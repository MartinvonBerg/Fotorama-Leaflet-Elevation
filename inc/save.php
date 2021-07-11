<?php
namespace mvbplugins\fotoramamulti;

const BROKEN_FILE = '0'; // value to store in img_metadata if error extracting metadata.
const MINIMUM_CHUNK_HEADER_LENGTH = 18;
const WEBP_VERSION = 1;

const VP8X_ICC = 32;
const VP8X_ALPHA = 16;
const VP8X_EXIF = 8;
const VP8X_XMP = 4;
const VP8X_ANIM = 2;
const EXIF_OFFSET = 8;
const MYDATEFORMAT = "Y-m-d H:i:s";

function getMetadata( $filename ) {
	$parsedWebPData = extractMetadata( $filename );
	if ( ! $parsedWebPData ) {
		return BROKEN_FILE;
	}

	$parsedWebPData['metadata']['WEBP_VERSION'] = WEBP_VERSION;
	return serialize( $parsedWebPData );
}

function extractMetadata( $filename ) {
	
	$info = findChunksFromFile( $filename, 100 ); //RiffExtractor 
	if ( $info === false ) {
		return false;
    }

   if ( $info['fourCC'] != 'WEBP' ) {
	   return false;
   }

   $metadata = extractMetadataFromChunks( $info['chunks'], $filename );
   if ( ! $metadata ) {
	   return false;
   }
   return $metadata;
}

function extractMetadataFromChunks( $chunks, $filename ) {
	$vp8Info = [];

	foreach ( $chunks as $chunk ) {
		if ( ! in_array( $chunk['fourCC'], [ 'VP8 ', 'VP8L', 'VP8X', 'EXIF', 'XMP ' ] ) ) {
			// Not a chunk containing interesting metadata
			continue;
		}

		$chunkHeader = file_get_contents( $filename, false, null, $chunk['start'], MINIMUM_CHUNK_HEADER_LENGTH );

		$head = $chunk['fourCC'];

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
				$exif1 = decodeLosslessChunkHeader( $chunkHeader );
				$exif2 = file_get_contents( $filename, false, null, $chunk['start'] + 62, $chunk['start']+$chunk['size'] );
				hex_dump( $exif2 );
				$meta = get_exif_meta( $exif2 );
				$meta['credit'] = $meta['copyright'];
				break;
			case 'XMP ':
				$xmp1_ = decodeLosslessChunkHeader( $chunkHeader );
				$xmp2 = file_get_contents( $filename, false, null, $chunk['start']+8, $chunk['start']+$chunk['size'] );
				$p = xml_parser_create();
				xml_parse_into_struct($p, $xmp2, $vals, $index);
				xml_parser_free($p);
				$title = $vals[13]["value"];
				$lens = $vals[2]["attributes"]["AUX:LENS"];
				$datetaken = $vals[2]["attributes"]["XMP:CREATEDATE"];
				break;
		}
	}
	return $vp8Info;
}

