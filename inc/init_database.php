<?php
namespace mvbplugins\fotoramamulti;

/**
 * init the database settings for the admin panel on first activation of the plugin.
 * Current settings will not be overwritten.
 * Mind the 'register_activation_hook': The path and main-file of the plugin have to match!
 *
 * @return void none
 */
function fotoramamulti_activate() {
	/*
	$option_name = 'fotorama_option2';
	$opt = get_option($option_name);
	if ( ! $opt ) {
		$opts = array(
				'gpx_reduce' =>  "false",
				'gpx_smooth' =>  25,
				'gpx_elesmooth' =>  4,
				'gpx_overwrite' =>  "false",
			);
		update_option($option_name, $opts);
	}

	$option_name = 'fotorama_elevation_option_name';
	$existingOptions = get_option($option_name);
	$newOptions = array(
		'path_to_images_for_fotorama_0' => "Galleries",
		'colour_theme_for_leaflet_elevation_1' => "lime-theme",
		'path_to_gpx_files_2' 		=> "gpx",
		'download_gpx_files_3' 		=> "true",
		'show_caption_4' 			=> "true",
		'images_with_gps_required_5' => "true",
		'ignore_custom_sort_6' 		=> "false",
		'show_address_of_start_7' 	=> "true",
		'text_for_start_address_8' 	=> "Start address",
		'general_text_for_the_fotorama_alt_9' => "Fotorama Slider",
		'height_of_map_10' 			=> "450",
		'height_of_chart_11' 		=> "200",
		'max_width_of_container_12' => "800",
		'useCDN_13' 				=> "false",  // kein shortcode attribut
		'min_width_css_grid_row_14' => "480",
		'setCustomFields_15' 	=> "false", // kein shortcode attribut
		'doYoastXmlSitemap_16' => "false", // kein shortcode attribut
		'gpx_file' 			=> "test.gpx",
		'showalltracks' 	=>  'false',
		'mapcenter' 		=>  '0.0, 0.0', 
		'zoom' 				=>  8,					
		'markertext' 		=>  'Home address',
		'fit' 				=>  'cover', // 'contain' Default, 'cover', 'scaledown', 'none'
		'ratio' 			=>  '1.5',
		'background' 		=>  'darkgrey', // background color in CSS name
		'nav' 				=>  'thumbs', // Default: 'dots', 'thumbs', false, // funktioniert nicht
		'navposition' 		=>  'bottom', // 'top'
		'navwidth' 			=>  '100', // in percent
		'f_thumbwidth' 		=>  '100', // in pixels
		'f_thumbheight' 	=>  '75', // in pixels
		'thumbmargin' 		=>  '2', // in pixels
		'thumbborderwidth' 	=>  '2', // in pixels
		'thumbbordercolor' 	=>  '#ea0000', // background color in CSS name or HEX-value. The color of the last shortcode on the page will be taken.
		'transition' 		=>  'crossfade', // 'slide' Default 'crossfade' 'dissolve'
		'transitionduration'=>  '400', // in ms
		'loop' 				=>  'true', // true or false
		'autoplay' 			=>  '3000', // on with 'true' or any interval in milliseconds.
		'arrows' 			=>  'true',  // true : Default, false, 'always' : Do not hide controls on hover or tap
		'shadows' 			=>  'true', // true or false
		'use_tile_server'	=>  'false',
		'convert_tiles_to_webp' => 'false',
		'aspect_ratio_of_map'  => '1.5',  // CSS aspect ratio for the leaflet map.
		'htaccess_Tile_Server_Is_OK' => 'false'
		);
	
	$opt = array_merge($newOptions, $existingOptions);
	update_option($option_name, $opt);
	

	$option_name = 'gpx-file';
	$opt = get_option($option_name);
	if ( ! $opt ) {
		$opts = '. No Filename given!';
		update_option($option_name, $opts);
	}
	*/
	$option_name = 'fm_plugins_checker';
	$opt = get_option($option_name);
	if ( ! $opt ) {
		$opts = array(
			'show_admin_message' =>  'false',
			'active_plugins' =>  '',
			'plugin_name' =>  '',
			'plugins_changed' => 'false',
			);
		update_option($option_name, $opts);
	} else {
		$opts = array(
			'show_admin_message' =>  'false',
			'active_plugins' =>  '',
			'plugin_name' =>  '',
			'plugins_changed' => 'false',
		);
	update_option($option_name, $opts);	
	}

	// delete the old options from previous versions of this plugin on activation after install.
	$option_name = 'fotorama_option2';
	delete_option($option_name);

	$option_name = 'fotorama_elevation_option_name';
	delete_option($option_name);

	$option_name = 'gpx-file';
	delete_option($option_name);

}

/**
 * On Deactivation of the Plugin: Delete the option 'postimg' for all pages and posts as this option is no longer required.
 *
 * @return void none
 */
function fotoramamulti_deactivate() {
	$args = array(
        'post_type'      => array( 'post', 'page' ),
        'posts_per_page' => -1,
        'post_status'    => array( 'publish', 'draft' ),
        'meta_key'       => 'postimg'
	);
   
    $the_query = new \WP_Query( $args );
   
    if ( $the_query->have_posts() ) {
   
        while ( $the_query->have_posts() ) {
            $the_query->the_post();
			delete_post_meta( \get_the_ID(), 'postimg');
        }
   
    }
    wp_reset_postdata();
}