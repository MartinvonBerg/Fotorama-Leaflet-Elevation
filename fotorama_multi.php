<?php

/**
 *
 * @link              https://github.com/MartinvonBerg/wp-fotorama-gpxviewer
 * @since             0.0.1
 * @package           fotorama-multi
 *
 * @wordpress-plugin
 * Plugin Name:       Fotorama-Multi
 * Plugin URI:        https://github.com/MartinvonBerg/wp-fotorama-gpxviewer
 * Description:       Fotorama Multi Slider
 * Version:           0.0.2
 * Author:            Martin von Berg
 * Author URI:        https://www.mvb1.de/info/ueber-mich/
 * License:           GPL-2.0
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */
namespace mvbplugins\fotoramamulti;

// fallback for wordpress security
defined('ABSPATH') || die('Are you ok?');

const MAX_IMAGE_SIZE =  2560; // value for resize to ...-scaled.jpg TODO: big_image_size_threshold : read from WP settings. But where?

// load globals and functions for status transitions only if needed or intended
const setCustomFields = false;
if (setCustomFields) {
	require_once __DIR__ . '/inc/stateTransitions.php';
}

// load the wpseo_sitemap_url-images callback to add images of post to the sitemap only if needed or intended
const doYoastXmlSitemap = false;
if (doYoastXmlSitemap) {
	require_once __DIR__ . '/inc/yoastXmlSitemap.php';
}

// define the shortcode to generate the image-slider with map
add_shortcode('fotomulti', '\mvbplugins\fotoramamulti\showmulti');

