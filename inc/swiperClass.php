<?php

/**
 * Class SwiperClass to generate the html for the swiper slider.
 *
 * PHP version 7.3.0 - 8.0.x
 *
 * @package    fotorama_multi
 * @author     Martin von Berg <mail@mvb1.de>
 * @copyright  Martin von Berg, 2022
 * @license    https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * @link       https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation
 * @since      File available since Plugin-Release 0.11.0
 * @version    0.0.1
 * TODO
 */

namespace mvbplugins\fotoramamulti;

/**
 * Class FotoramaClass to generate the html for the fotorama slider.
 */
final class SwiperClass
{
    // PHP 7.3 version :: damit ist PHPstan und PHPInsights nicht erfolgreich, bzw. zu viele Fehlermeldungen
    protected $sliderHtml = '';
    protected $imgnr = 0;
    protected $shortcodecounter = 0;
    protected $imageData = [];
    protected $imageNumber = 0;
    protected $imageDataToPassToJavascript = [];

    // PHP 7.4 version
    /*
    protected string $sliderHtml = '';
    protected int $imgnr = 0;
    protected int $shortcodecounter = 0;
    protected array $imageData = [];
    protected array $imageDataToPassToJavascript = [];
    */

    /**
     * constructor function for the class to do the initialization settings.
     *
     * TODO
     */
    public function __construct($shortcodecounter=0, $imageData=[])
    {
        $this->shortcodecounter = $shortcodecounter;
        $this->imgnr = 1;
        $this->imageData = $imageData;
        $this->imageNumber = count($this->imageData);
    }

    public function getSliderHtml( $attributes)
    {
        $this->generateSliderHtml( $attributes );
        return $this->sliderHtml;
    }

    public function getNumberImagesInHtml()
    {
        return $this->imgnr;
    }

    public function getImageDataForJS () {
        return $this->imageDataToPassToJavascript;
    }

