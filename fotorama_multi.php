<?php

/**
 *
 * @link              https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation
 * @since             5.3.0
 * @package           fotorama_multi
 *
 * @wordpress-plugin
 * Plugin Name:       Fotorama_Multi
 * Plugin URI:        https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation
 * Description:       Fotorama Slider and Leaflet Elevation integration
 * Version:           0.1.4
 * Author:            Martin von Berg
 * Author URI:        https://www.mvb1.de/info/ueber-mich/
 * License:           GPL-2.0
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */

namespace mvbplugins\fotoramamulti;

// fallback for wordpress security
if ( ! defined('ABSPATH' )) {
    die('Are you ok?');
}

// init the database settings for the admin panel on first activation of the plugin. Does not overwrite
require_once __DIR__ . '/inc/init_database.php';
register_activation_hook( plugin_basename( __FILE__ ) , '\mvbplugins\fotoramamulti\fotoramamulti_activate' );

// define globals and load all functions 
const MAX_IMAGE_SIZE =  2560; // value for resize to ...-scaled.jpg TODO: big_image_size_threshold : read from WP settings. But where?
require_once __DIR__ . '/inc/stateTransitions.php';
require_once __DIR__ . '/inc/fm_functions.php';
require_once __DIR__ . '/languages/locales_i18n.php';
//require_once __DIR__ . '/fotorama_multi_enq_scripts.php';

// load the wpseo_sitemap_url-images callback to add images of post to the sitemap only if needed or intended
$const2 = get_option( 'fotorama_elevation_option_name' )['doYoastXmlSitemap_16'];
if ($const2 == 'true') {
	require_once __DIR__ . '/inc/yoastXmlSitemap.php';
	add_action( 'plugins_loaded', 'mvbplugins\fotoramamulti\do_addfilter_for_yoast');
}


// --- show admin page if request is for admin page
if ( is_admin() ) {
	require_once __DIR__ . '/inc/admin_settings.php';
	$fotorama_elevation = new FotoramaElevation();
	
	$wp_act_pis = get_option('active_plugins');
	$wp_act_pis = \implode(', ',$wp_act_pis);
	$fm_act_pis = \get_option('fm_plugins_checker');
	if ( $wp_act_pis != $fm_act_pis['active_plugins']) {
		$fm_act_pis['active_plugins'] = $wp_act_pis;
		$fm_act_pis['plugins_changed'] = 'true';
		update_option('fm_plugins_checker', $fm_act_pis);
	}

	// show notice if not resetted by shutdown hook function, TODO: $fm_act_pis['show_admin_message']
	if ( 'true' == $fm_act_pis['show_admin_message'] ) {
		add_action( 'all_admin_notices', '\mvbplugins\fotoramamulti\fm_error_notice' ); // all_admin_notices for multisite
	}
}
add_action( 'shutdown', '\mvbplugins\fotoramamulti\action_shutdown', 10, 1 );

// ------------------------------------------------------------
// define the shortcode to generate the image-slider with map
add_shortcode('gpxview', '\mvbplugins\fotoramamulti\showmulti');