// this is the function that runs if the post is rendered an the shortcode is found in the page. Somehow the main-function
function showmulti($attr, $content = null)
{
	// Define global Values and Variables. We need the globals for the state-transition of the post
	global $post_state_pub_2_draft;
	global $post_state_draft_2_pub;
	$pub_2_draft = $post_state_pub_2_draft ?? false;
	$draft_2_pub = $post_state_draft_2_pub ?? false;
	
	// --- Variables -----------------------------------
	$postid = get_the_ID();
	$htmlstring = ''; 
	$files = [];
	$postimages = []; // array with images for the Yoast XML Sitemap
	$thumbsdir = 'thumbs'; // we use a fixed name for the subdir containing the thumbnails
	static $shortcodecounter=0; // counts the number of shortcodes on ONE page!

	// Extract shortcode-Parameters and set Default-Values
	extract(shortcode_atts(array(
		'gpxpath' => 'gpx',
		'gpxfile' => 'test.gpx',
		'mapheight' => '450',
		'chartheight' => '150',
		'imgpath' => 'Bilder',
		'dload' => 'no',
		'alttext' => '',
		'scale' => 1.0, // map-scale factor for GPXViewer
		'ignoresort' => 'true', // ignore custom sort even if provided by Wordpress, then sort by date ascending
		'showadress' => 'false',
		'adresstext' => 'Startadresse',
		'requiregps' => 'true',
		'maxwidth' => '800',
		'showcaption' => 'true',
	), $attr));

	// Detect Language of Website and set the Javascript-Variable for the Language used in GPXViewer
	$lang = substr(get_locale(), 0, 2);
	$languages = array("de", "en", "fr", "es");
	if (!in_array($lang, $languages)) {
		$lang = "en";
	}

	// Check Parameters for Height of Map and Chart and restrict to the given range. Preset if range exceeded
	if (($mapheight < 50) || ($mapheight > 900)) {
		$mapheight = 450;
	}
	if (($chartheight < 50) || ($chartheight > 500)) {
		$chartheight = 150;
	}

	// Define path and url variables
	$up_url = gpxview_get_upload_dir('baseurl');  // upload_url
	$up_dir = wp_get_upload_dir()['basedir'];     // upload_dir
	$gpx_dir = $up_dir . '/' . $gpxpath . '/';    // gpx_dir
	$gpx_url = $up_url . '/' . $gpxpath . '/';    // gpx_url
	$imagepath = $up_dir . '/' . $imgpath;        // path to the images
	$imageurl = $up_url . '/' . $imgpath;         // url to the images-url in uploads directory
	$thumbheight = (string) get_option('thumbnail_size_h');
	$thumbwidth = (string) get_option('thumbnail_size_w');
	$thumbcheck = '-' . $thumbwidth . 'x' . $thumbheight . '.jpg';
	
	// Loop through all jpg-files in the given folder, and get the required data
	$imageNumber = 0;
	foreach (glob($imagepath . "/*.[jJ][pP][gG]") as $file) {
		// check wether current $file of the $path (=folder) is a unscaled jpg-file and not a thumbnail or a rescaled file
		// This means: The filename must not contain 'thumb' or '[0-9]x[0-9]'. All other additions to the filename will be treated as 
		// full scaled image-file that will be shown in the image-slider
		$extension = pathinfo($file)['extension'];
		$jpgfile = basename($file, '.'.$extension); 
		$isthumb = stripos($jpgfile, 'thumb') || preg_match('.\dx{1}\d.', $jpgfile); 
		
		if ( ! $isthumb) {

			// check whether thumbnails are available in the image-folder and if yes, how they are named
			$thumbavail = true;
			$pathtocheck = $imagepath . '/' . $jpgfile;
			
			if     ( is_file($pathtocheck . $thumbcheck) ) {
				$thumbs = $thumbcheck;
				}
			elseif ( is_file($pathtocheck . '-thumb.jpg') ) {
				$thumbs = '-thumb.jpg';
				}
			elseif ( is_file($pathtocheck . '_thumb.jpg') ) {
				$thumbs = '_thumb.jpg';
				}
			else {
				$thumbavail = false;
			}
			
			// check additionally whether thumbnails are available in the sub-folder ./thumbs and if, how they are named
			// even if there were thumbnails in the image-folder the thumbnails in ../thumbs are preferably used
			// therefore this check runs here after the above check for the image-folder
			$thumbinsubdir = true;
			$pathtocheck = $imagepath . '/' . $thumbsdir . '/'. $jpgfile;
			
			if     ( is_file($pathtocheck . $thumbcheck) ) {
				$thumbs = $thumbcheck;
				}
			elseif ( is_file($pathtocheck . '-thumb.jpg') ) {
				$thumbs = '-thumb.jpg';
				}
			elseif ( is_file($pathtocheck . '_thumb.jpg') ) {
				$thumbs = '_thumb.jpg';
				}
			else {
				$thumbinsubdir = false;
			}

			// get $Exif-Data from image and check wether image contains GPS-data, if not it will be skipped
			$Exif = exif_read_data($file, 0, true);
			list($lon,$lat) = gpxview_getLonLat($Exif);	
			
			if ( ( (is_null($lon) ) || (is_null($lat)) ) && ('true' == $requiregps) ) {
				// do nothing, GPS-data invalid;
			} 

			else {
				// Check if file with GPS-Coordinate is maybe in WP-Media-Catalog 
				$wpimgurl = $imageurl . '/' . $jpgfile . '.jpg';
				$wpid = attachment_url_to_postid($wpimgurl);
	
				// get Exif-Data-Values from $Exif and $iptc and store it to array data2
				list($exptime, $apperture, $iso, $focal, $camera, $datetaken, $datesort, $tags, $description, $title, $alt, $caption, $sort) = gpxview_getEXIFData($Exif, $imagepath . "/" . basename($file), $imageNumber, $wpid);
				$data2[] = array(
					'id' => $imageNumber, 'lat' => $lat, 'lon' => $lon, 'title' => $title, 'file' => $jpgfile, 'exptime' => $exptime,
					'apperture' => $apperture, 'iso' => $iso, 'focal' => $focal, 'camera' => $camera, 'date' => $datetaken, 'tags' => $tags, 'wpid' => $wpid,
					'datesort' => $datesort, 'descr' => $description, 'thumbavail' => $thumbavail, 'thumbinsubdir' => $thumbinsubdir, 'alt' => $alt, 'caption' => $caption, 'sort' => $sort,
				);
			
				// create array to add the image-urls to Yoast-seo xml-sitemap // TODO: anpassung für multi!!!
				if (doYoastXmlSitemap) {
					$img2add = $up_url . '/' . $imgpath . '/' . $jpgfile . '.jpg';
					$postimages[] = array('src' => $img2add , 'alt' => $title, );
				}
			
				// increment imagenumber
				$imageNumber++;
				
			}
		}
	}
	// check if customsort is possible, if yes sort ascending
	$rowsum = $imageNumber * ($imageNumber + 1) / 2;

	if ($imageNumber > 0) {
		$csort = array_column($data2, 'sort'); // $customsort
		$arraysum = array_sum($csort);
	
		if ( ($rowsum != $arraysum) or ('true' == $ignoresort) ) {
			$csort = array_column($data2, 'datesort');
		}
	}
	
	// sort images asending date-taken
	if ($imageNumber > 0) {
		array_multisort($csort, SORT_ASC, $data2);
	}

	// on Status change from published to draft delete Custom-Fields 'lat' 'lon' and 'postimages' from the post
	// delete always as we may have this plugin before and do want to delete the custom fields now. 
	// But the deletion requires a status transition from published to draft and back
	if ($pub_2_draft) {
		delete_post_meta($postid,'lat');
		delete_post_meta($postid,'lon');
		delete_post_meta($postid,'postimg');
	}

	// on the status transition of the post from 'draft' to 'published'.
	// preset Custom-Field 'lat' and 'lon' of the post with GPS-Data of the first image 
	// Will be overwritten with the first trackpoint of the GPX-track, if there is one provided
	if ($draft_2_pub)  { // TODO: anpassung für multi!!!
		if (setCustomFields) {
			gpxview_setpostgps($postid, $data2[0]['lat'], $data2[0]['lon']);
		}
		if (doYoastXmlSitemap) {
			$postimages = maybe_serialize($postimages);
			delete_post_meta($postid,'postimg');
			update_post_meta($postid,'postimg',$postimages,'');
		}
	}
			
	// parse GPX-Track-Files, check if it is a file, and if so append to the string to pass to javascript
	$files = explode(",", $gpxfile);
	$i = 0; // i : gpxfilenumber
	$gpxfile = ''; // string to pass to javascript
	foreach ($files as $f) { 
		if (is_file($gpx_dir . $f)) { 
			
			if ($i == 0) {
				$gpxfile .= $f;

				if ($draft_2_pub and setCustomFields) {
					// Set Custom-Field 'lat' and 'lon' in the Post with first trackpoint of the GPX-track
					//TODO: anpassung für multi!!!
					$gpxdata = simplexml_load_file($gpx_url . $f);
					if (isset( $gpxdata->trk->trkseg->trkpt[0]['lat'] )) {
						$lat = (string) $gpxdata->trk->trkseg->trkpt[0]['lat']; 
					} else {
						$lat = (string) $gpxdata->trk->trkpt[0]['lat'];
					}
					if (isset( $gpxdata->trk->trkseg->trkpt[0]['lon'] )) {
						$lon = (string) $gpxdata->trk->trkseg->trkpt[0]['lon'];  
					} else {
						$lon = (string) $gpxdata->trk->trkpt[0]['lon'];
					}
					
					gpxview_setpostgps($postid, $lat, $lon);

					// get the adress of the GPS-starting point, source: https://nominatim.org/release-docs/develop/api/Reverse/
					// only done for the first track
					if ('true' == $showadress) {
						$url = 'https://nominatim.openstreetmap.org/reverse?lat=' . $lat . '&lon='. $lon . '&format=json&zoom=10&accept-language=de';
						$opts = array(
							'http'=>array(
							'method'=>"GET",
							'header'=>'User-Agent: PostmanRuntime/7.26.8' // just any user-agent to fake a human access
							)
						);
						$context = stream_context_create($opts);
						$geojson = json_decode(file_get_contents( $url , false, $context ));
						$geoadress = (array) $geojson->address;
						$geoadressfield = maybe_serialize($geoadress);
						delete_post_meta($postid,'geoadress');
						update_post_meta($postid,'geoadress', $geoadressfield,'');
					}	
				}		

			} else {
				$gpxfile .= ',' . $f;
			}
			$i++;
		}
	}

	// Generate the html-code start with the surrounding Div
	$htmlstring .= '<div id=box'.$shortcodecounter.' style="max-width:'. $maxwidth .'px;">';
	$imgnr = 1;

	// Generate Fotorama images for fotorama-javascript-rendering
	if ($imageNumber > 0) {
		$htmlstring  .= '<div id="Bilder" style="display : none"><figure><img loading="lazy" alt="' . $alttext . '"><figcaption></figcaption></figure></div>'; // sieht unnötig aus, aber es geht nur so
		$htmlstring  .= '<div id="mfotorama'. $shortcodecounter .'" class="fotorama" data-auto="false" data-width="100%" data-navwidth="100%" data-fit="cover" data-shadows="true" data-captions="'. $showcaption .'" data-ratio="1.5" data-nav="thumbs" data-allowfullscreen="native" data-keyboard="false" data-hash="false">';
		
		// loop through the data extracted from the images in folder and generate the div depending on the availability of thumbnails
		foreach ($data2 as $data) {
			// set the alt-tag for SEO
			$alttext = $data["alt"] != '' ? $data["alt"] : $data["title"];

			// get the image srcset if the image is in WP-Media-Catalog, otherwise not.
			// Code-Example with thumbs with image srcset (https://github.com/artpolikarpov/fotorama/pull/337)
			// <a href="img/large.jpg" srcset="img/large.jpg 1920w, img/medium.jpg 960w, img/little.jpg 480w"> <img src="img/thumb.jpg">
			$srcset2 = '';
			if ( $data['wpid'] > 0) {
				$srcset2 = wp_get_attachment_image_srcset( $data['wpid'] );
				$srcarr = explode(',', $srcset2);

				foreach( $srcarr as $val){
					$val = trim($val);
					$tmp = \explode(' ', $val);
					$tmp[1] = \str_replace('w', '', $tmp[1]);
					$finalArray[ $tmp[1] ] = $tmp[0];
				}
				$finalArray[ strval(MAX_IMAGE_SIZE) ] = $up_url . '/' . $imgpath . '/' . $data["file"] . '.jpg';
				$phpimgdata[$imgnr-1]['srcset'] = $finalArray;	
				$phpimgdata[$imgnr-1]['id'] = $imgnr;
			}

			if ($data['thumbinsubdir']) {
				$htmlstring .= '<a href="' . $up_url . '/' . $imgpath . '/' . $data["file"] . '.jpg" data-caption="'.$imgnr.' / '.$imageNumber .': ' . $data["title"] . 
				'<br> ' . $data['camera'] . ' <br> ' . $data['focal'] . ' / f/' . $data['apperture'] . ' / ' . $data['exptime'] . 's / ISO' . $data['iso'] . ' / ' . $data['date'] . '">\r\n';
				// code for the thumbnails
				$htmlstring .= '<img alt="' . $alttext .'" src="' . $up_url . '/' . $imgpath . '/' . $thumbsdir . '/' . $data["file"] . $thumbs . '"></a>\r\n'; 
			
			} elseif ($data['thumbavail']) {
				$imgurl = $up_url . '/' . $imgpath . '/' . $data["file"] . $thumbs;
				$htmlstring .= '<a href="' . $imgurl . '" data-caption="'.$imgnr.' / '.$imageNumber .': ' . $data["title"] . '<br> ' . $data['camera'] . 
				' <br> ' . $data['focal'] . ' / f/' . $data['apperture'] . ' / ' . $data['exptime'] . 's / ISO' . $data['iso'] . ' / ' . $data['date'] . '">';
				// this is for the thumbnails
				$htmlstring .= '<img alt="' . $alttext .'" src="' . $up_url . '/' . $imgpath . '/' . $data["file"] . $thumbs . '"></a>'; 
			
			} else { // do not add srcset here, because this is for folders without thumbnails. If this is the case we don't have image-sizes for the srcset
				$htmlstring .= '<img loading="lazy" alt="' . $alttext .'" src="' . $up_url . '/' . $imgpath . '/' . $data["file"] . '.jpg' . '" data-caption="'.$imgnr.' / '.$imageNumber .': ' . $data["title"] . '<br> ' . $data['camera'] . ' <br> ' . $data['focal'] . ' / f/' . $data['apperture'] . ' / ' . $data['exptime'] . 's / ISO' . $data['iso'] . ' / ' . $data['date'] . '">';
			}

			$imgnr++;
		}
		$htmlstring  .= '</div>';
	}

	// show Map only with valid gpx-tracks and if so, generate the div
	if ($showadress  == 'true') {
		$mapid = 'map' . strval($shortcodecounter); 
		if (strlen($gpxfile) > 3 && ($i > 0)) {
			$htmlstring  .= '<div id=box' . $mapid .'>';
			$htmlstring  .= '<div id='.$mapid.' class="map gpxview:' . $gpxfile . ':OPENTOPO" style="width:100%;height:' . $mapheight . 'px"></div>';
			$htmlstring  .= '<div id="'.$mapid.'_profiles" style="width:100%;height:' . $chartheight . 'px"><div id="'.$mapid.'_hp" class="map" style="width:100%;height:' . $chartheight . 'px"></div></div>';
			$htmlstring  .= '<div id="'.$mapid.'_img">';
		} elseif ($imageNumber > 0){
			$htmlstring  .= '<div id=box' . $mapid .'>';
			$htmlstring  .= '<div id='.$mapid.' class="gpxview::OPENTOPO" style="width:100%;height:' . $mapheight . 'px"></div>';
			$htmlstring  .= '<div id="'.$mapid.'_img">';
			$gpx_url = "";
		}

		// define the marker images for the map. this is for GPXviewer  
		if ($imageNumber > 0) {
			foreach ($data2 as $data) {
				$htmlstring  .= '<a class="gpxpluga"  href="' . $up_url . '/' . $imgpath . '/';
			
				if ($data['thumbinsubdir']) {
						$htmlstring  .= $thumbsdir . '/' . $data["file"] . $thumbs;
				} elseif ($data['thumbavail']) {
						$htmlstring  .= $data["file"] . $thumbs;
				} else {
						$htmlstring  .= $data["file"] . '.jpg';
				}
			
				$htmlstring .= '" data-geo="lat:' . $data["lat"] . ',lon:' . $data["lon"] . '"></a>';
			}
		}
	}
	// close all html-divs
	$htmlstring  .= '</div>';

	// provide GPX-download if defined
	if (($dload == 'yes') && ($i == 1)) {
		$htmlstring .= '<p><strong>GPX-Datei: <a download="' . $gpxfile . '" href="' . $gpx_url . $gpxfile . '">Download GPX-Datei</a></strong></p>';
	}
	
	// produce starting point description,  TODO: anpassung für multi!!!
	if ($showadress  == 'true') {
		$geoadresstest =  get_post_meta($postid,'geoadress');
		if ( ! empty($geoadresstest) ) {
			$test = $geoadresstest[0]; // we need only the first index
			$geoadress = maybe_unserialize($test);	// type conversion to array
			$htmlstring .= '<h4>'. $adresstext .'</h4>';
		
			$v = '';
			foreach ($geoadress as $key => $value) {
				if ($key != 'country') {
					$v .= $value . ', ';
				} else {
					$v .= $value;
					break;
				}
			}

			// https://www.google.com/maps/search/?api=1&query=47.5951518,-122.3316393
			//https://www.google.com/maps/search/@?api=1&map_action=map&center=44.757601666667,6.7916916666667&zoom=12
			//https://www.google.com/maps/       @?api=1&map_action=map&center=-33.712206,150.311941&zoom=12&basemap=terrain
			//$googleurl = 'https://www.google.com/maps/@?api=1&map_action=map&center=' . $lat[0] . ',' . $lon[0] . '&zoom=10';
			//http://www.google.com/maps/place/<lat>,<lng>/@<lat>,<lng>,<zoom>z

			$lat = get_post_meta($postid,'lat');
			$lon = get_post_meta($postid,'lon');
			$googleurl = 'https://www.google.com/maps/place/' . $lat[0] . ',' . $lon[0] . '/@' . $lat[0] . ',' . $lon[0] . ',9z';
			$v2 = '<a href="' .$googleurl. '" target="_blank">'. $v .'</a>';
			$htmlstring .= '<p>'. $v2 . '</p>';
		}
	}
	
	// pass php variabls to javascript-file for fotorama
	wp_localize_script('fm_script2', 'wpfm_phpvars' . $shortcodecounter, array(
		'ngpxfiles'  => $i,
		'maprescale' => $scale,
		'imgdata' => $phpimgdata ?? [],
		) 
	);


	$shortcodecounter++;
	return $htmlstring;
}

//bind and call scripts and styles
function fotomulti_scripts()
{
  wp_reset_query();
  $plugin_url = plugins_url('/', __FILE__);

  if (!is_front_page() || !is_home()) {
    // Load Styles
    wp_enqueue_style('fm_style1', $plugin_url . 'css/fotorama_multi.css');
	wp_enqueue_style('fm-style2', $plugin_url . 'css/fotorama3.css');
	//wp_enqueue_style('fm-style3', $plugin_url . 'css/image-zoom.css');

    // Load Scripts
    wp_enqueue_script('fm-script1', $plugin_url . 'js/fotorama3.js', array('jquery'), '1.10.2', true);
	wp_enqueue_script('fm_script2', $plugin_url . 'js/fotorama_multi.js', array('jquery'), '1.10.2', true);
	//wp_enqueue_script('fm_script3', $plugin_url . 'js/wheelzoom.js', array('jquery'), '1.10.2', true);
	
  }
}

add_action('wp_enqueue_scripts', 'mvbplugins\fotoramamulti\fotomulti_scripts');

// --------------- load additonal functions ------------------------------
require_once __DIR__ . '/inc/fm_functions.php';

