<?php
namespace mvbplugins\fotoramamulti;

$path = plugin_dir_path(__FILE__);
require_once $path . 'phpGPX/phpGPX.php';

use phpGPX\phpGPX;
use phpGPX\Models\GpxFile;
use phpGPX\Models\Metadata;
use phpGPX\Models\Point;
use phpGPX\Models\Segment;
use phpGPX\Models\Track;
use phpGPX\Models\Bounds;

// TODO : läuft derzeit nur mit einem Track element
/**
 * Parse GPX-track and write it to destination directory
 *
 * @param string $infile path to inputfile in PHP tmp Directory
 * @param string $path destination path for GPX-Track
 * @param string $newfile name for GPX-Track-file
 * @param float $smooth value for track smoothing in meters
 *
 * @return string description with simple stats as written to metadata of gpx-track
 */
function parsegpx($infile, $path, $newfile, $smooth) {

    // metdata for track
    $desc = '';
    $bounds = []; 
    $lastbounds = [];
    $ascent = 0;
    $descent = 0;
    $dist = 0;
    $reducetrack = true;
    $sizebefore = filesize( $infile ) / 1024;
    $sizeafter = 0;
    $pointsbefore = 0;
    $pointsafter = 0;

    $gpx = new phpGPX();    
    $file = $gpx->load($infile);

    foreach ($file->routes as $track) {
        // Statistics for whole track
        $track->stats->toArray();

    }
	
    foreach ($file->tracks as $track) {
        // Statistics for whole track
        $track->stats->toArray();

        // check lastbounds and set new maxmin values
        //if (\array_key_exists('minLongitude', $bounds )) {
        //    $lastbounds = $bounds[0];
        //}
        
        foreach ($track->segments as $segment) {
            // check lastbounds and set new maxmin values
            if (\array_key_exists('minLongitude', $bounds[0] )) {
                $lastbounds = $bounds[0];
            }
            // Statistics for segment of track
            $segment->stats->toArray();
            $pointsbefore = $pointsbefore + \sizeof($segment->points);
            $ascent = $ascent + $segment->stats->cumulativeElevationGain;
            $descent = $descent + $segment->stats->cumulativeElevationLoss;
            $dist = $dist + $segment->stats->distance;
            $bounds = getBounds($segment, $reducetrack, $smooth);
        
            // check lastbounds and set new maxmin values
            if (\array_key_exists('minLongitude', $lastbounds )) {
                ($bounds[0]->maxLatitude > $lastbounds->maxLatitude) ? '' : ($bounds[0]->maxLatitude = $lastbounds->maxLatitude);
                ($bounds[0]->maxLongitude > $lastbounds->maxLongitude) ? '' : ($bounds[0]->maxLongitude = $lastbounds->maxLongitude);
                ($bounds[0]->minLatitude < $lastbounds->minLatitude) ? '' : ($bounds[0]->minLatitude = $lastbounds->minLatitude);
                ($bounds[0]->minLongitude < $lastbounds->minLongitude) ? '' : ($bounds[0]->minLongitude = $lastbounds->minLongitude);
            }
        }
    }
    
    if (\sizeof($file->tracks) > 0)  {
        $ascent = intval($ascent);
        $descent = intval($descent);
        $dist = number_format_i18n($dist / 1000, 1);

        $desc = 'Dist: ' . $dist . ' km, Gain: ' . $ascent . ' Hm, Loss: ' . $descent. ' Hm';

        // GpxFile contains data and handles serialization of objects
        $gpx_file = new GpxFile();

        // Creating sample Metadata object
        $gpx_file->metadata = new Metadata();

        // Description of GPX file
        $gpx_file->metadata->description = $desc;
        $gpx_file->metadata->name = $newfile;
        $gpx_file->metadata->bounds = $bounds[0];
        $gpx_file->metadata->time = new \DateTime(); 
        $gpx_file->metadata->time = $file->tracks[0]->segments[0]->points[0]->time;

        // Creating track
        $track 	= new Track();

        // Name of track
        $track->name = $newfile;

        // Creating Track segment
        $newsegment = $bounds[1];	

        // Add segment to segment array of track
        $track->segments[] 	= $newsegment;
        $pointsafter = \sizeof($newsegment->points);

        // Add track to file
        $gpx_file->tracks[] = $track;

        // GPX output
        $complete = $path . '/' . $newfile;
        $gpx_file->save($complete, \phpGPX\phpGPX::XML_FORMAT);
        $sizeafter = \filesize($complete) / 1024;
        $desc .= ', Filesize (before / after): ' . number_format_i18n($sizebefore, 0) . ' / ' . number_format_i18n($sizeafter, 0) . ' kB';
        $desc .= ', Points (before / after): ' . number_format_i18n($pointsbefore, 0) . ' / ' . number_format_i18n($pointsafter, 0);
    } else {
        $desc = 'No tracks in GPX-File. Skipped';
    }
    
    return $desc;
}

