<?php
/**
 * The following snippets uses `PLUGIN` to prefix
 * the constants and class names. You should replace
 * it with something that matches your plugin name.
 */
// define test environment
define( 'PLUGIN_PHPUNIT', true );

// define fake ABSPATH
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', sys_get_temp_dir() );
}
// define fake PLUGIN_ABSPATH
if ( ! defined( 'PLUGIN_ABSPATH' ) ) {
	define( 'PLUGIN_ABSPATH', sys_get_temp_dir() . '/wp-content/plugins/fotorama_multi-2023-08-30/' );
}

define( 'THUMBSDIR', 'thumbs' );

// load the local autoloader from composer
require_once './vendor/autoload.php';

// change this if the plugin was moved to a different folder
define ( 'PLUGIN_DIR', 'C:\wamp64\www\wordpress\wp-content\plugins\fotorama_multi-2023-08-30');