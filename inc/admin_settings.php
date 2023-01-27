<?php

/**
 * Almost generic class to generate an admin settings page with tabs. The content of the tabs is generated by Helper Class AdminSettingsPage
 * by Martin von Berg
 * at http://jeremyhixon.com/wp-tools/option-page/
 */


namespace mvbplugins\fotoramamulti;

$path = plugin_dir_path(__FILE__);
require_once $path . 'custom_mime_types.php';
require_once $path . 'parseGPX.php';
require_once $path . 'AdminSettingsPage.php';


final class FotoramaElevationAdmin
{
	// organize all settings and page info in tabs and give base page information
	private $tabs = [ 
		'page_title' => 'Slider-Map-Chart', // page_title
		'menu_title' => 'Slider-Map-Chart', // menu_title
		'slug' => 'slider-map-chart', // menu_slug and page name
		'namespace' => 'fotoramamulti',
		'title' => 'Settings for Slider + Leaflet-Map + Chart Plugin', // the Top page title
		'subtitle' => 'Settings for the Slider + Leaflet-Map + Chart Plugin that are used for every page or post where the Plugin is used. (Almost) All settings can be overwritten by parameters of the shortcode.',
		'showParametersPage' => true, 
		'parametersTitle' => 'Parameters', // Name of the Tab for the Overview page with all Parameters
		// subarray for Tabs. Will be shown in that order
		'tabs' => [
			['slug' => 'general', // the Slug of the Tab
			'title' => 'General', // the Title of the Tab
			'setting' => 'commonSettings' // define the array with settings for this tab
			],
			['slug' => null, // the default Tab
			'title' => 'GPX-File',
			'setting' => 'gpxSettings',
			'default' => true
			],
			['slug' => 'leaflet',
			'title' => 'Map + Chart',
			'setting' => 'leafletSettings',
			],
			['slug' => 'fotorama',
			'title' => 'Fotorama',
			'setting' => 'fotoramaSettings',
			],
			['slug' => 'swiper',
			'title' => 'Swiper',
			'setting' => 'swiperSettings',
			],
		],
	];
			
	// this are the settings for the GPX-File Tab. These are very specific, not generic. The class is adopted to this settings.
	private $gpxSettings = [
		'pre' => 'gpx',
		'options' => 'fm_gpx_options',
		'sanitizer' => 'handle_file_upload', // this settings do only work together with this sanitizer function!
		'section' => 'gpx_section',
		'sectionsText' => 'GPX-File settings + upload',
		'namespace' => 'fotoramamulti',
		'subTitle' => 'Hint: GPX-routes without elevation data should be converted to tracks with www.gpsvisualizer.com.
						Trackdata without elevation will be skipped on demand. Tracksegments will be combined. Routes and waypoints will be ignored. Trackname will be set to filename.
						Button Save GPX-File underneath will save settings and / or GPX-File.',
		//'shortcode_no_admin' => [], // none!
		'param0' => [
			'label' => 'path_to_gpx_files_2',
			'text' => 'Path to GPX-Files',
			'class' => 'leaflet_row',
			'custom_data' => 'custom0',
			'type' => 'path',
			'required' => 'required',
			'values' => '',
			'default' => 'gpx',
			'description' => 'Define path without leading and trailing slashes',
			'shortcode' => 'gpxpath',
			'info' => 'Path to file(s) with GPX-Track(s) relative to the Wordpress uploads folder, e.g: ../wordpress/wp-content/uploads/gpx',
		],
		'param1' => [ // general
			'label' => 'gpxfile',
			'text' => 'Select GPX-File',
			'class' => 'gpx_row',
			'custom_data' => 'custom',
			'type' => 'file_input',
			'accept' => '.gpx',
			'values' => '',
			'default' => 'test.gpx',
			'description' => 'GPX-File : Reduce with Settings below and add Track Statistics (Track length and difference in altitude).',
			'shortcode' => 'gpxfile',
			'info' => 'Used for uploading only. Define the file in your shortcode, too!. File with gpx-track, e.g: ../wordpress/wp-content/uploads/gpx/test.gpx. Use comma seperated list for multiple file: "f1.gpx, f2.gpx, f3.gpx"',
		],
		'param2' => [ // general
			'label' => 'gpx_reduce',
			'text' => 'Reduce GPX-File',
			'class' => 'gpx_row',
			'custom_data' => 'custom0',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'GPX-File : Reduce with Settings below and add Track Statistics (Track length and difference in altitude).',
			'shortcode' => '',
			'info' => '',
		],
		'param5' => [ 
			'label' => 'gpx_ignore_zero_elev',
			'text' => 'Ignore Track Points with Zero Elevation.',
			'class' => 'gpx_row',
			'custom_data' => 'custom5',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Upload GPX-File : Ignore Track Points with Zero Elevation. Necessary for some devices, because they write "0" as Elevation Data if GPX accuracy is not sufficient',
			'shortcode' => 'ignorezeroes',
			'info' => 'Ignore Track Points with Zero Elevation in Chart. Necessary for some devices, because they write "0" as Elevation Data if GPX accuracy is not sufficient',
		],
		'param3' => [
			'label' => 'gpx_smooth',
			'text' => 'Distance Smooth',
			'class' => 'gpx_row',
			'custom_data' => 'custom1',
			'type' => 'number',
			'values' => 25, // default value
			'default' => 25,
			'min' => 1,
			'max' => 10000,
			'description' => 'Min. Distance of Track Points in Meters (25m best for mountaineering of any kind)',
			'shortcode' => '',
			'info' => '',
		],
		'param4' => [
			'label' => 'gpx_elesmooth',
			'text' => 'Elevation Smooth',
			'class' => 'gpx_row',
			'custom_data' => 'custom2',
			'type' => 'number',
			'values' => 4, // default value
			'default' => 4,
			'min' => 1,
			'max' => 50,
			'description' => 'Min. Elevation between Track Points in Meters. Used for Statistics Calc only. Best is 4.',
			'shortcode' => '',
			'info' => '',
		],
		'param6' => [ 
			'label' => 'gpx_overwrite',
			'text' => 'Overwrite GPX-File',
			'class' => 'gpx_row',
			'custom_data' => 'custom6',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'false',
			'description' => 'Overwrite existing GPX-File',
			'shortcode' => '',
			'info' => '',
		],
	];