    private function generateSliderHtml( $attr ) {
        // Define path and url variables
	    $up_url = gpxview_get_upload_dir('baseurl');  // upload_url
	    $up_dir = wp_get_upload_dir()['basedir'];     // upload_dir
        $thumbsdir = THUMBSDIR; // we use a fixed name for the subdir containing the thumbnails

        // Get Values from Admin settings page
 	    $fotorama_elevation_options = get_option( 'fotorama_elevation_option_name' ); // Array of All Options
        
        // Extract shortcode-Parameters and set Default-Values
        extract ( shortcode_atts ( array (
            'gpxpath' 			=> $fotorama_elevation_options['path_to_gpx_files_2'] ?? 'gpx', 
            'gpxfile' 			=> 'test.gpx',
            'mapheight' 		=> $fotorama_elevation_options['height_of_map_10'] ?? '1000',
            'mapaspect'			=> $fotorama_elevation_options['aspect_ratio_of_map'] ?? '1.50',
            'chartheight' 		=> $fotorama_elevation_options['height_of_chart_11'] ?? '200',
            'imgpath' 			=> $fotorama_elevation_options['path_to_images_for_fotorama_0'] ?? 'Bilder',
            'dload' 			=> $fotorama_elevation_options['download_gpx_files_3'] ?? 'true', 
            'alttext' 			=> $fotorama_elevation_options['general_text_for_the_fotorama_alt_9'] ?? '', 
            'ignoresort' 		=> $fotorama_elevation_options['ignore_custom_sort_6'] ?? 'false', 
            'showadress' 		=> $fotorama_elevation_options['show_address_of_start_7'] ?? 'true', 
            'showmap' 			=> 'true',
            'adresstext' 		=> $fotorama_elevation_options['text_for_start_address_8'] ?? 'Startadresse',
            'requiregps' 		=> $fotorama_elevation_options['images_with_gps_required_5'] ?? 'true',
            'maxwidth' 			=> $fotorama_elevation_options['max_width_of_container_12'] ?? '600', 
            'minrowwidth' 		=> $fotorama_elevation_options['min_width_css_grid_row_14'] ?? '480',
            'showcaption' 		=> $fotorama_elevation_options['show_caption_4'] ?? 'true',
            'eletheme' 			=> $fotorama_elevation_options['colour_theme_for_leaflet_elevation_1'], 
            'showalltracks' 	=> $fotorama_elevation_options['showalltracks'] ?? 'false', // not in gtb block
            'mapcenter' 		=> $fotorama_elevation_options['mapcenter'] ?? '0.0, 0.0', // not in gtb block
            'zoom' 				=> $fotorama_elevation_options['zoom'] ?? 8,		// not in gtb block			
            'markertext' 		=> $fotorama_elevation_options['markertext'] ?? 'Home address', // not in gtb block
            'fit' 				=> $fotorama_elevation_options['fit'] ?? 'cover', // 'contain' Default, 'cover', 'scaledown', 'none'
            'ratio' 			=> $fotorama_elevation_options['ratio'] ?? '1.5',
            'background' 		=> $fotorama_elevation_options['background'] ?? 'darkgrey', // background color in CSS name
            'navposition' 		=> $fotorama_elevation_options['navposition'] ?? 'bottom', // 'top'
            'navwidth' 			=> $fotorama_elevation_options['navwidth'] ?? '100', // in percent
            'f_thumbwidth' 		=> $fotorama_elevation_options['f_thumbwidth'] ?? '100', // in pixels
            'f_thumbheight' 	=> $fotorama_elevation_options['f_thumbheight'] ?? '75', // in pixels
            'thumbmargin' 		=> $fotorama_elevation_options['thumbmargin'] ?? '2', // in pixels
            'thumbborderwidth' 	=> $fotorama_elevation_options['thumbborderwidth'] ?? '2', // in pixels
            'thumbbordercolor' 	=> $fotorama_elevation_options['thumbbordercolor'] ?? '#ea0000', // background color in CSS name or HEX-value. The color of the last shortcode on the page will be taken.
            'transition' 		=> $fotorama_elevation_options['transition'] ?? 'crossfade', // 'slide' Default 'crossfade' 'dissolve'
            'transitionduration'=> $fotorama_elevation_options['transitionduration'] ?? '400', // in ms
            'loop' 				=> $fotorama_elevation_options['loop'] ?? 'true', // true or false
            'autoplay' 			=> $fotorama_elevation_options['autoplay'] ?? 'false', // on with 'true' or any interval in milliseconds.
            'arrows' 			=> $fotorama_elevation_options['arrows'] ?? 'true',  // true : Default, false, 'always' : Do not hide controls on hover or tap
            'shadows' 			=> $fotorama_elevation_options['shadows'] ?? 'true', // true or false
            'shortcaption'		=> 'false',
            'mapselector'       => $fotorama_elevation_options['mapselector'] ?? 'OpenTopoMap'
        ), $attr));

        $htmlstring = '<div class="swiper myswiper"><div class="swiper-wrapper" id="mfotorama'.$this->shortcodecounter.'">';

        // loop through the data extracted from the images in folder and generate the div depending on the availability of thumbnails
		foreach ($this->imageData as $data) {

			// set the alt-tag and the title for SEO
			if ( 'notitle' === $data['title'] ) {
				$data['title'] = __('Galeriebild') . ' '. \strval( $this->imgnr );
			}
			$alttext = $data['alt'] !== '' ? $data['alt'] : $data['title'];

			// generate the caption for html and javascript
			if ( $shortcaption === 'false') {
				//$caption = 'data-caption="' .$this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . ' </br> ' . $data['camera'] . ' </br> ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'] . '"';
				$jscaption = $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . ' </br> ' . $data['camera'] . ' </br> ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'];	
			} else {
				//$caption = 'data-caption="' .$this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . '"';
				$jscaption = $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"];
			};
			

			// --------------- Proceed with HTML -------------------
            $htmlstring .= '<div class="swiper-slide">';
            $htmlstring .= '<div class="swiper-zoom-container">';
            // img and a href
			if ( $data['thumbinsubdir'] ) {
			} elseif ( $data['thumbavail'] ) {
			} else { // do not add srcset here, because this is for folders without thumbnails. If this is the case we don't have image-sizes for the srcset
				$htmlstring .= <<<EOF
                <img loading="lazy" class="swiper-lazy" alt="{$alttext}" src="{$up_url}/{$imgpath}/{$data['file']}{$data['extension']}"/>
                EOF;
			};
            
            $htmlstring .= '</div>'; // End div swiper-zoom-container

            // todo: verwende ein Icon mit Lupe rechts oben über dem Bild wie bei fotorama
            $htmlstring .= '<a data-fslightbox="1" data-type="image" data-caption="'. $alttext .'" ';
            $htmlstring .= <<<EOF
            href="{$up_url}/{$imgpath}/{$data['file']}{$data['extension']}"></a>
            EOF;

            // Ergänze den info button links oben. Position und styling mit Css
            $htmlstring .= '<div class="fm-attach-link">';
            $htmlstring .= '<a href="" target="_blank">';
            $htmlstring .= '<div class="fm-itemsButtons" type="info"><svg height="20px" style="fill: rgb(255, 255, 255);" version="1.1" viewBox="0 0 46 100" width="46px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M35.162,0c6.696,0,10.043,4.567,10.043,9.789c0,6.522-5.814,12.555-13.391,12.555c-6.344,0-10.045-3.752-9.869-9.947   C21.945,7.176,26.35,0,35.162,0z M14.543,100c-5.287,0-9.164-3.262-5.463-17.615l6.07-25.457c1.057-4.077,1.23-5.707,0-5.707   c-1.588,0-8.451,2.816-12.51,5.59L0,52.406C12.863,41.48,27.662,35.072,34.004,35.072c5.285,0,6.168,6.361,3.525,16.148   L30.58,77.98c-1.234,4.729-0.703,6.359,0.527,6.359c1.586,0,6.787-1.963,11.896-6.041L46,82.377C33.488,95.1,19.83,100,14.543,100z   "></path></g><g></svg></div>';
            $htmlstring .= '</a></div>';
            
            // Ergänze die Caption
            if ( $showcaption === 'false') {
				$jscaption = '';
			} else {
                $htmlstring .= '<div class="swiper-slide-title">' . $jscaption . '</div>';
            }
             
            $htmlstring .= '</div>'; // End div <swiper-slide>

            // get the image srcset if the image is in WP-Media-Catalog, otherwise not. in: $data, 
			// Code-Example with thumbs with image srcset (https://github.com/artpolikarpov/fotorama/pull/337)
            // $up_url, $up_dir, $thumbsdir
			$phpimgdata[] = getSrcset( $data, $up_url, $up_dir, $imgpath, $thumbsdir );
			$phpimgdata[$this->imgnr-1]['id'] = $this->imgnr;
			$phpimgdata[$this->imgnr-1]['title'] = $alttext; 
			$phpimgdata[$this->imgnr-1]['coord'][0] = round( $data['lat'], 6 );
			$phpimgdata[$this->imgnr-1]['coord'][1] = round( $data['lon'], 6 );
			$phpimgdata[$this->imgnr-1]['permalink'] = $data['permalink'] ?? '';
			$phpimgdata[$this->imgnr-1]['jscaption'] = $jscaption;

			$this->imgnr++;
		} // end for loop for image data

		$htmlstring  .= "</div>"; // end of swiper wrapper
        $htmlstring .= '<div class="swiper-button-prev"></div>';
        $htmlstring .= '<div class="swiper-button-next"></div>';
        $htmlstring .= '<div class="swiper-pagination"></div>';
        $htmlstring  .= "</div><!--div id=end-of-slider -->";

        $this->imageDataToPassToJavascript = $phpimgdata;
        $this->sliderHtml = $htmlstring;
    }

}