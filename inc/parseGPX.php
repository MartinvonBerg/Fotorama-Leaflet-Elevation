<?php
namespace mvbplugins\fotoramamulti;

$path = plugin_dir_path(__FILE__);
require_once $path . 'phpGPX/phpGPX.php';
require_once $path . 'phpGPX/Models/GpxFile.php';
require_once $path . 'phpGPX/Models/Summarizable.php';

use phpGPX\phpGPX;

function parsegpx($infile) {
    $success = true;

    $gpx = new phpGPX();
    $str = '';
    
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
    }
    
    return $success;
}