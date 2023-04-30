<?php
namespace mvbplugins\fotoramamulti;

// Extract Metadata from a Webp and JPG-file. 
const BROKEN_FILE = false; // value to store in img_metadata if error extracting metadata.
const MINIMUM_CHUNK_HEADER_LENGTH = 18;
const WEBP_VERSION = '0.0.1';
const VP8X_ICC = 32;
const VP8X_ALPHA = 16;
const VP8X_EXIF = 8;
const VP8X_XMP = 4;
const VP8X_ANIM = 2;
const EXIF_OFFSET = 8;

/**
 * read out the required metadata from a jpg-file on the server. The result provides some more data than required.
 *
 * @param string $filename The complete path to the file in the directory.
 * @return array The exif data a array similar to the JSON that is provided via the REST-API.
 */
function getJpgMetadata( string $filename ) : array 
{	
	$info = [];
	getimagesize( $filename, $info );
	$Exif = exif_read_data( $filename, 'ANY_TAG', true );
	
	// get the title
	if (isset($info['APP13'])) {
		$iptc = iptcparse($info['APP13']);
		if (isset($iptc["2#005"][0])) {
			$title =  htmlspecialchars($iptc["2#005"][0]);
		} else $title = 'notitle';
	} else $title = 'notitle';
	
	// get image capture data
	$exptime = $Exif["EXIF"]["ExposureTime"] ?? '--';

	if ( isset($Exif["EXIF"]["FNumber"] ) ) {
		$aperture = explode("/", $Exif["EXIF"]["FNumber"]);
		if ( sizeof( $aperture ) == 2) {
			$aperture = $aperture[0] / $aperture[1];
		} else { 
			$aperture = $Exif["EXIF"]["FNumber"];
		}
	} else $aperture = '--';

	$iso = $Exif["EXIF"]["ISOSpeedRatings"] ?? '--';
	
	if (isset($Exif["EXIF"]["FocalLengthIn35mmFilm"])) {
	//if (array_key_exists('FocalLengthIn35mmFilm', $Exif["EXIF"])) {
		$focal = $Exif["EXIF"]["FocalLengthIn35mmFilm"];
	} else {
		$focal = '--';
	}

	// Check setting of exif-field make (the lens information, written by my Ligtroom-Plugin)
	// alternatively I wrote lens information to the make therefore I check for make here
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
	$camera == '' ? $camera = '---' : $camera; 

	// get date-taken information
	if (isset($Exif["EXIF"]["DateTimeOriginal"])) {
		$datetaken = $Exif["EXIF"]["DateTimeOriginal"];
	} else {
		$datetaken = '';
	}

	// get tags and $description
	$tags = isset($iptc["2#025"]) ? $iptc["2#025"] : ''; 
	$description = isset($Exif["IFD0"]["ImageDescription"]) ? $Exif["IFD0"]["ImageDescription"] : '';
	
	$data['GPS'] = $Exif['GPS'] ?? null;
	$data['exposure_time'] = $exptime;
	$data['aperture'] = $aperture; 
	$data['iso'] = $iso; 
	$data['focal_length_in_35mm'] = $focal; 
	$data['camera'] = $camera; 
	$data['DateTimeOriginal'] = $datetaken; 
	$data['keywords'] = $tags; 
	$data['datesort'] = ''; 
	$data['sort'] = 0;

	$data['title'] = $title; 
	$data['descr'] = $description; 
	$data['alt'] = ''; 
	$data['caption'] = ''; 
	
	return $data;
}

/**
 * Read out the required metadata from a Webp-file on the server. The result provides some more data than required.
 * Only tested for Nikon D7500 images after handling with Lightroom 6.14 and converson with imagemagick. Not done for all cameras that are around.
 * Title, caption and keywords are not found in EXIF-data. These are taken from XMP-data. 
 * This keys are set in the returned array: 
 * 		credit, copyright, title, caption, camera, keywords, GPS, make, 
 * 		orientation, lens, iso, exposure-time, aperture, focal-length, created-timestamp.
 * 		alt and description are not set.
 *
 * @param string $filename The complete path to the file in the directory.
 * @return array The exif data array similar to the JSON that is provided via the REST-API.
 */
