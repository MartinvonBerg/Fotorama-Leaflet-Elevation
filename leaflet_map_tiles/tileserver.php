<?php 
namespace mvbplugins\fotoramamulti;
// TODO: file extension directive in .htaccess
// TODO: cache fileage solution. What to do if files are too old?


// get the directory ot this file which is the cachedir and define other variables
$cacheDir = __DIR__;
$cacheHeaderTime = 60*60*24*365; // Browser Header (sec)
$cacheFileTime = 60*60*24*365 / 4; // max File Age (sec)
$preUrl = 'https://';
$ds = \DIRECTORY_SEPARATOR;
$allowed = \ini_get('allow_url_fopen') === '1';
$useWebp = true;
$error = false;

// partition the request code
$req = preg_split('/(\/|\.)/', $_GET["tile"]);
$req[4] = \strtolower($req[4]);

$tileServers = array(
	"osm" => array(
		"searchfor" => "osmde",
		"localdir" 	=> "osm{$ds}{$req[1]}{$ds}{$req[2]}",
		"server" 	=> "a.tile.openstreetmap.de/tiles/osmde/", //"tile.openstreetmap.org/", 
		"tile" 		=> "{$req[1]}/{$req[2]}/{$req[3]}",
		"file"		=> "{$req[3]}",
		"ext" 		=> "png"
	),
	"otm" => array(
		"searchfor" => "opentopomap",
		"localdir" 	=> "otm{$ds}{$req[1]}{$ds}{$req[2]}",
		"server" 	=> "a.tile.opentopomap.org/",
		"tile" 		=> "{$req[1]}/{$req[2]}/{$req[3]}",
		"file"		=> "{$req[3]}",
		"ext" 		=> "png"
	),
	"cycle" => array(
		"searchfor" => "cyclosm",
		"localdir" 	=> "cycle{$ds}{$req[1]}{$ds}{$req[2]}",
		"server" 	=> "a.tile-cyclosm.openstreetmap.fr/cyclosm/",
		"tile" 		=> "{$req[1]}/{$req[2]}/{$req[3]}",
		"file"		=> "{$req[3]}",
		"ext" 		=> "png"
	),
	"sat" => array(
		"searchfor" => "arcgisonline",
		"localdir" 	=> "sat{$ds}{$req[1]}{$ds}{$req[2]}",
		"server" 	=> "server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/",
		"tile" 		=> "{$req[1]}/{$req[2]}/{$req[3]}",
		"file"		=> "{$req[3]}",
		"ext" 		=> "jpeg"
	),
);

// check if localdir is in request and get the requested tiletype.
$tile ='';
foreach ($tileServers as $key => $entry) {
	if ( $req[0] === $key ) {
		$tile = $key;
		break;
	}
}

if ($_GET["tile"]=== 'testfile.webp') {
	http_response_code(302);
	echo('local htaccess is working');
	return;
}

if ( $tile==='' || ! \is_numeric( $req[1]) || ! \is_numeric( $req[2]) || ! \is_numeric( $req[3]) || !( ($req[4] === 'webp') || ($req[4] === 'png') || ($req[4] === 'jpg') || ($req[4] === 'jpeg') )) {
	http_response_code(404);
	echo('request denied');
	return;
}

// create the directory name.
$localDir = $cacheDir . $ds . $tileServers[$tile]["localdir"];

if ( ! $useWebp && $req[4] === 'webp') $useWebp = true;

// create the file name 
$localFile = $localDir . $ds . $tileServers[$tile]["file"];
if ( $useWebp ) {
	$localFile = $localFile . ".webp";
	$headerMime = 'image/webp';
} else {
	$localFile = $localFile . '.' . $req[4];
	$headerMime = 'image/' . $req[4];
}

// check if file is available on server.
if ( $allowed && ! \file_exists($localFile) ) 
{ // fallback if the file is still not available then get the new file
	// check if dir exists if not create it
	if (! \is_dir($localDir)) mkdir($localDir, 0777, true);

	$url = $preUrl . $tileServers[$tile]['server'] . $tileServers[$tile]['tile'] . '.' . $tileServers[$tile]['ext'];
	$opts = array(
		'http'=>array(
			'method'=>'GET',
			'header'=>'User-Agent: ' . $_SERVER["HTTP_USER_AGENT"] // just use the user agent from the request what is absolutely correct acc. to file usage policy.
		)
	);

	$context = stream_context_create($opts);
	$imgData = file_get_contents( $url , false, $context );
	// original Filename 
	$tileFile = $localDir . $ds . $tileServers[$tile]["file"] . '.' . $tileServers[$tile]['ext'];

	if ( $imgData === false) {
		$error = true;
		$result = false;
	} else {
		// save the original file
		$result = file_put_contents($tileFile, $imgData); 
	}

	if ( $result === false ) $error = true;
	
	// convert the original and save it
	if ( $useWebp ) $result = webpImage($tileFile, 75, true);
	$imgData = file_get_contents($localFile);

	if ( $imgData === false || $result === false) $error = true;
}

if ( $error || ! $allowed) {
	$localFile = $cacheDir . $ds . 'tile-error.webp';
	$headerMime = 'image/webp';	
	$httpResCode = 404;
} else {
	$httpResCode = 201;
}

// pass the image content to client
$imgData = file_get_contents($localFile);
http_response_code( $httpResCode );
header("Cache-Control: public, max-age=".$cacheHeaderTime.", s-maxage=".$cacheHeaderTime."");
header('Content-type: ' . $headerMime); 
echo $imgData;
exit(0);

// ----------------------------------------------------------------
/**
 * Convert image file to webp and keep or remove the original file.
 *
 * @param  string  $source the file path to the original file.
 * @param  integer $quality for webp conversion.
 * @param  boolean $removeOld remove the original file or not.
 * @return string|false the file path to the converted file.
 */
function webpImage($source, $quality = 80, $removeOld = false) {
	if( ! extension_loaded('gd') || ! \function_exists('imagewebp')) return false;

	$dir = pathinfo($source, PATHINFO_DIRNAME);
	$name = pathinfo($source, PATHINFO_FILENAME);
	$destination = $dir . DIRECTORY_SEPARATOR . $name . '.webp';
	$info = getimagesize($source);
	$isAlpha = false;

	if ($info['mime'] == 'image/jpeg')
		$image = imagecreatefromjpeg($source);
	elseif ($isAlpha = $info['mime'] == 'image/gif') {
		$image = imagecreatefromgif($source);
	} elseif ($isAlpha = $info['mime'] == 'image/png') {
		$image = imagecreatefrompng($source);
	} else {
		return $source;
	}
	if ($isAlpha) {
		imagepalettetotruecolor($image);
		imagealphablending($image, true);
		imagesavealpha($image, true);
	}
	imagewebp($image, $destination, $quality);

	if ($removeOld)
		unlink($source);

	return $destination;
}
