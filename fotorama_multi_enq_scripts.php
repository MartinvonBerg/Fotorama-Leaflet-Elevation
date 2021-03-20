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
	wp_enqueue_style('fm-style1', $plugin_url . 'css/fotorama_multi.css');
	wp_enqueue_style('fm-style2', $plugin_url . 'css/fotorama3.min.css');
	// Load Scripts
	wp_enqueue_script('fm-script1', $plugin_url . 'js/fotorama3.min.js', array('jquery'), '3.1.0', true);
	  
    if ($useCDN == 'true') {
        // Load Styles from CDN
        wp_enqueue_style('fm-style3', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.css');
        wp_enqueue_style('fm-style4', 'https://unpkg.com/@raruto/leaflet-elevation@1.5.3/dist/leaflet-elevation.min.css');
        wp_enqueue_style('fm-style7', 'https://unpkg.com/leaflet-gesture-handling/dist/leaflet-gesture-handling.min.css');
        wp_enqueue_style('fm-style5', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.fullscreen/2.0.0/Control.FullScreen.min.css');

        // Load Scripts
        wp_enqueue_script('fm-script3', 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js', array('jquery'), '5.16.0', true); // does not work with d3 > version 6.0 !
        wp_enqueue_script('fm-script2', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.js', array('jquery'), '1.7.1', true);
        wp_enqueue_script('fm-script4', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet-gpx/1.5.0/gpx.min.js', array('jquery'), '1.5.0', true);
        wp_enqueue_script('fm-script12', $plugin_url . 'js/libs/leaflet-gpxgroup.min.js', array('jquery'), '', true);
        wp_enqueue_script('fm-script5', 'https://unpkg.com/@raruto/leaflet-elevation@1.5.3/dist/leaflet-elevation.min.js', array('jquery'), '1.5.3', true);
        wp_enqueue_script('fm-script8', 'https://unpkg.com/leaflet-gesture-handling/dist/leaflet-gesture-handling.min.js', array('jquery'), '', true);
        wp_enqueue_script('fm-script10','https://cdnjs.cloudflare.com/ajax/libs/leaflet.fullscreen/2.0.0/Control.FullScreen.min.js', array('jquery'), '2.0.0', true);
        wp_enqueue_script('fm-script11','https://cdnjs.cloudflare.com/ajax/libs/jquery-zoom/1.7.21/jquery.zoom.min.js', array('jquery'), '1.7.21', true);
        wp_enqueue_script('fm-script9',  $plugin_url . 'js/fotorama_multi.min.js', array('jquery'), '', true);	
    } else {
        // Load local Styles
        wp_enqueue_style('fm-style3', $plugin_url . 'css/leaflet.min.css');
        wp_enqueue_style('fm-style4', $plugin_url . 'css/leaflet-elevation.min.css');
        wp_enqueue_style('fm-style7', $plugin_url . 'css/leaflet-gesture-handling.min.css');
        wp_enqueue_style('fm-style5', $plugin_url . 'css/Control.FullScreen.min.css');

        // Load local Scripts
        wp_enqueue_script('fm-script3',  $plugin_url . 'js/libs/d3.min.js', array('jquery'), '5.15.0', true); // does not work with d3 > version 6.0 !
        wp_enqueue_script('fm-script2',  $plugin_url . 'js/libs/leaflet.min.js', array('jquery'), '1.7.1', true);
        wp_enqueue_script('fm-script4',  $plugin_url . 'js/libs/gpx.min.js', array('jquery'), '1.5.0', true);
        wp_enqueue_script('fm-script12', $plugin_url . 'js/libs/leaflet-gpxgroup.min.js', array('jquery'), '', true);
        wp_enqueue_script('fm-script5',  $plugin_url . 'js/libs/leaflet-elevation.min.js', array('jquery'), '1.5.3', true);
        wp_enqueue_script('fm-script8',  $plugin_url . 'js/libs/leaflet-gesture-handling.min.js', array('jquery'), '', true);
        wp_enqueue_script('fm-script10', $plugin_url . 'js/libs/Control.FullScreen.min.js', array('jquery'), '', true);
        wp_enqueue_script('fm-script11', $plugin_url . 'js/zoom-master/jquery.zoom.min.js', array('jquery'), '1.7.21', true);
        wp_enqueue_script('fm-script9',  $plugin_url . 'js/fotorama_multi.min.js', array('jquery'), '0.0.7', true);	
        
    }
  }