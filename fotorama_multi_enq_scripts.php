<?php

/**
 *
 * Description:       enqueue scripts - Fotorama Multi Slider
 * Author:            Martin von Berg
 * Author URI:        https://www.mvb1.de/info/ueber-mich/
 * License:           GPL-2.0
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */

namespace mvbplugins\fotoramamulti;

// fallback for wordpress security
if ( ! defined('ABSPATH') ) {
    die('Are you ok?');
}

add_action('wp_enqueue_scripts', 'mvbplugins\fotoramamulti\fotomulti_scripts');

//bind and call scripts and styles
function fotomulti_scripts()
{
    wp_reset_query();
    $plugin_url = plugins_url('/', __FILE__);
    $useCDN = get_option( 'fotorama_elevation_option_name')['useCDN_13'];
	
 	// Load Styles
	wp_enqueue_style('fotorama_css', $plugin_url . 'css/fotorama_multi.css');
	wp_enqueue_style('fotorama3_css', $plugin_url . 'css/fotorama3.min.css');
	// Load Scripts
	wp_enqueue_script('fotorama3_js', $plugin_url . 'js/fotorama3.min.js', array('jquery'), '3.1.0', true);
	  
    if ( 'true' == $useCDN ) {
		// Load Styles from CDN
		wp_enqueue_style('fm-style3', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.css'); // aktuell
		wp_enqueue_style('fm-style4', 'https://unpkg.com/@raruto/leaflet-elevation@1.5.6/dist/leaflet-elevation.min.css'); // 1.6.7
		wp_enqueue_style('fm-style7', 'https://unpkg.com/leaflet-gesture-handling/dist/leaflet-gesture-handling.min.css'); // 1.2.1
		wp_enqueue_style('fm-style5', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.fullscreen/2.0.0/Control.FullScreen.min.css'); // aktuell

		// Load Scripts
		wp_enqueue_script('fm-script3', 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js', array('jquery'), '5.16.0', true); // 6.6.0 does not work with d3 > version 6.0 !
		wp_enqueue_script('fm-script2', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.js', array('jquery'), '1.7.1', true); // aktuell
		wp_enqueue_script('fm-script4', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet-gpx/1.5.1/gpx.min.js', array('jquery'), '1.5.1', true); // aktuell
		wp_enqueue_script('fm-script12', $plugin_url . 'js/libs/leaflet-gpxgroup.min.js', array('jquery'), '', true);
		wp_enqueue_script('fm-script5', 'https://unpkg.com/@raruto/leaflet-elevation@1.5.6/dist/leaflet-elevation.min.js', array('jquery'), '1.5.6', true); // 1.6.7
		wp_enqueue_script('fm-script8', 'https://unpkg.com/leaflet-gesture-handling/dist/leaflet-gesture-handling.min.js', array('jquery'), '', true); // 1.2.1
		wp_enqueue_script('fm-script10','https://cdnjs.cloudflare.com/ajax/libs/leaflet.fullscreen/2.0.0/Control.FullScreen.min.js', array('jquery'), '2.0.0', true); // aktuell
		wp_enqueue_script('fm-script11','https://cdnjs.cloudflare.com/ajax/libs/jquery-zoom/1.7.21/jquery.zoom.min.js', array('jquery'), '1.7.21', true); // aktuell
		wp_enqueue_script('fm-script9',  $plugin_url . 'js/fotorama_multi.min.js', array('jquery'), '', true);	
	} else {
		// Load local Styles
		wp_register_style('leaflet', $plugin_url . 'css/leaflet.min.css', '', '1.7.1');
		wp_register_style('leaflet-elevation', $plugin_url . 'css/leaflet-elevation.min.css', '', '1.5.6');
		wp_register_style('leaflet-gesture-handling', $plugin_url . 'css/leaflet-gesture-handling.min.css', '', '1.2.1');
		wp_register_style('control-fullscreen', $plugin_url . 'css/Control.FullScreen.min.css', '', '2.0.0');

        wp_enqueue_style ('leaflet');
		wp_enqueue_style ('leaflet-elevation');
		wp_enqueue_style ('leaflet-gesture-handling');
		wp_enqueue_style ('control-fullscreen');

		// Load local Scripts
		wp_register_script('d3',  $plugin_url . 'js/libs/d3.min.js', array('jquery'), '5.16.0', true); // does not work with d3 > version 6.0 !
		wp_register_script('leaflet-js',  $plugin_url . 'js/libs/leaflet.min.js', array('jquery'), '1.7.1', true);
		wp_register_script('gpx',  $plugin_url . 'js/libs/gpx.min.js', array('jquery'), '1.5.1', true);
		wp_register_script('leaflet-gpxgroup', $plugin_url . 'js/libs/leaflet-gpxgroup.min.js', array('jquery'), '', true);
		wp_register_script('leaflet-elevation-js',  $plugin_url . 'js/libs/leaflet-elevation.min.js', array('jquery'), '1.5.6', true);
		wp_register_script('leaflet-gesture-handling-js',  $plugin_url . 'js/libs/leaflet-gesture-handling.min.js', array('jquery'), '1.2.1', true);
		wp_register_script('control-fullscreen-js', $plugin_url . 'js/libs/Control.FullScreen.min.js', array('jquery'), '2.0.0', true);
		wp_register_script('zoom-master', $plugin_url . 'js/zoom-master/jquery.zoom.min.js', array('jquery'), '1.7.21', true);
		wp_register_script('fotorama_multi',  $plugin_url . 'js/fotorama_multi.min.js', array('jquery'), '0.1.1', true);	

        wp_enqueue_script('d3');
		wp_enqueue_script('leaflet-js');
		wp_enqueue_script('gpx');
		wp_enqueue_script('leaflet-gpxgroup');
		wp_enqueue_script('leaflet-elevation-js');
		wp_enqueue_script('leaflet-gesture-handling-js');
		wp_enqueue_script('control-fullscreen-js');
		wp_enqueue_script('zoom-master');
		wp_enqueue_script('fotorama_multi');	
	}
  }