<?php
namespace mvbplugins\fotoramamulti;

function custom_mime_types( $mimes ) { 
	// Add new MIME types here
	$mimes['kml'] = 'application/vnd.google-earth.kml+xml';
	$mimes['gpx'] = 'application/gpx+xml';
	$mimes['gpx'] = 'application/xml';
	$mimes['gpx'] = 'text/xml';
	$mimes['gpx'] = 'text/gpx';
	$mimes['gpx'] = 'text/gpsxml';
	$mimes['gpx'] = 'application/gpsxml';
	
	return $mimes;
	}
add_filter( 'upload_mimes', '\mvbplugins\fotoramamulti\custom_mime_types' );