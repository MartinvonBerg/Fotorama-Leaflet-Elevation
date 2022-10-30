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
	if ( \array_key_exists('fm_counter',$_POST) && $_POST['fm_counter'] > 0 && $_POST['gpx_counter'] === 0  ) {
        //\wp_deregister_script('leaflet_elevation_bundle');
        \wp_dequeue_script('leaflet_elevation_bundle');
    }

    if ( \array_key_exists('fm_counter',$_POST) && $_POST['fm_counter'] > 0 && $_POST['fotoramaCounter'] === 0  ) {
        //\wp_deregister_script('fotorama_bundle');
        \wp_dequeue_script('fotorama_bundle');
    }

    if ( \array_key_exists('fm_counter',$_POST) && $_POST['fm_counter'] > 0 && $_POST['swiperCounter'] === 0  ) {
        //\wp_deregister_script('swiper_bundle');
        \wp_dequeue_script('swiper_bundle');
    }

}

function enqueue_elevation_scripts( string $mode='production' ) {
    $plugin_url = plugins_url('/', __FILE__);
    $version = '0.12.0';
    wp_enqueue_script('elevation_leaflet', $plugin_url . 'build/js/elevation/elevation_607.js', array('jquery'), '1.9.2', true);
    wp_enqueue_script('elevation_bundle', $plugin_url . 'build/js/elevation/elevation_main.js', array('jquery'), $version, true);
}

function enqueue_leaflet_scripts( string $mode='production' ) {
    $plugin_url = plugins_url('/', __FILE__);
    wp_enqueue_script('leaflet', $plugin_url . 'build/js/leaflet/leaflet_607.js', array('jquery'), '1.9.2', true);
    wp_enqueue_script('leaflet_map_bundle', $plugin_url . 'build/js/leaflet/leaflet_main.js', array('jquery'), '0.12.0', true);
}

function enqueue_main_scripts( string $mode='production', array $deps=['jquery'] ) {
    $plugin_url = plugins_url('/', __FILE__);
    $version = '0.12.0';

    if ( $mode === 'production') {
        wp_enqueue_script('fotorama_main_bundle',  $plugin_url . 'js/fotorama_main.js', ['jquery','fotorama_bundle'], $version, true);
    
    } else if ( $mode === 'prodtest') {
        wp_enqueue_script('fotorama_main_bundle',  $plugin_url . 'release/js/fotorama_main.js', $deps, $version, true);
    
    } else {
        wp_enqueue_script('fotorama_main_bundle',  $plugin_url . 'js/fotorama-multi-reduced.js', ['jquery','leafletClass_js'], $version, true);
    
    }
}

function enqueue_fotorama_scripts( string $mode='production' ) {
    $plugin_url = plugins_url('/', __FILE__);
    wp_enqueue_script('fotorama_bundle', $plugin_url . 'build/js/fotorama/fotorama_bundle.min.js', array('jquery'), '0.12.0', true);
}

function enqueue_swiper_scripts( string $mode='production' ) {
    $plugin_url = plugins_url('/', __FILE__);
    wp_enqueue_script('swiper_bundle', $plugin_url . 'build/js/swiper/swiper_bundle.min.js', [], '8.4.4', true);
}