<?php
namespace mvbplugins\fotoramamulti;

include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\fm_functions.php';

/**
 * wrapper class for functions in file ../fotorama_multi\inc\fm_functions.php
 */
class WrapFmFunctions {

    public function gpxviewGetLonLat ( array $exif ) {
        return \mvbplugins\fotoramamulti\gpxview_getLonLat( $exif);
    }

    public function gpxviewGps2Num( string $coordPart) {
        return \mvbplugins\fotoramamulti\gpxview_GPS2Num( $coordPart );
    }

    public function gpxviewGetGPS( array $exifCoord, string $hemi ) {
        return \mvbplugins\fotoramamulti\gpxview_getGPS( $exifCoord, $hemi );
    }
}