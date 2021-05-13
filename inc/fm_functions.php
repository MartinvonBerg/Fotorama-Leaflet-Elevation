<?php
namespace mvbplugins\fotoramamulti;

// add the style for the grid to ALL headers!
// Generate the inline style for the CSS-Grid. Identical for all shortcodes!
add_action('wp_head', '\mvbplugins\fotoramamulti\fotorama_multi_styles', 100);
function fotorama_multi_styles( ) {
	$fotorama_elevation_options = get_option( 'fotorama_elevation_option_name' ); // Array of All Options
	$stylestring  = '<style id="fotorama_multi_inline_css" type="text/css">';
	$stylestring  .= '@media screen and (min-width: 480px) { .mfoto_grid { display: grid;';
	$stylestring  .= ' grid-template-columns: repeat(auto-fit, minmax('. $fotorama_elevation_options['min_width_css_grid_row_14'] .'px, 1fr)); grid-gap: 5px;} } </style>';  
	echo $stylestring;
}

// define the shutdown callback 
function action_shutdown( $array ) { 
    
	$fm_act_pis = \get_option('fm_plugins_checker');

	//if ( ('true' == $fm_act_pis['plugins_changed']) && ( \is_page() || \is_single()) ) { 
	if ( ( \is_page() || \is_single()) ) {
		$all = \mvbplugins\fotoramamulti\get_scripts_styles();
		$plugin_path = plugins_url() . '/';
		$plugin_name = plugin_basename( __FILE__ );
		$pos = \stripos( $plugin_name, '/' );
		$plugin_name = \substr($plugin_name, 0, $pos);
		$not_fm_scripts = array();
		$fm_scripts = array();
		
		// filter and sort the scripts loaded from all plugins and themes
		foreach ($all['scripts'] as $script) {
			$script = \str_replace( $plugin_path, '', $script);
			$is_fm_script = \stripos($script, $plugin_name);
			$suffix = \stripos( $script, '.js?' );
			if ( $suffix > 0 ) {
				$script = \substr($script, 0, $suffix+3);
			}
			$js = \basename($script, '.js');
			$min = \stripos( $js, 'min' );
			
			if ($min > 0) {
				$js = \str_replace('.min', '', $js);
			}

			if ( false === $is_fm_script ) {
				$not_fm_scripts[] = $js;
				$not_fm_scripts_complete[] = $script;
				$plugin = \str_replace( $plugin_path, '', $script);
				$pos = \stripos( $plugin, '/' );
				$plugin_check = \substr($plugin, 0, $pos);
				$plugin_conflict = \stripos( $plugin_check, 'leaflet' );
				if ( is_numeric($plugin_conflict) ) {
					$conflicting_plugin[] = $plugin_check . ' - detected by naming' ;
				}
				
			} else {
				$fm_scripts[] = $js;
			}
		}

		// check the scripts if there are double filenames
		foreach ($not_fm_scripts as $script) {
			if ( ! empty( $fm_scripts)  ) {
				$script_conflict = \in_array($script, $fm_scripts);
			} else {
				$script_conflict = false;
			}
			if ( $script_conflict ) {
				$plugin = \array_search($script, $all['scripts']);

				$search = $script . '.min.js';
				$matches = array_filter($not_fm_scripts_complete, function ($haystack) use ($search) {
					return(strpos($haystack, $search));
				});

				if ( \count($matches) == 0) {
					$search = $script . '.js';
					$matches = array_filter($not_fm_scripts_complete, function ($haystack) use ($search) {
						return(strpos($haystack, $search));
					});
				}
				// get the plugin of the conflicting script
				foreach ($matches as $match) {
					$plugin = \str_replace( $plugin_path, '', $match);
					$pos = \stripos( $plugin, '/' );
					$plugin_name = \substr($plugin, 0, $pos);
					$conflicting_script[] = $plugin_name . ' - ' . \str_replace($plugin_name, '', $match );
				}
				
			}
		}

		if ( empty( $conflicting_script ) && empty( $conflicting_plugin ) ) {
			$fm_act_pis['plugins_changed'] = 'false';
			$fm_act_pis['show_admin_message'] = 'false';
			$fm_act_pis['plugin_name'] = '';
		} else {
			$fm_act_pis['show_admin_message'] = 'true';
			$conflicting_script = \array_merge( (array)$conflicting_script, (array)$conflicting_plugin);
			$fm_act_pis['plugin_name'] = \maybe_serialize( $conflicting_script );
		}
		\update_option('fm_plugins_checker', $fm_act_pis);
	}
}
	
function fm_error_notice() {
	// error : red
	// is-dimissable : click away and forget.
	$fm_act_pis = \get_option('fm_plugins_checker');
	$fm_act_pis = \maybe_unserialize( $fm_act_pis['plugin_name'] );
    ?>
    <div class="notice notice-warning is-dismissible">
        <p><strong>Plugin Conflict detected: </strong><br></p>
		<p>The following Plugin(s) conflicts with Fotorama_multi:</p>
		<?php 
		foreach ($fm_act_pis as $conflict) {
			echo ( '<strong>' . $conflict . '</strong><br>');
		}
		?>
		<p>This message is generated by the Plugin "Fotorama_multi" after activation / deactivation of a plugin and usage of identical javascript files 
		on the same page or post. Deactivate Fotorama_multi or the above plugin(s), reload the relevant page or post and the admin page to remove this message. 
		</p>
    </div>
    <?php
}

function get_scripts_styles() {

    $result = [];
    $result['scripts'] = [];
    $result['styles'] = [];

    // Print all loaded Scripts
    global $wp_scripts;
	if ( 'array' == gettype( $wp_scripts) || 'object' == gettype( $wp_scripts) ) {
		foreach( $wp_scripts->queue as $script ) {
		$result['scripts'][] =  $wp_scripts->registered[$script]->src;
		}
	}

    // Print all loaded Styles (CSS)
    global $wp_styles;
	if ( 'array' == gettype( $wp_styles) || 'object' == gettype( $wp_styles) ) {
		foreach( $wp_styles->queue as $style ) {
		$result['styles'][] =  $wp_styles->registered[$style]->src;
		}
	}

    return $result;
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
 * @param string $coordPart gpx coordinate-part, degree, minute or second
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
 * @param string $lat the GPS-coordinates lat as number
 * @param string $lon the GPS-coordinates lon as number
 * @return void
 */
function gpxview_setpostgps($pid, $lat, $lon)
{
	// es wurde vorab schon geprüft, dass die Werte $lat und $lon existieren. Stimmt nur für setzen aus Foto
	// Wenn Struktur GPS-XML abweicht, dann liefert simplexml leere Strings
	$oldlat = get_post_meta($pid,'lat');
	$oldlon = get_post_meta($pid,'lon');
	if ((count($oldlon)==0) && (count($oldlat)==0)) {
		update_post_meta($pid,'lat',$lat); 
		update_post_meta($pid,'lon',$lon);
		//echo ('Update Post-Meta lat und lon');
	} else { //if (strlen($oldlon[0]>=0) && strlen($oldlat[0]>=0)) {
		delete_post_meta($pid,'lat');
		delete_post_meta($pid,'lon');
		update_post_meta($pid,'lat',$lat); 
		update_post_meta($pid,'lon',$lon);
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