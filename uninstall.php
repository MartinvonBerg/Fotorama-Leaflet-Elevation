<?php

/**
 *
 * Description:       uninstall script - Fotorama Multi Slider -automatically run by WP
 * Author:            Martin von Berg
 * Author URI:        https://www.mvb1.de/info/ueber-mich/
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