	private $commonSettings = [
		'pre' => 'common', // Prefix for the usage of this settings.
		'options' => 'fm_common_options', // name for the options in the WP Database.
		'sanitizer' => 'options_sanitizer', // do not change! This is the general sanitizer.
		'section' => 'common_section', // Name for the Section on the page in Tab.
		'sectionsText' => 'General and Common Settings', // Title to show under the Tab.
		'namespace' => 'fotoramamulti',
		'subTitle' => 'Common Settings and Settings used for both Sliders', // Sub-Title to show under the Tab.
		// All Parameters for this option. Will be shown in that order on the Page under the Tab.
		'param5' => [ // general!
			'label' => 'slider', // Transition effect. Can be 'slide', 'fade', 'cube', 'coverflow', 'flip' or ('creative')
			'text' => 'Slider Type', // Text before the input Field.
			'class' => 'common_row', // The class of the input Field. Unused.
			'custom_data' => 'custom5', // unused.
			'type' => 'select', // The type of the input field. Callback function must exist with name: <type>_callback.
			'values' => ['fotorama' => 'Fotorama', 'swiper' => 'Swiper'], // all foreseen values.
			'default' => 'fotorama',
			'description' => 'Select the Slider to show the Images. Swiper works with Fotos and Videos.', // Text after the input field.
			'shortcode' => 'slider', // shortcode Parameter that will be used.
			'info' => 'Select the Image Slider. Swiper works with Fotos and Videos. Fotorama with Images only.', // Text for the Overview Parameter Table shown under a separate Tab.
		],
		'param6' => [ // 
			'label' => 'fit',
			'text' => 'How to fit the images in Slider',
			'class' => 'common_row',
			'custom_data' => 'custom6',
			'type' => 'select',
			'values' => ['contain' => 'Contain', 'cover' => 'Cover', 'fill' => 'Fill', 'inherit' => 'Inherit'],
			'default' => 'contain',
			'description' => 'Define the scaling of Fotos for the Fotorama Slider',
			'shortcode' => 'fit',
			'info' => 'Define the scaling of Fotos for the Slider',
		],
		'param7' => [ // general
			'label' => 'ratio',
			'text' => 'Slider Aspect Ratio',
			'class' => 'common_row',
			'custom_data' => 'custom7',
			'type' => 'number',
			'values' => 1.5, // default value
			'default' => 1.5,
			'min' => 0.1,
			'max' => 5,
			'step' => 0.01,
			'description' => 'Define the width / height ratio of the Fotorama slider. Smaller ratio means greater height of the Slider. No checking of values up to now',
			'shortcode' => 'ratio',
			'info' => 'Define the width / height ratio of the Slider. Smaller ratio means greater height of the Slider. No checking of values up to now',
		],
		'param8' => [ // general
			'label' => 'background',
			'text' => 'Slide Background Colour',
			'class' => 'common_row',
			'custom_data' => 'custom8',
			'type' => 'color',
			'values' => 'red',
			'default' => 'red',
			'description' => 'Background color of the slider defined by a valid CSS name',
			'shortcode' => 'background',
			'info' => 'Background color of the slider defined by a valid CSS name',
		],
		'param0' => [ // general
			'label' => 'path_to_images_for_fotorama_0',
			'text' => 'Path to Images for Slider',
			'class' => 'common_row',
			'custom_data' => 'custom0',
			'type' => 'path',
			'required' => '',
			'values' => '',
			'default' => 'Bilder',
			'description' => 'Define path to images without leading and trailing slashes',
			'shortcode' => 'imgpath',
			'info' => 'Path the images relative to the Wordpress uploads folder, e.g: ../wordpress/wp-content/uploads/galleries/holiday2020',
		],
		'param1' => [ // general
			'label' => 'show_caption_4',
			'text' => 'Show Caption',
			'class' => 'common_row',
			'custom_data' => 'custom1',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Show the caption in the fotorama slider',
			'shortcode' => 'showcaption',
			'info' => 'Show the caption in the Slider',
		],
		'param2' => [ // general
			'label' => 'short_caption',
			'text' => 'Short Caption',
			'class' => 'common_row',
			'custom_data' => 'custom2',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Show short caption only. (Don not show image metadata from EXIF)',
			'shortcode' => 'shortcaption',
			'info' => 'Show short caption only. (Do not show image metadata from EXIF)',
		],
		'param3' => [ // general
			'label' => 'images_with_gps_required_5',
			'text' => 'Images with GPS required',
			'class' => 'common_row',
			'custom_data' => 'custom3',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Show images only if they provide GPS-Data in EXIF. Remember to set showmap="false".',
			'shortcode' => 'requiregps',
			'info' => 'Require images to have GPS-data in EXIF. Show image only if it provides GPS-Data in its EXIF.',
		],
		'param4' => [ // general
			'label' => 'ignore_custom_sort_6',
			'text' => 'Ignore custom sort',
			'class' => 'common_row',
			'custom_data' => 'custom4',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Ignore custom sort even if provided by Wordpress. Sort ascending by date taken if checked.',
			'shortcode' => 'ignoresort',
			'info' => 'Ignore custom sort even if provided by Wordpress. If checked sort by date ascending',
		],
		'param24' => [ // general
			'label' => 'max_width_of_container_12',
			'text' => 'Max Width of Container in px',
			'class' => 'common_row',
			'custom_data' => 'custom24',
			'type' => 'number',
			'values' => 1500, // default value
			'default' => 1500,
			'min' => 100,
			'max' => 1500,
			'description' => '',
			'shortcode' => 'maxwidth',
			'info' => 'Maximum width of the whole container with slider and map',
		],
		'param25' => [ // general
			'label' => 'min_width_css_grid_row_14',
			'text' => 'Min Width of one CSS-grid Row in px',
			'class' => 'common_row',
			'custom_data' => 'custom25',
			'type' => 'number',
			'values' => 480, // default value
			'default' => 480,
			'min' => 50,
			'max' => 1500,
			'description' => '',
			'shortcode' => 'minrowwidth',
			'info' => 'Minimum width of one row of the CSS-Grid. If greater than maxwidth/2: Slider and the map are never shown in one row. Mind that the max. width of the outer div may be inherited from other elements or set by the theme.',
		],
		'param11' => [ // general
			'label' => 'f_thumbwidth',
			'text' => 'Thumbnail Width in px',
			'class' => 'common_row',
			'custom_data' => 'custom11',
			'type' => 'number',
			'values' => 96, // default value
			'default' => 96,
			'min' => 10,
			'max' => 200,
			'description' => '',
			'shortcode' => 'f_thumbwidth',
			'info' => 'Width of the single thumbnail in the navigation bar in pixels',
		],
		'param12' => [ // general
			'label' => 'f_thumbheight',
			'text' => 'Thumbnail Height in px',
			'class' => 'common_row',
			'custom_data' => 'custom12',
			'type' => 'number',
			'values' => 64, // default value
			'default' => 64,
			'min' => 10,
			'max' => 200,
			'description' => '',
			'shortcode' => 'f_thumbheight',
			'info' => 'Height of the single thumbnail in the navigation bar in pixels',
		],
		'param13' => [ // general
			'label' => 'thumbmargin',
			'text' => 'Thumbnail Side Margin in px',
			'class' => 'common_row',
			'custom_data' => 'custom13',
			'type' => 'number',
			'values' => 2, // default value
			'default' => 2,
			'min' => 0,
			'max' => 20,
			'description' => '',
			'shortcode' => 'thumbmargin',
			'info' => 'Margin between thumbnails in pixels',
		],
		'param14' => [ // general
			'label' => 'thumbborderwidth',
			'text' => 'Thumbnail Border Width in px',
			'class' => 'common_row',
			'custom_data' => 'custom14',
			'type' => 'number',
			'values' => 2, // default value
			'default' => 2,
			'min' => 0,
			'max' => 20,
			'description' => '',
			'shortcode' => 'thumbborderwidth',
			'info' => 'Width of the coloured thumbnail border in pixels',
		],
		'param15' => [ // general
			'label' => 'thumbbordercolor',
			'text' => 'Thumbnail Border Colour',
			'class' => 'common_row',
			'custom_data' => 'custom15',
			'type' => 'color',
			'values' => 'red',
			'default' => 'red',
			'description' => '',
			'shortcode' => 'thumbbordercolor',
			'info' => 'Color of thumbnail border in CSS name or HEX-value with #!. Attention: If there are multiple shortcodes on the page, the color of the LAST shortcode on the page will be taken.',
		],
		'param17' => [ // general
			'label' => 'transitionduration',
			'text' => 'Transition Duration in ms',
			'class' => 'common_row',
			'custom_data' => 'custom17',
			'type' => 'number',
			'values' => 0, // default value
			'default' => 0,
			'min' => 0,
			'max' => 2000,
			'description' => '',
			'shortcode' => 'transitionduration',
			'info' => 'Duration of Slide transition in ms',
		],
		'param21' => [ // general
			'label' => 'useCDN_13',  // label was used before for that
			'text' => 'Add Permalink',
			'class' => 'common_row',
			'custom_data' => 'custom1',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => ' Add a Permalink to the attachment page of the Image. AND add the permalink ot the sitemap instead of the image link.',
			'shortcode' => '', //none
			'info' => '',
		],
		'param22' => [ // general
			'label' => 'setCustomFields_15',
			'text' => 'Set Custom Fields for post',
			'class' => 'common_row',
			'custom_data' => 'custom1',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Set Custom Fields (geoadress, lat, lon) in post. Geoadress is for the address shown under the elevation chart. Lat.,Lon. is for the GPS-Coords used for the Overview-Map.',
			'shortcode' => '', // none
			'info' => '',
		],
		'param23' => [ // general
			'label' => 'doYoastXmlSitemap_16',
			'text' => 'Generate Entries in Yoast XML-Sitemap for Fotorama Images',
			'class' => 'common_row',
			'custom_data' => 'custom1',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Generate the Yoast XML-Sitemap with the images shown in the Slider. Used for SEO.',
			'shortcode' => '', // none!
			'info' => '',
		],
	];

