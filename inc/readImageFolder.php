<?php

/**
 * Class to readout all image files (jpg or webp) from the give directory on the server.
 *
 * PHP version 7.3.0 - 8.0.x
 *
 * @package    fotorama_multi
 * @author     Martin von Berg <mail@mvb1.de>
 * @copyright  Martin von Berg, 2021
 * @license    https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * @link       https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation
 * @since      File available since Plugin-Release 0.4.0
 * @version    0.0.1
 * @param string $folder folder or directory on the server shall be analysed.
 */

namespace mvbplugins\fotoramamulti;

// ---------- class ReadImageFolder to readout a given folder on the server --------------------
final class ReadImageFolder
{
    // PHP 7.3 version :: damit ist PHPstan und PHPInsights nicht erfolgreich, bzw. zu viele Fehlermeldungen
    protected $imageNumber; // int Hint: type declaration only since PHP 7.4.0 allowed
    protected $result = array(); // array
    protected $allImageFiles; // array
    protected $imagepath; // string
    protected $thumbheight; // string
    protected $thumbwidth; // string
    protected $thumbsdir  = ''; // string
    protected $imageurl   = ''; // string
    protected $requiregps = ''; // string
    protected $ignoresort = ''; // string
    
    // PHP 7.4 version
    /*
    protected int $imageNumber; // int Hint: type declaration only since PHP 7.4.0 allowed
    protected array $result = []; // array
    protected array $allImageFiles; // array
    protected string $imagepath; // string
    protected string $thumbheight; // string
    protected string $thumbwidth; // string
    protected string $thumbsdir  = ''; // string
    protected string $imageurl   = ''; // string
    protected string $requiregps = ''; // string
    protected string $ignoresort = ''; // string
    */

    /**
     * constructor function for the class to do the initialization settings.
     *
     * @param string $folder folder that should be used for the image gallery and that will be analysed.
     * @param string $dir name of the directory with thumbnails
     * @param string $url complete url to the images
     * @param string $gps whether gps is required or not
     */
    public function __construct(string $folder, string $dir, string $url, string $gps, string $ignoresort)
    {
        $this->imageNumber = 0;
        $this->imagepath = $folder;
        $this->result = [];

        $files = glob($this->imagepath . '/*.*');
        if ($files === false) $files = [];
        $sorted = preg_grep('/\.(jpe?g|webp)$/i', $files);
        if ($sorted !== false) $this->allImageFiles = $sorted;

        // settings for the thumbnail checking
        $this->thumbheight = (string) get_option('thumbnail_size_h');
        $this->thumbwidth = (string) get_option('thumbnail_size_w');

        $this->thumbsdir  = $dir;
        $this->imageurl   = $url;
        $this->requiregps = $gps;
        $this->ignoresort = $ignoresort;

        $this->readFolder();
    }

    /**
     * provide the result of the readFolder function as array
     *
     * @return array<int, array<string, mixed>> array with all images in the folder an adjacent information
     */
    public function getImagesForGallery()
    {
        return $this->result;
    }

    /**
     * Return the number of images to show in the gallery.
     *
     * @return int the number of images to show in the gallery
     */
    public function getImageNumber()
    {
        return $this->imageNumber;
    }

