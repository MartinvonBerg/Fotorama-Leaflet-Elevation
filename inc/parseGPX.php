<?php
//namespace mvbplugins\fotoramamulti;

$path = plugin_dir_path(__FILE__);
require_once $path . 'phpGPX/phpGPX.php';
//require_once $path . 'phpGPX/Models/GpxFile.php';

use phpGPX\phpGPX;
use phpGPX\Models\GpxFile;
use phpGPX\Models\Metadata;
use phpGPX\Models\Point;
use phpGPX\Models\Segment;
use phpGPX\Models\Track;

function parsegpx($infile, $path, $newfile) {

    $gpx = new phpGPX();

    // metdata for track
    $name = ''; // get from filename
    $trackname = '';
    $desc = '';
    $bounds = ''; // get during loop through trk-points
    $ascent = 0;
    $descent = 0;
    $dist = 0;
    $npoints = 0;
    
    $file = $gpx->load($infile);
	
    foreach ($file->tracks as $track)
    {
        // Statistics for whole track
        $track->stats->toArray();
        
        foreach ($track->segments as $segment)
        {
            // Statistics for segment of track
            $segment->stats->toArray();
        }
        
        $npoints = $npoints + count($segment->points);
        $ascent = $ascent + $segment->stats->cumulativeElevationGain;
        $descent = $descent + $segment->stats->cumulativeElevationLoss;
        $dist = $dist + $segment->stats->distance;
    }
    
    $ascent = intval($ascent);
    $descent = intval($descent);
    $dist = number_format_i18n($dist / 1000, 1);

    $desc = 'Dist: ' . $dist . ' Gain: ' . $ascent . ' Loss: ' . $descent;

    // GpxFile contains data and handles serialization of objects
    $gpx_file = new GpxFile();

    // Creating sample Metadata object
    $gpx_file->metadata = new Metadata();

    // Description of GPX file
    $gpx_file->metadata->description = $desc;
    $gpx_file->metadata->name = $newfile;
    //$gpx_file->metadata->bounds = $bounds;

    // Creating track
    $track 	= new Track();

    // Name of track
    $track->name = $newfile;

    // Creating Track segment
    $newsegment = new Segment();	

    // Add segment to segment array of track
    $track->segments[] 				= $segment;

    // Add track to file
    $gpx_file->tracks[] 			= $track;

    // GPX output
    $complete = $path . '/' . $newfile;
    $gpx_file->save($complete, \phpGPX\phpGPX::XML_FORMAT);

    
    return $desc;
}