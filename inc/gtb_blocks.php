<?php

/**
 *
 * Description:       Gutenberg Block for Fotorama Slider and Leaflet Elevation integration
 * Version:           0.10.0
 * Author:            Martin von Berg
 * Author URI:        https://www.berg-reise-foto.de/software-wordpress-lightroom-plugins/wordpress-plugins-fotos-und-gpx/
 * License:           GPL-2.0
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */

namespace mvbplugins\fotoramamulti;

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
  	register_block_type( 
		WP_PLUGIN_DIR . '/fotorama_multi/build', 
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
		}
	}

	if ( $GLOBALS["editing"] ) {
		// back end render		
		return \mvbplugins\fotoramamulti\showmulti($attr);
	} else {
		// frontend render
		return \mvbplugins\fotoramamulti\showmulti($attr);
	}
}