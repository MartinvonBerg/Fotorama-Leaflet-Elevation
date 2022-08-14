<?php 
namespace mvbplugins\fotoramamulti;

// TODO: security: only allow requests from js file on same Browser, use wp nonces with ajax.
// TODO: check the passed variables. Run only if in range. and check urls.

// get the directory ot this file which is the cachedir 
$cacheDir = __DIR__;
$cacheHeaderTime = 60*60*24*365; // Browser Header (sec)
$cacheFileTime = 60*60*24*365 / 4; // max File Age (sec)
$preUrl = 'https://';
$ds = \DIRECTORY_SEPARATOR;
$allowed = \ini_get('allow_url_fopen') === '1';

$tileServers = array(
	"osm" => array(
		"searchfor" => "osmde",
		"localdir" 	=> "osm{$ds}{$_GET['z']}{$ds}{$_GET['x']}",
		"server" 	=> "{s}.tile.openstreetmap.de/tiles/osmde/",
		"tile" 		=> "{$_GET['z']}/{$_GET['x']}/{$_GET['y']}",
		"file"		=> "{$_GET['y']}",
		"ext" 		=> "png"
	),
	"otm" => array(
		"searchfor" => "opentopomap",
		"localdir" 	=> "otm{$ds}{$_GET['z']}{$ds}{$_GET['x']}",
		"server" 	=> "{s}.tile.opentopomap.org/",
		"tile" 		=> "{$_GET['z']}/{$_GET['x']}/{$_GET['y']}",
		"file"		=> "{$_GET['y']}",
		"ext" 		=> "png"
	),
	"cycle" => array(
		"searchfor" => "cyclosm",
		"localdir" 	=> "cycle{$ds}{$_GET['z']}{$ds}{$_GET['x']}",
		"server" 	=> "{s}.tile-cyclosm.openstreetmap.fr/cyclosm/",
		"tile" 		=> "{$_GET['z']}/{$_GET['x']}/{$_GET['y']}",
		"file"		=> "{$_GET['y']}",
		"ext" 		=> "png"
	),
	"sat" => array(
		"searchfor" => "arcgisonline",
		"localdir" 	=> "sat{$ds}{$_GET['z']}{$ds}{$_GET['y']}",
		"server" 	=> "server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/",
		"tile" 		=> "{$_GET['z']}/{$_GET['y']}/{$_GET['x']}",
		"file"		=> "{$_GET['x']}",
		"ext" 		=> "jpeg"
	),
);

$tile ='';

// get the requested tiletype 
foreach ($tileServers as $key => $entry) {
	$found = \strpos( $_GET['url'], $entry['searchfor']);
	if ( $found !== false) {
		$tile = $key;
		break;
	}
}

// create the directory name.
$localDir = $cacheDir . $ds . $tileServers[$tile]["localdir"]; 

// create the file name 
$localFile = $localDir . $ds . $tileServers[$tile]["file"] . ".webp";

// check if file is available on server. TODO: not needed if catched by htaccess.
if ( \file_exists($localFile)) {
	header("Cache-Control: public, max-age=".$cacheHeaderTime.", s-maxage=".$cacheHeaderTime."");
	header('Content-type: image/webp');
	// send the image file 
	$imgData = file_get_contents($localFile);
	//echo $imgData;
} 
else 
{ // fallback if the file is still not available
	// check if dir exists if not create it
	if (! \is_dir($localDir)) {
		$result = \mkdir($localDir, 0777, true);
	}

	// get the new file
	if ( $allowed ) {
		$url = $preUrl . $_GET['url'] . '/' . $tileServers[$tile]['tile'] . '.' . $tileServers[$tile]['ext'];
		$opts = array(
			'http'=>array(
				'method'=>'GET',
				'header'=>'User-Agent: PostmanRuntime/7.26.10' // just any user-agent to fake a human access
			)
		);
		$context = stream_context_create($opts);
		$imgData = file_get_contents( $url , false, $context );
		// original Filename 
		$tileFile = $localDir . $ds . $tileServers[$tile]["file"] . '.' . $tileServers[$tile]['ext'];
		// save the original
		\file_put_contents($tileFile, $imgData); 
		// convert the original and save it
		webpImage($tileFile, 75, true);
		$imgData = file_get_contents($localFile);
	} else {
		$localFile = $cacheDir . $ds . 'tile-error.webp';
		$imgData = file_get_contents($localFile);
	}
}

// pass the image content to client
echo $imgData;

/**
 * Convert image file to webp and keep or remove the original file.
 *
 * @param  string  $source the file path to the original file.
 * @param  integer $quality for webp conversion.
 * @param  boolean $removeOld remove the original file or not.
 * @return string the file path to the converted file.
 */
function webpImage($source, $quality = 80, $removeOld = false)
    {
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
