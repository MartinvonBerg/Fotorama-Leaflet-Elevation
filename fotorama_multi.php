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
 * Version:           0.10.2
 * Author:            Martin von Berg
 * Author URI:        https://www.berg-reise-foto.de/software-wordpress-lightroom-plugins/wordpress-plugins-fotos-und-gpx/
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
register_activation_hook( plugin_basename( __FILE__ ) ,   '\mvbplugins\fotoramamulti\fotoramamulti_activate' );
register_deactivation_hook( plugin_basename( __FILE__ ) , '\mvbplugins\fotoramamulti\fotoramamulti_deactivate' );

// define global Constants  
const MAX_IMAGE_SIZE =  2560; // value for resize to ...-scaled.jpg TODO: big_image_size_threshold : read from WP settings. read from WP settings. wp_options: large_size_w. Did not work
const THUMBSDIR = 'thumbs';

// load all functions
require_once __DIR__ . '/inc/stateTransitions.php';
require_once __DIR__ . '/inc/fm_functions.php';
require_once __DIR__ . '/languages/locales_i18n.php';
require_once __DIR__ . '/inc/yoastXmlSitemap.php';
require_once __DIR__ . '/inc/gtb_blocks.php';

// -------- show admin page if request is for admin page
if ( is_admin() ) {
	require_once __DIR__ . '/inc/admin_settings.php';
	$fotorama_elevation = new FotoramaElevation();
	
	// do the check for activated plugins that may conflict with leaflet.js
	$wp_act_pis = get_option('active_plugins');
	$wp_act_pis = \implode(', ',$wp_act_pis);
	$fm_act_pis = \get_option('fm_plugins_checker');
	if ( $wp_act_pis != $fm_act_pis['active_plugins']) {
		$fm_act_pis['active_plugins'] = $wp_act_pis;
		$fm_act_pis['plugins_changed'] = 'true';
		update_option('fm_plugins_checker', $fm_act_pis);
	}

	// show notice if not resetted by shutdown hook function.
	if ( 'true' == $fm_act_pis['show_admin_message'] ) {
		add_action( 'all_admin_notices', '\mvbplugins\fotoramamulti\fm_error_notice' ); // all_admin_notices for multisite
	}
}
add_action( 'shutdown', '\mvbplugins\fotoramamulti\action_shutdown', 10, 1 );