// this is the function that runs if the post is rendered an the shortcode is found in the page. Somehow the main-function
function showmulti($attr, $content = null)
{
	require_once __DIR__ . '/fotorama_multi_enq_scripts.php';

	// Define global Values and Variables. We need the globals for the state-transition of the post
	global $post_state_pub_2_draft;
	global $post_state_draft_2_pub;
	$pub_2_draft = $post_state_pub_2_draft ?? false;
	$draft_2_pub = $post_state_draft_2_pub ?? false;
	$setCustomFields = get_option( 'fotorama_elevation_option_name' )['setCustomFields_15'] == 'true'; // liefert 'true'
	$doYoastXmlSitemap = get_option( 'fotorama_elevation_option_name' )['doYoastXmlSitemap_16'] == 'true';
	
	// --- Variables -----------------------------------
	$postid = get_the_ID();
	$htmlstring = ''; 
	$files = [];
	$tracks = [];
	$postimages = []; // array with images for the Yoast XML Sitemap
	$thumbsdir = 'thumbs'; // we use a fixed name for the subdir containing the thumbnails
	static $shortcodecounter=0; // counts the number of shortcodes on ONE page!
	
 	// Get Values from Admin settings page
 	$fotorama_elevation_options = get_option( 'fotorama_elevation_option_name' ); // Array of All Options
 	
	// Extract shortcode-Parameters and set Default-Values
	extract(shortcode_atts(array(
		'gpxpath' => $fotorama_elevation_options['path_to_gpx_files_2'] ?? 'gpx',
		'gpxfile' => 'test.gpx',
		'mapheight' => $fotorama_elevation_options['height_of_map_10'] ?? '450',
		'chartheight' => $fotorama_elevation_options['height_of_chart_11'] ?? '200',
		'imgpath' => $fotorama_elevation_options['path_to_images_for_fotorama_0'] ?? 'Bilder',
		'dload' => $fotorama_elevation_options['download_gpx_files_3'] ?? 'yes', 
		'alttext' => $fotorama_elevation_options['general_text_for_the_fotorama_alt_9'] ?? '',
		'ignoresort' => $fotorama_elevation_options['ignore_custom_sort_6'] ?? 'false', 
		'showadress' => $fotorama_elevation_options['show_address_of_start_7'] ?? 'true', 
		'showmap' => 'true',
		'adresstext' => $fotorama_elevation_options['text_for_start_address_8'] ?? 'Startadresse',
		'requiregps' => $fotorama_elevation_options['images_with_gps_required_5'] ?? 'true',
		'maxwidth' => $fotorama_elevation_options['max_width_of_container_12'] ?? '600', 
		'minrowwidth' => $fotorama_elevation_options['min_width_css_grid_row_14'] ?? '480',
		'showcaption' => $fotorama_elevation_options['show_caption_4'] ?? 'true',
		'eletheme' => $fotorama_elevation_options['colour_theme_for_leaflet_elevation_1'], 
		'showalltracks' => 'false',
		'mapcenter' => '0.0, 0.0', 
		'zoom' => 8,					
		'markertext' => 'Home address',
		'fit' => 'cover', // 'contain' Default, 'cover', 'scaledown', 'none'
		'ratio' => '1.5',
	), $attr));

	// Detect Language of the client request
	if ( array_key_exists('HTTP_ACCEPT_LANGUAGE', $_SERVER) ) {
		$lang = substr(\explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE'])[0], 0, 2); 
	} else {
		$lang = 'en';
	}

	$mapcenter = explode(',',$mapcenter);

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
	$plugin_path = plugins_url('/', __FILE__);
	$wp_fotomulti_path = $plugin_path . 'images/';
	
	// Loop through all jpg-files in the given folder, and get the required data
	$imageNumber = 0;
	foreach (glob($imagepath . '/*.[jJ][pP][gG]') as $file) {
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
			
				// create array to add the image-urls to Yoast-seo xml-sitemap
				if ($doYoastXmlSitemap) {
					$img2add = $up_url . '/' . $imgpath . '/' . $jpgfile . '.jpg';
					$postimages[] = array('src' => $img2add , 'alt' => $title, 'title' => $title,);
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
		// sort images asending with date-taken
		array_multisort($csort, SORT_ASC, $data2);
	}
	
	// on Status change from published to draft delete Custom-Fields 'lat' 'lon' and 'postimages' from the post
	// delete always as we may have this plugin before and do want to delete the custom fields now. 
	// But the deletion requires a status transition from published to draft and back
	if ($pub_2_draft) {
		delete_post_meta($postid,'lat');
		delete_post_meta($postid,'lon');
		delete_post_meta($postid,'postimg');
		delete_post_meta($postid,'geoadress');
	}

	// on the status transition of the post from 'draft' to 'published'.
	// preset Custom-Field 'lat' and 'lon' of the post with GPS-Data of the first image 
	// Will be overwritten with the first trackpoint of the GPX-track, if there is one provided
	if ( \current_user_can('edit_posts') && $setCustomFields && (0 == $shortcodecounter) && ( $imageNumber > 0)) {
			gpxview_setpostgps($postid, $data2[0]['lat'], $data2[0]['lon']);
	}

	if ( \current_user_can('edit_posts') && $setCustomFields && $doYoastXmlSitemap && ( $draft_2_pub) ) { 
			
		if ( (0 == $shortcodecounter) ) {
			delete_post_meta($postid,'postimg');

		} else {
			$myimgfrompost = get_post_meta($postid,'postimg'); // read array with post_images from custom-field of post
			
			if ( ! empty($myimgfrompost) ) {
				$test = $myimgfrompost[0]; // we need only the first index
				$existimages = maybe_unserialize($test);	// type conversion to array
				//append new images at the end of array
				$postimages = \array_merge($existimages, $postimages);
			}
		}

		$postimages = maybe_serialize($postimages);
		update_post_meta( $postid, 'postimg', $postimages, '' );
	}
	
			
	// parse GPX-Track-Files, check if it is a file, and if so append to the string to pass to javascript
	$files = explode(",", $gpxfile);
	$i = 0; // i : gpxfilenumber
	$gpxfile = ''; // string to pass to javascript
	foreach ($files as $file) { 
		$f = trim($file);
		if (is_file($gpx_dir . $f)) {
			$tracks['track_' . $i]['url'] = $gpx_url . $f;

			if ($i == 0) {
				$gpxfile .= $f;

				//if ($draft_2_pub && $setCustomFields && (0 == $shortcodecounter)) {
				if ( \current_user_can('edit_posts') && $setCustomFields && (0 == $shortcodecounter) ) {	
					// Set Custom-Field 'lat' and 'lon' in the Post with first trackpoint of the GPX-track
					// This is done only once to reduce load on nominatim. If requests are too frequent it will block the response!
					$gpxdata = simplexml_load_file( $gpx_dir . $f );

					if ( 'object' == gettype( $gpxdata) ) {
						if (isset( $gpxdata->trk->trkseg->trkpt[0]['lat'] ) ) {
							$lat = \strval( $gpxdata->trk->trkseg->trkpt[0]['lat'] ); 
						} else {
							$lat = \strval( $gpxdata->trk->trkpt[0]['lat'] );
						}

						if (isset( $gpxdata->trk->trkseg->trkpt[0]['lon'] )) {
							$lon = \strval( $gpxdata->trk->trkseg->trkpt[0]['lon'] );  
						} else {
							$lon = \strval( $gpxdata->trk->trkpt[0]['lon'] );
						}
						
						//$htmlstring .= '<p>Lat: '. $lat .'</p>';
						//$htmlstring .= '<p>Lon: '. $lon .'</p>';
						//$htmlstring .= '<p>'. $gpx_dir . $f . '</p>';
						if ( isset( $lat ) && isset( $lon ) ) {
							gpxview_setpostgps($postid, $lat, $lon);
						}
					}

					// get the adress of the GPS-starting point, source: https://nominatim.org/release-docs/develop/api/Reverse/
					// only done for the first track
					// Mind: allow_url_fopen of the server has to be ON!
					$isallowed = \ini_get('allow_url_fopen');
					
					if ( ('true' == $showadress) &&  ('1' == $isallowed) ) {
						$url = 'https://nominatim.openstreetmap.org/reverse?lat=' . $lat . '&lon='. $lon . '&format=json&zoom=10&accept-language=de';
						$opts = array(
							  		'http'=>array(
										'method'=>'GET',
										'header'=>'User-Agent: PostmanRuntime/7.26.10' // just any user-agent to fake a human access
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

	// Generate the inline style for the CSS-Grid. Identical for all shortcodes!
	// --> moved to header in file fm_functions.php
	
	// Generate the html-code start with the surrounding Div
	$htmlstring .= '<div id=multifotobox'.$shortcodecounter.' class="mfoto_grid" style="max-width:'. $maxwidth .'px;">';
	$imgnr = 1;

	// Generate Fotorama images for fotorama-javascript-rendering
	if ($imageNumber > 0) {
		$htmlstring  .= '<div class="fotorama_multi_images" style="display : none"><figure><figcaption></figcaption></figure></div>'; // sieht unnötig aus, aber es geht nur so
		$htmlstring  .= '<div id="mfotorama'. $shortcodecounter .'" class="fotorama" data-auto="false" data-width="100%" data-navwidth="100%" data-fit="'. $fit .'" 
							  data-shadows="true" data-captions="'. $showcaption .'" data-ratio="'. $ratio .'" data-nav="thumbs" data-allowfullscreen="native" data-keyboard="false" data-hash="false">';
		
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
				$finalArray = [];

				foreach( $srcarr as $val){
					$val = trim($val);
					$tmp = \explode(' ', $val);
					$tmp[1] = \str_replace('w', '', $tmp[1]);
					$finalArray[ $tmp[1] ] = $tmp[0];
				}
				$finalArray[ strval(MAX_IMAGE_SIZE) ] = $up_url . '/' . $imgpath . '/' . $data["file"] . '.jpg';
				$phpimgdata[$imgnr-1]['srcset'] = $finalArray;	
			}

			elseif ( ($data['thumbinsubdir']) || ($data['thumbavail']) ) {
				$finalArray = [];
				
				if ( $data['thumbinsubdir'] ) {
					$thumbfile = $up_dir . '/' . $imgpath . '/' . $thumbsdir . '/' . $data["file"] . $thumbs;
					$thumburl  = $up_url . '/' . $imgpath . '/' . $thumbsdir . '/' . $data["file"] . $thumbs;
				} else {
					// thumbavail
					$thumbfile = $up_dir . '/' . $imgpath . '/' . $data["file"] . $thumbs;
					$thumburl  = $up_url . '/' . $imgpath . '/' . $data["file"] . $thumbs; 
				}
				
				list($thumbwidth, $height, $type, $attr) = getimagesize( $thumbfile );
				$finalArray[ strval( $thumbwidth ) ] = $thumburl;
				$finalArray[ strval(MAX_IMAGE_SIZE) ] = $up_url . '/' . $imgpath . '/' . $data["file"] . '.jpg';
				$phpimgdata[$imgnr-1]['srcset'] = $finalArray;	
			}

			$phpimgdata[$imgnr-1]['id'] = $imgnr;
			$phpimgdata[$imgnr-1]['title'] = $alttext; //$data['title'];
			$phpimgdata[$imgnr-1]['coord'][0] = round( $data['lat'], 6 );
			$phpimgdata[$imgnr-1]['coord'][1] = round( $data['lon'], 6 );

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
	if ($showmap  == 'true') {
		$mapid = 'map' . strval($shortcodecounter); 
		$htmlstring  .= '<div id=box' . $mapid .' class="boxmap">';
		$htmlstring  .= '<div id="'. $mapid .'" class="leafmap" style="height:'. $mapheight .'px;"></div>';
		// Custom Summary
		if ($i > 0) { // number of gpxtracks at least 1 !
			$htmlstring  .= '<div id="elevation-div'. strval($shortcodecounter) .'" style="height:'. $chartheight .'px;" class="leaflet-control elevation"></div>';
			$htmlstring  .= '<div id="data-summary'.strval($shortcodecounter) .'" class="data-summary">';
			$htmlstring  .= '<span class="totlen">';
			$htmlstring  .= '<span class="summarylabel"> </span>';
			$htmlstring  .= '<span class="summaryvalue">0</span></span> ';
			$htmlstring  .= '<span class="gain">';
			$htmlstring  .= '<span class="summarylabel"> </span>';
			$htmlstring  .= '<span class="summaryvalue">0</span> </span> ';
			$htmlstring  .= '<span class="loss">';
			$htmlstring  .= '<span class="summarylabel"> </span>';
			$htmlstring  .= '<span class="summaryvalue">0</span> </span> </div>';
		}
		//$htmlstring  .= '</div>'; // uncommented to include fm-dload in grid of the boxmap, showing directly under the map
	}
	
	// ----------------------------------------------------
	$htmlstring  .= '<div class="fm-dload">';
	// provide GPX-download if defined
	if ( ($dload == 'true') and ($i > 0))  {
		if ($i == 1) {
			$htmlstring .= '<p>' . t('Download', $lang) . ': <a download="' . $gpxfile . '" href="' . $gpx_url . $gpxfile . '">'. $gpxfile .'</a></p>';
		} else {
			$gpxf = explode(',',$gpxfile);
			$htmlstring .= '<p><strong>' . t('Download', $lang) . ': '; // <a download=""</a>
			foreach ($gpxf as $f){
				$htmlstring .= ' <a download="' . $f . '" href="' . $gpx_url . $f . '">'. $f .' - </a>';
			}
			$htmlstring .= '</strong></p>';
		}
	}
	
	// produce starting point description,  
	if ( 'true' == $showadress ) {
		$geoadresstest =  get_post_meta($postid,'geoadress');
		if ( ! empty($geoadresstest[0]) ) {
			$test = $geoadresstest[0]; // we need only the first index
			$geoadress = maybe_unserialize($test);	// type conversion to array
			//$htmlstring .= '<p>'. $adresstext .': </p>';
		
			$v = '';
			foreach ($geoadress as $key => $value) {
				if ($key != 'country') {
					$v .= $value . ', ';
				} else {
					$v .= $value;
					break;
				}
			}

			if ( \current_user_can('edit_posts') && ('true' == $showadress) &&  ('0' == $isallowed) ) {
				$v = 'Your Server is not set correctly! Cannot read address for GPX-Data. Check server setting "allow_url_fopen"';
			}

			$lat = get_post_meta($postid,'lat');
			$lon = get_post_meta($postid,'lon');
			$googleurl = 'https://www.google.com/maps/place/' . $lat[0] . ',' . $lon[0] . '/@' . $lat[0] . ',' . $lon[0] . ',9z';
			$v2 = '<a href="' .$googleurl. '" target="_blank" rel="noopener noreferrer">'. $v .'</a>';
			if ($adresstext != 'Start address'){
				$htmlstring .= '<p>'. $adresstext. ': ' .  $v2 . '</p>';
			} else {
				$htmlstring .= '<p>'. t('Start address', $lang) . ': ' .  $v2 . '</p>';
			}
		}
	}
    $htmlstring  .= '</div>'; // end <div class="fm-dload"> is empty w/o dload or startadress 
	// ----------------------------------------------------
	
	if ($showmap  == 'true') {
        $htmlstring  .= '</div>'; // end for boxmap. div ends here to have fm-dload underneath the map
	}

	// close all html-divs
	$htmlstring  .= '</div><!--div id=multifotobox'.$shortcodecounter.'-->';
	
	// pass php variabls to javascript-file for fotorama
	wp_localize_script('fotorama_multi_js', 'wpfm_phpvars' . $shortcodecounter, array(
		'ngpxfiles'  => $i,
		'imagepath' => $wp_fotomulti_path,
		'imgdata' => $phpimgdata ?? [],
		'tracks' => $tracks,
		'eletheme' => $eletheme,
		'mapheight' => $mapheight,
		'chartheight' => $chartheight,
		'showalltracks' => $showalltracks,
		'mapcenter' => $mapcenter,
		'zoom' => $zoom,
		'markertext' => $markertext,
 		) 
	);

	$shortcodecounter++;

	return $htmlstring;
}