function getWebpMetadata( string $filename ) 
{
	$parsedWebPData = extractMetadata( $filename );
	if ( ! $parsedWebPData ) {
		//return BROKEN_FILE;
		return [];
	}

	$parsedWebPData['meta_version'] = WEBP_VERSION;
	return $parsedWebPData;
}

/**
 * Extract EXIF and XMP metadata from a file
 *
 * @param  string $filename the file to analyse
 * @return false|array array with metadata of false on failure
 */
function extractMetadata( string $filename ) 
{
	
	$info = findChunksFromFile( $filename, 100 ); //RiffExtractor 
	if ( $info === false ) {
		return false;
    }

   if ( 'WEBP' != $info['fourCC'] ) {
	   return false;
   }

   $metadata = extractMetadataFromChunks( $info['chunks'], $filename );
   if ( ! $metadata ) {
	   return false;
   }
   return $metadata;
}

/**
 * extractMetadataFromChunks for a given filename
 *
 * @param  array  $chunks the previously extracted chunks from the file
 * @param  string $filename the file to analyse
 * @return array metadata from chunks in array
 */
function extractMetadataFromChunks( array $chunks, string $filename ) :array
{
	
	$meta = [];

	foreach ( $chunks as $chunk ) {
		if ( ! in_array( $chunk['fourCC'], [ 'VP8 ', 'VP8L', 'VP8X', 'EXIF', 'XMP ' ] ) ) {
			// Not a chunk containing interesting metadata
			continue;
		}

		$chunkHeader = file_get_contents( $filename, false, null, $chunk['start'], MINIMUM_CHUNK_HEADER_LENGTH );

		switch ( $chunk['fourCC'] ) {
			case 'VP8 ':
				$vp8Info_1 = decodeLossyChunkHeader( $chunkHeader );
				break;
			case 'VP8L':
				$vp8Info_2 = decodeLosslessChunkHeader( $chunkHeader );
				break;
			case 'VP8X':
				$vp8Info_3 = decodeExtendedChunkHeader( $chunkHeader );
				break;
			case 'EXIF':
				$exif2 = file_get_contents( $filename, false, null, $chunk['start'], $chunk['start']+$chunk['size'] );
				$meta = get_exif_meta( $exif2 );
				if ( isset( $meta['copyright'] ) ) $meta['credit'] = $meta['copyright'];
				if ( isset( $meta['camera']) && isset( $meta['lens']) ) {$meta['camera'] = $meta['camera'] . ' + ' . $meta['lens'];} // TODO: changed from stripmetadata. test it!
				break;
			case 'XMP ':
				$xmp2 = file_get_contents( $filename, false, null, $chunk['start']+8, $chunk['start']+$chunk['size'] );
				$p = xml_parser_create();
				xml_parser_set_option($p,XML_OPTION_SKIP_WHITE,1);
				xml_parse_into_struct($p, $xmp2, $vals, $index);
				xml_parser_free($p);
				
				$title = '';

				if ( isset( $index["DC:TITLE"] ) ) {
					$nr = (int) ($index["DC:TITLE"][1] + $index["DC:TITLE"][0]) / 2;
					$title = $vals[ $nr ]["value"];
				}
				$title != '' ? $meta[ 'title' ] = $title : $meta[ 'title' ] = 'notitle';

				if ( isset( $index["DC:DESCRIPTION"] ) ) {
					$nr = (int) ($index["DC:DESCRIPTION"][1] + $index["DC:DESCRIPTION"][0]) / 2;
					$caption = $vals[ $nr ]["value"];
					$meta[ 'caption' ] = $caption;
				}
				//$caption != '' ? $meta[ 'caption' ] = $caption : $meta[ 'caption' ] = '';
				/*
				if ( isset( $vals[2]["attributes"]["AUX:LENS"] ) ) {
					$lens = $vals[2]["attributes"]["AUX:LENS"];
					$meta[ 'camera' ] = $meta[ 'camera' ] . ' + ' . $lens;
				} else {
					$meta[ 'camera' ] = '---';
				}
				*/
				$tags = [];

				if ( isset( $index["RDF:BAG"] ) ) {
					$tagstart = $index["RDF:BAG"][0] +1;
					$tagend   = $index["RDF:BAG"][1] -1;
					while ( $tagstart <= $tagend ) {
						$tag = $vals[ $tagstart ]["value"];
						$tagstart += 1;
						$tags[] = $tag;
					}
				}

				$meta[ 'keywords' ] = $tags; 

				break;
		}
	}
	return $meta;
}

