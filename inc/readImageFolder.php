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
class ReadImageFolder
{
    protected $imageNumber; // Hint: type declaration only since PHP 7.4.0 allowed
    protected $result = array();
    protected $allImageFiles;
    protected $imagepath;
    protected $thumbheight;
    protected $thumbwidth;
    protected $thumbsdir  = ''; 
    protected $imageurl   = ''; 
    protected $requiregps = '';

    /**
     * constructor function for the class to do the initialization settings.
     *
     * @param string $folder folder that should be used for the image gallery and that will be analysed.
     * @param  string $dir name of the directory with thumbnails
     * @param  string $url complete url to the images
     * @param  string $gps whether gps is required or not
     */
    public function __construct( string $folder, string $dir, string $url, string $gps ) 
    {
        $this->imageNumber = 0;
        $this->imagepath = $folder;
        $this->result = array();
        $this->allImageFiles = preg_grep('/\.(jpe?g|webp)$/i', glob( $this->imagepath .'/*.*')); // TODO: use GLOB_MARK ???

        // settings for the thumbnail checking
        $this->thumbheight = (string) get_option('thumbnail_size_h');
        $this->thumbwidth = (string) get_option('thumbnail_size_w');

        $this->thumbsdir  = $dir;
        $this->imageurl   = $url;
        $this->requiregps = $gps;
    }

    /**
     * provide the result of the readFolder function as array
     *
     * @return array array with all images in the folder an adjacent information
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
    public function readFolder() {
        $data2 = array();
        if ( $this->thumbsdir == '' || $this->imageurl='' || $this->requiregps == '') return;

        foreach ( $this->allImageFiles as $file ) {
            // check wether current $file of the $path (=folder) is a unscaled jpg-file and not a thumbnail or a rescaled file
            // This means: The filename must not contain 'thumb' or '[0-9]x[0-9]' or 'scaled'. 
            // All other additions to the filename will be treated as full scaled image-file that will be shown in the image-slider
            $ext = '.' . pathinfo($file)['extension'];
            $jpgfile = basename($file, $ext); 
            $isthumb = stripos($jpgfile, 'thumb') || preg_match('.\dx{1}\d.', $jpgfile) || stripos($jpgfile, 'scaled'); 
            $thumbcheck = '-' . $this->thumbwidth . 'x' . $this->thumbheight . $ext;
            
            if ( ! $isthumb ) {
    
                // check whether thumbnails are available in the image-folder and if yes, how they are named
                // für diesen Teil mit checkThumbs wird ca. 38% der Gesamtlaufzeit bei Aufruf des Shortcodes verbraucht! wobei ca. 80% von is_file oder file_exists verbraucht wird!
                $thumbs = '';
                $pathtocheck = $this->imagepath . '/' . $jpgfile;
                list( $thumbavail, $thumbs ) = checkThumbs( $thumbs, $pathtocheck, $thumbcheck, $ext);
    
                // search for webp-thumbs if jpg-image was converted to webp. The files will never be in a subdir because if so, it was done by WordPress.
                if ( ( ('.jpg' == $ext) || ('.jpeg' == $ext) ) && ( ! $thumbavail ) ) {
                    $thumbcheck = '-' . $this->thumbwidth . 'x' . $this->thumbheight . '.webp';
                    list( $thumbavail, $thumbs ) = checkThumbs( $thumbs, $pathtocheck, $thumbcheck, '.webp');
                }
                        
                // check additionally whether thumbnails are available in the sub-folder ./thumbs and if, how they are named
                // even if there were thumbnails in the image-folder the thumbnails in ../thumbs are preferably used
                // therefore this check runs here after the above check for the image-folder
                $pathtocheck = $this->imagepath . '/' . $this->thumbsdir . '/'. $jpgfile;
                list( $thumbinsubdir, $thumbs ) = checkThumbs( $thumbs, $pathtocheck, $thumbcheck, $ext);
                            
                
                // get $Exif-Data from image and check wether image contains GPS-data
                // And get the WPid if the image is in the WP-Media-Library
                $wpimgurl = $this->imageurl . '/' . $jpgfile . $ext;
                $wpid = attachment_url_to_postid( $wpimgurl );
                $data2[ $this->imageNumber ] = getEXIFData( $this->imagepath . "/" . basename( $file), $ext, $wpid );
    
                // convert the GPS-data to decimal values, if available
                // Dieser Teil braucht ebenfalls ca. 38% der Laufzeit bei Aufruf des shortcodes, wobei ca. 50% von gpxview_GPS2Num verbraucht wird
                list( $lon, $lat ) = gpxview_getLonLat( $data2 [ $this->imageNumber ] ) ;
            
                // do nothing, GPS-data invalid but we want only to show images WITH GPS, so skip this image;
                if ( ( (is_null($lon) ) || (is_null($lat)) ) && ( 'true' == $this->requiregps ) ) {	
                    array_pop( $data2 );
                } 
                else {
                    // expand array data2 with information that was collected during the image loop
                    $data2[ $this->imageNumber ]['id'] = $this->imageNumber; 
                    $data2[ $this->imageNumber ]['lat'] = $lat; 
                    $data2[ $this->imageNumber ]['lon'] = $lon; 
                    $data2[ $this->imageNumber ]['file'] = $jpgfile;
                    $data2[ $this->imageNumber ]['wpid'] = $wpid;
                    $data2[ $this->imageNumber ]['thumbavail'] = $thumbavail; 
                    $data2[ $this->imageNumber ]['thumbinsubdir'] = $thumbinsubdir;
                    $data2[ $this->imageNumber ]['thumbs'] = $thumbs;
                    $data2[ $this->imageNumber ]['extension'] = $ext;
                
                    // create array to add the image-urls to Yoast-seo xml-sitemap
                    //if ($doYoastXmlSitemap) {
                    //    $img2add = $up_url . '/' . $imgpath . '/' . $jpgfile . $ext;
                    //    $postimages[] = array('src' => $img2add , 'alt' => $data2[ $this->imageNumber ]['title'], 'title' => $data2[ $this->imageNumber ]['title'],);
                    // }
                
                    // increment imagenumber
                    $this->imageNumber++;
                }
            }
        }
        $this->result = $data2;
        
    }
}