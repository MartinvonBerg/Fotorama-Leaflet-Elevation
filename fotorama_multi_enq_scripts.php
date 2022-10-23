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

namespace mvbplugins\fotoramamulti;

//add_action( 'wp_print_scripts', '\mvbplugins\fotoramamulti\correct_enqueued_scripts',10 );
//add_action( 'wp_enqueue_scripts', '\mvbplugins\fotoramamulti\correct_enqueued_scripts',10 );
//add_action( 'wp_print_footer_scripts', '\mvbplugins\fotoramamulti\correct_enqueued_scripts',10 ); // wp_footer( )
add_action( 'wp_footer', '\mvbplugins\fotoramamulti\correct_enqueued_scripts',10,0 ); // nur das funktioniert auf dem Server

function correct_enqueued_scripts() {
    // make sure that the main script is loaded at the end. Better solve this with webpack!
    /*
        $registered = $GLOBALS['wp_scripts']->queue;
        \do_action('qm/debug', $registered );
        $key = \array_search('fotorama_main_bundle',$registered);
        unset($registered[$key]); 
        \array_push($registered,'fotorama_main_bundle');
        $GLOBALS['wp_scripts']->queue = $registered;
        \do_action( 'qm/debug', $registered );
    */
    
    // remove leaflet_elevation_bundle if there is no gpx-file included on the whole page
	if ( \array_key_exists('fm-counter',$_POST) && $_POST['fm_counter'] > 0 && $_POST['gpx_counter'] === 0  ) {
        //\wp_deregister_script('leaflet_elevation_bundle');
        \wp_dequeue_script('leaflet_elevation_bundle');
    }

    if ( \array_key_exists('fm-counter',$_POST) && $_POST['fm_counter'] > 0 && $_POST['fotoramaCounter'] === 0  ) {
        //\wp_deregister_script('fotorama_bundle');
        \wp_dequeue_script('fotorama_bundle');
    }

    if ( \array_key_exists('fm-counter',$_POST) && $_POST['fm_counter'] > 0 && $_POST['swiperCounter'] === 0  ) {
        //\wp_deregister_script('swiper_bundle');
        \wp_dequeue_script('swiper_bundle');
    }

}

function enqueue_elevation_scripts( string $mode='production' ) {
    $plugin_url = plugins_url('/', __FILE__);
    $version = '0.12.0';
    
    if ( $mode === 'production') {
        //wp_enqueue_style('leaflet_css', $plugin_url . '/js/leaflet/leaflet.min.css', [], '1.8.0');
        wp_enqueue_style('leaflet_elevation_css', $plugin_url . 'js/leaflet_elevation/leaflet_elevation.min.css', [], '1.8.0');
        // Load Scripts
        wp_enqueue_script('leaflet_elevation_bundle', $plugin_url . 'js/leaflet_elevation/leaflet_elevation_bundle.js', array('jquery'), $version, true);
    
    } else if ( $mode === 'prodtest') {
        wp_enqueue_style('leaflet_elevation_css', $plugin_url . 'release/js/leaflet_elevation/leaflet_elevation.min.css', [], '1.8.0');
        wp_enqueue_script('leaflet_elevation_bundle', $plugin_url . 'release/js/leaflet_elevation/leaflet_elevation_bundle.js', array('jquery'), $version, true);
    
    } else {
        // --- LEAFLET -------------
        // register local Styles
        wp_register_style('leaflet_css', $plugin_url . 'js/leaflet/leaflet.min.css', [], '1.8.0');
        wp_register_style('control_fullscreen_css', $plugin_url . 'js/fullscreen/Control.FullScreen.min.css', [], '2.4.0');
        // register local Scripts
        wp_register_script('leaflet_js',  $plugin_url . 'js/leaflet/leaflet.js', array('jquery'), '1.8.0', true);
        wp_register_script('leaflet_ui', $plugin_url . 'js/leaflet-ui/leaflet-ui-short.min.js', array('jquery'), '0.5.9', true);
        wp_register_script('control_fullscreen_js', $plugin_url . 'js/fullscreen/Control.FullScreen.min.js', array('jquery'), '2.4.0', true);
        wp_register_script('leafletClass_js',  $plugin_url . 'js/leafletMapClass.js', array('jquery'), '0.12.0', true);
        // --- LEAFLET -------------

        // --- LEAFLET-ELEVATION -------------
        // register local Styles
        wp_register_style('leaflet_elevation_css', $plugin_url . 'js/elevation/dist/leaflet-elevation.css', [], '2.2.6');
        // register local Scripts - load dependencies first
        wp_register_script('d3_js',  $plugin_url . 'js/elevation/dist/d3.min.js', array('jquery'), '7.6.1', true); 
        wp_register_script('gpx_js',  $plugin_url . 'js/libs/gpx.min.js', array('jquery'), '1.5.1', true);
        wp_register_script('gpxgroups_js',  $plugin_url . 'js/elevation/libs/leaflet-gpxgroup.min.js', array('jquery'), '1.5.1', true);
        wp_register_script('togeojson_js',  $plugin_url . 'js/elevation/dist/togeojson.umd.js', array('jquery'), '5.2.2', true); 
        wp_register_script('geom_util_js',  $plugin_url . 'js/elevation/dist/leaflet.geometryutil.min.js', array('jquery'), '0.10.1', true); 
        wp_register_script('leaflet_elevation_js',  $plugin_url . 'js/elevation/dist/leaflet-elevation.js', array('jquery'), '2.2.6', true);
        wp_register_script('elevationClass_js',  $plugin_url . 'js/elevationClass.js', array('jquery'), '0.12.0', true);
        // --- LEAFLET-ELEVATION -------------

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
        wp_enqueue_script('leafletClass_js');
        wp_enqueue_script('elevationClass_js');
    }
}

