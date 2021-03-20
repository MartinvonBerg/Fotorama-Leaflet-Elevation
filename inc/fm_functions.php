<?php
namespace mvbplugins\fotoramamulti;

/**
 * check whether a plugin is activated
 * source: https://stackoverflow.com/questions/39293716/detect-yoast-seo-plugin
 *
 * @param string $plugin the plugin path relative to the wp plugins-path
 * @return mixed true if plugin is active
 */
function active( $plugin ) {
    $network_active = false;
    if ( is_multisite() ) {
        $plugins = get_site_option( 'active_sitewide_plugins' );
        if ( isset( $plugins[$plugin] ) ) {
            $network_active = true;
        }
    }
    return in_array( $plugin, get_option( 'active_plugins' ) ) || $network_active;
}

/**
 * Get the upload URL/path in right way (works with SSL).
 *
 * @param string $param  "basedir" or "baseurl"
 * @param string $subfolder  subfolder to append to basedir or baseurl
 * @return string the base appended with subfolder
 */
function gpxview_get_upload_dir($param, $subfolder = '')
{
	$upload_dir = wp_get_upload_dir();
	$url = $upload_dir[$param];

	if ($param === 'baseurl' && is_ssl()) {
		$url = str_replace('http://', 'https://', $url);
	}

	return $url . $subfolder;
}

/**
 * Convert one part of GPS coordinates to float
 *
 * @param array $coordPart gpx coordinate-part, degree, minute or second
 * @return float GPS coordinates as number
 */
function gpxview_GPS2Num($coordPart)
{
	$parts = explode('/', $coordPart);

	if (count($parts) <= 0)
		return 0;

	if (count($parts) == 1)
		return $parts[0];

	return floatval($parts[0]) / floatval($parts[1]);
}

/**
 * calculate GPS-coordinates to float together with earth hemisphere
 *
 * @param array $exif-Coord One GPS-Coordinate taken from Exif in jpg-image in [degrees, minutes, seconds]
 * @param string $hemi earth hemisphere. If "W" or "S" it is the west or south half of earth
 * @return float|null gps-coordinate as number or null if $exif-Coord is not an array
 */
function gpxview_getGPS($exifCoord, $hemi)
{
	if ( ! is_array($exifCoord)) {
		return null;
	}

	$degrees = count($exifCoord) > 0 ? gpxview_GPS2Num($exifCoord[0]) : 0;
	$minutes = count($exifCoord) > 1 ? gpxview_GPS2Num($exifCoord[1]) : 0;
	$seconds = count($exifCoord) > 2 ? gpxview_GPS2Num($exifCoord[2]) : 0;

	$flip = ($hemi == 'W' or $hemi == 'S') ? -1 : 1;

	$gpsvalue = $flip * ($degrees + $minutes / 60 + $seconds / 3600);
	if (($gpsvalue <= 180.0) && ($gpsvalue >= -180.0) && is_numeric($gpsvalue)) {
		return $gpsvalue;
	} else {
		return null;
	}
}

/**
 * set custom fields 'lat' and 'lon' of the post
 *
 * @param int $pid the post-id
 * @param float $lat the GPS-coordinates lat as number
 * @param float $lon the GPS-coordinates lon as number
 * @return nothing
 */
function gpxview_setpostgps($pid, $lat, $lon)
{
	// es wurde vorab schon geprüft, dass die Werte $lat und $lon existieren. Stimmt nur für setzen aus Foto
	// Wenn Struktur GPS-XML abweicht, dann liefert simplexml leere Strings
	$oldlat = get_post_meta($pid,'lat');
	$oldlon = get_post_meta($pid,'lon');
	if ((count($oldlon)==0) && (count($oldlat)==0)) {
		update_post_meta($pid,'lat',$lat,''); 
		update_post_meta($pid,'lon',$lon,'');
		//echo ('Update Post-Meta lat und lon');
	} elseif (strlen($oldlon[0]>=0) && strlen($oldlat[0]>=0)) {
		delete_post_meta($pid,'lat');
		delete_post_meta($pid,'lon');
		update_post_meta($pid,'lat',$lat,''); 
		update_post_meta($pid,'lon',$lon,'');
		//echo ('Update Post-Meta lat und lon');
	}
}

/**
 * get GPS-Longitude 'lon' and Latitude 'lat' from the Exif-Data in the image
 *
 * @param array $Exif the Exif-data read out from the image
 * @return array ($lon, $lat) the GPS-coordinates
 */
function gpxview_getLonLat($Exif)
{
	if (array_key_exists('GPS',$Exif)) {
		$lon = gpxview_getGPS($Exif["GPS"]["GPSLongitude"], $Exif["GPS"]['GPSLongitudeRef']);
		$lat = gpxview_getGPS($Exif["GPS"]["GPSLatitude"], $Exif["GPS"]['GPSLatitudeRef']);
	} else {
		// "No GPS-Data available.."
		$lon = null;
		$lat = null;
	}
	
	return array($lon, $lat);
}

