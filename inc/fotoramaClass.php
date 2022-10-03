<?php

/**
 * Class FotoramaClass to generate the html for the fotorama slider.
 * 
 * PHP version 7.3.0 - 8.0.x
 *
 * Summary     Class FotoramaClass to generate the html for the fotorama slider.
 * Description This Class generates the html for the fotoram slider.
 * @author     Martin von Berg <mail@mvb1.de>
 * @copyright  Martin von Berg, 2022
 * @license    https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * @link       https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation
 * @since      0.12.0
 * @version    0.12.0
 */

namespace mvbplugins\fotoramamulti;

/**
 * Class FotoramaClass to generate the html for the fotorama slider.
 */
final class FotoramaClass
{
    // PHP 7.3 version :: damit ist PHPstan und PHPInsights nicht erfolgreich, bzw. zu viele Fehlermeldungen
    protected $sliderHtml = '';
    protected $imgnr = 0;
    protected $shortcodecounter = 0;
    protected $imageData = [];
    protected $imageNumber = 0;
    protected $imageDataToPassToJavascript = [];
    protected $postid = 0;

    // PHP 7.4 version
    /*
    protected string $sliderHtml = '';
    protected int $imgnr = 0;
    protected int $shortcodecounter = 0;
    protected array $imageData = [];
    protected array $imageDataToPassToJavascript = [];
    protected int $postid = 0;
    */

    /**
     * constructor function for the class to do the initialization settings.
     *
     * TODO
     */
    public function __construct($shortcodecounter=0, $imageData=[], $postid)
    {
        $this->shortcodecounter = $shortcodecounter;
        $this->imgnr = 1;
        $this->imageData = $imageData;
        $this->imageNumber = count($this->imageData);
        $this->postid = $postid;
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
        $mapcenter = explode(',',$mapcenter);

        // die erste Zeile sieht unnötig aus, aber es geht nur so
        $htmlstring = '';
		$htmlstring .= <<<EOF
        <div class="fotorama_multi_images" style="display:none;"><figure><figcaption></figcaption></figure></div> 
        <div id="mfotorama{$this->shortcodecounter}"
                data-autoplay="{$autoplay}"
                data-stopautoplayontouch="true"
                data-width="100%" 
                data-allowfullscreen="native" 
                data-keyboard="false" 
                data-hash="false"
                data-captions="{$showcaption}"
                data-fit="{$fit}" 
                data-ratio="{$ratio}" 
                data-nav="thumbs" 
                data-navposition="{$navposition}"
                data-navwidth="{$navwidth}%"
                data-thumbwidth="{$f_thumbwidth}" 
                data-thumbheight="{$f_thumbheight}" 
                data-thumbmargin="{$thumbmargin}"
                data-thumbborderwidth="{$thumbborderwidth}"
                data-transition="{$transition}"
                data-transitionduration="{$transitionduration}"
                data-loop="{$loop}"
                data-arrows="{$arrows}"
                data-shadows="{$shadows}">

EOF;

        // loop through the data extracted from the images in folder and generate the div depending on the availability of thumbnails
		foreach ($this->imageData as $data) {

            if ( $this->imgnr===1 && $this->shortcodecounter === 0 && \current_user_can('edit_posts')) {
                // generate the srcset and write to a custom field
                // <link rel="preload" as="image" href="wolf.jpg" imagesrcset="wolf_400px.jpg 400w, wolf_800px.jpg 800w, wolf_1600px.jpg 1600w" imagesizes="50vw">
                $hrefsrc = "{$up_url}/{$imgpath}/{$data['file']}{$data['extension']}";
                $srcset = wp_get_attachment_image_srcset($data['wpid']);
                $args = '<link rel="preload" as="image" href="' . $hrefsrc . '" imagesrcset="' . $srcset . '" ';
                //
                update_post_meta( $this->postid,'fm_header_link', $args);
            }

			// set the alt-tag and the title for SEO
			if ( 'notitle' == $data['title'] ) {
				$data['title'] = __('Galeriebild') . ' '. \strval( $this->imgnr );
			}
			$alttext = $data['alt'] != '' ? $data['alt'] : $data['title'];

			// generate the caption for html and javascript
			if ( $shortcaption === 'false') {
				$caption = 'data-caption="' .$this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . ' || ' . $data['camera'] . ' || ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'] . '"';
				$jscaption = $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . ' || ' . $data['camera'] . ' || ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'];	
			} else {
				$caption = 'data-caption="' .$this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . '"';
				$jscaption = $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"];
			};
			if ( $showcaption === 'false') {
				$caption = '';
				$jscaption = '';
			}

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

			// --------------- Proceed with HTML -------------------
			if ( $data['thumbinsubdir'] ) {
				$htmlstring .= <<<EOF
		<a href="{$up_url}/{$imgpath}/{$data['file']}{$data['extension']}"
		 {$caption}
		<img loading="lazy" alt="{$alttext}" src="{$up_url}/{$imgpath}/{$thumbsdir}/{$data['file']}{$data['thumbs']}"></a>
EOF;
			
			} elseif ( $data['thumbavail'] ) {
					
				$htmlstring .= <<<EOF
		<a href="{$up_url}/{$imgpath}/{$data['file']}{$data['thumbs']}" 
		 {$caption}
		<img loading="lazy" alt="{$alttext}" src="{$up_url}/{$imgpath}/{$data['file']}{$data['thumbs']}"></a>
EOF;

			} else { // do not add srcset here, because this is for folders without thumbnails. If this is the case we don't have image-sizes for the srcset
				$htmlstring .= <<<EOF
		<img loading="lazy" alt="{$alttext}" src="{$up_url}/{$imgpath}/{$data['file']}{$data['extension']}"
		 {$caption}>
EOF;
			};
			$this->imgnr++;
		} // end for loop for image data
		
        $htmlstring  .= "</div><!--div id=end-of-slider -->";
        $this->imageDataToPassToJavascript = $phpimgdata;
        $this->sliderHtml = $htmlstring;
    }

}