function enqueue_leaflet_scripts( string $mode='production' ) {
    $plugin_url = plugins_url('/', __FILE__);
    $version = '0.12.0';

    if ( $mode === 'production') {
        wp_enqueue_style('leaflet_css', $plugin_url . 'js/leaflet/leaflet.min.css', [], '1.8.0');
        wp_enqueue_script('leaflet_map_bundle', $plugin_url . 'js/leaflet/leaflet_map_bundle.js', array('jquery'), $version, true);
    
    } else if ( $mode === 'prodtest') {
        wp_enqueue_style('leaflet_css', $plugin_url . 'release/js/leaflet/leaflet.min.css', [], '1.8.0');
        wp_enqueue_script('leaflet_map_bundle', $plugin_url . 'release/js/leaflet/leaflet_map_bundle.js', array('jquery'), $version, true);

    } else {
        // --- LEAFLET -------------
        wp_enqueue_style('leaflet_css', $plugin_url . 'js/leaflet/leaflet.css', [], '1.8.0');
        wp_enqueue_style('control_fullscreen_css', $plugin_url . 'js/fullscreen/Control.FullScreen.min.css', [], '2.4.0');
        
        wp_enqueue_script('leaflet_js',  $plugin_url . 'js/leaflet/leaflet.js', array('jquery'), '1.8.0', true);
        wp_enqueue_script('leaflet_ui', $plugin_url . 'js/leaflet-ui/leaflet-ui-short.min.js', array('jquery'), '0.5.9', true);
        wp_enqueue_script('control_fullscreen_js', $plugin_url . 'js/fullscreen/Control.FullScreen.min.js', array('jquery'), '2.4.0', true);
        wp_enqueue_script('leafletClass_js',  $plugin_url . 'js/leafletMapClass.js', array('jquery','leaflet_js'), '0.12.0', true);
        // --- LEAFLET -------------
    }
}

function enqueue_main_scripts( string $mode='production', array $deps=['jquery'] ) {
    $plugin_url = plugins_url('/', __FILE__);
    $version = '0.12.0';

    if ( $mode === 'production') {
        wp_enqueue_script('fotorama_main_bundle',  $plugin_url . 'js/fotorama_main.js', $deps, $version, true);
    
    } else if ( $mode === 'prodtest') {
        wp_enqueue_script('fotorama_main_bundle',  $plugin_url . 'release/js/fotorama_main.js', $deps, $version, true);
    
    } else {
        wp_enqueue_script('fotorama_main_bundle',  $plugin_url . 'js/fotorama-multi-reduced.js', ['jquery','leafletClass_js'], $version, true);
    
    }
}

function enqueue_fotorama_scripts( string $mode='production' ) {
    $plugin_url = plugins_url('/', __FILE__);
    $version = '0.12.0';

    if ( $mode === 'production') {
        wp_enqueue_style('fotorama_css', $plugin_url . 'js/fotorama/fotorama.min.css', [], $version	);
        wp_enqueue_script('fotorama_bundle', $plugin_url . 'js/fotorama/fotorama_bundle.js', array('jquery'), $version, true);
    
    } else if ( $mode === 'prodtest') {
        wp_enqueue_style('fotorama_css', $plugin_url . 'release/js/fotorama/fotorama.min.css', [], $version	);
        wp_enqueue_script('fotorama_bundle', $plugin_url . 'release/js/fotorama/fotorama_bundle.js', array('jquery'), $version, true);
    
    } else {
        // --- FOTORAMA -------------
        // Load Styles
        wp_enqueue_style('fotorama_css', $plugin_url . 'css/fotorama_multi.css', [], '4.6.4');
        wp_enqueue_style('fotorama3_css', $plugin_url . 'css/fotorama3.min.css', [], '4.6.4');
        // Load Scripts
        wp_enqueue_script('fotorama3_js', $plugin_url . 'js/fotorama3.min.js', array('jquery'), '4.6.4');
        wp_enqueue_script('zoom_master_js', $plugin_url . 'js/zoom-master/jquery.zoom.min.js', array('jquery'), '1.7.21', true);
        wp_enqueue_script('fotoramaClass_js',  $plugin_url . 'js/fotoramaClass.js', array('jquery'), '0.12.0', true);
        // --- FOTORAMA -------------
    }
}

function enqueue_swiper_scripts( string $mode='production' ) {
    $plugin_url = plugins_url('/', __FILE__);
    wp_enqueue_script('swiper_bundle', $plugin_url . 'build/js/swiper/swiper_bundle.min.js', [], '8.4.4', true);
}