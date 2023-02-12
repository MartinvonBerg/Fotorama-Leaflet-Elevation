<?php
namespace mvbplugins\fotoramamulti;

require_once __DIR__ . '/extractMetadata.php';

/**
 * enqueue the fslightbox.js script as basic or paid version, if available.
 *
 * @return void
 */
function enqueue_fslightbox()
{
    $isEnqueued =  \wp_script_is('fslightbox', 'enqueued');

	if ( ! $isEnqueued ) {
		$plugin_main_dir = \WP_PLUGIN_DIR; // @phpstan-ignore-line
		$path = $plugin_main_dir . '/simple-lightbox-fslight/js/fslightbox-paid/fslightbox.js';
		$path = \str_replace('/', \DIRECTORY_SEPARATOR, $path); // @phpstan-ignore-line
		$slug = \WP_PLUGIN_URL; // @phpstan-ignore-line

		if (is_file($path)) {
			$path = $slug . '/simple-lightbox-fslight/js/fslightbox-paid/fslightbox.js';
			wp_enqueue_script('fslightbox', $path, [], '3.4.1', true);
		}

		$path = $plugin_main_dir . '/simple-lightbox-fslight/js/fslightbox-basic/fslightbox.js';
		$path = \str_replace('/', \DIRECTORY_SEPARATOR, $path); // @phpstan-ignore-line

		if (is_file($path)) {
			$path = $slug . '/simple-lightbox-fslight/js/fslightbox-basic/fslightbox.js';
			// This does not overload if both js-scripts are available because wp_enqueue_script does not overload.
			wp_enqueue_script('fslightbox', $path, [], '3.3.1', true);
		}

		// pass option to the js-script to switch fullscreen of browser off, when lightbox is closed.
		//$jsFullscreen = "fsLightboxInstances['1'].props.exitFullscreenOnClose = true;";
		// this option increases the load time with many images.
		//$jsFullscreen = "fsLightboxInstances['1'].props.exitFullscreenOnClose = true;fsLightboxInstances['1'].props.showThumbsOnMount = true;";
		//\wp_add_inline_script('fslightbox', $jsFullscreen); 
	}
}

// add the style for the grid to ALL headers!
add_action('wp_head', '\mvbplugins\fotoramamulti\fotorama_multi_styles', 100);
/**
 * Generate the inline style for the CSS-Grid. Identical for all shortcodes!
 *
 * @return void none
 */
function fotorama_multi_styles( ) {
	$fotorama_elevation_options = get_option( 'fm_common_options' ); // Array of Common Options
	
	if ( $fotorama_elevation_options['min_width_css_grid_row_14'] > 0) {
		$stylestring  = '<style id="fotorama_multi_inline_css" type="text/css">';
		$stylestring  .= '@media screen and (min-width: 480px) { .mfoto_grid { display: grid;';
		$stylestring  .= ' grid-template-columns: repeat(auto-fit, minmax('. $fotorama_elevation_options['min_width_css_grid_row_14'] .'px, 1fr)); grid-gap: 5px;} } </style>';  
		echo $stylestring;
	}
}

// hook the function addLinkToHead the wp_head hook
add_action('wp_head', '\mvbplugins\fotoramamulti\addLinkToHead', 2);
/**
 * add the link-tag to the header of the page depending on mobile or desktop request
 *
 * @return void
 */
function addLinkToHead() {
	// detect request from mobile device. 
	$ua = strtolower($_SERVER["HTTP_USER_AGENT"]);
	$isMobile = strpos($ua, "mobile") !== false;
	// <link rel="preload" as="image" href="wolf.jpg" imagesrcset="wolf_400px.jpg 400w, wolf_800px.jpg 800w, wolf_1600px.jpg 1600w" imagesizes="50vw">
	$link = '';
	// get $postid
	$postid = get_the_ID();
	// get custom field for the link
	$link = get_post_meta( $postid,'fm_header_link', true);

	// echo the string from custom field
	if (($link === '') || ($link === false)) {
		// echo nothing
	}
	elseif ( $isMobile ) {
		$link2 = $link . 'imagesizes="100vw">';
		echo $link2;
	} else {
		$link2 = $link . 'imagesizes="50vw">';
		echo $link2;
	}
}

/**
 * define the shutdown callback
 *
 * @return void
 */