	private $swiperSettings = [
		'pre' => 'swiper', // change
		'options' => 'fm_swiper_options', // change
		'sanitizer' => 'options_sanitizer', // don't change
		'section' => 'swiper_section', // change
		'sectionsText' => 'Swiper Slider Settings', // change
		'namespace' => 'fotoramamulti', // change
		'subTitle' => 'Settings for the Swiper Slider only.',
		'param1' => [
			'label' => 'sw_effect', // Transition effect. Can be 'slide', 'fade', 'cube', 'coverflow', 'flip' or ('creative')
			'text' => 'Swiper Slide Change Effect',
			'class' => 'swiper_row',
			'custom_data' => 'custom1',
			'type' => 'select',
			'values' => ['slide' => 'Slide', 'fade' => 'Fade', 'flip' => 'Flip', 'cube' => 'Cube', 'coverflow' => 'Coverflow'],
			'default' => 'slide',
			'description' => '',
			'shortcode' => 'sw_effect',
			'info' => 'Swiper Slide Change Effect. Cube works but is reduced in functionality (no-zoom and lightbox)',
		],
		'param11' => [
			'label' => 'sw_button_color',
			'text' => 'Arrow Colour',
			'class' => 'common_row',
			'custom_data' => 'custom11',
			'type' => 'color',
			'values' => 'white',
			'default' => 'white',
			'description' => 'Color of the Arrow on Slider to change Slide.',
			'shortcode' => 'sw_button_color',
			'info' => 'Color of the Arrow on Slider to change Slide.',
		],
		'param7' => [
			'label' => 'sw_mousewheel',
			'text' => 'Use Mousewheel for Slide Change',
			'class' => 'swiper_row',
			'custom_data' => 'custom7',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Only active if there is one Slider on Page.',
			'shortcode' => 'sw_mousewheel',
			'info' => 'Use the Mousewheel for Slide change. Only activated for ONE Slider on page.',
		],
		'param4' => [
			'label' => 'sw_zoom',
			'text' => 'Activate Zoom on Slider',
			'class' => 'swiper_row',
			'custom_data' => 'custom4',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Activates the Zoom Function within the Swiper Slider',
			'shortcode' => 'sw_zoom',
			'info' => 'Activates the Zoom Function within the Swiper Slider',
		],
		'param9' => [
			'label' => 'sw_max_zoom_ratio',
			'text' => 'Set the Zoom Ratio for Swiper Zoom',
			'class' => 'swiper_row',
			'custom_data' => 'custom9',
			'type' => 'number',
			'values' => 3, // default value
			'default' => 3,
			'min' => 1,
			'max' => 10,
			'description' => '',
			'shortcode' => 'sw_max_zoom_ratio',
			'info' => 'Defines the Zoom ratio for the Swiper Zoom Effect.',
		],
		'param5' => [
			'label' => 'sw_fslightbox',
			'text' => 'Use fslightbox for Fullscreen',
			'class' => 'swiper_row',
			'custom_data' => 'custom5',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Requires an additional Plugin!',
			'shortcode' => 'sw_fslightbox',
			'info' => 'Activate the fslightbox for Fullscreen Presentation. Mind: Requires the installation of another Plugin from me!',
		],
		'param2' => [
			'label' => 'sw_thumbbartype',
			'text' => 'Thumbnailbar Type',
			'class' => 'swiper_row',
			'custom_data' => 'custom2',
			'type' => 'select',
			'values' => ['integrated' => 'Swiper Thumbbar', 'special' => 'Special Thumbbar'],
			'default' => 'special',
			'description' => '',
			'shortcode' => 'sw_thumbbartype',
			'info' => 'Select Swiper native Thumbbar or my special Thumbbar',
		],
		'param3' => [
			'label' => 'sw_activetype',
			'text' => 'Effect for Special Thumbbar',
			'class' => 'swiper_row',
			'custom_data' => 'custom3',
			'type' => 'select',
			'values' => ['active_border' => 'Border', 'active' => 'Brightness', 'active_animation' => 'Shake',],
			'default' => 'active_border',
			'description' => '',
			'shortcode' => 'sw_activetype',
			'info' => 'Select the Effect to show the active Image in the special Thumbbar',
		],
		'param10' => [
			'label' => 'sw_bar_margin_top',
			'text' => 'Margin above Special Thumbbar in px',
			'class' => 'swiper_row',
			'custom_data' => 'custom10',
			'type' => 'number',
			'values' => 5, // default value
			'default' => 5,
			'min' => 0,
			'max' => 100,
			'description' => '',
			'shortcode' => 'sw_bar_margin_top',
			'info' => 'Margin above Thumbbar in pixels',
		],
		/*
		'param6' => [ // unused
			'label' => 'sw_pagination',
			'text' => 'Activate Zoom in Slider',
			'class' => 'swiper_row',
			'custom_data' => 'custom6',
			'type' => 'checkbox',
			'values' => '',
			'description' => '',
			'shortcode' => '',
			'info' => 'Show pagination under the Slider. Should be used instead of Thumbbar',
			],
		*/
		'param8' => [
			'label' => 'sw_hashnavigation',
			'text' => 'Activate Hash Navigation',
			'class' => 'swiper_row',
			'custom_data' => 'custom8',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'false',
			'description' => 'Enables the option to use a page-link to a dedicated image.',
			'shortcode' => 'sw_hashnavigation',
			'info' => 'Use hashnavigation to directly jump to a dedicated Slider and Image.',
		],
		//'sw_slides_per_view'=> 10, // unused
		//'sw_transition_duration'=>300, // unused
		//'sw_keyboard'			=> 'true', // fixed to this setting
	];

