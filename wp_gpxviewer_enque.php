<?php
namespace mvbplugins\fotoramagpxviewer;

add_action('wp_enqueue_scripts', '\mvbplugins\fotoramagpxviewer\wp_gpxviewer_scripts');

function wp_gpxviewer_scripts()
{
  wp_reset_query();
  $plugin_url = plugins_url('/', __FILE__);

  if (!is_front_page() || !is_home()) {
    //If page is using slider portfolio template then load our slider script
    // Load Styles
    wp_enqueue_style('wp_gpxviewer_style1', $plugin_url . 'css/wp_gpxviewer_style.css');
    wp_enqueue_style('fr-style1', $plugin_url . 'css/fotorama.css');

    // Load Scripts
    wp_enqueue_script('wp_gpxviewer_script1', $plugin_url . 'GM_Utils/GPX2GM.js', array('jquery'), '1.10.2', true);
    //wp_enqueue_script('fr-script1', $plugin_url . 'js/fotorama.js', array('jquery'), '1.10.2', true);
    wp_enqueue_script('fr-script1', $plugin_url . 'js/fotorama2.min.js', array('jquery'), '1.10.2', true);
    wp_enqueue_script('wp_gpxviewer_script2', $plugin_url . 'js/wp_gpxviewer.js', array('jquery'), '1.10.2', true);
  }
}