/**
 * Decode a lossy Header and set Compression, Width and Height of the image
 *
 * @param  string $header the header to decode as binary string
 * @return array array with decoded data: compression, width, height or empty array on failure
 */
function decodeLossyChunkHeader( string $header ) :array
{
	// Bytes 0-3 are 'VP8 '
	// Bytes 4-7 are the VP8 stream size
	// Bytes 8-10 are the frame tag
	// Bytes 11-13 are 0x9D 0x01 0x2A called the sync code
	$syncCode = substr( $header, 11, 3 );
	if ( ($syncCode != "\x9D\x01\x2A") || (strlen($header)<18) ) {
		return [];
	}
	// Bytes 14-17 are image size
	$imageSize = unpack( 'v2', substr( $header, 14, 4 ) );
	// Image sizes are 14 bit, 2 MSB are scaling parameters which are ignored here
	return [
		'compression' => 'lossy',
		'width' => $imageSize[1] & 0x3FFF,
		'height' => $imageSize[2] & 0x3FFF
	];
}

/**
 * Decode a lossless Header and set Compression, Width and Height of the image
 *
 * @param  string $header the header to decode as binary string
 * @return array array with decoded data: compression, width, height or empty array on failure
 */
function decodeLosslessChunkHeader( string $header ) :array
{ // @codeCoverageIgnore
	// Bytes 0-3 are 'VP8L'
	// Bytes 4-7 are chunk stream size
	// Byte 8 is 0x2F called the signature
	if ( ($header[8] != "\x2F") || (strlen($header)<12) ) {
		return [];
	}
	// Bytes 9-12 contain the image size
	// Bits 0-13 are width-1; bits 15-27 are height-1
	$imageSize = unpack( 'C4', substr( $header, 9, 4 ) );
	return [
			'compression' => 'lossless',
			'width' => ( $imageSize[1] | ( ( $imageSize[2] & 0x3F ) << 8 ) ) + 1,
			'height' => ( ( ( $imageSize[2] & 0xC0 ) >> 6 ) |
					( $imageSize[3] << 2 ) | ( ( $imageSize[4] & 0x03 ) << 10 ) ) + 1
	];
}

/**
 * Decode a Extended Chunk Header and set Compression, animated, transparency, Width, Height of the image
 *
 * @param  string $header the header to decode as binary string
 * @return array array with decoded data: compression, width, height or empty array on failure
 */
function decodeExtendedChunkHeader( string $header ) :array 
{
	// Bytes 0-3 are 'VP8X'
	// Byte 4-7 are chunk length
	// Byte 8-11 are a flag bytes
	$flags = unpack( 'c', substr( $header, 8, 1 ) );

	// Byte 12-17 are image size (24 bits)
	$width = unpack( 'V', substr( $header, 12, 3 ) . "\x00" );
	$height = unpack( 'V', substr( $header, 15, 3 ) . "\x00" );

	return [
		'compression' => 'unknown',
		'animated' => ( $flags[1] & VP8X_ANIM ) == VP8X_ANIM,
		'transparency' => ( $flags[1] & VP8X_ALPHA ) == VP8X_ALPHA,
		'width' => ( $width[1] & 0xFFFFFF ) + 1,
		'height' => ( $height[1] & 0xFFFFFF ) + 1
	];
}

/**
 * findchunks (EXIF-Data) in a given file
 *
 * @param string $filename the file to analyse
 * @param integer $maxChunks max number of chunks
 * @return false|array fals on failure or array with extracted chunks
 */
function findChunksFromFile( string $filename, int $maxChunks = -1 ) 
{
	$file = fopen( $filename, 'rb' );
	$info = findChunks( $file, $maxChunks );
	fclose( $file );
	return $info;
}

/**
 * findchunks (EXIF-Data) in a given file
 *
 * @param resource|string $filename the file to analyse
 * @param integer $maxChunks max number of chunks
 * @return false|array fals on failure or array with extracted chunks
 */
