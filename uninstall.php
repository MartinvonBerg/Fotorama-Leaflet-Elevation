<?php
// delete options in wp_options in the database at uninstall of the plugin

// if uninstall.php is not called by WordPress, die
if (!defined('WP_UNINSTALL_PLUGIN')) {
    die;
}
 
$option_name = 'fotorama_option2';
delete_option($option_name);

$option_name = 'fotorama_elevation_option_name';
delete_option($option_name);

$option_name = 'gpx-file';
delete_option($option_name);