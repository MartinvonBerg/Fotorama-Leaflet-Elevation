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

/**
 *  Parse (reduce) GPX-track and write it to destination directory
 */
final class parseGpxFile {

    /**
     * just an empty constructor
     */
     public function __construct( ) {
    }

    /**
     * Parse (reduce) GPX-track and write it to destination directory
     *
     * @param string $infile path to inputfile in PHP tmp Directory
     * @param string $path destination path for GPX-Track
     * @param string $newfile name for GPX-Track-file
     * @param float $smooth value for distance smoothing in meters
     * @param int $elesmooth value for elevation smoothing in meters
     * @param mixed $ignoreZeroElev ignore Elevations with zero as value or not
     *
     * @return string description with simple stats as written to metadata of gpx-track
     */
    public function parsegpx(string $infile, string $path, string $newfile, float $smooth, int $elesmooth, $ignoreZeroElev) :string {

        // metdata for track
        $bounds = []; 
        $lastbounds = [];
        $ascent = 0;
        $descent = 0;
        $dist = 0;
        $reducetrack = true; // always true because we are here if we want to reduce the track.
        $sizebefore = filesize( $infile ) / 1024;
        $sizeafter = 0;
        $pointsbefore = 0;
        $pointsafter = 0;
        $allSegments = [];

        $gpx = new phpGPX();  
        $gpx::$ELEVATION_SMOOTHING_THRESHOLD = $elesmooth; // ?? 4;
        //$gpx::$DISTANCE_SMOOTHING_THRESHOLD = $smooth ?? 25; is not used here because smoothing is done in seperate function.
        $gpx::$APPLY_DISTANCE_SMOOTHING = true; // always true because we are if we want to reduce the track.
        $gpx::$APPLY_ELEVATION_SMOOTHING = true; // always true because we are if we want to reduce the track.
        $gpx::$IGNORE_ELEVATION_0 = $ignoreZeroElev; 

        $file = $gpx->load($infile);

        // append all segments in routes and tracks to one array
        // Including: Calc Statistics for whole track assuming that a track without elevation gain / loss or no distance is not realistic
        foreach ($file->routes as $segment) { 
            if ( ($segment->stats->cumulativeElevationGain > 0) || ($segment->stats->cumulativeElevationLoss > 0) || ($segment->stats->distance > 0)) {
                // convert route segment to track segment with phpGPX library
                $segment = $this->convertToTrackSegment( $segment );
                $segment !== null ? $allSegments[] = $segment : '';
            } 
        }
        foreach ($file->tracks as $track) {
            if ( ($track->stats->cumulativeElevationGain > 0) || ($track->stats->cumulativeElevationLoss > 0) || ($track->stats->distance > 0)) {
                foreach ( $track->segments as $segment ) {
                    $allSegments[] = $segment;
                }
            }
        }

        // Handle the track with segments. Creating new track for output
        $newTrack 	= new Track();
        // Name of track
        $newTrack->name = $newfile;

        foreach ( $allSegments as $segment ) {

            $bounds = $this->getBounds($segment, $reducetrack, $smooth, $ignoreZeroElev);
            // TBD: add the distance, elevation diff between last point of one track and first point of next track to Statistics?
            // check lastbounds 
            if ( $pointsbefore === 0 ) { $lastbounds = $bounds[0]; }
        
            // Statistics for segment of track
            $segment->stats->toArray();
            $pointsbefore = $pointsbefore + \sizeof($segment->points);
            $ascent = $ascent + $segment->stats->cumulativeElevationGain;
            $descent = $descent + $segment->stats->cumulativeElevationLoss;
            $dist = $dist + $segment->stats->distance;
        
            // check lastbounds and set new maxmin values
            if ( isset($lastbounds->minLatitude) && isset($lastbounds->maxLatitude) && isset($lastbounds->minLongitude) && isset($lastbounds->maxLongitude) ) {
                ($bounds[0]->maxLatitude > $lastbounds->maxLatitude) ? '' : ($bounds[0]->maxLatitude = $lastbounds->maxLatitude);
                ($bounds[0]->maxLongitude > $lastbounds->maxLongitude) ? '' : ($bounds[0]->maxLongitude = $lastbounds->maxLongitude);
                ($bounds[0]->minLatitude < $lastbounds->minLatitude) ? '' : ($bounds[0]->minLatitude = $lastbounds->minLatitude);
                ($bounds[0]->minLongitude < $lastbounds->minLongitude) ? '' : ($bounds[0]->minLongitude = $lastbounds->minLongitude);
            }

            // append the points of this segment to existing
            // Add segment to segment array of track.
            if ( sizeof($newTrack->segments) === 0 ) {
                $newTrack->segments[] = $bounds[1];
            } else {
                $newTrack->segments[0]->points = array_merge($newTrack->segments[0]->points, $bounds[1]->points);
            }
        }
        
        // create the new track and store it to the file.
        if ( isset($bounds[0]->minLatitude) && isset($bounds[0]->maxLatitude) && isset($bounds[0]->minLongitude) && isset($bounds[0]->maxLongitude)) { 
            $ascent = intval($ascent);
            $descent = intval($descent);
            $dist = number_format_i18n($dist / 1000, 1);
            $desc = 'Dist: ' . $dist . ' km, Gain: ' . $ascent . ' m, Loss: ' . $descent. ' m'; // Do not translate this! Translation is done in Javascript.
            $newTrack->recalculateStats();

            if ( $newTrack->stats->cumulativeElevationGain === null && $newTrack->stats->cumulativeElevationLoss === null && $newTrack->stats->distance === null ) {
                $desc = 'No elevation or distance data in reduced route or track of GPX-File. Skipped'; // TODO
                return $desc;
            }

            // Calc the new number of points
            $pointsafter = \sizeof( $newTrack->segments[0]->points );
            if ( $pointsafter === 0 ) {
                $desc = 'File Skipped. No points in reduced track: ' . $desc . '. Please upload without reduction.'; // TODO
                return $desc;
            }

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

            // Add track to file
            $gpx_file->tracks[] = $newTrack;

            // GPX output
            $complete = $path . '/' . $newfile;
            $gpx_file->save($complete, \phpGPX\phpGPX::XML_FORMAT);
            $sizeafter = \filesize($complete) / 1024;
            $desc .= ', ' . __('Filesize', 'fotoramamulti') . ': '  . number_format_i18n(  $sizebefore, 0) . ' / ' . number_format_i18n($sizeafter,   0) . ' kB';
            $desc .= ', ' . __('Points', 'fotoramamulti')   . ': '  . number_format_i18n($pointsbefore, 0) . ' / ' . number_format_i18n($pointsafter, 0);
            $desc .= ' (' . __('before / after', 'fotoramamulti') . '): ';
        } else {
            $desc = 'No routes or tracks in GPX-File. Skipped'; // TODO
        }
        
        return $desc;
    }

