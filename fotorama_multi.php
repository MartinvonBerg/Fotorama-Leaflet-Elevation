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
 * Version:           0.5.1
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
register_activation_hook( plugin_basename( __FILE__ ) , '\mvbplugins\fotoramamulti\fotoramamulti_activate' );

// define globals and load all functions 
const MAX_IMAGE_SIZE =  2560; // value for resize to ...-scaled.jpg TODO: big_image_size_threshold : read from WP settings. read from WP settings. wp_options: large_size_w. Did not work
require_once __DIR__ . '/inc/stateTransitions.php';
require_once __DIR__ . '/inc/fm_functions.php';
require_once __DIR__ . '/languages/locales_i18n.php';

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

	// show notice if not resetted by shutdown hook function.
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
	$tracks = [];
	$postimages = []; // array with images for the Yoast XML Sitemap
	$thumbsdir = 'thumbs'; // we use a fixed name for the subdir containing the thumbnails
	static $shortcodecounter = 0; // counts the number of shortcodes on ONE page!
	$currentTheme = \get_stylesheet();
	
 	// Get Values from Admin settings page
 	$fotorama_elevation_options = get_option( 'fotorama_elevation_option_name' ); // Array of All Options
 	
	// Extract shortcode-Parameters and set Default-Values
	extract ( shortcode_atts ( array (
		'gpxpath' 			=> $fotorama_elevation_options['path_to_gpx_files_2'] ?? 'gpx',
		'gpxfile' 			=> 'test.gpx',
		'mapheight' 		=> $fotorama_elevation_options['height_of_map_10'] ?? '450',
		'chartheight' 		=> $fotorama_elevation_options['height_of_chart_11'] ?? '200',
		'imgpath' 			=> $fotorama_elevation_options['path_to_images_for_fotorama_0'] ?? 'Bilder',
		'dload' 			=> $fotorama_elevation_options['download_gpx_files_3'] ?? 'yes', 
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
		'showalltracks' 	=> $fotorama_elevation_options['showalltracks'] ?? 'false',
		'mapcenter' 		=> $fotorama_elevation_options['mapcenter'] ?? '0.0, 0.0', 
		'zoom' 				=> $fotorama_elevation_options['zoom'] ?? 8,					
		'markertext' 		=> $fotorama_elevation_options['markertext'] ?? 'Home address',
		'fit' 				=> $fotorama_elevation_options['fit'] ?? 'cover', // 'contain' Default, 'cover', 'scaledown', 'none'
		'ratio' 			=> $fotorama_elevation_options['ratio'] ?? '1.5',
		'background' 		=> $fotorama_elevation_options['background'] ?? 'darkgrey', // background color in CSS name
		'nav' 				=> $fotorama_elevation_options['nav'] ?? 'thumbs', // Default: 'dots', 'thumbs', false, // funktioniert nicht
		'navposition' 		=> $fotorama_elevation_options['navposition'] ?? 'bottom', // 'top'
		'navwidth' 			=> $fotorama_elevation_options['navwidth'] ?? '100', // in percent
		'f_thumbwidth' 		=> $fotorama_elevation_options['f_thumbwidth'] ?? '100', // in pixels
		'f_thumbheight' 	=> $fotorama_elevation_options['f_thumbheight'] ?? '75', // in pixels
		'thumbmargin' 		=> $fotorama_elevation_options['thumbmargin'] ?? '2', // in pixels
		'thumbborderwidth' 	=> $fotorama_elevation_options['thumbborderwidth'] ?? '2', // in pixels
		'thumbbordercolor' 	=> $fotorama_elevation_options['thumbbordercolor'] ?? '#ea0000', // background color in CSS name or HEX-value. The color of the last shortcode on the page will be taken.
		'transition' 		=> $fotorama_elevation_options['transition'] ?? 'crossfade', // 'slide' Default 'crossfade' 'dissolve'
		'transitionduration' => $fotorama_elevation_options['transitionduration'] ?? '400', // in ms
		'loop' 				=> $fotorama_elevation_options['loop'] ?? 'true', // true or false
		'autoplay' 			=> $fotorama_elevation_options['autoplay'] ?? '3000', // on with 'true' or any interval in milliseconds.
		'arrows' 			=> $fotorama_elevation_options['arrows'] ?? 'true',  // true : Default, false, 'always' : Do not hide controls on hover or tap
		'shadows' 			=> $fotorama_elevation_options['shadows'] ?? 'true' , // true or false
		'shortcaption'		=> 'false'
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
	if ( \current_user_can('edit_posts') && $setCustomFields && (0 === $shortcodecounter) && ( $imageNumber > 0)) {
			gpxview_setpostgps($postid, $data2[0]['lat'], $data2[0]['lon']);
	}

	if ( \current_user_can('edit_posts') && $setCustomFields && $doYoastXmlSitemap && $draft_2_pub ) {
		// create array to add the image-urls to Yoast-seo xml-sitemap
		$firstpart = $up_url . \DIRECTORY_SEPARATOR . $imgpath . \DIRECTORY_SEPARATOR;
		foreach ($data2 as $data) {
			$img2add = $firstpart . $data['file'] . $data['extension'];
			$postimages[] = array(
				'src' => $img2add,
				'alt' => $data['title'],
				'title' => $data['title']
			);
		}

		if ( (0 === $shortcodecounter) ) {
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

			// set the alt-tag for SEO 
			// $data['alt'] is only set if image is in wp media library, otherwise it is empty.
			if ( $data['alt'] !== '') {
				$alttext = $data['alt'];
			} elseif ( $data['descr'] !== '' ) {
				$alttext = $data['descr'];
			} elseif ( $data['title'] !== 'notitle'	) {
				$alttext = $data['title'];
			} else {
				$alttext = __('Galeriebild') . ' ' . \strval( $imgnr );
			}

			// set the caption-title (1st line). For JPGs the title is copied from $iptc["2#005"], otherwise it is 'notitle'.
			if ( $data['title'] === 'notitle' && $data['descr'] === '' ) { 
				$data['title'] = __('Galeriebild') . ' ' . \strval( $imgnr );
			} elseif ( $data['descr'] != '' ) {
				$data['title'] = substr( $data['descr'], 0, 80); 
			}

			// get the image srcset if the image is in WP-Media-Catalog, otherwise not. in: $data, 
			// Code-Example with thumbs with image srcset (https://github.com/artpolikarpov/fotorama/pull/337)
			$phpimgdata[] = getSrcset( $data, $up_url, $up_dir, $imgpath, $thumbsdir );
			$phpimgdata[$imgnr-1]['id'] = $imgnr;
			$phpimgdata[$imgnr-1]['title'] = $alttext; 
			$phpimgdata[$imgnr-1]['coord'][0] = round( $data['lat'], 6 );
			$phpimgdata[$imgnr-1]['coord'][1] = round( $data['lon'], 6 );

			// generate the caption
			if ( $shortcaption === 'false') {
				// hot-fix for the new 2022 theme of WordPress. With usage of '<br>' or other html-tages the string of the caption is partly replaced by html-entities, e.g. &#8222 or so.
				// Due to this the caption is not correct and fotorama breaks. Theoretically the usage of <br> within the string is NOT correct. It's better to use <p></p> for the three lines.
				// But these HTML-tags are also replace by html-entities, which leads to inconsitencies.
				// The only fif for the moment is to remove linebreaks for 2022-theme, or to use shortcaption, or no caption at all.
				// In CSS there is no method to force line-breaks. I could be done with JS or jQuery but this is somewhat overdone.
				// TODO: Find a better solution for that.
				if ( $currentTheme == 'twentytwentytwo')
					$caption = 'data-caption="' .$imgnr. ' / ' .$imageNumber . ': ' . $data["title"] . ' ' . $data['camera'] . ' ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'] . '"';
				else
					$caption = "data-caption=\"{$imgnr} / {$imageNumber}: {$data['title']}<br>{$data['camera']}<br>{$data['focal_length_in_35mm']} mm / f/{$data['aperture']} / {$data['exposure_time']} s / ISO{$data['iso']} / {$data['DateTimeOriginal']}\"";
				//$caption = 'data-caption="' .$imgnr. ' / ' .$imageNumber . ': ' . $data["title"] . ' lnbrk ' . $data['camera'] . ' lnbrk ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'] . '"';
				
			} else {
				//$caption = "data-caption=\"{$imgnr} / {$imageNumber}: {$data['title']}\"";
				$caption = 'data-caption="' .$imgnr. ' / ' .$imageNumber . ': ' . $data["title"] . '"';
			};

			if ( $showcaption === 'false') $caption = '';

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
		$htmlstring  .= "</div>";
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
 		) 
	);

	$shortcodecounter++;

	return $htmlstring;
}