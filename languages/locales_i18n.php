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

/**
 * A function that overloads the wordpress standard translate function.
 *
 * @param string $text The input string to be translated.
 * @return string The translated string.
 */
function __( string $text, $namespace = 'fotoramamulti' ) :string {
	$lang = setDashboardLanguage();
	$tranlated = t($text, $lang);
	return $tranlated;
}

add_action( 'plugins_loaded', 'mvbplugins\fotoramamulti\i18n_init'); // only for translations in the admin-settings page

/**
 * translate strings on client request (mind: it will not work if the page or post is cached by wordpress or another cache mechanism)
 *
 * @param $string $translate the string to translate
 * @param $string $language	 the client language
 * @return $string the translated string for defined language or the original string
 */
function t(string $translate, string $language) :string {
	
	$languages = array('de', 'fr', 'it', 'es'); // provided translations

	if ( !in_array($language, $languages) && strpos( $language, '_') !== false) {
		$language = substr($language, 0, strpos($language, '_'));
	}

	$de = array(
		'Download' => 'Herunterladen',
		'Upload' => 'Hochladen',
		'Start address' => 'Startadresse',
		'successful' => 'erfolgreich',
		'ATTENTION: File .htaccess is NOT OK.' => 'ACHTUNG: Datei .htaccess ist NICHT OK.',
		'Recommendation' => 'Empfehlung',
		'File' => 'Datei',
		'does not exist' => 'existiert nicht',
		'Leave Import File empty and press Save Button before' => 'Keine Importdatei angeben und vorher Einstellungen speichern',
		'File not touched' => 'Datei nicht geändert',
		'Error during File processing' => 'Fehler bei der Datei-Verarbeitung',
		'File alread exists' => 'Datei existiert bereits',
		'No Filename given' => 'Kein Dateiname angegeben',
		'Settings File generated. Use Download link below' => 'Settings File generated. Use Download link below',
		'Could not generate File!' => 'Datei konnte nicht erzeugt werden!',
		'Something Failed! Settings were not upated! Or set to default values.' => 'Etwas ist schief gelaufen! Einstellungen wurden nicht aktualisiert oder auf Standardwerte gesetzt.',
		'Use a local Tile-Server to provide Map-Tiles (.htaccess checked and OK)' => 'Benutze einen lokalen Tile-Server um Karten zu laden (.htaccess ist OK)',
		'no Shortode' => 'kein Shortode',
		'Shortcode' => 'Shortcode',
		'Value (Default first)' => 'Wert (Voreinstellung zuerst)',
		'Example' => 'Beispiel',
		'Description' => 'Beschreibung',
		'Dist' => 'Länge',
		'Gain' => 'Anstieg',
		'Loss' => 'Abstieg',
		'Filesize' => 'Dateigröße',
		'Points' => 'Punkte',
		'before / after' => 'vor / nach',
	);

	$fr = array(
		'Download' => 'Télécharges',
		'Start address' => 'Adresse de départ'
	);

	$it = array(
		'Download' => 'Scarica',
		"Upload" => "Carica",
		'Start address' => 'Indirizzo iniziale',
		'successful' => 'successo',
		'ATTENTION: File .htaccess is NOT OK.' => 'ATTENZIONE: il file .htaccess non è OK',
		'Recommendation' => 'raccomandazione',
		'File' => 'file',
		'does not exist' => 'non esiste',
		'Leave Import File empty and press Save Button before' => 'Non specificare il file di importazione e salvare le impostazioni prima',
		'File not touched' => 'file non modificato',
		'Error during File processing' => 'Errore durante il processo di importazione',
		'File alread exists' => 'file esiste già',
		'No Filename given' => 'Nessun nome di file',
		'Settings File generated. Use Download link below' => 'File di impostazioni generato. Utilizza il link di download qui sotto',
		'Could not generate File!' => 'Impossibile generare il file!',
		'Something Failed! Settings were not upated! Or set to default values.' => 'Qualcosa è andato storto! Le impostazioni non sono state aggiornate o impostate in valori predefiniti',
		'Use a local Tile-Server to provide Map-Tiles (.htaccess checked and OK)' => 'Utilizza un server di mappa locale per fornire i mappati (.htaccess è stato controllato e è OK)',
		'no Shortode' => 'nessun shortcode',
		'Shortcode' => 'Shortcode',
		'Value (Default first)' => 'Valore (primo valore predefinito)',
		'Example' => 'Esempio',
		'Description' => 'Descrizione',
		'Dist' => 'Lunghezza',
		'Gain' => 'Salita	',
		'Loss' => 'Discesa',
		'Filesize' => 'Dimensione del file',
		'Points' => 'Punti',
		'before / after' => 'prima / dopo',
	);

	$es = array(
		'Download' => 'Descarga',
		'Start address' => 'Dirección de inicio'
	);

	if ( in_array($language, $languages)) {
		$translate = isset( $$language[$translate]) ? $$language[$translate] : $translate;
	}

	// escape the translated string depending on existing html tags.
	if($translate != strip_tags($translate)) {
		// contains HTML
		// do nothing for the moment
	} else {
		// does not contain HTML
		$translate = esc_html( $translate );
	}

	return $translate;
}