    /**
     * get bounds of track-segment and reduce track segment (apply distance smoothing)
     *
     * @param object $segment phpGPX track segment 
     * @param bool $reduce reduce track or not
     * @param float $smooth distance smooth value for track smoothing in meters
     * @param bool $ignoreZeroElev with true points with zero Elevation will be skipped
     *
     * @return array<mixed> bounds of track and segment 
     */
    private function getBounds( object $segment, bool $reduce, float $smooth, bool $ignoreZeroElev) :array {
        $minlat = 180;
        $maxlat = -180;
        $minlon = 180;
        $maxlon = -180;
        $points = $segment->points;
        $lastlat = 0;
        $lastlon = 0;
    
        // Creating Track segment
        $newsegment = new Segment();

        foreach ($points as $spoint) {
            $lat = $spoint->latitude;
            $lon = $spoint->longitude;
            $ele = $spoint->elevation;
            if ( abs(intval($ele) - $ele) < 0.0001 ) {
                $ele += 0.01;
            }

            ($lat > $maxlat) ? $maxlat = $lat : '';
            ($lat < $minlat) ? $minlat = $lat : '';

            ($lon > $maxlon) ? $maxlon = $lon : '';
            ($lon < $minlon) ? $minlon = $lon : '';

            if ( ($ele > 0.1) || ! $ignoreZeroElev ) { // skip points with no height information.
                if ($reduce) {
                    $newdist = $this->distance($lastlat, $lastlon, $lat, $lon);
                    if ( abs($newdist) > $smooth) {
                        $lastlat = $lat;
                        $lastlon = $lon;
                        // Creating trackpoint
                        $newpoint = new Point(Point::TRACKPOINT);
                        $newpoint->latitude 			= $lat;
                        $newpoint->longitude 			= $lon;
                        $newpoint->elevation 			= $ele;
                        $newsegment->points[] 			= $newpoint;
                    }
                } else {
                    // Creating trackpoint
                    $newpoint = new Point(Point::TRACKPOINT);
                    $newpoint->latitude 			= $lat;
                    $newpoint->longitude 			= $lon;
                    $newpoint->elevation 			= $ele;
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
     * @param float $lon1
     * @param float $lat2
     * @param float $lon2
     *
     * @return float [m] distance beteen two points in meters
     */
    private function distance( float $lat1, float $lon1, float $lat2, float $lon2) :float {

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

    /**
     * convert route segment to track segment with phpGPX library
     *
     * @param  object $segment as route segment
     * @return object|null $segment as track segment
     */
    private function convertToTrackSegment( object $segment ) : ?object {
        if (get_class( $segment ) !== "phpGPX\Models\Route" ) {
            return null;
        }
        if ( sizeof($segment->points) === 0 ) {
            return null;
        }

        $new = new Segment();
        $new->points = $segment->points;
        $new->stats = $segment->stats;

        return $new;
    }

}