function findChunks( $file, int $maxChunks = -1 ) 
{
		$riff = fread( $file, 4 );
		if ( $riff !== 'RIFF' ) {
			return false;
		}
 
		// Next four bytes are fileSize
		$fileSize = fread( $file, 4 );
		if ( !$fileSize || strlen( $fileSize ) != 4 ) {
			return false;
		}
 
		// Next four bytes are the FourCC
		$fourCC = fread( $file, 4 );
		if ( !$fourCC || strlen( $fourCC ) != 4 ) {
			return false;
		}
 
		// Create basic info structure
		$info = [
			'fileSize' => unpack( 'V', $fileSize )[1],
			'fourCC' => $fourCC,
			'chunks' => [],
		];
		$numberOfChunks = 0;
 
		// Find out the chunks
		while ( !feof( $file ) && !( $numberOfChunks >= $maxChunks && $maxChunks >= 0 ) ) {
			$chunkStart = ftell( $file );
 
			$chunkFourCC = fread( $file, 4 );
			if ( !$chunkFourCC || strlen( $chunkFourCC ) != 4 ) {
				return $info;
			}
 
			$chunkSize = fread( $file, 4 );
			if ( !$chunkSize || strlen( $chunkSize ) != 4 ) {
				return $info;
			}
			$intChunkSize = unpack( 'V', $chunkSize )[1];
 
			// Add chunk info to the info structure
			$info['chunks'][] = [
				'fourCC' => $chunkFourCC,
				'start' => $chunkStart,
				'size' => $intChunkSize
			];
 
			// Uneven chunks have padding bytes
			$padding = $intChunkSize % 2;
			// Seek to the next chunk
			fseek( $file, $intChunkSize + $padding, SEEK_CUR );
 
		}
 
		return $info;
}

/**
 * Extract the EXIF Metadata from a binary string a return as array.
 *
 * @param  string $buffer binary string buffer. The data with EXIF data.
 * @return false|array
 */
function get_exif_meta( string $buffer ) 
{

	$meta = [];

	$tags = array( 
		'0x010F' => array(
			'text' => 'make',
			'type' => 2, // ascii string
			'Byte' => 0, // Bytes per component: taken from data field
			'comps'=> 1, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		), 
		'0x0110' => array(
			'text' => 'camera', // model in EXIF
			'type' => 2, // ascii string
			'Byte' => 0, // Bytes per component: taken from data field
			'comps'=> 1, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		), 
		'0x0112' => array(
			'text' => 'orientation',
			'type' => 3, // unsigned short
			'Byte' => 2, // Bytes per component
			'comps'=> 2, // Number of components per data-field 
			'offs' => 0, // offset for type 2, 5, 10, 12
		), 
		'0xA434' => array(
			'text' => 'lens', // model in EXIF
			'type' => 2, // ascii string
			'Byte' => 0, // Bytes per component: taken from data field
			'comps'=> 1, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		),
		'0x8825' => array(
			'text' => 'GPS',
			'type' => 4, // unsigned short
			'Byte' => 2, // Bytes per component
			'comps'=> 160, // Number of components per data-field 
			'offs' => 0, // offset for type 2, 5, 10, 12
		), 
		'0x8827' => array(
			'text' => 'iso',
			'type' => 3, // unsigned short
			'Byte' => 2, // Bytes per component
			'comps'=> 2, // Number of components per data-field 
			'offs' => 0, // offset for type 2, 5, 10, 12
		), 
		'0x8298' => array(
			'text' => 'copyright',
			'type' => 2, // ascii string
			'Byte' => 0, // Bytes per component: taken from data field
			'comps'=> 1, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		), 
		'0x829A' => array(
			'text' => 'exposure_time',
			'type' => 5, // unsigned long rational, means 2 rational numbers
			'Byte' => 8, // Bytes per component: taken from data field
			'comps'=> 2, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		), 
		'0x829D' => array(
			'text' => 'aperture', // EXIF: FNumber
			'type' => 5, // unsigned long rational
			'Byte' => 8, // Bytes per component: taken from data field
			'comps'=> 2, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		), 
		/*
		'0x9202' => array(
			'text' => 'aperture', // FNumber
			'type' => 5, // unsigned long rational
			'Byte' => 8, // Bytes per component: taken from data field
			'comps'=> 2, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		),
		*/ 
		'0x9003' => array(
			'text' => 'created_timestamp', // DateTimeOriginal
			'type' => 2, // ascii string
			'Byte' => 0, // Bytes per component: taken from data field
			'comps'=> 1, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		), 
		'0x920A' => array(
			'text' => 'focal_length',
			'type' => 5, // ascii string
			'Byte' => 8, // Bytes per component: taken from data field
			'comps'=> 2, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		), 
		'0xA405' => array(
			'text' => 'focal_length_in_35mm',
			'type' => 3, // unsigned short
			'Byte' => 2, // Bytes per component
			'comps'=> 2, // Number of components per data-field 
			'offs' => 0, // offset for type 2, 5, 10, 12
		), 
	);

	$head = strtoupper( substr( $buffer, 0, 4) );

	if ( 'EXIF' != $head ) { 
		// no EXIF data
		return false; 
	}

	$type = strtoupper( substr( $buffer, 8, 2) );
	$check = strtoupper( bin2hex ( substr( $buffer, 10, 2) ) );

	if ( ('II' == $type) && ('2A00' == $check) ) {
		$isIntel = true; // use for Endianess
	
	} elseif ( 'MM' == $type && ('002A' == $check) ) {
		$isIntel = false; // use for Endianess
		
	} else {
		// intel or Motorola type not detected
		return false;
	}

	$bufflen = strlen( $buffer );
	$bufoffs = EXIF_OFFSET + 4;

	while ( $bufoffs <= $bufflen) {
		$piece = frombuffer( $buffer, $bufoffs, 2, $isIntel );
		
		if ( array_key_exists( $piece, $tags ) ) {
			// found one tag
			$value_of_tag = get_meta_from_piece( $isIntel, $buffer, $bufoffs, $piece, $tags );
			$meta_key =	$tags[ $piece ]['text'];

			if ( 'created_timestamp' == $meta_key) {
				$meta[ 'DateTimeOriginal' ] = $value_of_tag;
				$value_of_tag = strtotime ( $value_of_tag);
			}
			
			if ( $value_of_tag )	
				$meta[ $meta_key ] = $value_of_tag;
		}
		$bufoffs += 1;
		if ( sizeof ( $meta ) === \sizeof( $tags) ) { break; }
	}
	return $meta;
}

