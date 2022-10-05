<?php

/**
 *
 * Description:       uninstall script - Fotorama Multi Slider -automatically run by WP
 * Author:            Martin von Berg
 * Author URI:        https://www.berg-reise-foto.de/software-wordpress-lightroom-plugins/wordpress-plugins-fotos-und-gpx/
 * License:           GPL-2.0
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */
// delete options in wp_options in the database at uninstall of the plugin

// if uninstall.php is not called by WordPress, die
if ( ! defined('WP_UNINSTALL_PLUGIN') ) {
    die;
}
 
$option_name = 'fotorama_option2';
delete_option($option_name);

$option_name = 'fotorama_elevation_option_name';
delete_option($option_name);

$option_name = 'gpx-file';
delete_option($option_name);

$option_name = 'fm_plugins_checker';
delete_option($option_name);

delete_custom_field( 'lat' );
delete_custom_field( 'lon' );
delete_custom_field( 'geoadress' );
delete_custom_field( 'fm_header_link' );

/**
 * On Uninstall of the Plugin: Delete the custom-fields lat, lon, geoadress, fm_header_link for all pages and posts as this option is no longer required.
 * 
 * @param string $key the custom-field to delete
 * @return void none
 */
function delete_custom_field( string $key) {
	$args = array(
        'post_type'      => array( 'post', 'page' ),
        'posts_per_page' => -1,
        'post_status'    => array( 'publish', 'draft' ),
        'meta_key'       => $key
	);
   
    $the_query = new \WP_Query( $args );
   
    if ( $the_query->have_posts() ) {
   
        while ( $the_query->have_posts() ) {
            $the_query->the_post();
			delete_post_meta( \get_the_ID(), $key);
        }
   
    }
    wp_reset_postdata();
}