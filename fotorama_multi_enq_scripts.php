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
$mode = 'production';
$version = '0.11.0';
	
if ( $mode === 'production') {
    wp_enqueue_style('fotorama_css', $plugin_url . 'js/fotorama/fotorama.min.css', [], $version	);
    wp_enqueue_style('leaflet_css', $plugin_url . 'js/leaflet/leaflet.min.css', [], '1.8.0');
    wp_enqueue_style('leaflet_elevation_css', $plugin_url . 'js/leaflet_elevation/leaflet_elevation.min.css', [], '1.8.0');
    // Load Scripts
    wp_enqueue_script('fotorama_bundle', $plugin_url . 'js/fotorama/fotorama_bundle.js', array('jquery'), $version, true);
    wp_enqueue_script('leaflet_map_bundle', $plugin_url . 'js/leaflet/leaflet_map_bundle.js', array('jquery'), $version, true);
    wp_enqueue_script('leaflet_elevation_bundle', $plugin_url . 'js/leaflet_elevation/leaflet_elevation_bundle.js', array('jquery'), $version, true);
    wp_enqueue_script('fotorama_multi_js',  $plugin_url . 'js/fotorama_main.js', array('jquery'), $version, true);

} else {

    // --- FOTORAMA -------------
    // Load Styles
    wp_enqueue_style('fotorama_css', $plugin_url . 'css/fotorama_multi.min.css', [], '4.6.4');
    wp_enqueue_style('fotorama3_css', $plugin_url . 'css/fotorama3.min.css', [], '4.6.4');
    // Load Scripts
    wp_enqueue_script('fotorama3_js', $plugin_url . 'js/fotorama3.min.js', array('jquery'), '4.6.4');
    wp_register_script('zoom_master_js', $plugin_url . 'js/zoom-master/jquery.zoom.min.js', array('jquery'), '1.7.21', true);
    wp_register_script('fotoramaClass_js',  $plugin_url . 'js/fotoramaClass.js', array('jquery'), '0.11.0', true);
    // --- FOTORAMA -------------

    // --- LEAFLET -------------
    // register local Styles
    wp_register_style('leaflet_css', $plugin_url . 'js/leaflet/leaflet.min.css', [], '1.8.0');
    wp_register_style('control_fullscreen_css', $plugin_url . 'js/fullscreen/Control.FullScreen.min.css', [], '2.4.0');
    // register local Scripts
    wp_register_script('leaflet_js',  $plugin_url . 'js/leaflet/leaflet.js', array('jquery'), '1.8.0', true);
    wp_register_script('leaflet_ui', $plugin_url . 'js/leaflet-ui/leaflet-ui-short.min.js', array('jquery'), '0.5.9', true);
    wp_register_script('control_fullscreen_js', $plugin_url . 'js/fullscreen/Control.FullScreen.min.js', array('jquery'), '2.4.0', true);
    wp_register_script('leafletClass_js',  $plugin_url . 'js/leafletMapClass.js', array('jquery'), '0.11.0', true);
    // --- LEAFLET -------------

    // --- LEAFLET-ELEVATION -------------
    // register local Styles
    wp_register_style('leaflet_elevation_css', $plugin_url . 'js/elevation/dist/leaflet-elevation.min.css', [], '2.2.6');
    // register local Scripts - load dependencies first
    wp_register_script('d3_js',  $plugin_url . 'js/elevation/dist/d3.min.js', array('jquery'), '7.6.1', true); 
    wp_register_script('gpx_js',  $plugin_url . 'js/libs/gpx.min.js', array('jquery'), '1.5.1', true);
    wp_register_script('gpxgroups_js',  $plugin_url . 'js/elevation/libs/leaflet-gpxgroup.min.js', array('jquery'), '1.5.1', true);
    wp_register_script('togeojson_js',  $plugin_url . 'js/elevation/dist/togeojson.umd.js', array('jquery'), '5.2.2', true); 
    wp_register_script('geom_util_js',  $plugin_url . 'js/elevation/dist/leaflet.geometryutil.min.js', array('jquery'), '0.10.1', true); 
    wp_register_script('leaflet_elevation_js',  $plugin_url . 'js/elevation/dist/leaflet-elevation.min.js', array('jquery'), '2.2.6', true);
    wp_register_script('elevationClass_js',  $plugin_url . 'js/elevationClass.js', array('jquery'), '0.11.0', true);
    // --- LEAFLET-ELEVATION -------------

    // --- MAIN-JS-SCRIPT -------------
    wp_register_script('fotorama_multi_js',  $plugin_url . 'js/fotorama-multi-reduced.js', array('jquery'), '0.11.0', true);
    // --- MAIN-JS-SCRIPT -------------

    // load styles
    wp_enqueue_style ('leaflet_css');
    wp_enqueue_style ('leaflet_elevation_css');
    wp_enqueue_style ('control_fullscreen_css');

    // load scripts
    wp_enqueue_script('d3_js');
    wp_enqueue_script('leaflet_js');
    wp_enqueue_script('gpx_js');
    wp_enqueue_script('gpxgroups_js');
    wp_enqueue_script('togeojson_js');
    wp_enqueue_script('geom_util_js');
    wp_enqueue_script('leaflet_elevation_js');
    wp_enqueue_script('leaflet_ui');
    wp_enqueue_script('control_fullscreen_js');
    wp_enqueue_script('zoom_master_js');
    wp_enqueue_script('fotoramaClass_js');
    wp_enqueue_script('leafletClass_js');
    wp_enqueue_script('elevationClass_js');
    wp_enqueue_script('fotorama_multi_js');	
}