// ------------------ shortcode function ------------------------------------------
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
	$addPermalink = get_option( 'fotorama_elevation_option_name')['useCDN_13'] == 'true'; // re-used for addPermalink now!
	
	// --- Variables -----------------------------------
	$postid = get_the_ID();
	$htmlstring = ''; 
	$tracks = [];
	$thumbsdir = THUMBSDIR; // we use a fixed name for the subdir containing the thumbnails
	static $shortcodecounter = 0; // counts the number of shortcodes on ONE page!
	$currentTheme = \get_stylesheet(); // required for special caption for theme 2022 with WP 5.9
	
 	// Get Values from Admin settings page
 	$fotorama_elevation_options = get_option( 'fotorama_elevation_option_name' ); // Array of All Options
 	
	// Extract shortcode-Parameters and set Default-Values
	extract ( shortcode_atts ( array (
		'gpxpath' 			=> $fotorama_elevation_options['path_to_gpx_files_2'] ?? 'gpx', 
		'gpxfile' 			=> 'test.gpx',
		'mapheight' 		=> $fotorama_elevation_options['height_of_map_10'] ?? '450',
		'chartheight' 		=> $fotorama_elevation_options['height_of_chart_11'] ?? '200',
		'imgpath' 			=> $fotorama_elevation_options['path_to_images_for_fotorama_0'] ?? 'Bilder',
		'dload' 			=> $fotorama_elevation_options['download_gpx_files_3'] ?? 'true', 
		'alttext' 			=> $fotorama_elevation_options['general_text_for_the_fotorama_alt_9'] ?? '', 
		'ignoresort' 		=> $fotorama_elevation_options['ignore_custom_sort_6'] ?? 'false', 
		'showadress' 		=> $fotorama_elevation_options['show_address_of_start_7'] ?? 'true', 
		'showmap' 			=> 'true',
		'adresstext' 		=> $fotorama_elevation_options['text_for_start_address_8'] ?? 'Startadresse',
		'requiregps' 		=> $fotorama_elevation_options['images_with_gps_required_5'] ?? 'true',
		'maxwidth' 			=> $fotorama_elevation_options['max_width_of_container_12'] ?? '600', 
		'minrowwidth' 		=> $fotorama_elevation_options['min_width_css_grid_row_14'] ?? '480',
		'showcaption' 		=> $fotorama_elevation_options['show_caption_4'] ?? 'true',
		'eletheme' 			=> $fotorama_elevation_options['colour_theme_for_leaflet_elevation_1'], 
		'showalltracks' 	=> $fotorama_elevation_options['showalltracks'] ?? 'false', // not in gtb block
		'mapcenter' 		=> $fotorama_elevation_options['mapcenter'] ?? '0.0, 0.0', // not in gtb block
		'zoom' 				=> $fotorama_elevation_options['zoom'] ?? 8,		// not in gtb block			
		'markertext' 		=> $fotorama_elevation_options['markertext'] ?? 'Home address', // not in gtb block
		'fit' 				=> $fotorama_elevation_options['fit'] ?? 'cover', // 'contain' Default, 'cover', 'scaledown', 'none'
		'ratio' 			=> $fotorama_elevation_options['ratio'] ?? '1.5',
		'background' 		=> $fotorama_elevation_options['background'] ?? 'darkgrey', // background color in CSS name
		//'nav' 				=> $fotorama_elevation_options['nav'] ?? 'thumbs', // Default: 'dots', 'thumbs', 'false' // funktioniert nicht: andere Werte als thums zeigen nicht alle Bilder im Slider!
		'navposition' 		=> $fotorama_elevation_options['navposition'] ?? 'bottom', // 'top'
		'navwidth' 			=> $fotorama_elevation_options['navwidth'] ?? '100', // in percent
		'f_thumbwidth' 		=> $fotorama_elevation_options['f_thumbwidth'] ?? '100', // in pixels
		'f_thumbheight' 	=> $fotorama_elevation_options['f_thumbheight'] ?? '75', // in pixels
		'thumbmargin' 		=> $fotorama_elevation_options['thumbmargin'] ?? '2', // in pixels
		'thumbborderwidth' 	=> $fotorama_elevation_options['thumbborderwidth'] ?? '2', // in pixels
		'thumbbordercolor' 	=> $fotorama_elevation_options['thumbbordercolor'] ?? '#ea0000', // background color in CSS name or HEX-value. The color of the last shortcode on the page will be taken.
		'transition' 		=> $fotorama_elevation_options['transition'] ?? 'crossfade', // 'slide' Default 'crossfade' 'dissolve'
		'transitionduration'=> $fotorama_elevation_options['transitionduration'] ?? '400', // in ms
		'loop' 				=> $fotorama_elevation_options['loop'] ?? 'true', // true or false
		'autoplay' 			=> $fotorama_elevation_options['autoplay'] ?? 'false', // on with 'true' or any interval in milliseconds.
		'arrows' 			=> $fotorama_elevation_options['arrows'] ?? 'true',  // true : Default, false, 'always' : Do not hide controls on hover or tap
		'shadows' 			=> $fotorama_elevation_options['shadows'] ?? 'true', // true or false
		'shortcaption'		=> 'false',
		'mapselector'       => $fotorama_elevation_options['mapselector'] ?? 'OpenTopoMap'
	), $attr));
	$mapcenter = explode(',',$mapcenter);

	// Detect Language of the client request
	if ( array_key_exists('HTTP_ACCEPT_LANGUAGE', $_SERVER) ) {
		$lang = substr(\explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE'])[0], 0, 2); 
	} else {
		$lang = 'en';
	}

	// add inline CSS for fotorama CSS settings
	$custom_css1 = ".fotorama__stage { background-color: {$background}; }";
    wp_add_inline_style( 'fotorama_css', $custom_css1 );
				  
	$custom_css2 = ".fotorama__thumb-border { border-color: {$thumbbordercolor}; }";
	wp_add_inline_style( 'fotorama3_css', $custom_css2 );

	if ( $showcaption === 'false') {
		$custom_css3 = ".fotorama__caption__wrap { display: none; }";
		wp_add_inline_style( 'fotorama3_css', $custom_css3 );
	}
				
	
	// Define path and url variables
	$up_url = gpxview_get_upload_dir('baseurl');  // upload_url
	$up_dir = wp_get_upload_dir()['basedir'];     // upload_dir
	$gpx_dir = $up_dir . '/' . $gpxpath . '/';    // gpx_dir
	$gpx_url = $up_url . '/' . $gpxpath . '/';    // gpx_url
	$imagepath = $up_dir . '/' . $imgpath;        // path to the images
	$imageurl = $up_url . '/' . $imgpath;         // url to the images-url in uploads directory
	$plugin_path = plugins_url('/', __FILE__);
	$wp_fotomulti_path = $plugin_path . 'images/';

	
	// Loop through all webp- and jpg-files in the given folder, and get the required data
	require_once __DIR__ . '/inc/readImageFolder.php';
	$folder = new ReadImageFolder( $imagepath, $thumbsdir, $imageurl, $requiregps, $ignoresort );
	$data2 = $folder->getImagesForGallery();
	$imageNumber = $folder->getImageNumber();
	$allImgInWPLibrary = $folder->areAllImgInWPLibrary();
	$folder = null;

	// check if customsort is possible, if yes sort ascending, if no sort with date taken and ascending
	// Did not work to move it to the class for reading out images. So it is still here.
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

	// ------------- custom fields, move to admin and class
	// On Status change from published to draft delete Custom-Fields 'lat' 'lon' and 'geoadress' from the post.
	// But the update requires now a status transition from published to draft and back.
	
	if ($pub_2_draft) {
		delete_post_meta($postid,'lat');
		delete_post_meta($postid,'lon');
		delete_post_meta($postid,'geoadress');

		// Does not work in Quick-Edit-Mode. The pages has to be open in editor to set the parent.
		foreach ($data2 as $data) {
			if ($data['wpid'] > 0){
				$media_post = wp_update_post( 
					array(
					'ID'            => $data['wpid'],
					'post_parent'   => '',
				), false );
			}
		}
	}

	// on Status change from draft to published set the parent of the image, if they are in the WP media library.
	// Does not work in Quick-Edit-Mode. The pages has to be open in editor to set the parent.
	if ($draft_2_pub){
		foreach ($data2 as $data) {
			if ($data['wpid'] > 0){
				$media_post = wp_update_post( 
					array(
					'ID'            => $data['wpid'],
					'post_parent'   => $postid,
				), false );
			}
		}
	}
	
	// preset Custom-Field 'lat' and 'lon' of the post with GPS-Data of the first image 
	// Will be overwritten with the first trackpoint of the GPX-track, if there is one provided
	if ( \current_user_can('edit_posts') && $setCustomFields && (0 === $shortcodecounter) && ( $imageNumber > 0)) {
			gpxview_setpostgps($postid, $data2[0]['lat'], $data2[0]['lon']);
	}

		
	// --------------- HTML -------------------
	// parse GPX-Track-Files, check if it is a file, and if so append it to the string to pass to javascript
	list( $gpxfile, $tracks, $i ) = parseGPXFiles( $postid, $gpxfile, $gpx_dir, $gpx_url, $showadress, $setCustomFields, $shortcodecounter );
		
	// Generate the html-code start with the surrounding Div
	$htmlstring .= "<div id=\"multifotobox{$shortcodecounter}\" class=\"mfoto_grid\" style=\"max-width:{$maxwidth}px;\">";
	
	// Generate html for Fotorama images for fotorama-javascript-rendering
	if ($imageNumber > 0) {
		$imgnr = 1;
		// die erste Zeile sieht unnötig aus, aber es geht nur so
		$htmlstring .= <<<EOF

<div class="fotorama_multi_images" style="display:none;"><figure><figcaption></figcaption></figure></div> 
<div id="mfotorama{$shortcodecounter}" class="fotorama" 
		data-autoplay="{$autoplay}" 
		data-stopautoplayontouch="true"
		data-width="100%" 
		data-allowfullscreen="native" 
		data-keyboard="false" 
		data-hash="false"
		data-captions="{$showcaption}"
		data-fit="{$fit}" 
		data-ratio="{$ratio}" 
		data-nav="thumbs" 
		data-navposition="{$navposition}"
		data-navwidth="{$navwidth}%"
		data-thumbwidth="{$f_thumbwidth}" 
		data-thumbheight="{$f_thumbheight}" 
		data-thumbmargin="{$thumbmargin}"
		data-thumbborderwidth="{$thumbborderwidth}"
		data-transition="{$transition}"
		data-transitionduration="{$transitionduration}"
		data-loop="{$loop}"
		data-arrows="{$arrows}"
		data-shadows="{$shadows}">

EOF;

		// loop through the data extracted from the images in folder and generate the div depending on the availability of thumbnails
		foreach ($data2 as $data) {

			// set the alt-tag and the title for SEO
			if ( 'notitle' == $data['title'] ) {
				$data['title'] = __('Galeriebild') . ' '. \strval( $imgnr );
			}
			$alttext = $data['alt'] != '' ? $data['alt'] : $data['title'];

			// generate the caption for html and javascript
			if ( $shortcaption === 'false') {
				$caption = 'data-caption="' .$imgnr. ' / ' .$imageNumber . ': ' . $data["title"] . ' || ' . $data['camera'] . ' || ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'] . '"';
				$jscaption = $imgnr. ' / ' .$imageNumber . ': ' . $data["title"] . ' || ' . $data['camera'] . ' || ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'];	
			} else {
				$caption = 'data-caption="' .$imgnr. ' / ' .$imageNumber . ': ' . $data["title"] . '"';
				$jscaption = $imgnr. ' / ' .$imageNumber . ': ' . $data["title"];
			};
			if ( $showcaption === 'false') {
				$caption = '';
				$jscaption = '';
			}

			// get the image srcset if the image is in WP-Media-Catalog, otherwise not. in: $data, 
			// Code-Example with thumbs with image srcset (https://github.com/artpolikarpov/fotorama/pull/337)
			$phpimgdata[] = getSrcset( $data, $up_url, $up_dir, $imgpath, $thumbsdir );
			$phpimgdata[$imgnr-1]['id'] = $imgnr;
			$phpimgdata[$imgnr-1]['title'] = $alttext; 
			$phpimgdata[$imgnr-1]['coord'][0] = round( $data['lat'], 6 );
			$phpimgdata[$imgnr-1]['coord'][1] = round( $data['lon'], 6 );
			$phpimgdata[$imgnr-1]['permalink'] = $data['permalink'] ?? '';
			$phpimgdata[$imgnr-1]['jscaption'] = $jscaption;

			// --------------- Proceed with HTML -------------------
			if ( $data['thumbinsubdir'] ) {
				$htmlstring .= <<<EOF
		<a href="{$up_url}/{$imgpath}/{$data['file']}{$data['extension']}"
		 {$caption}
		<img loading="lazy" alt="{$alttext}" src="{$up_url}/{$imgpath}/{$thumbsdir}/{$data['file']}{$data['thumbs']}"></a>
EOF;
			
			} elseif ( $data['thumbavail'] ) {
					
				$htmlstring .= <<<EOF
		<a href="{$up_url}/{$imgpath}/{$data['file']}{$data['thumbs']}" 
		 {$caption}
		<img loading="lazy" alt="{$alttext}" src="{$up_url}/{$imgpath}/{$data['file']}{$data['thumbs']}"></a>
EOF;

			} else { // do not add srcset here, because this is for folders without thumbnails. If this is the case we don't have image-sizes for the srcset
				$htmlstring .= <<<EOF
		<img loading="lazy" alt="{$alttext}" src="{$up_url}/{$imgpath}/{$data['file']}{$data['extension']}"
		 {$caption}>
EOF;
			};
			$imgnr++;
		}
		$htmlstring  .= "</div><!--div id=end-of-slider -->";
	}

	// show Map only with valid gpx-tracks and if so, generate the div
	if ($showmap  == 'true') {
		$mapid = 'map' . strval($shortcodecounter); 
		$htmlstring  .= "<div id=\"box{$mapid}\" class=\"boxmap\">";
		$htmlstring  .= "<div id=\"{$mapid}\" class=\"leafmap\" style=\"height:{$mapheight}px;\"></div>";
		// Custom Summary
		if ($i > 0) { // number of gpxtracks at least 1 !
			$htmlstring .= <<<EOF

		<div id="elevation-div{$shortcodecounter}" style="height:{$chartheight}px;" class="leaflet-control elevation"></div>
		<div id="data-summary{$shortcodecounter}" class="data-summary">
		<span class="totlen">
		<span class="summarylabel"> </span>
		<span class="summaryvalue">0</span></span>
		<span class="gain">
		<span class="summarylabel"> </span>
		<span class="summaryvalue">0</span></span> 
		<span class="loss">
		<span class="summarylabel"> </span>
		<span class="summaryvalue">0</span></span></div>
EOF;
		}
		//$htmlstring  .= '</div>'; // uncommented to include fm-dload in grid of the boxmap, showing directly under the map
	}
	
	// ----------------------------------------------------
	$htmlstring  .= '<div class="fm-dload">';

	// provide GPX-download if defined
	if ( ('true' == $dload ) and ($i > 0))  {
		$text = t('Download', $lang);
		
		if ($i == 1) {
			$htmlstring .= "<p>{$text} : <a download=\"{$gpxfile}\" href=\"{$gpx_url}{$gpxfile}\">{$gpxfile}</a></p>";
		} else {
			$gpxf = explode(',',$gpxfile);
			$htmlstring .= "<p><strong>{$text} : "; // <a download=""</a>
			foreach ($gpxf as $f){
				$htmlstring .= "<a download=\"{$f}\" href=\"{$gpx_url}{$f}\">{$f} - </a>";
			}
			$htmlstring .= "</strong></p>";
		}
	}

	// produce starting point description,  
	if ( 'true' == $showadress ) {
		$geoadresstest =  get_post_meta($postid,'geoadress');
		if ( ! empty($geoadresstest[0]) ) {
			$test = $geoadresstest[0]; // we need only the first index
			$geoadress = maybe_unserialize($test);	// type conversion to array
				
			$v = '';
			foreach ($geoadress as $key => $value) {
				if ($key != 'country') {
					$v .= $value . ', ';
				} else {
					$v .= $value;
					break;
				}
			}

			if ( \current_user_can('edit_posts') && ('true' == $showadress) &&  ('0' == \ini_get('allow_url_fopen') ) ) {
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
	
	// end for boxmap. div ends here to have fm-dload underneath the map
	if ($showmap  == 'true') {
        $htmlstring  .= '</div>'; 
	}
	
	if ($addPermalink && $allImgInWPLibrary && ($i < 2) && ( $imageNumber > 0)){
		$htmlstring  .= '<div class="fm-attach-link">';
		$htmlstring .= '<a href="" target="_blank">';
		$htmlstring .= '<div class="fm-itemsButtons" type="info"><svg height="20px" style="fill: rgb(255, 255, 255);" version="1.1" viewBox="0 0 46 100" width="46px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M35.162,0c6.696,0,10.043,4.567,10.043,9.789c0,6.522-5.814,12.555-13.391,12.555c-6.344,0-10.045-3.752-9.869-9.947   C21.945,7.176,26.35,0,35.162,0z M14.543,100c-5.287,0-9.164-3.262-5.463-17.615l6.07-25.457c1.057-4.077,1.23-5.707,0-5.707   c-1.588,0-8.451,2.816-12.51,5.59L0,52.406C12.863,41.48,27.662,35.072,34.004,35.072c5.285,0,6.168,6.361,3.525,16.148   L30.58,77.98c-1.234,4.729-0.703,6.359,0.527,6.359c1.586,0,6.787-1.963,11.896-6.041L46,82.377C33.488,95.1,19.83,100,14.543,100z   "></path></g><g></svg></div>';
		$htmlstring .= '</a></div>';
	}

	// close all html-divs
	$htmlstring  .= '</div><!--div id=multifotobox'.$shortcodecounter.'-->';
	
	// pass php variables to javascript-file for fotorama
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
		'fit' => $fit,
		'mapselector' => $mapselector,
 		) 
	);

	$shortcodecounter++;

	return $htmlstring;
}