/**
 * Extract metadata from a binary string with metadata and return with dedicated type. Use a byte offset to do so. 
 *
 * @param  boolean $isIntel is the buffer input a intel 'II' representation. Actually the defines the Endianess.
 * @param  string  $buffer the buffer with metadata that will be used for extraction
 * @param  integer $bufoffs the offset where to start the extraction in $buffer
 * @param  [type]  $piece unused parameter
 * @param  [type]  $tags unused parameter
 * @return mixed the extracted metadata in different types
 */
function get_meta_from_piece( bool $isIntel, string $buffer, int $bufoffs, $piece, $tags ) 
{ // @codeCoverageIgnore
	$type = substr( $buffer, $bufoffs +2, 2);
	$ncomps = substr( $buffer, $bufoffs +4, 4);
	$data = substr( $buffer, $bufoffs +8, 4);

	if ( $isIntel ) { // revert byte order first
		$type = binrevert( $type );
		$ncomps = binrevert( $ncomps );
		$data = binrevert( $data );
	} else { // extract data from pieces
		$type = '0x' . strtoupper( bin2hex ( $type) );
		$ncomps = '0x' . strtoupper( bin2hex ( $ncomps ) );
		$data = '0x' . strtoupper( bin2hex ( $data ) );
	}

	if ( '0x0002' == $type ) { // this is a ascii string with one component
		$ascii =  substr( $buffer, EXIF_OFFSET + hexdec($data), hexdec($ncomps) -1 );
		return $ascii;
	} elseif ( '0x0003' == $type ) { // this is a integer with 2 components
		if ( ! $isIntel) {
			$data = substr( $data, 0, 6);
		}
		$data = \hexdec( $data);
		return $data;
	} elseif ( '0x0004' == $type ) { // this is a 
		$ascii =  substr( $buffer, EXIF_OFFSET + hexdec($data), 160 );
		$gps = get_gps_data( $ascii, $buffer, $isIntel);
		return $gps;
	} elseif ( '0x0005' == $type ) { // this is a 
		$value_of_tag = getrationale( $buffer, $data, 0, $isIntel);
		return $value_of_tag;
	} else { 
		return false; 
	}
}

