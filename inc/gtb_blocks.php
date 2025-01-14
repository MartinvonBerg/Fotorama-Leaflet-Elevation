<?php
namespace mvbplugins\fotoramamulti;

/**
 *
 * Description:       Gutenberg Block for Fotorama Slider and Leaflet Elevation integration
 * Version:           0.12.0
 * Author:            Martin von Berg
 * Author URI:        https://www.berg-reise-foto.de/software-wordpress-lightroom-plugins/wordpress-plugins-fotos-und-gpx/
 * License:           GPL-2.0
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */


// fallback for wordpress security
if ( ! defined('ABSPATH' )) { die('Are you ok?'); }

// ------------------ gutenberg block development --------------------------------
/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function fotoramamulti_fotorama_multi_block_init() {
	$path = \plugin_dir_path(__DIR__) . 'build';

  	register_block_type( 
		$path, 
		[
			'render_callback' => '\mvbplugins\fotoramamulti\shortcodewrapper'
		]
	);
}
add_action( 'init', '\mvbplugins\fotoramamulti\fotoramamulti_fotorama_multi_block_init', 10, 1 );

function shortcodewrapper ( $attr ) {
	
	foreach ( $attr as $key=>$val) {
		if (gettype($val) != 'string') {
			$attr[$key] = \var_export($val, true);
		} elseif ($val == "") {
			unset($attr[$key]);
		}
	}

	// We need to use special settings for the editor to just show image 1 and the gpx file link to check if they are correct.
	if (is_array($_GET) && array_key_exists('context', $_GET) && $_GET['context'] == 'edit') {
		$attr['showmap'] = false;
		$attr['showchart'] = false;
		$attr['sw_thumbbartype'] = 'none';
	}

	return \mvbplugins\fotoramamulti\showmulti($attr);
}

function site_editor_styles() {
	// source: https://wordpress.stackexchange.com/questions/419449/how-can-i-add-classes-to-the-gutenberg-iframe-editor-canvas-body-tag-added-in
    if ( is_admin() ) {

		$path = \plugin_dir_url(__DIR__);

        // Enqueue or Javascript
        wp_enqueue_script(
            'fotorama_main_bundle',
            $path . 'build/fm_bundle/fm_main_func.js',
            array('wp-blocks', 'wp-dom'),
            //filemtime( get_stylesheet_directory() . '/assets/js/editor.js' ),
            '0.32.0',
        );

        // Pass the class names to the script
        //wp_localize_script('fotorama_main_bundle', 'iframeBodyData', [
        //    'classes' => $classes,
        //]);


    }
} 
//add_action( 'enqueue_block_assets', '\mvbplugins\fotoramamulti\site_editor_styles' );