	private $fotoramaSettings = [
		'pre' => 'fotorama', //
		'options' => 'fm_fotorama_options', //
		'sanitizer' => 'options_sanitizer', // do not change!
		'section' => 'fotorama_section', //
		'sectionsText' => 'Fotorama Slider Settings',
		'namespace' => 'fotoramamulti',
		'subTitle' => 'Settings for the Fotorama Slider only.',
		//'shortcode_no_admin' => [], // none!
		'param16' => [
			'label' => 'transition',
			'text' => 'Slide Transition Type',
			'class' => 'fotorama_row',
			'custom_data' => 'custom16',
			'type' => 'select',
			'values' => ['slide' => 'Slide', 'crossfade' => 'Crossfade', 'dissolve' => 'Dissolve'],
			'default' => 'slide',
			'description' => '',
			'shortcode' => 'transition',
			'info' => 'Type of transition between Slides.',
		],
		'param19' => [
			'label' => 'autoplay',
			'text' => 'Autoplay Slideshow',
			'class' => 'fotorama_row',
			'custom_data' => 'custom19',
			'type' => 'text',
			'required' => 'required',
			'values' => '',
			'default' => 'false',
			'description' => 'Values: false, true, or integer value in milliseconds',
			'shortcode' => 'autoplay',
			'info' => 'Autoplay or loop the slider. On with "true" or any numeric interval in milliseconds. Of with "false"',
		],
		'param18' => [ // general
			'label' => 'loop',
			'text' => 'Loop through Slides',
			'class' => 'common_row',
			'custom_data' => 'custom18',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'loop',
			'shortcode' => 'loop',
			'info' => 'Loop through images (proceed with first slide after reaching the last one)',
		],
		'param20' => [
			'label' => 'arrows',
			'text' => 'Show Arrows',
			'class' => 'fotorama_row',
			'custom_data' => 'custom16',
			'type' => 'select',
			'values' => ['true' => 'True', 'false' => 'False', 'always' => 'Always'],
			'default' => 'true',
			'description' => '',
			'shortcode' => 'arrows',
			'info' => 'Show arrows for the slider control. \'always\' : Do not hide controls on hover or tap',
		],
		'param9' => [
			'label' => 'navposition',
			'text' => 'Thumbnailbar Position',
			'class' => 'fotorama_row',
			'custom_data' => 'custom9',
			'type' => 'select',
			'values' => ['bottom' => 'Bottom', 'top' => 'Top'],
			'default' => 'bottom',
			'description' => 'Provide download link for GPX-Files',
			'shortcode' => 'navposition',
			'info' => 'Position of the Thumbnailbar (=Thumbbar)',
		],
		'param10' => [
			'label' => 'navwidth',
			'text' => 'Thumbnailbar Width in %',
			'class' => 'fotorama_row',
			'custom_data' => 'custom10',
			'type' => 'number',
			'values' => 100, // default value
			'default' => 100,
			'min' => 10,
			'max' => 100,
			'description' => '',
			'shortcode' => 'navwidth',
			'info' => 'Width of the Thumbnailbar in percent relative to Slider size.',
		],
	];