    /**
     * Analyze the image folder and extract the image data to an array
     *
     * @return void
     */
    private function readFolder()
    {
        // Remark to variables: Not all variables are defined as class variables. So the exist only locally within this function.
        $data2 = [];
        if ($this->thumbsdir === '') return;

        foreach ($this->allImageFiles as $file) {
            // check wether current $file of the $path (=folder) is a unscaled jpg-file and not a thumbnail or a rescaled file
            // This means: The filename must not contain 'thumb' or '[0-9]x[0-9]' or 'scaled'.
            // All other additions to the filename will be treated as full scaled image-file that will be shown in the image-slider
            $ext = '.' . pathinfo($file, PATHINFO_EXTENSION);
            $jpgfile = basename($file, $ext);
            $isthumb = stripos($jpgfile, 'thumb') || preg_match('.\dx{1}\d.', $jpgfile) || stripos($jpgfile, 'scaled');
            $thumbcheck = '-' . $this->thumbwidth . 'x' . $this->thumbheight . $ext;

            if ( ! $isthumb ) {

                // check whether thumbnails are available in the image-folder and if yes, how they are named
                $thumbs = '';
                $pathtocheck = $this->imagepath . '/' . $jpgfile;
                [$thumbavail, $thumbs] = $this->checkThumbs($thumbs, $pathtocheck, $thumbcheck, $ext);

                // search for webp-thumbs if jpg-image was converted to webp. The files will never be in a subdir because if so, it was done by WordPress.
                if (('.jpg' === $ext || '.jpeg' === $ext) && ! $thumbavail) {
                    $thumbcheck = '-' . $this->thumbwidth . 'x' . $this->thumbheight . '.webp';
                    [$thumbavail, $thumbs] = $this->checkThumbs($thumbs, $pathtocheck, $thumbcheck, '.webp');
                }

                // check additionally whether thumbnails are available in the sub-folder ./thumbs and if, how they are named
                // even if there were thumbnails in the image-folder the thumbnails in ../thumbs are preferably used
                // therefore this check runs here after the above check for the image-folder
                $pathtocheck = $this->imagepath . '/' . $this->thumbsdir . '/' . $jpgfile;
                [$thumbinsubdir, $thumbs] = $this->checkThumbs($thumbs, $pathtocheck, $thumbcheck, $ext);

                // get $Exif-Data from image and check wether image contains GPS-data
                // And get the WPid if the image is in the WP-Media-Library
                $wpimgurl = $this->imageurl . '/' . $jpgfile . $ext;
                $wpid = attachment_url_to_postid($wpimgurl);
                $data2[$this->imageNumber] = getEXIFData($this->imagepath . "/" . basename($file), $ext, $wpid);

                // convert the GPS-data to decimal values, if available
                [$lon, $lat] = gpxview_getLonLat($data2[$this->imageNumber]);

                // do nothing, GPS-data invalid but we want only to show images WITH GPS, so skip this image;
                if ( (is_null($lon) || is_null($lat)) && ('true' === $this->requiregps)) {
                    array_pop($data2);
                } else {
                    // expand array data2 with information that was collected during the image loop
                    $data2[$this->imageNumber]['id'] = $this->imageNumber;
                    $data2[$this->imageNumber]['lat'] = $lat;
                    $data2[$this->imageNumber]['lon'] = $lon;
                    $data2[$this->imageNumber]['file'] = $jpgfile;
                    $data2[$this->imageNumber]['wpid'] = $wpid;
                    $data2[$this->imageNumber]['thumbavail'] = $thumbavail;
                    $data2[$this->imageNumber]['thumbinsubdir'] = $thumbinsubdir;
                    $data2[$this->imageNumber]['thumbs'] = $thumbs;
                    $data2[$this->imageNumber]['extension'] = $ext;

                    // increment imagenumber
                    $this->imageNumber++;
                }
            }
        }
        /*
        // check if customsort is possible, if yes sort ascending, if no sort with date taken and ascending
        $rowsum = $this->imageNumber * ($this->imageNumber + 1) / 2;

        if ($this->imageNumber > 0) {
            $csort = array_column($data2, 'sort'); // $customsort
            $arraysum = array_sum($csort);
        
            if ( ($rowsum !== $arraysum) or ('true' === $this->ignoresort) ) {
                $csort = array_column($data2, 'datesort');
            }
            // sort images asending with date-taken
            array_multisort($csort, SORT_ASC, $data2);
        }
        */
        $this->result = $data2;
    }

    /**
     * check the availability of thumbnails
     *
     * @param string $thumbs the prepared but usually empty string with thumbnail string. Somewhat useless.
     * @param string $pathtocheck the path that will be checked for thumbnails
     * @param string $thumbcheck the basename of the file with thumbnails to search for
     * @param string $ext the current extension ('jgp' or 'webp')
     * @return array<bool, string> with result values for $thumbinsubdir and $thumbs-extension
     */
    private function checkThumbs(string $thumbs, string $pathtocheck, string $thumbcheck, string $ext)
    {
        $thumbinsubdir = true;

        if (\in_array($pathtocheck . $thumbcheck, $this->allImageFiles)) {
            $thumbs = $thumbcheck;
        } elseif (\in_array($pathtocheck . '-thumb' . $ext, $this->allImageFiles)) {
            $thumbs = '-thumb' . $ext;
        } elseif (\in_array($pathtocheck . '_thumb' . $ext, $this->allImageFiles)) {
            $thumbs = '_thumb' . $ext;
        } else {
            $thumbinsubdir = false;
        }

        return [$thumbinsubdir, $thumbs];
    }
}
