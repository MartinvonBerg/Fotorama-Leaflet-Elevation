$minlat = 180;
        $maxlat = -180;
        $minlon = 180;
        $maxlon = -180;
        $points = $segment->points;
        $lastlat = 0;
        $lastlon = 0;
    

        foreach ($points as $spoint) {
            $lat = $spoint->latitude;
            $lon = $spoint->longitude;

            ($lat > $maxlat) ? $maxlat = $lat : '';
            ($lat < $minlat) ? $minlat = $lat : '';

            ($lon > $maxlon) ? $maxlon = $lon : '';
            ($lon < $minlon) ? $minlon = $lon : '';

        }

        $bounds = new Bounds();
        $bounds->minLatitude = $minlat;
        $bounds->minLongitude = $minlon;
        $bounds->maxLatitude = $maxlat;
        $bounds->maxLongitude = $maxlon;

        return array( $bounds);