	private $leafletSettings = [
		'pre' => 'leaflet', //
		'options' => 'fm_leaflet_options', //
		'sanitizer' => 'options_sanitizer', // do not change!
		'section' => 'leaflet_section', //
		'sectionsText' => 'Leaflet Map and Elevation Chart Settings',
		'namespace' => 'fotoramamulti',
		'subTitle' => 'Settings for the Leaflet Map and Elevation Chart',
		//'shortcode_no_admin' => ['gpxfile', 'showalltracks', 'mapcenter', 'zoom', 'markertext'],
		'param12' => [
			'label' => 'colour_theme_for_leaflet_elevation_1',
			'text' => 'Colour Theme for Leaflet Elevation',
			'class' => 'leaflet_row',
			'custom_data' => 'custom12',
			'type' => 'select',
			'values' => [
				'martin-theme' => 'Martin',
				'lime-theme' => 'Lime',
				'steelblue-theme' => 'Steelblue',
				'purple-theme' => 'Purple',
				'yellow-theme' => 'Yellow',
				'red-theme' => 'Red',
				'magenta-theme' => 'Magenta',
				'lightblue-theme' => 'Lightblue',
				'custom-theme' => 'Custom'
			],
			'default' => 'martin-theme',
			'description' => '',
			'shortcode' => 'eletheme',
			'info' => 'Theme for leaflet elevation Chart. Martin-theme is my special theme. Custom theme is customizable in Colours.',
		],
		'param11' => [
			'label' => 'chart_fill_color',
			'text' => 'Chart fill Colour',
			'class' => 'common_row',
			'custom_data' => 'custom11',
			'type' => 'color',
			'values' => 'black',
			'default' => 'black',
			'description' => 'Colour to fill the area under the Elevation profile',
			'shortcode' => 'chart_fill_color',
			'info' => 'Colour to fill the area under the Elevation profile',
		],
		'param10' => [
			'label' => 'chart_background_color',
			'text' => 'Chart background Colour',
			'class' => 'common_row',
			'custom_data' => 'custom10',
			'type' => 'color',
			'values' => 'black',
			'default' => 'black',
			'description' => 'Background Colour for the Elevation Chart',
			'shortcode' => 'chart_background_color',
			'info' => 'Background Colour for the Elevation Chart',
		],
		'param9' => [
			'label' => 'height_of_chart_11',
			'text' => 'Height of Chart in px',
			'class' => 'leaflet_row',
			'custom_data' => 'custom9',
			'type' => 'number',
			'values' => 200, // default value
			'default' => 200,
			'min' => 100,
			'max' => 1000,
			'description' => '',
			'shortcode' => 'chartheight',
			'info' => 'Height of the leaflet elevation chart in pixels (px)',
		],
		'param1' => [
			'label' => 'download_gpx_files_3',
			'text' => 'Download GPX-Files',
			'class' => 'leaflet_row',
			'custom_data' => 'custom1',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Provide download link for GPX-Files',
			'shortcode' => 'dload',
			'info' => 'Provide download link for the GPX-Tracks.',
		],
		'param2' => [
			'label' => 'show_address_of_start_7',
			'text' => 'Show Address',
			'class' => 'leaflet_row',
			'custom_data' => 'custom2',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Show address of starting point (taken from the first image or GPX-coordinate in the GPX-track)',
			'shortcode' => 'showadress',
			'info' => 'Show start address of the tour. GPX-coords are taken from the first point in the GPX-track or from the first image.',
		],
		'param3' => [
			'label' => 'text_for_start_address_8',
			'text' => 'Text for Start address',
			'class' => 'leaflet_row',
			'custom_data' => 'custom3',
			'type' => 'text',
			'required' => 'required',
			'values' => '',
			'default' => 'Startadresse',
			'description' => 'Set the Text for the Start Address',
			'shortcode' => 'adresstext',
			'info' => 'Text for header above start address',
		],
		'param4' => [
			'label' => 'mapselector',
			'text' => 'Select the Map',
			'class' => 'leaflet_row',
			'custom_data' => 'custom4',
			'type' => 'select',
			'values' => ['OpenStreetMap' => 'OpenStreetMap', 'OpenTopoMap' => 'OpenTopoMap', 'CycleOSM' => 'CycleOSM', 'Satellit' => 'Satellite'],
			'default' => 'OpenStreetMap',
			'description' => '',
			'shortcode' => 'mapselector',
			'info' => 'Choose which map should be shown first. OpenTopoMap might be slow!',
		],
		'param5' => [
			'label' => 'use_tile_server',
			'text' => 'Use local Tileserver',
			'class' => 'leaflet_row',
			'custom_data' => 'custom5',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'ATTENTION: File .htaccess not checked yet!',
			'shortcode' => '', // none!
			'info' => '',
		],
		'param6' => [
			'label' => 'convert_tiles_to_webp',
			'text' => 'Convert and serve local Tiles as webp',
			'class' => 'leaflet_row',
			'custom_data' => 'custom6',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'true',
			'description' => 'Convert Tile-Files to webp (conversion settings in PHP only)',
			'shortcode' => '', // none!
			'info' => '',
		],
		'param7' => [
			'label' => 'height_of_map_10',
			'text' => 'Maximum Height of Map in px',
			'class' => 'leaflet_row',
			'custom_data' => 'custom7',
			'type' => 'number',
			'values' => 400, // default value
			'default' => 400,
			'min' => 100,
			'max' => 1000,
			'description' => '',
			'shortcode' => 'mapheight',
			'info' => 'Height of the leaflet map in pixels (px)',
		],
		'param8' => [
			'label' => 'aspect_ratio_of_map',
			'text' => 'Aspect Ratio of Map',
			'class' => 'leaflet_row',
			'custom_data' => 'custom8',
			'type' => 'number',
			'values' => 1.5, // default value
			'default' => 1.5,
			'min' => 0.1,
			'max' => 5,
			'step' => 0.01,
			'description' => '',
			'shortcode' => 'mapaspect',
			'info' => 'Aspect ratio of Map Element on Page (used for responsiveness)',
		],
	];

