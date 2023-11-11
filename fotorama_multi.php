<?php
namespace mvbplugins\fotoramamulti;

/**
 *
 * @link              https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation
 * @since             5.3.0
 * @package           fotorama_multi
 *
 * @wordpress-plugin
 * Plugin Name:       Slider + Leaflet-Map + Chart
 * Plugin URI:        https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation
 * Description:       Image and Video Slider, Leaflet Map and Elevation Chart Integration. Shows images from any directory in your upload folder. Uses Fotorama or Swiper for the Slider.
 * Version:           0.24.0
 * Requires at least: 5.9
 * Requires PHP:      7.4
 * Author:            Martin von Berg
 * Author URI:        https://www.berg-reise-foto.de/software-wordpress-lightroom-plugins/wordpress-plugins-fotos-und-gpx/
 * License:           GPL-2.0
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */


// fallback for wordpress security
if ( ! defined('ABSPATH' )) die('Are you ok?');

// define global Constants  
const MAX_IMAGE_SIZE =  2560; // value for resize to ...-scaled.jpg TODO: big_image_size_threshold : read from WP settings. read from WP settings. wp_options: large_size_w. Did not work
const THUMBSDIR = 'thumbs';

// init the database settings for the admin panel on first activation of the plugin. Does not overwrite
require_once __DIR__ . '/inc/init_database.php';
register_activation_hook( plugin_basename( __FILE__ ) ,   '\mvbplugins\fotoramamulti\fotoramamulti_activate' );
register_deactivation_hook( plugin_basename( __FILE__ ) , '\mvbplugins\fotoramamulti\fotoramamulti_deactivate' );

// load all functions
require_once __DIR__ . '/inc/stateTransitions.php';
require_once __DIR__ . '/inc/fm_functions.php';
require_once __DIR__ . '/languages/locales_i18n.php';
require_once __DIR__ . '/inc/yoastXmlSitemap.php';
require_once __DIR__ . '/inc/gtb_blocks.php';

// -------- show admin page if request is for admin page
if ( is_admin() ) {
	require_once __DIR__ . '/inc/admin_settings.php';
	$fotorama_elevation = new FotoramaElevationAdmin();
	$fotorama_elevation_options = get_option( 'fm_leaflet_options' );
	$fotorama_elevation->checkHtaccess() ? $fotorama_elevation_options['htaccess_Tile_Server_Is_OK'] = 'true' : $fotorama_elevation_options['htaccess_Tile_Server_Is_OK'] = 'false';
	update_option( 'fm_leaflet_options', $fotorama_elevation_options );
}

// ------------------ shortcode function ------------------------------------------
// define the shortcode to generate the image-slider with map
add_shortcode('gpxview', '\mvbplugins\fotoramamulti\showmulti');

