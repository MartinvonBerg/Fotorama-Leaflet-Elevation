<?php

/**
 *
 * Description:       locale and i18n functions for the Fotorama Multi Slider
 * Author:            Martin von Berg
 * Author URI:        https://www.berg-reise-foto.de/software-wordpress-lightroom-plugins/wordpress-plugins-fotos-und-gpx/
 * License:           GPL-2.0
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 */

namespace mvbplugins\fotoramamulti;

// fallback for wordpress security
if ( ! defined('ABSPATH') ) {
    die('Are you ok?');
}

/**
 * Prepare the translation of the back- and frontend
 *
 * @return void no return value
 */
function i18n_init() {
	$dir = dirname( \plugin_basename( __FILE__)) . '/languages/';
	load_plugin_textdomain( 'fotoramamulti', false, $dir);
}

add_action( 'plugins_loaded', 'mvbplugins\fotoramamulti\i18n_init'); // only for translations in the admin-settings page

/**
 * translate strings on client request (mind: it will not work if the page or post is cached by wordpress or another cache mechanism)
 *
 * @param $string $translate the string to translate
 * @param $string $language	 the client language
 * @return $string the translated string for defined language or the original string
 */
function t($translate, $language) {
	
	$languages = array('de', 'fr', 'it', 'es'); // provided translations

	$de = array(
		'Download' => 'Herunterladen',
		'Start address' => 'Startadresse');

	$fr = array(
		'Download' => 'Télécharges',
		'Start address' => 'Adresse de départ');

	$it = array(
		'Download' => 'Scarica',
		'Start address' => 'Indirizzo iniziale');

	$es = array(
		'Download' => 'Descarga',
		'Start address' => 'Dirección de inicio');

	if ( ! in_array($language, $languages)) {
		$language = "en";
		return $translate;
	} else {
		$translate = isset( $$language[$translate]) ? $$language[$translate] : $translate;
	}

	return $translate;
}