	private $no_admin_settings = [
		'sectionsText' => 'Parameters without Admin Settings but Shortcode',
		'param0' => [
			'shortcode' => 'showalltracks',
			'type' => 'checkbox',
			'values' => '',
			'default' => 'false',
			'info' => 'Show all Tracks from List of GPX-Files at once on the Map.'
		],
		'param1' => [
			'shortcode' => 'mapcenter',
			'type' => 'text',
			'values' => '0.0, 0.0',
			'default' => '0.0, 0.0',
			'info' => 'Define the Map center for the Map that shows a Marker only.'
		],
		'param2' => [
			'shortcode' => 'zoom',
			'type' => 'number',
			'values' => 8,
			'default' => 8,
			'min' => 1,
			'max' => 19,
			'info' => 'Define the Zoom Level for the Map that shows a Marker only.'
		],
		'param3' => [
			'shortcode' => 'markertext',
			'type' => 'text',
			'values' => 'Home address',
			'default' => 'Home address',
			'info' => 'Define the Marker Text for the Map that shows a Marker only.'
		]
	];

	private $allSettingsClasses = [];
	private $allSettings = [];


	public function __construct()
	{
		//add_action( 'admin_init', array( $this, 'fotorama_elevation_page_init' ) );
		add_action('admin_menu', array($this, 'admin_add_plugin_page_to_menu'));

		// check .htaccess and change info text accordingly. Special handling to be removed for a general class.
		$hasWorkingHtaccess = $this->checkHtaccess();
		if ($hasWorkingHtaccess) {
			$infoText = __('Use a local Tile-Server to provide Map-Tiles (.htaccess checked and OK)', 'fotoramamulti');
		} else {
			$infoText = 'ATTENTION: File .htaccess is NOT OK.';
		}
		$this->leafletSettings['param5']['description'] = $infoText;

		// init the classes and settings for the tab.
		$i = 0;
		foreach($this->tabs['tabs'] as $currentTab) {
			$set = $this->{$currentTab['setting']};
			$this->allSettingsClasses[ $i ] = new AdminSettingsPage( $set );
			$this->allSettings[ $i ] = $set;
			$i++;
		}

		// append $no_admin_settings to show in info page
		$this->allSettings[ $i ] = $this->no_admin_settings;
	}