/**
 * get bounds of track-segment
 *
 * @param object $segment phpGPX track segment 
 * @param bool $reduce reduce track or not
 * @param float $smooth value for track smoothing in meters
 *
 * @return float [m]
 */
function getBounds($segment, $reduce, $smooth) {
    $minlat = 180;
    $maxlat = 0;
    $minlon = 180;
    $maxlon = 0;
    $points = $segment->points;
    $lastlat = 0;
    $lastlon = 0;
   
    // Creating Track segment
    $newsegment = new Segment();

    foreach ($points as $spoint) {
        $lat = $spoint->latitude;
        $lon = $spoint->longitude;
        $ele = $spoint->elevation;

        ($lat > $maxlat) ? $maxlat = $lat : '';
        ($lat < $minlat) ? $minlat = $lat : '';

        ($lon > $maxlon) ? $maxlon = $lon : '';
        ($lon < $minlon) ? $minlon = $lon : '';

        if ($ele > 0.1) { // skip points with no height information
            if ($reduce) {
                $newdist = distance($lastlat, $lastlon, $lat, $lon);
                if ( abs($newdist) > $smooth) {
                    $lastlat = $lat;
                    $lastlon = $lon;
                    // Creating trackpoint
                    $newpoint = new Point(Point::TRACKPOINT);
                    $newpoint->latitude 			= $lat;
                    $newpoint->longitude 			= $lon;
                    $newpoint->elevation 			= $spoint->elevation;
                    $newsegment->points[] 			= $newpoint;
                }
            } else {
                // Creating trackpoint
                $newpoint = new Point(Point::TRACKPOINT);
                $newpoint->latitude 			= $lat;
                $newpoint->longitude 			= $lon;
                $newpoint->elevation 			= $spoint->elevation;
                $newsegment->points[] 			= $newpoint;
            }
        }
    }

    $bounds = new Bounds();
    $bounds->minLatitude = $minlat;
    $bounds->minLongitude = $minlon;
    $bounds->maxLatitude = $maxlat;
    $bounds->maxLongitude = $maxlon;

    return array( $bounds, $newsegment);
}

/**
 * Calc 3D-Distance between trackpoints
 *
 * @param float $lat1
 * @param float $lon2
 * @param float $lat2
 * @param float $lon2
 *
 * @return float [m] distance beteen two points in meters
 */
function distance($lat1, $lon1, $lat2, $lon2) {
    $unit = "K";
    $theta = $lon1 - $lon2;
    $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
    $dist = acos($dist);
    $dist = rad2deg($dist);
    $miles = $dist * 60 * 1.1515;
    $unit = strtoupper($unit);
  
    if ($unit == "K") {
        return ($miles * 1.609344 * 1000);
    } else if ($unit == "N") {
        return ($miles * 0.8684);
    } else {
        return $miles;
    }
  }