function decodeLossyChunkHeader( $header ) {
	// Bytes 0-3 are 'VP8 '
	// Bytes 4-7 are the VP8 stream size
	// Bytes 8-10 are the frame tag
	// Bytes 11-13 are 0x9D 0x01 0x2A called the sync code
	$syncCode = substr( $header, 11, 3 );
	if ( $syncCode != "\x9D\x01\x2A" ) {
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

function decodeLosslessChunkHeader( $header ) {
	// Bytes 0-3 are 'VP8L'
	// Bytes 4-7 are chunk stream size
	// Byte 8 is 0x2F called the signature
	if ( $header{8} != "\x2F" ) {
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

function decodeExtendedChunkHeader( $header ) {
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
 * findchunks
 *
 * @param string $filename
 * @param integer $maxChunks
 * @return array $info
 */
function findChunksFromFile( $filename, $maxChunks = -1 ) {
	$file = fopen( $filename, 'rb' );
	$info = findChunks( $file, $maxChunks );
	fclose( $file );
	return $info;
}
 
function findChunks( $file, $maxChunks = -1 ) {
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
			'fileSize' => extractUInt32( $fileSize ),
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
			$intChunkSize = extractUInt32( $chunkSize );
 
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
 
function extractUInt32( $string ) {
	return unpack( 'V', $string )[1];
}

function hex_dump($data, $newline="<br>")
{
  static $from = '';
  static $to = '';

  static $width = 16; # number of bytes per line

  static $pad = '.'; # padding for non-visible characters

  if ($from==='')
  {
    for ($i=0; $i<=0xFF; $i++)
    {
      $from .= chr($i);
      $to .= ($i >= 0x20 && $i <= 0x7E) ? chr($i) : $pad;
    }
  }

  $hex = str_split(bin2hex($data), $width*2);
  $chars = str_split(strtr($data, $from, $to), $width);

  $offset = 0;
  foreach ($hex as $i => $line)
  {
    echo sprintf('%6X',$offset).' : '.implode(' ', str_split($line,2)) . ' [' . $chars[$i] . ']' . $newline;
    $offset += $width;
  }
}

function get_exif_meta( $buffer ) {
	$dateformat = MYDATEFORMAT;

	/* JSON output of rest api
"image_meta": {
	"			aperture": "11",
				"credit": "Martin von Berg",
				"camera": "Nikon D7500",
		"caption": "Wasserfall",
				"created_timestamp": "1602938620",
				"copyright": "Martin von Berg",
				"focal_length": "50",
				"iso": "10000",
				"shutter_speed": "0.00125",
		XMP: "title": "Wasserfall",
				"orientation": "1",
		"keywords": [
			"Wasserfall"
		]
	*/

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
			'text' => 'f_number', // FNumber
			'type' => 5, // unsigned long rational
			'Byte' => 8, // Bytes per component: taken from data field
			'comps'=> 2, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		), 
		'0x9202' => array(
			'text' => 'aperture', // FNumber
			'type' => 5, // unsigned long rational
			'Byte' => 8, // Bytes per component: taken from data field
			'comps'=> 1, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
		), 
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
			'Byte' => 0, // Bytes per component: taken from data field
			'comps'=> 1, // Number of components per data-field 
			'offs' => -1, // offset for type 2, 5, 10, 12: taken from data field
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
		$isMoto = false; // use for Endianess

	} elseif ( 'MM' == $type && ('002A' == $check) ) {
		$isIntel = false; // use for Endianess
		$isMoto = true;   // use for Endianess

	} else {
		// intel or Motorola type not detected
		return false;
	}

	$bufflen = strlen( $buffer );
	$bufoffs = EXIF_OFFSET + 4;

	while ( $bufoffs <= $bufflen) {
		$binary = substr( $buffer, $bufoffs, 2);

		if ( $isIntel) {	
			$piece = binrevert( $binary );
		} else {
			$piece = '0x' . strtoupper( bin2hex ( $binary ) );
		}

		if ( array_key_exists( $piece, $tags ) ) {
			// found one tag
			$value_of_tag = get_meta_from_piece( $isIntel, $buffer, $bufoffs, $piece, $tags );
			$meta_key =	$tags[ $piece]['text'];
			if ( 'datetaken' == $meta_key) {
				$value_of_tag = strtotime ( $value_of_tag);
			}	
			$meta[ $meta_key] = $value_of_tag;
		}
		$bufoffs += 1;
		if ( sizeof ( $meta ) === \sizeof( $tags) ) { break; }
	}
	return $meta;
}

function get_meta_from_piece( $isIntel, $buffer, $bufoffs, $piece, $tags ) {
	$type =    substr( $buffer, $bufoffs +2, 2) ;
	$ncomps =  substr( $buffer, $bufoffs +4, 4) ;
	$data =    substr( $buffer, $bufoffs +8, 4) ;

	if ( $piece == '0x829D') { 
		$a =0;
	}

	if ( $isIntel ) {
		// revert byte order first
		$type = binrevert( $type );
		$ncomps = binrevert( $ncomps );
		$data = binrevert( $data );
		$save = $data;

	} else {
		// extract data from pieces
		$type = '0x' . strtoupper( bin2hex ( $type) );
		$ncomps = '0x' . strtoupper( bin2hex ( $ncomps ) );
		$data = '0x' . strtoupper( bin2hex ( $data ) );

	}

	if ( '0x0002' == $type ) { // this is a ascii string with one component
		$ascii =  substr( $buffer, EXIF_OFFSET + hexdec($data), hexdec($ncomps)-1 ) ;
		return $ascii;

	} elseif ( '0x0003' == $type ) { // this is a integer with 2 components
		if ( ! $isIntel) {
			$data = substr( $data, 0, 6);
		}
		$data = \hexdec( $data);
		return $data;
	} elseif ( '0x0005' == $type ) { // this is a ascii string with one component
		$ascii =  substr( $buffer, EXIF_OFFSET + hexdec($data), 8 ) ;
		$numerator =  substr( $data, 0, 6 ); // Zähler
		$denominator =    '0x' . substr( $data, 6, 10 ); // Nenner
		return $numerator;

	}
}

/**
 * revert a binary string to a reverted hex-string
 *
 * @param string $binary binary-data as string taken from the binary buffer with EXIF-data
 * @return string the inverted binary data as hex-string
 */
function binrevert ( $binary ) {
	if (\strlen( $binary) == 2) {
		$val = dechex( unpack( 'v', $binary )[1]);
		$bin = '0x' . \strtoupper( sprintf('%04s', $val ) );
	} elseif (\strlen( $binary) == 4) {
		$val = dechex( unpack( 'V', $binary )[1]);
		$bin = '0x' . \strtoupper( sprintf('%08s', $val ) );
	}

	return $bin; // string
}