function action_shutdown() { 
    
	$fm_act_pis = \get_option('fm_plugins_checker');

	//if ( ('true' == $fm_act_pis['plugins_changed']) && ( \is_page() || \is_single()) ) { 
	if ( ( \is_page() || \is_single()) ) {
		$all = \mvbplugins\fotoramamulti\get_scripts_styles();
		$plugin_path = plugins_url() . '/';
		$plugin_name = plugin_basename( __FILE__ );
		$pos = \stripos( $plugin_name, '/' );
		$plugin_name = \substr($plugin_name, 0, $pos);
		$not_fm_scripts = [];
		$not_fm_scripts_complete = [];
		$conflicting_plugin = [];
		$conflicting_script = [];
		$fm_scripts = [];
		
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

/**
 * Display the error notice in admin panel if plugins are conflicting
 *
 * @return void none
 */
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

/**
 * Get all scripts and styles
 *
 * @return array{scripts: array<int, mixed>, styles: array<int, mixed>}
 */
function get_scripts_styles() :array
{
    $result = [];
    $result['scripts'] = [];
    $result['styles'] = [];

    // Get all loaded Scripts
    global $wp_scripts;
	if ( 'array' == gettype( $wp_scripts) || 'object' == gettype( $wp_scripts) ) {
		foreach( $wp_scripts->queue as $script ) {
		$result['scripts'][] =  $wp_scripts->registered[$script]->src;
		}
	}

    // Get all loaded Styles (CSS)
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
function gpxview_get_upload_dir($param, $subfolder = '') :string
{
	$upload_dir = wp_get_upload_dir();
	$url = $upload_dir[$param];

	if ($param === 'baseurl' && is_ssl()) {
		$url = str_replace('http://', 'https://', $url);
	}

	return $url . $subfolder;
}

/**
 * Convert one part of GPS coordinates to float. That is a string defined by nominator/denominator
 *
 * @param string $coordPart gpx coordinate-part, degree, minute or second
 * @return float GPS coordinates as number
 */
function gpxview_GPS2Num( string $coordPart ) :float
{
	$parts = explode('/', $coordPart);
	$Nparts = count( $parts );

	if ( $Nparts == 1)
		return floatval($parts[0]);

	if ( floatval($parts[1]) == 0)
		return 0;

	return floatval($parts[0]) / floatval($parts[1]);
}

/**
 * calculate GPS-coordinates to float together with earth hemisphere
 *
 * @param array<int,string> $exifCoord One GPS-Coordinate taken from Exif in jpg-image in [degrees, minutes, seconds]
 * @param string $hemi earth hemisphere. If "W" or "S" it is the west or south half of earth
 * @return float|null gps-coordinate as number or null if $exif-Coord is not an array
 */
function gpxview_getGPS( array $exifCoord, string $hemi)
{ 
	if ( empty($exifCoord) ) 
		return null;
	
	$flip = ( ($hemi == 'W') or ($hemi == 'S') ) ? -1 : 1;
	$gpsvalue = 0;
	$i = 0;

	foreach( $exifCoord as $val ) {
		$gpsvalue = $gpsvalue + gpxview_GPS2Num( $val ) / 60**$i;
		++$i;

		if ($i == 3) 
			break;
	}
	
	$gpsvalue = $flip * $gpsvalue;

	if ( abs($gpsvalue) > 180.000 )
		$gpsvalue = null;
	
	return $gpsvalue;
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
 * @param array{GPS: array<string, string|array<int,string>>} $Exif the Exif-data read out from the image.
 * //param array{GPS: array{GPSLongitude: array<int,string>, GPSLatitude: array<int,string>, GPSLongitudeRef:string, GPSLatitudeRef:string}}
 * @return array<int, float|null> ($lon, $lat) the GPS-coordinates
 */
function gpxview_getLonLat( array $Exif) :array
{ 
	if (array_key_exists('GPS',$Exif) && ( null != $Exif["GPS"] ) && ( array_key_exists( 'GPSLongitude', $Exif["GPS"]) )) {
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
 * Read-out single values from the Exif-Data, IPTC-Data in the file and -additionally- the WP-Media-Catalog-Database.
 * If found in the Catalog this information will be preferred. If title is not set or equal to the filename
 * it will be preset with 'notitle'.
 *
 * @param string $file the directory-path to the image file 
 * @param string $ext the file extension
 * @param int $wpid the wordpress-id of the image 
 * @return array<string, mixed> array with collected information for the image
 */
function getEXIFData( string $file, string $ext, int $wpid) :array
{
	// preset the title 
	$title = 'notitle';
	$ext = \strtolower( $ext );
	$data = [];
	
	// read exif from file independent if image is in WP database
	if ( ('.jpg' == $ext) || ('.jpeg' == $ext) ) {
		$data = getJpgMetadata( $file );
		$data['type'] = 'image';

	} elseif ( '.webp' == $ext) {
		// Pre-define values that may not be in the webp
		$data['datesort'] = '';
		$data['focal_length_in_35mm'] = '--';
		$data['iso'] = '--';
		$data['aperture'] = '--';
		$data['DateTimeOriginal'] = '';
		$data['alt'] = '';
		$data['descr'] = '';
		$data['title'] = $title;
		$data['camera'] = '---';
		$data['type'] = 'image';

		$additionaldata = getWebpMetadata( $file );
		if ( ! empty($additionaldata) ) {
			$data = \array_merge( $data, $additionaldata);
		}

		if ( isset( $data['exposure_time'] ) && $data['exposure_time'] > 0) {
			$data['exposure_time'] = '1/' . strval( 1 / $data['exposure_time'] );
		} else {
			$data['exposure_time'] = '--';
		}

	} else if (($ext === '.mp4') || ($ext === '.m4v') || ($ext === '.webm') || ($ext === '.ogv') || ($ext === '.wmv') || ($ext === '.flv')) {
		// check if poster file is available.
		$pext = '.' . pathinfo($file, PATHINFO_EXTENSION);
		$posterBase = \str_replace($pext,'',$file) . '-poster.';
		$hasPoster = false;
		$data['type'] = 'video';

		if (\is_file( $posterBase . 'jpg')) {
			$pfile = $posterBase . 'jpg';
			$pdata = getJpgMetadata( $pfile );
			$hasPoster = true;
		} else if (\is_file( $posterBase . 'jpeg')) {
			$pfile = $posterBase . 'jpeg';
			$pdata = getJpgMetadata( $pfile );
			$hasPoster = true;
		} else if (\is_file( $posterBase . 'webp')) {
			$pfile = $posterBase . 'webp';
			$pdata = getWebpMetadata( $pfile );
			$hasPoster = true;
		}
		if ( $hasPoster) {
			$data['poster'] =\basename($pfile);
			$data = array_merge($data, $pdata);
		} else {
			$data['alt'] = '';
			$data['descr'] = '';
			$data['title'] = $title;
		}

		if ( $hasPoster && key_exists('GPS', $pdata) ) {
			$data['GPS'] = $pdata['GPS'];
		}

		// get metadate from video file
		require_once( ABSPATH . 'wp-admin/includes/media.php' );
		$vidmeta = \wp_read_video_metadata($file);
		
		// get the dates
		$data['datesort'] = '';
		$dateFormat = get_option( 'date_format' ) . ' ' . get_option( 'time_format' );
		if (\key_exists('created_timestamp', $vidmeta)) {
			$data['created_timestamp'] = $vidmeta['created_timestamp'];
			$date = wp_date( $dateFormat, $vidmeta['created_timestamp'] );
			$data['DateTimeOriginal'] = $date;
		} else if ( ! $hasPoster) {
			$date = wp_date( $dateFormat, \filemtime($file) );
			$data['DateTimeOriginal'] = $date;
			$data['created_timestamp'] = $date;
		} else if ( $hasPoster) {
			$data['DateTimeOriginal'] = $pdata['DateTimeOriginal'];
		}
	}

	// Post-Processing of $data for DateTimeOriginal
	if ( isset( $data["DateTimeOriginal"] ) ) { 
		$data['datesort'] = $data["DateTimeOriginal"];
		$date = wp_date( get_option( 'date_format' ), strtotime( $data['DateTimeOriginal'] ) );
		$data['DateTimeOriginal'] = $date;
	}

	// get width and height data
	$sizeinfo = \wp_getimagesize( $file );
	if ($sizeinfo !== false) {
		$data['height'] = $sizeinfo[1];
		$data['width'] = $sizeinfo[0];
	} else {
		$data['height'] = 0;
		$data['width'] = 0;
	}

	// get additional data from the wp database, if it is there
	if ($wpid > 0) {
		
		// general jpeg and webp
		$wpmediadata = get_post( $wpid, 'ARRAY_A');
		$sort = get_post_meta( $wpid, 'gallery_sort', true) ?? '';
		$alt = get_post_meta( $wpid, '_wp_attachment_image_alt', true) ?? '' ;
		$meta = wp_get_attachment_metadata($wpid);

		// Sonderbehandlung wenn tags im jpg verfügbar sind
		\key_exists('image_meta', $meta) ? $wptags = $meta["image_meta"]["keywords"] : $wptags = ''; 
		$tags = is_array($wptags) ? $wptags : '';
		$description = $wpmediadata["post_content"] ?? ''; // 'Beschreibung' in the Media-Catalog, means description
		
		\key_exists('image_meta', $meta) ? $title = $meta["image_meta"]["title"] : null;
		$wptitle = $wpmediadata['post_title'];
		$wptitle = \str_replace( $ext, '', $wptitle);
		if ( $wptitle != basename($file, $ext) ) {
			$title = $wptitle;
		}
		$oldditle = $data['title'] ?? 'notitle';
		strlen($title) > 2 ? $data['title'] = $title : $data['title'] = $oldditle;

		//$description = $wpdescription != '' ? $wpdescription : $description;
		$caption = $meta["image_meta"]["caption"] ?? '';
		$wpcaption = $wpmediadata["post_excerpt"]; // 'Beschriftung' in the Media-Catalog, means caption
		$caption = $wpcaption != '' ? $wpcaption : $caption;

		// set the data fields 
		$data['sort'] = $sort;
		$data['alt'] = $alt;
		$data['caption'] = $caption;
		
		$tags != '' ? $data['keywords'] = $tags : '';
		$description != '' ? $data['descr'] = $description : '';
		 	
	} 
	// Post-Processing of $data for title and alt for images not in media catalog. Only title and alt are used later on.
	// JPG: alt and caption are empty for images not in Media-Catalog.
	// WEBP: alt and description are empty for images not in Media-Catalog.

	// no-title -> caption -> description -> alt -> notitle.
	if ( \key_exists('title', $data) && $data['title'] === 'notitle' ) {
		if ( ! empty( $data['caption'] ) ) $data['title'] = $data['caption'];
		elseif ( ! empty( $data['descr'] ) ) $data['title'] = $data['descr'];
		elseif ( ! empty( $data['alt'] ) ) $data['title'] = $data['alt'];	
	}

	// no-alt -> description -> caption -> title
	if ( \key_exists('alt', $data) && $data['alt'] === '' ) {
		if ( ! empty( $data['descr'] ) ) $data['alt'] = $data['descr'];
		elseif ( ! empty( $data['caption'] ) ) $data['alt'] = $data['caption'];
		elseif ( $data['title'] !== 'notitle') $data['alt'] = $data['title'];
			
	}
	
	return $data;
}

/**
 * get the Source Set for the current image. Either from WP-database or create from the thumbnails provided in the folder.
 * If both not possible provide an emtpy string
 *
 * @param array<string, mixed> $data the array with all collected image information
 * @param string $up_url the wp upload url
 * @param string $up_dir the wp upload dir on the server
 * @param string $imgpath the current path of the 'Album' or 'gallerie' which is taken for fotorama
 * @param string $thumbsdir the directory with thumbnails, if any
 * @return array<string, array<int|string, string>|string> the srcset as array
 */
function getSrcset ( array $data, string $up_url, string $up_dir, string $imgpath, string $thumbsdir ) :array
{
	$phpimgdata = [];

	// take srcset from WP if image was added to the WP media library
	if ( $data['wpid'] > 0) {
		$srcset2 = wp_get_attachment_image_srcset( $data['wpid'] );

		if ( false !== $srcset2) {
			$srcarr = explode( ',', $srcset2 );
			$finalArray = [];

			foreach( $srcarr as $val){
				$val = trim($val);
				$tmp = \explode(' ', $val);
				$tmp[1] = \str_replace('w', '', $tmp[1]);
				$finalArray[ $tmp[1] ] = $tmp[0];
			}
			$finalArray[ strval(MAX_IMAGE_SIZE) ] = $up_url . '/' . $imgpath . '/' . $data['file'] . $data['extension'];
			//$phpimgdata[$imgnr-1]['srcset'] = $finalArray;
			$phpimgdata['srcset'] = $finalArray;
		}	
	}
	// generate a 'fake' srcset if thumbnails were provided
	elseif ( ($data['thumbinsubdir']) || ($data['thumbavail']) ) {
		$finalArray = [];
		
		if ( $data['thumbinsubdir'] ) {
			$thumbfile = $up_dir . '/' . $imgpath . '/' . $thumbsdir . '/' . $data['file'] . $data['thumbs'];
			$thumburl  = $up_url . '/' . $imgpath . '/' . $thumbsdir . '/' . $data['file'] . $data['thumbs'];
		} else {
			// thumbavail
			$thumbfile = $up_dir . '/' . $imgpath . '/' . $data['file'] . $data['thumbs'];
			$thumburl  = $up_url . '/' . $imgpath . '/' . $data['file'] . $data['thumbs']; 
		}
		
		list($thumbwidth, $height, $type, $attr) = getimagesize( $thumbfile );
		$finalArray[ strval( $thumbwidth ) ] = $thumburl;
		$finalArray[ strval(MAX_IMAGE_SIZE) ] = $up_url . '/' . $imgpath . '/' . $data['file'] . $data['extension'];
		$phpimgdata['srcset'] = $finalArray;	
	
		// no srcset without rescaled, smaller images
	} else {
		$phpimgdata['srcset'] = '';
	}
	return $phpimgdata;
}

/**
 * Parse GPX-Track-Files, check if every entry is a file, and if so append it to the string and the array to pass to javascript.
 * Additionally set custom-fields lat, lon and get the data for the start address.
 *
 * @param integer $postid the id of the current post
 * @param string $gpxfile the string with a comma seperated list with gpxfiles form the shortcode parameter
 * @param string $gpx_dir the server directory with gpx-files from the fotorama admint settings or the shortcode parameter
 * @param string $gpx_url the gpx url form where the gpx-file is downloadable
 * @param string $showadress whether to show the start adress
 * @param boolean $setCustomFields whether to set the custom fields in the post
 * @param integer $shortcodecounter the number of the shortcode on the page / post where it is used.
 * @return array{string, array, int} gpxfile as string and tracks as array for the Javscript variable
 */
function parseGPXFiles ( int $postid, string $gpxfile, string $gpx_dir, string $gpx_url, string $showadress, bool $setCustomFields, int $shortcodecounter ) :array
{
	// parse GPX-Track-Files, check if it is a file, and if so append it to the string to pass to javascript
	$files = explode(",", $gpxfile);
	$i = 0; // i : gpxfilenumber : the actual number of tracks at the end of the loop
	$gpxfile = ''; // string to pass to javascript // parameter $setCustomFields, $shortcodecounter, $showadress, $files, out: $gpxfile
	$tracks = [];
	
	foreach ($files as $file) { 
		$f = trim($file);
		if (is_file($gpx_dir . $f)) {
			$tracks['track_' . $i]['url'] = $gpx_url . $f;
			$gpxdata = simplexml_load_file( $gpx_dir . $f );
			$tracks['track_' . $i]['info'] = (string) $gpxdata->metadata->desc[0];

			if ($i == 0) {
				$gpxfile .= $f;

				//if ($draft_2_pub && $setCustomFields && (0 == $shortcodecounter)) {
				if ( \current_user_can('edit_posts') && $setCustomFields && (0 == $shortcodecounter) ) {	
					// Set Custom-Field 'lat' and 'lon' in the Post with first trackpoint of the GPX-track
					// This is done only once to reduce load on nominatim. If requests are too frequent it will block the response!
					
					if ( 'object' == gettype( $gpxdata) ) {
						if (isset( $gpxdata->trk->trkseg->trkpt[0]['lat'] ) ) {
							$lat = \strval( $gpxdata->trk->trkseg->trkpt[0]['lat'] ); 
						} else {
							$lat = \strval( $gpxdata->trk->trkpt[0]['lat'] );
						}

						if (isset( $gpxdata->trk->trkseg->trkpt[0]['lon'] )) {
							$lon = \strval( $gpxdata->trk->trkseg->trkpt[0]['lon'] );  
						} else {
							$lon = \strval( $gpxdata->trk->trkpt[0]['lon'] );
						}
						
						if ( \is_numeric( $lat ) && \is_numeric( $lon ) ) {
							gpxview_setpostgps($postid, $lat, $lon);

							// get the adress of the GPS-starting point, source: https://nominatim.org/release-docs/develop/api/Reverse/
							// only done for the first track. Mind: allow_url_fopen of the server has to be ON!
							if ( ('true' == $showadress) &&  ('1' == \ini_get('allow_url_fopen') ) ) {
								$url = 'https://nominatim.openstreetmap.org/reverse?lat=' . $lat . '&lon='. $lon . '&format=json&zoom=10&accept-language=de';
								$opts = array(
									'http'=>array(
									'method'=>'GET',
									'header'=>'User-Agent: PostmanRuntime/7.26.10' // just any user-agent to fake a human access
									)
								);
								$context = stream_context_create($opts);
								$geojson = json_decode(file_get_contents( $url , false, $context ));
								$geoadress = (array) $geojson->address;
								//$resp = wp_remote_get( $url );
								//$body = \json_decode( \wp_remote_retrieve_body( $resp ) );
								//$geoadress = (array) $body->address;
								$geoadressfield = maybe_serialize($geoadress);
								delete_post_meta($postid,'geoadress');
								update_post_meta($postid,'geoadress', $geoadressfield,'');
							}
						}
					}	
				}		

			} else {
				$gpxfile .= ',' . $f;
			}
			++$i;
		}
	}
	return array ( $gpxfile, $tracks, $i );
}