	public function admin_add_plugin_page_to_menu()
	{
		add_options_page(
			$this->tabs['page_title'], // page_title
			$this->tabs['menu_title'], // menu_title
			'manage_options', // capability is fixed do not change
			$this->tabs['slug'], // menu_slug
			array($this, 'create_admin_page_with_tabs') // function
		);
	}

	public function create_admin_page_with_tabs()
	{
		//$this->fotorama_elevation_options = get_option('fotorama_elevation_option_name');
		//$this->up_dir = wp_get_upload_dir()['basedir'];     // upload_dir

		//Get the active tab from the $_GET param
		$default_tab = null;
		$tab = isset($_GET['tab']) ? $_GET['tab'] : $default_tab;

		?>
		<div class="wrap">
			<h2><?php esc_html_e($this->tabs['title'], $this->tabs['namespace']) ?></h2>
			<h4><?php esc_html_e($this->tabs['subtitle'], $this->tabs['namespace']) ?></h4>

			<nav class="nav-tab-wrapper">
				<?php 
				foreach($this->tabs['tabs'] as $currentTab) {
					if (\array_key_exists('default', $currentTab)) {
						$tabstring = "<a href=\"?page={$this->tabs['slug']}\" class=\"nav-tab";
					} else {
						$tabstring = "<a href=\"?page={$this->tabs['slug']}&tab={$currentTab['slug']}\" class=\"nav-tab";
					}
					($tab === $currentTab['slug']) ? $tabstring .= ' nav-tab-active"' : $tabstring .= '"';

					$tabstring .= ">{$currentTab['title']}</a>";
					echo( $tabstring);
				}

				if ( $this->tabs['showParametersPage'] ) {
					$tabstring = "<a href=\"?page={$this->tabs['slug']}&tab=params\" class=\"nav-tab";
					($tab === 'params') ? $tabstring .= ' nav-tab-active"' : $tabstring .= '"';
					$tabstring .= ">{$this->tabs['parametersTitle']}</a>";
					echo( $tabstring);
				}
				?>
			</nav>

			<div class="tab-content">
				<?php 
					if ( $tab !== 'params' ) {
						$i = 0;
						foreach($this->tabs['tabs'] as $currentTab) {
							if ( $tab === $currentTab['slug'] ) {
								$this->allSettingsClasses[ $i ]->show_options_page_html();
							}
							$i++;
						}
						
					} 
					else 
					{
						?>
						<!-- table with all shortcode Parameters -->
						<h3>Table with shortcode Parameters</h3>

						<style type="text/css">
							.tg {
								border-collapse: collapse;
								border-spacing: 2;
								background-color: white;
							}

							.tg td {
								border-color: black;
								border-style: solid;
								border-width: 1px;
								font-family: Arial, sans-serif;
								font-size: 14px;
								overflow: hidden;
								padding: 10px 5px;
								word-break: normal;
							}

							.tg th {
								border-color: black;
								border-style: solid;
								border-width: 1px;
								font-family: Arial, sans-serif;
								font-size: 14px;
								font-weight: normal;
								overflow: hidden;
								padding: 10px 5px;
								word-break: normal;
							}

							.tg .tg-dncm {
								border-color: inherit;
								font-weight: bold;
								position: -webkit-sticky;
								position: sticky;
								text-align: left;
								top: -1px;
								vertical-align: top;
								will-change: transform;
								background-color: goldenrod;
							}

							.tg .tg-0pky {
								border-color: inherit;
								text-align: left;
								vertical-align: top
							}

							.tg tr:nth-child(even) {
								background-color: lightgray;
							}
						</style>

						<table class="tg">
							<thead>
								<tr>
									<th class="tg-dncm">Shortcode</th>
									<th class="tg-dncm">Value (Default first)</th>
									<th class="tg-dncm">Example</th>
									<th class="tg-dncm">Description</th>
								</tr>
							</thead>
							<tbody>
								<?php
								// loop through settings
								foreach ($this->allSettings as $setArr) {
									// create the header 
								?>
									<tr>
										<td class="tg-0pky" colspan="4"><strong><?php echo ($setArr['sectionsText']) ?></strong></td>
									</tr>
									<?php
									foreach ($setArr as $single) {

										// define the value for the single parameter line
										if ( \gettype($single) === 'array' ) {
											if ($single['type'] === 'number') {
												$value = strval($single['default']) . ' / ' . strval($single['min']) . '..' . strval($single['max']);
											} elseif ($single['type'] === 'select') {
												$value = implode(' / ', array_keys($single['values']));
											} elseif ($single['type'] === 'checkbox') {
												if ($single['default'] === 'true') $value = 'true / false';
												else $value = 'false / true';
											} else {
												$value = strval($single['default']);
											}

											if ( $single['shortcode'] !== '' ) {
												?>
													<tr>
														<td class="tg-0pky"><?php echo ($single['shortcode']) ?></td>
														<td class="tg-0pky" style="max-width:480px;"><?php echo ($value) ?></td>
														<td class="tg-0pky"><?php echo ($single['shortcode'] . '="' . $single['default'] . '"') ?></td>
														<td class="tg-0pky"><?php echo ($single['info']) ?></td>
													</tr>
												<?php
											} else {
												?>
													<tr>
														<td class="tg-0pky"><?php echo ('no Shortode: </br>' . $single['text']) ?></td>
														<td class="tg-0pky" style="max-width:480px;"><?php echo ($value) ?></td>
														<td class="tg-0pky"><?php echo ('--') ?></td>
														<td class="tg-0pky"><?php echo ($single['text'] .': '. $single['description']) ?></td>
													</tr>
												<?php
											}
										}
									}
								}
								?>
							</tbody>
						</table>
						<?php 
					};
				?>
			</div>
		<?php
	}

	// ---- htaccess helper -----------------
	/**
	 * Check if file .htaccess is available in the sub-folder 'leaflet_map_tiles' and try to fetch the 
	 * testfile, which will be responded with status code 302 file by the script 'tileserver.php'.
	 * 
	 * @return boolean the result of the htaccess check
	 */
	public function checkHtaccess()
	{
		// try to access testfile.webp which will be redirected to testfile.php if .htaccess is working
		$path = \str_replace('inc/', '', plugins_url('/', __FILE__)) . 'leaflet_map_tiles/';

		if (\ini_get('allow_url_fopen') === '1') {
			$url = $path . 'testfile.webp';

			// switch off PHP error reporting and get the url.
			$ere = \error_reporting();
			\error_reporting(0);
			$test = fopen($url, 'r');
			\error_reporting($ere);

			// check if header contains status code 302
			if ($test !== false) {
				$code = $http_response_header[0];
				$found = \strpos($code, '302');
				fclose($test);
				if ($found  > 0) return true;
			}
		}
		return false;
	}
}