/**
 * Extract GPS-Data from the EXIF-Header
 *
 * @param  string  $gpsbuffer the binary string buffer with gpsdata taken from the EXIF-header
 * @param  string  $buffer the complete EXIF-header as binary string
 * @param  boolean $isIntel is the buffer input a intel 'II' representation. Actually the defines the Endianess.
 * @return false|array the GPS-Data as associative array or false if no GPS-Data found
 */
function get_gps_data( string $gpsbuffer, string $buffer, bool $isIntel ) 
{ // @codeCoverageIgnore
	$meta = [];

	// define the gps-tags to search for
	$tags = array( 
		'0x0000' => array(
			'text' => 'GPSVersionID',
			'type' => 1, // n int8 values, number n is taken from $count, usually 4
			'nBytes' => 1, // Bytes per component: taken from data field
		), 
		'0x0001' => array(
			'text' => 'GPSLatitudeRef',
			'type' => 2, // ascii string
			'nBytes' => 2, // Bytes per string value, so two asciis each 2 Bytes long
		), 
		'0x0002' => array(
			'text' => 'GPSLatitude',
			'type' => 5, // rational uint64, number n is taken from $count, usually 3
			'nBytes' => 4, // relative address pointer to the data, 4 Bytes long
		), 
		'0x0003' => array(
			'text' => 'GPSLongitudeRef',
			'type' => 2, // ascii string, 
			'nBytes' => 2, // Bytes per string value, so two asciis each 2 Bytes long
		), 
		'0x0004' => array(
			'text' => 'GPSLongitude',
			'type' => 5,  // rational uint64, number n is taken from $count, usually 3
			'nBytes' => 4, // relative address pointer to the data, 4 Bytes long
		), 
		'0x0005' => array(
			'text' => 'GPSAltitudeRef',
			'type' => 1, // n int8 values, number n is taken from $count, usually 4
			'nBytes' => 1, // Bytes per component: taken from data field
		), 
		'0x0006' => array(
			'text' => 'GPSAltitude',
			'type' => 5, // rational uint64, number n is taken from $count, usually 3
			'nBytes' => 4, // relative address pointer to the data, 4 Bytes long
		), 
	);
	// get the total number of tags
	$nGpsTags = hexdec( frombuffer( $gpsbuffer, 0, 2, $isIntel) );
	
	if ( ( $nGpsTags < 1 ) || ( $nGpsTags > 31) ) { 
		// no GPS data or wrong buffer selected
		return false; 
	}

	$bufflen = strlen( $gpsbuffer );
	$bufoffs = 2;

	while ( $bufoffs <= $bufflen) {
		$piece = frombuffer( $gpsbuffer, $bufoffs, 2, $isIntel) ;
		$bufoffs += 2;

		if ( array_key_exists( $piece, $tags ) ) {
			// init data array 
			$data = [];

			// get the type of the tag first
			$type = hexdec( frombuffer( $gpsbuffer, $bufoffs, 2, $isIntel) );
			$expectedType = $tags[ $piece ]['type']; 
			$bufoffs += 2;

			// do only if the type is correct
			if ( $type === $expectedType){
				// get the number of values
				$count = hexdec( frombuffer( $gpsbuffer, $bufoffs, 4, $isIntel) );
				if ($count > $bufflen) break;
				$nvalues = $count;
				$bufoffs += 4;

				if ( 5 == $type ) { // correct number of values for pointers, it's only one pointer
					//$nvalues = $count;
					$count = 1;
				}

				// get the data or relative pointer
				$lendata = $tags[ $piece ]['nBytes'];
				for ($i=1; $i <= $count ; $i++) { 
					$data[] = frombuffer( $gpsbuffer, $bufoffs, $lendata, $isIntel);
					$bufoffs += $lendata;
				}

				// special treatment of the Lat/Long-Ref
				if ( 2 == $type ) {
					$data = \strtoupper($data[0]);
					$data = \str_replace('0','', $data);
					$data = \str_replace('X','', $data);
					$data = chr (hexdec ( $data ));
					$found = strpos( ' NSEW', $data);
					if ( $found === false ) $data = false;
				}

				// special treatment of the Lat- / Long- / Alt-itude
				if ( 5 == $type ) {
					$rational = [];
					for ($i=0; $i < $nvalues ; $i++) { 
						$rational[] = getrationale( $buffer, $data[0], $i, $isIntel, 'gps');
					}
					$data = $rational;
				}
				
				// store the new data in array
				$value_of_tag = $data; 
				$meta_key =	$tags[ $piece ]['text'];
				$meta[ $meta_key ] = $value_of_tag;
			}
		}
		
		if ( sizeof ( $meta ) === $nGpsTags ) { break; }
	}
	return $meta;
}