/**
 * read-out single values from the Exif-Data, IPTC-Data and the WP-Media-Catalog-Database
 * If found in the Catalog this information will be preferred.
 *
 * @param array $Exif the Exif-data read out from the image
 * @param string $file the directory-path to the image file 
 * @param int $imageNumber the local loop-counter for the image 
 * @param int $wpid the wordpress-id of the image 
 * @return array array with dedicated information for the image
 */
function gpxview_getEXIFData($Exif, $file, $imageNumber, $wpid)
{
	// get title from IPTC-data
	getimagesize($file, $info);

	$title = 'Galeriebild ' . strval($imageNumber+1);
	if (isset($info['APP13'])) {
		$iptc = iptcparse($info['APP13']);
		if (isset($iptc["2#005"][0])) {
			$title =  htmlspecialchars($iptc["2#005"][0]);
		} 
	} 
	
	// get foto capture data
	$exptime = $Exif["EXIF"]["ExposureTime"] ?? '--';
	$apperture = strtok(($Exif["EXIF"]["FNumber"] ?? '-'), ' / ');
	$iso = $Exif["EXIF"]["ISOSpeedRatings"] ?? '--';
	if (isset($Exif["EXIF"]["FocalLengthIn35mmFilm"])) {
	//if (array_key_exists('FocalLengthIn35mmFilm', $Exif["EXIF"])) {
		$focal = $Exif["EXIF"]["FocalLengthIn35mmFilm"] . 'mm';
	} else {
		$focal = '--mm';
	}

	// Check setting of exif-field make (the lens information, written by my Ligtroom-Plugin)
	// alternatively I wrote lens information to the make.
	if (isset($Exif["IFD0"]["Make"])) {
	//if (array_key_exists('Make', $Exif['IFD0'])) {
		$make = $Exif["IFD0"]["Make"] ?? '';
		$make = preg_replace('/\s+/', ' ', $make);
	} else {
		$make = '';
	}

	// get lens data. $make is obsolete now!
	$lens = isset($Exif["EXIF"]["UndefinedTag:0xA434"]) ? $Exif["EXIF"]["UndefinedTag:0xA434"] : '';
	//$lens = array_key_exists("UndefinedTag:0xA434", $Exif["EXIF"]) ? $Exif["EXIF"]["UndefinedTag:0xA434"] : '';
	
	// get the camera model
	if (isset($Exif["IFD0"]["Model"])) {
	//if (array_key_exists('Model', $Exif['IFD0'])) {
		$model = $Exif["IFD0"]["Model"];
	} else {
		$model = '';
	}
	// combine camera model and lens data
	if (!ctype_alpha($lens) && strlen($lens)>0) {
		$camera = $model . ' + '. $lens;
	} else {
		$camera = $model;
	}

	// get date-taken information
	if (isset($Exif["EXIF"]["DateTimeOriginal"])) {
		$datetaken = explode(":", $Exif["EXIF"]["DateTimeOriginal"]);
		$datesort = $Exif["EXIF"]["DateTimeOriginal"];
		$datetaken = strtok((string) $datetaken[2], ' ') . '.' . (string) $datetaken[1] . '.' . (string) $datetaken[0];
	} else {
		$datetaken = '';
		$datesort = '';
	}

	// get tags and $description
	$tags = isset($iptc["2#025"]) ? $iptc["2#025"] : ''; 
	$description = isset($Exif["IFD0"]["ImageDescription"]) ? $Exif["IFD0"]["ImageDescription"] : '';
	
	// get data fromt the wp database, if it is there
	$sort = 0; $alt = ''; $caption = '';
	if ($wpid > 0) {
		$wpmediadata = get_post( $wpid, 'ARRAY_A');
		$wptitle = $wpmediadata['post_title']; 
		$title = $wptitle != '' ? $wptitle : $title;
		$caption = $wpmediadata["post_excerpt"]; // 'Beschriftung' in the Media-Catalog, means caption
		$wpdescription = $wpmediadata["post_content"]; // 'Beschreibung' in the Media-Catalog, means $description
		$description = $wpdescription != '' ? $wpdescription : $description;

		$sort = get_post_meta( $wpid, 'gallery_sort', true) ?? '';
		$alt = get_post_meta( $wpid, '_wp_attachment_image_alt', true) ?? '' ;
		
		$meta = wp_get_attachment_metadata($wpid);
		$wptags = $meta["image_meta"]["keywords"]; 
		$tags = is_array($wptags) ? $wptags : $tags;
	}
	
	return array($exptime, $apperture, $iso, $focal, $camera, $datetaken, $datesort, $tags, $description, $title, $alt, $caption, $sort);
}