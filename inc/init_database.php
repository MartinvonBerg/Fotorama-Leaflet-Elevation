<?php
namespace mvbplugins\fotoramamulti;

/**
 * init the database settings for the admin panel on first activation of the plugin.
 * Current settings will not be overwritten.
 * Mind the 'register_activation_hook': The path and main-file of the plugin have to match!
 *
 * @param void none
 * @return void none
 */
function fotoramamulti_activate() {
	
	$option_name = 'fotorama_option2';
	$opt = get_option($option_name);
	if ( ! $opt) {
		$opts = array(
				'gpx_reduce' =>  "false",
				'gpx_smooth' =>  25,
				'gpx_elesmooth' =>  4,
				'gpx_overwrite' =>  "false",
			);
		update_option($option_name, $opts);
	}

	$option_name = 'fotorama_elevation_option_name';
	$opt = get_option($option_name);
	if ( ! $opt) {
		$opts = array(
				'path_to_images_for_fotorama_0' => "Alben-Website",
				'colour_theme_for_leaflet_elevation_1' => "lime-theme",
				'path_to_gpx_files_2' => "gpx",
				'download_gpx_files_3' => "true",
				'show_caption_4' => "true",
				'images_with_gps_required_5' => "true",
				'ignore_custom_sort_6' => "false",
				'show_address_of_start_7' => "true",
				'text_for_start_address_8' => "Start address",
				'general_text_for_the_fotorama_alt_9' => "Fotorama Slider",
				'height_of_map_10' => "450",
				'height_of_chart_11' => "200",
				'max_width_of_container_12' => "800",
				'useCDN_13' => "false",
				'min_width_css_grid_row_14' => "480",
				'setCustomFields_15' => "false",
				'doYoastXmlSitemap_16' => "false",
				'gpx_file' => "test.gpx",
				);
		update_option($option_name, $opts);
	}

	$option_name = 'gpx-file';
	$opt = get_option($option_name);
	if ( ! $opt) {
		$opts = '. No Filename given!';
		update_option($option_name, $opts);
	}
}