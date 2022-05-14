<?php

/**
 *
 * Description:       enqueue scripts - Fotorama Multi Slider
 * Author:            Martin von Berg
 * Author URI:        https://www.berg-reise-foto.de/software-wordpress-lightroom-plugins/wordpress-plugins-fotos-und-gpx/
 * License:           GPL-2.0
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */

// Untersuchung der am meisten installierten Leaflet map plugins für wordpress, 30.03.2021
// GEO my Wordpress : 	        handle: leaflet           lokal ../leaflet.min.js
// MapPress Maps for WordPress:	handle: mappress-leaflet  unpgk ../leaflet.js
// Leaflet Map:                 handle: leaflet_js        unpgk ../leaflet.js, wird nicht registriert, daher mit funktion im shutdown hook nicht auffindbar, fotorama handle angpasst
// Leaflet Maps Marker 	        handle: leafletmapsmarker lokal ../leaflet.js, wird als <script-tag direkt eingebettet, nicht mit wp_enqueue! mit funktion im shutdown hook nicht auffindbar
// Ultimate Maps by Supsystic   handle: unknown!		  lokal ../leaflet.js
// Google Maps Easy: benutzt leaflet nicht: Alternative des Herstellers: Ultimate Maps by Supsystic
// WP GPX maps					handle: leaflet		  	  lokal ../leaflet.js
// Geo Mashup					handle: leaflet		      cdnjs ../leaflet.js : getestet, scheint konfliktfrei zu arbeiten!

//wp_reset_query();
$plugin_url = plugins_url('/', __FILE__);

// Load Styles
wp_enqueue_style('fotorama_css', $plugin_url . 'css/fotorama_multi.min.css');
wp_enqueue_style('fotorama3_css', $plugin_url . 'css/fotorama3.min.css');
// Load Scripts
wp_enqueue_script('fotorama3_js', $plugin_url . 'js/fotorama3.min.js', array('jquery'), '3.1.0');
	
// register local Styles
wp_register_style('leaflet_css', $plugin_url . 'css/leaflet.min.css', [], '1.7.1');
wp_register_style('leaflet_elevation_css', $plugin_url . 'css/leaflet-elevation.min.css', [], '1.5.6');
wp_register_style('leaflet_gesture_handling_css', $plugin_url . 'css/leaflet-gesture-handling.min.css', [], '1.2.1');
wp_register_style('control_fullscreen_css', $plugin_url . 'css/Control.FullScreen.min.css', [], '2.0.0');

// register local Scripts
wp_register_script('d3_js',  $plugin_url . 'js/libs/d3.min.js', array('jquery'), '5.16.0'); // does not work with d3 > version 6.0 !
wp_register_script('leaflet_js',  $plugin_url . 'js/libs/leaflet.min.js', array('jquery'), '1.7.1');
wp_register_script('gpx_js',  $plugin_url . 'js/libs/gpx.min.js', array('jquery'), '1.5.1');
wp_register_script('leaflet_gpxgroup_js', $plugin_url . 'js/libs/leaflet-gpxgroup.min.js', array('jquery'), '');
wp_register_script('leaflet_elevation_js',  $plugin_url . 'js/libs/leaflet-elevation.min.js', array('jquery'), '1.5.6');
wp_register_script('leaflet_gesture_handling_js',  $plugin_url . 'js/libs/leaflet-gesture-handling.min.js', array('jquery'), '1.2.1');
wp_register_script('control_fullscreen_js', $plugin_url . 'js/libs/Control.FullScreen.min.js', array('jquery'), '2.0.0');
wp_register_script('zoom_master_js', $plugin_url . 'js/zoom-master/jquery.zoom.min.js', array('jquery'), '1.7.21');
wp_register_script('fotorama_multi_js',  $plugin_url . 'js/fotorama_multi.min.js', array('jquery'), '0.10.2');

// load styles
wp_enqueue_style ('leaflet_css');
wp_enqueue_style ('leaflet_elevation_css');
wp_enqueue_style ('leaflet_gesture_handling_css');
wp_enqueue_style ('control_fullscreen_css');
// load scripts
wp_enqueue_script('d3_js');
wp_enqueue_script('leaflet_js');
wp_enqueue_script('gpx_js');
wp_enqueue_script('leaflet_gpxgroup_js');
wp_enqueue_script('leaflet_elevation_js');
wp_enqueue_script('leaflet_gesture_handling_js');
wp_enqueue_script('control_fullscreen_js');
wp_enqueue_script('zoom_master_js');
wp_enqueue_script('fotorama_multi_js');	