/**
 * Convert a string buffer to its binary representation depending on given parameters. 
 * For an alphanumeric string the output is its character code, which is reverted if it isIntel=true.
 * Example 'AB' -> 0x4142 or 0x4241
 *
 * @param  string  $buffer input that should be converted to a binary.  
 * @param  integer $offset where to start the conversion within the buffer
 * @param  integer $length length of the string that sould be converted 
 * @param  boolean $isIntel is the buffer input a intel 'II' representation. Actually the defines the Endianess.
 * @return string the piece of the data as hex-string
 */
function frombuffer(string $buffer, int $offset, int $length, bool $isIntel) :string
{ // @codeCoverageIgnore
	if ( (strlen( $buffer) < ( $offset + $length )) || ($length == 0) ) return '0x00';

	$binary = substr( $buffer, $offset, $length);

	if ( $isIntel) {	
		$piece = binrevert( $binary );
	} else {
		$piece = '0x' . strtoupper( bin2hex ( $binary ) );
	}

	return $piece;
}

/**
 * get the rational value out of the string buffer
 *
 * @param string $buffer the data buffer which contains the values
 * @param string $pointer the relative pointer as hex value like 'AF'. For Exif the offset is marked by 'MM' or 'II'.
 * @param integer $count the n'th value to search for, '0' means 1st value
 * @param boolean $isIntel whether the byte field is to revert
 * @return string|float $value_of_tag the calculated rational value = nominator / denominator or as string.
 */
function getrationale (string $buffer, string $pointer, int $count, bool $isIntel, string $type = 'number')
{ // @codeCoverageIgnore
	$value_of_tag = 0.0;
	$explength = EXIF_OFFSET + hexdec($pointer) + 8 + $count*8;

	if ( strlen( $buffer ) < $explength ) return $value_of_tag;

	$numerator =   substr( $buffer, EXIF_OFFSET + hexdec($pointer)     + $count*8 , 4 ); // Zähler
	$denominator = substr( $buffer, EXIF_OFFSET + hexdec($pointer) + 4 + $count*8 , 4 ); // Nenner
	
	if ( $isIntel ) {
		// revert byte order first
		$numerator   = binrevert( $numerator );
		$denominator = binrevert( $denominator );
		$numerator   =    hexdec( $numerator ); // Zähler
		$denominator =    hexdec( $denominator ); // Nenner
	} else {
		$numerator =   hexdec( '0x' . bin2hex( $numerator   ) ); // Zähler
		$denominator = hexdec( '0x' . bin2hex( $denominator ) ); // Nenner
	}

	if ( 'number' == $type ) {
		$value_of_tag = $numerator / $denominator;
	} elseif ( 'gps' == $type ) {
		$value_of_tag = strval( $numerator ) . '/' . strval( $denominator );
	}

	return $value_of_tag;
}

/**
 * Revert a binary string to a reverted hex-string. The output of this function is inconsistent!
 * For length=(2 / 4) the function provides the reverted character codes. Example 'AZ' -> 0x5A41. 
 * But for length = 1 the function provides the digit to hex conversion. So '1' -> 0x01. And for anything else than [0-9] it responds with 0x00.
 *
 * @param string $binary binary-data as string taken from the binary buffer with EXIF-data
 * @return string the inverted binary data as hex-string
 */
function binrevert (string $binary) :string
{ // @codeCoverageIgnore
	switch ( \strlen( $binary) ) {
		case 1:
			$val = dechex( \intval( $binary ) ) ;
			$bin = '0x' . \strtoupper( sprintf('%02s', $val ) );
			return $bin;
			break;
		case 2:
			$val = dechex( unpack( 'v', $binary )[1]);
			$bin = '0x' . \strtoupper( sprintf('%04s', $val ) );
			return $bin;
			break;
		case 4:
			$val = dechex( unpack( 'V', $binary )[1]);
			$bin = '0x' . \strtoupper( sprintf('%08s', $val ) );
			return $bin;
			break;
		default:
			return '0x00';
			break;
	}
}