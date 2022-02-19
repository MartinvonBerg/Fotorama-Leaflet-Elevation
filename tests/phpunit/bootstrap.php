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
	define( 'PLUGIN_ABSPATH', sys_get_temp_dir() . '/wp-content/plugins/fotorama_multi/' );
}

$comp_path = "C:/Users/Martin von Berg/AppData/Roaming/Composer"; // TODO: get the global path

require_once $comp_path . '/vendor/autoload.php';

// Include the class for PluginTestCase
require_once __DIR__ . '../../src/Process.php';
//include_once __DIR__ . '../../src/WrapStateTransition.php';

//require_once __DIR__ . '/../../classes/Process.php';

//require_once __DIR__ . '/../../inc/stateTransitions.php';

// Since our plugin files are loaded with composer, we should be good to go