// this is the function that runs if the post is rendered an the shortcode is found in the page. Somehow the main-function
function showmulti($attr, $content = null)
{
	//require_once __DIR__ . '/fotorama_multi_enq_scripts.php';
	$plugin_path = plugins_url('/', __FILE__);
	\wp_enqueue_style('swiperCss', $plugin_path . 'js/swiperClass.min.css',[],'0.24.0','all');
	\wp_enqueue_style('swiperThumbsCss', $plugin_path . 'js/thumbnailClass.min.css',[],'0.24.0','all');

	// Define global Values and Variables. We need the globals for the state-transition of the post.
	global $post_state_pub_2_draft;
	global $post_state_draft_2_pub;
	$pub_2_draft = $post_state_pub_2_draft ?? false;
	$draft_2_pub = $post_state_draft_2_pub ?? false;
		
	// --- Variables -----------------------------------
	$postid = get_the_ID();
	$htmlstring = ''; 
	$tracks = [];
	$thumbsdir = THUMBSDIR; // we use a fixed name for the subdir containing the thumbnails
	static $shortcodecounter = 0; // counts the number of shortcodes on ONE page!
	static $gpxTrackCounter = 0;
	static $fotoramaCounter = 0;
	static $swiperCounter = 0;
	static $masonryCounter = 0;
	static $pageVarsForJs = [];
	$page_options = [];
		
 	// Get Values from Admin settings page
 	// Array of All Options
	$fotorama_elevation_options = \array_merge(get_option('fm_fotorama_options'), get_option('fm_swiper_options'), get_option('fm_leaflet_options'), get_option('fm_gpx_options'), get_option('fm_common_options'), \get_option('fm_masonry_options'));
	$setCustomFields = $fotorama_elevation_options['setCustomFields_15'] === 'true'; // liefert 'true'
	$addPermalink = $fotorama_elevation_options['useCDN_13'] === 'true'; // re-used for addPermalink now!
 	
	// Extract shortcode-Parameters and set Default-Values
	extract ( shortcode_atts ( array (
		'gpxpath' 			=> $fotorama_elevation_options['path_to_gpx_files_2'] ?? 'gpx', 
		'gpxfile' 			=> 'test.gpx',
		'mapheight' 		=> $fotorama_elevation_options['height_of_map_10'] ?? '1000',
		'mapaspect'			=> $fotorama_elevation_options['aspect_ratio_of_map'] ?? '1.50',
		'chartheight' 		=> $fotorama_elevation_options['height_of_chart_11'] ?? '200',
		'imgpath' 			=> $fotorama_elevation_options['path_to_images_for_fotorama_0'] ?? 'Bilder',
		'filefilter'		=> '',
		'dload' 			=> $fotorama_elevation_options['download_gpx_files_3'] ?? 'true', 
		'alttext' 			=> $fotorama_elevation_options['general_text_for_the_fotorama_alt_9'] ?? '', 
		'ignoresort' 		=> $fotorama_elevation_options['ignore_custom_sort_6'] ?? 'true', 
		'sortorder'			=> $fotorama_elevation_options['sortorder'] ?? 'asc',
		'showadress' 		=> $fotorama_elevation_options['show_address_of_start_7'] ?? 'true', 
		'showmap' 			=> 'true',
		'showchart'			=> $fotorama_elevation_options['showchart'] ?? 'true',
		'adresstext' 		=> $fotorama_elevation_options['text_for_start_address_8'] ?? 'Startadresse',
		'requiregps' 		=> $fotorama_elevation_options['images_with_gps_required_5'] ?? 'true',
		'maxwidth' 			=> $fotorama_elevation_options['max_width_of_container_12'] ?? '600', 
		'minrowwidth' 		=> $fotorama_elevation_options['min_width_css_grid_row_14'] ?? '480',
		'showcaption' 		=> $fotorama_elevation_options['show_caption_4'] ?? 'true',
		'eletheme' 			=> $fotorama_elevation_options['colour_theme_for_leaflet_elevation_1'] ?? 'martin-theme', 
		'showalltracks' 	=> $fotorama_elevation_options['showalltracks'] ?? 'false', // not in gtb block
		'mapcenter' 		=> $fotorama_elevation_options['mapcenter'] ?? '0.0, 0.0', // not in gtb block
		'zoom' 				=> $fotorama_elevation_options['zoom'] ?? 8,		// not in gtb block			
		'markertext' 		=> $fotorama_elevation_options['markertext'] ?? 'Home address', // not in gtb block
		'fit' 				=> $fotorama_elevation_options['fit'] ?? 'cover', // 'contain' Default, 'cover', 'scaledown', 'none'
		'ratio' 			=> $fotorama_elevation_options['ratio'] ?? '1.5',
		'background' 		=> $fotorama_elevation_options['background'] ?? 'darkgrey', // background color in CSS name
		'sw_button_color'	=> $fotorama_elevation_options['sw_button_color'] ?? 'white', // swiper button color in CSS name or value
		'chart_fill_color'		=> $fotorama_elevation_options['chart_fill_color'] ?? 'white',
		'chart_background_color'=> $fotorama_elevation_options['chart_background_color'] ?? 'gray',
		'charttype'			=> $fotorama_elevation_options['charttype'] ??  'chartjs', // TODO setting
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
		'shortcaption'		=> $fotorama_elevation_options['short_caption'] ?? 'false', // true or false
		'mapselector'       => $fotorama_elevation_options['mapselector'] ?? 'OpenTopoMap',
		'slider'			=> $fotorama_elevation_options['slider'], // 'fotorama' or 'swiper' : secret shortcode
		'sw_effect'			=> $fotorama_elevation_options['sw_effect'], // Transition effect. Can be 'slide', 'fade', 'cube', 'coverflow', 'flip' or ('creative')
		'sw_zoom'			=> $fotorama_elevation_options['sw_zoom'], //
		'sw_fslightbox'		=> $fotorama_elevation_options['sw_fslightbox'], //'true',
		'sw_pagination'		=> 'false', // unused and no admin setting
		'sw_slides_per_view'=> 10, // unused and no admin setting
		'sw_transition_duration'=> intval($fotorama_elevation_options['transitionduration']) ?? 300,
		'sw_mousewheel'		=> $fotorama_elevation_options['sw_mousewheel'], //'true'
		'sw_hashnavigation' => $fotorama_elevation_options['sw_hashnavigation'], //'true'
		'sw_max_zoom_ratio'	=> $fotorama_elevation_options['sw_max_zoom_ratio'], //3
		'sw_thumbbartype'	=> $fotorama_elevation_options['sw_thumbbartype'], //'special'
		'sw_bar_margin_top'	=> $fotorama_elevation_options['sw_bar_margin_top'], //5,
		'sw_activetype'	 	=> $fotorama_elevation_options['sw_activetype'], //'active_border',
		// special parameters for masonry
		'mm_fslightbox'		=> $fotorama_elevation_options['mm_fslightbox'] ?? 'true', //'true',
		'mm_gutterx'		=> $fotorama_elevation_options['mm_gutterx'] ?? 5,
		'mm_guttery'		=> $fotorama_elevation_options['mm_guttery'] ?? 5,
		'mm_minify'			=> $fotorama_elevation_options['mm_minify'] ?? 'false',
		'mm_surrGutter'		=> $fotorama_elevation_options['mm_surrGutter'] ?? 'false',
		'mm_ultiGutter'		=> $fotorama_elevation_options['mm_ultiGutter'] ?? 5,
		'mm_dialogHeader'	=> $fotorama_elevation_options['mm_dialogHeader'] ?? 'h5'
	), $attr));

	$mapcenter = explode(',',$mapcenter);

	// Detect Language of the client request
	if ( array_key_exists('HTTP_ACCEPT_LANGUAGE', $_SERVER) ) {
		$lang = substr(\explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE'])[0], 0, 2); 
	} else {
		$lang = 'en';
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
	$folder = new ReadImageFolder( $imagepath, $thumbsdir, $imageurl, $requiregps, $ignoresort, $slider, $filefilter );
	$data2 = $folder->getImagesForGallery( $sortorder );
	$imageNumber = $folder->getImageNumber();
	$allImgInWPLibrary = $folder->areAllImgInWPLibrary();
	$folder = null;

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
				wp_update_post( 
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
				wp_update_post( 
					array(
					'ID'            => $data['wpid'],
					'post_parent'   => $postid,
				), false );
			}
		}
	}
	
	// preset Custom-Field 'lat' and 'lon' of the post with GPS-Data of the first image 
	// Will be overwritten with the first trackpoint of the GPX-track, if there is one provided
	// TODO: the first image is taken, so sorting does change the starting point. One might regard that as intentional.
	if ( \current_user_can('edit_posts') && $setCustomFields && (0 === $shortcodecounter) && ( $imageNumber > 0)) {
			gpxview_setpostgps($postid, $data2[0]['lat'], $data2[0]['lon']);
	}

		
	// --------------- HTML CODE GENERATION--------------------------------------------
	// parse GPX-Track-Files, check if it is a file, and if so append it to the string to pass to javascript
	list( $gpxfile, $tracks, $i ) = parseGPXFiles( $postid, $gpxfile, $gpx_dir, $gpx_url, $showadress, $setCustomFields, $shortcodecounter );
	// Generate the html-code start with the surrounding Div
	$htmlstring .= "<div id=\"multifotobox{$shortcodecounter}\" class=\"mfoto_grid\" style=\"max-width:{$maxwidth}px;\">";

	// used for all Elements on the page, not only the swiper. 
	$page_options = [
		'addPermalink' 			=> $addPermalink, 
		'allImgInWPLibrary' 	=> $allImgInWPLibrary,
		'sw_effect'				=> $sw_effect,
		'sw_zoom'				=> $sw_zoom,
		'sw_fslightbox'			=> $sw_fslightbox,
		'sw_pagination'			=> $sw_pagination,
		'sw_slides_per_view' 	=> $sw_slides_per_view, // unused with martins thumbnails
		'sw_transition_duration'=> $sw_transition_duration,
		'sw_mousewheel'			=> $sw_mousewheel,
		'sw_hashnavigation'  	=> $sw_hashnavigation,
		'sw_max_zoom_ratio'		=> $sw_max_zoom_ratio,
		'showcaption'			=> $showcaption,
		'shortcaption'			=> $shortcaption,
		'imgpath'				=> $imgpath,
		'slide_fit'				=> $fit,
		'sw_aspect_ratio'		=> $ratio,
		'sw_keyboard'			=> 'true', // fixed to this setting
		'background'			=> $background,
		'sw_button_color'		=> $sw_button_color,
		// thumbnails settings
		'f_thumbwidth'			=> $f_thumbwidth, // for swiper thumbs and for videos without thumbnails
		'thumbbartype'			=> $sw_thumbbartype, // 'integrated' or 'special'. 'multi' is from 'thumbnailClass.js'
		'navposition' 			=> 'bottom', //$navposition, // only 'bottom' is useful. for future change.
		'bar_margin_top'     	=> $sw_bar_margin_top . 'px', // top margin of thumbnail bar in px
		'bar_min_height'		=> $f_thumbheight . 'px', // now two values for the height!
		'bar_rel_height'		=> '1%', // Does not work.height of thumbnail bar in percent. Use 1% to have a fixed height. for future change.
		'nail_margin_side' 		=> $thumbmargin . 'px', // left and right margin of single thumb in pixels
		'nail_activeClass'		=> $sw_activetype, // available params: active, active_animation, active_border
		// only for active_border  
		'active_border_width'	=> $thumbborderwidth . 'px', // in pixels. only bottom border here!
		'active_border_color'	=> $thumbbordercolor, // '#ea0000', 
		'active_brightness'		=> '1.05', // brightness if activate. other values are: 0.6, 0.95, 1.05 currently unused. for future change.
		// for elevation chart
		'chart_fill_color'		=> $chart_fill_color,
		'chart_background_color'=> $chart_background_color,
		'minrowwidth'			=> $minrowwidth,
		// special parameters for masonry
		'mm_fslightbox'			=> $mm_fslightbox,
		'mm_gutterX'			=> $mm_gutterx,
		'mm_gutterY'			=> $mm_guttery,
		'mm_minify'				=> $mm_minify,
		'mm_surrGutter'			=> $mm_surrGutter,
		'mm_ultiGutter'			=> $mm_ultiGutter,
		'mm_dialogHeader'		=> $mm_dialogHeader,
		// responsive image sizes
		'image_sizes'			=> $fotorama_elevation_options['image_sizes']
	];
		
	// Generate html for Slider images for javascript-rendering
	if ($imageNumber > 0) {				
		if ( $slider === 'fotorama') {
			// load the scripts for fotorama here
			require_once __DIR__ . '/inc/fotoramaClass.php';
			$fotoramaCounter++;
			$fClass = new FotoramaClass( $shortcodecounter, $data2, $postid); // Attention: Inconsistent constructor!
			$htmlstring .= $fClass->getSliderHtml( $attr);
			$phpimgdata = $fClass->getImageDataForJS();
			$fClass = null;

		} elseif ( $slider === 'swiper') {
			// load the scripts for swiper here
			$swiperCounter++;
			require_once __DIR__ . '/inc/swiperClass.php';
		
			$fClass = new SwiperClass( $shortcodecounter, $data2, $page_options); // Attention: Inconsistent constructor!
			$htmlstring .= $fClass->getSliderHtml( $attr);
			$phpimgdata = $fClass->getImageDataForJS();
			$fClass = null;

			// load script for fslightbox. Move to if() one level above if used for fotorama-slider also.
			\mvbplugins\fotoramamulti\enqueue_fslightbox();

		} elseif ( $slider === 'masonry1') {
			$masonryCounter++;

			// reset all leaflet and chart settings to prevent html output
			$showmap  = 'false';
			$showadress = 'false';
			$dload = 'false';

			$htmlstring = "<div id=\"multifotobox{$shortcodecounter}\" style=\"max-width:{$maxwidth}px;\">";

			// load the class for masonry here and generate html for masonry gallery
			require_once __DIR__ . '/inc/miniMasonryClass.php';
			$fClass = new MiniMasonryClass( $shortcodecounter, $data2, $page_options); // Attention: Inconsistent constructor!
			$fClass->googleAPIkey = $fotorama_elevation_options['googleApiKey'];
			$htmlstring .= $fClass->getSliderHtml( $attr);
			$phpimgdata = $fClass->getImageDataForJS();
			$fClass = null;

			// load script for fslightbox. Move to if() one level above if used for fotorama-slider also.
			\mvbplugins\fotoramamulti\enqueue_fslightbox();
		} else return ''; // return nothing if there are images but no slider defined. Fallback for wrong logic.
	}

	// show Map only with valid gpx-tracks and if so, generate the div
	if ($showmap  == 'true') {
		$mapid = 'map' . strval($shortcodecounter); 
		$htmlstring  .= "<div id=\"box{$mapid}\" class=\"boxmap\">";
		$htmlstring  .= "<div id=\"{$mapid}\" class=\"leafmap\" style=\"max-height:{$mapheight}px;aspect-ratio:{$mapaspect}\"></div>";

		// show Elevation-Chart and custom summary
		if ($i > 0 && $showchart !== 'false') { // number of gpxtracks at least 1 ! <div id="elevation-div{$shortcodecounter}" style="height:{$chartheight}px;" class="leaflet-control elevation"></div>
			if ( $charttype !== 'chartjs' ) {
				$display = '';
				//if ( $showchart === 'false' ) $display = 'display:none';
				$htmlstring .= <<<EOF
				<div id="elevation-div{$shortcodecounter}" style="height:{$chartheight}px;{$display}"></div>
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
			// generate div and cancas for chartjs if chart should be shown 
			else {
				$htmlstring .= "<div class=\"chartjs-profile-container\" id=\"chartjs-profile-container{$shortcodecounter}\" style=\"height:{$chartheight}px;\"><canvas id=\"fm-elevation-chartjs{$shortcodecounter}\" style=\"width:100%;height:100%\"></canvas></div>";
				$htmlstring .= <<<EOF
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
		} 
	}
	
	// ----------------------------------------------------
	if ( ('true' === $showadress) || (('true' === $dload ) && ($i > 0)) )  {
		$htmlstring  .= '<div class="fm-dload">';
	
		// provide GPX-download if defined
		if ( ('true' === $dload ) && ($i > 0))  {
			$text = t('Download', $lang);
			
			if ($i == 1) {
				$htmlstring .= "<p>{$text}: <a download=\"{$gpxfile}\" href=\"{$gpx_url}{$gpxfile}\">{$gpxfile}</a></p>";
			} else {
				$gpxf = explode(',',$gpxfile);
				$htmlstring .= "<p><strong>{$text}: "; // <a download=""</a>
				foreach ($gpxf as $f){
					$htmlstring .= "<a download=\"{$f}\" href=\"{$gpx_url}{$f}\">{$f} - </a>";
				}
				$htmlstring .= "</strong></p>";
			}
		}

		// produce starting point description,  
		if ( 'true' === $showadress ) {
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
	}
	// ----------------------------------------------------
	
	// end for boxmap. div ends here to have fm-dload underneath the map
	if ($showmap  === 'true') {
        $htmlstring  .= '</div>'; 
	}
	
	if ($addPermalink && $allImgInWPLibrary && ($i < 2) && ( $imageNumber > 0) && ($slider === 'fotorama') ){
		$htmlstring .= '<div class="fm-attach-link">';
		$htmlstring .= '<a href="" target="_blank">';
		$htmlstring .= '<div class="fm-itemsButtons" type="info"><svg height="20px" style="fill: rgb(255, 255, 255);" version="1.1" viewBox="0 0 46 100" width="46px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M35.162,0c6.696,0,10.043,4.567,10.043,9.789c0,6.522-5.814,12.555-13.391,12.555c-6.344,0-10.045-3.752-9.869-9.947   C21.945,7.176,26.35,0,35.162,0z M14.543,100c-5.287,0-9.164-3.262-5.463-17.615l6.07-25.457c1.057-4.077,1.23-5.707,0-5.707   c-1.588,0-8.451,2.816-12.51,5.59L0,52.406C12.863,41.48,27.662,35.072,34.004,35.072c5.285,0,6.168,6.361,3.525,16.148   L30.58,77.98c-1.234,4.729-0.703,6.359,0.527,6.359c1.586,0,6.787-1.963,11.896-6.041L46,82.377C33.488,95.1,19.83,100,14.543,100z   "></path></g><g></svg></div>';
		$htmlstring .= '</a></div>';
	}

	// close all html-divs
	$htmlstring  .= '</div><!--div id=multifotobox'.$shortcodecounter.'-->';
	
	// pass php variables to javascript-file for fotorama
	$pageVarsForJs[ $shortcodecounter] = array(
		'ngpxfiles'  => $i,
		'imagepath' => $wp_fotomulti_path,
		'imgdata' => $phpimgdata ?? [],
		'tracks' => $tracks,
		'eletheme' => $eletheme,
		'ignorezeroes' => $fotorama_elevation_options['gpx_ignore_zero_elev'],
		'mapheight' => $mapheight,
		'mapaspect' => $mapaspect,
		'chartheight' => $chartheight,
		'showalltracks' => $showalltracks,
		'mapcenter' => $mapcenter,
		'zoom' => $zoom,
		'markertext' => $markertext,
		'fit' => $fit,
		'mapselector' => $mapselector,
		'useTileServer' => $fotorama_elevation_options['use_tile_server'],
		'convertTilesToWebp' => $fotorama_elevation_options['convert_tiles_to_webp'],
		'htaccessTileServerIsOK' => $fotorama_elevation_options['htaccess_Tile_Server_Is_OK'],
		'sw_options' => $page_options // keep old name of php-variable here for javascript.
 	);

	 if ( isset($charttype) && $charttype === 'chartjs') {
		wp_enqueue_script('fotorama_main_bundle',  $plugin_path . 'build/fm_chartjs/fm_main.js', ['jquery'], '0.24.0', true);
	} else {
		wp_enqueue_script('fotorama_main_bundle',  $plugin_path . 'build/fm_bundle/fm_main.js', ['jquery'], '0.24.0', true);
	}

	wp_localize_script('fotorama_main_bundle', 'pageVarsForJs', $pageVarsForJs);
	
	$shortcodecounter++;
	$gpxTrackCounter += $i;

	return $htmlstring;
}