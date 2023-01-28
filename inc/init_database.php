<?php
namespace mvbplugins\fotoramamulti;

/**
 * init the database settings for yoastXmlSitemap.php on first activation of the plugin.
 * Current settings will not be overwritten.
 * Mind the 'register_activation_hook': The path and main-file of the plugin have to match!
 *
 * @return void none
 */
function fotoramamulti_activate() {

	$option_name = 'fm_common_options';
	$opt = get_option($option_name);
	if ( ! $opt ) {
		$opts = array(
				'doYoastXmlSitemap_16' =>  "false",
				'images_with_gps_required_5' =>  "true",
				'useCDN_13' =>  "false", // Add Permalink option!
				'min_width_css_grid_row_14' => 0,
			);
		update_option($option_name, $opts);
	}
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