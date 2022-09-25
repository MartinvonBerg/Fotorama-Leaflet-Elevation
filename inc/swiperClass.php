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
 * @since      File available since Plugin-Release 0.12.0
 * @version    0.0.1
 * TODO
 */

namespace mvbplugins\fotoramamulti;

use DOMDocument;

class myElement extends \DOMElement {
    function appendElement($name) { 
       return $this->appendChild(new myElement($name));
    }

    function appendElWithAttsDIV( $attributes) {
        $el = $this->appendElement('div');
        
        foreach ( $attributes as $att){
            $el->setAttribute($att[0], $att[1]);
        }
        return $el;
    }
}
 
 class myDocument extends \DOMDocument {
    function setRoot($name) { 
       return $this->appendChild(new myElement($name));
    }
}

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
    protected $showpagination = true; // TODO: swiper options and pass to js
    protected $fslightbox = true;
    protected $zoom = true;
    protected $effect = 'slide';
    protected $showInfoButton = true;

    // PHP 7.4 version
    /*
    protected string $sliderHtml = '';
    protected int $imgnr = 0;
    protected int $shortcodecounter = 0;
    protected array $imageData = [];
    protected array $imageDataToPassToJavascript = [];
    protected boolean $showpagination = true;
    protected boolean $fslightbox = false;
    protected boolean $zoom = true;
    protected string $effect = 'slide';
    protected booleand $showInfoButton = true;
    */

    /**
     * constructor function for the class to do the initialization settings.
     *
     * TODO
     */
    public function __construct($shortcodecounter=0, $imageData=[], $options)
    {
        $this->shortcodecounter = $shortcodecounter;
        $this->imgnr = 1;
        $this->imageData = $imageData;
        $this->imageNumber = count($this->imageData);
        // set the options from shortcode or admin setting
        $this->showpagination = $options['sw_pagination'] === 'true';
        $this->fslightbox = $options['sw_fslightbox'] === 'true';
        $this->zoom = $options['sw_zoom'] === 'true';
        $this->effect = $options['sw_effect'];
        $this->showInfoButton = $this->showInfoButton && $options['addPermalink'] && $options['allImgInWPLibrary'];

        // change swiper settings for certain cases TODO: might change again if added to shortcode array
        if ( $this->effect === 'cube') {
            $this->zoom = false;
            $this->showInfoButton = false;
            $this->showpagination = false;
            $this->fslightbox = false;
        }
    }

    public function getSliderHtml( $attributes)
    {
        $this->generateDomHtml( $attributes );
        return $this->sliderHtml;
    }

    public function getNumberImagesInHtml()
    {
        return $this->imgnr;
    }

    public function getImageDataForJS () {
        return $this->imageDataToPassToJavascript;
    }

    private function generateDomHtml( $attr) {
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
            'imgpath' 	=> $fotorama_elevation_options['path_to_images_for_fotorama_0'] ?? 'Bilder',
            'dload' 			=> $fotorama_elevation_options['download_gpx_files_3'] ?? 'true', 
            'alttext' 	=> $fotorama_elevation_options['general_text_for_the_fotorama_alt_9'] ?? '', 
            'ignoresort' 		=> $fotorama_elevation_options['ignore_custom_sort_6'] ?? 'false', 
            'showadress' 		=> $fotorama_elevation_options['show_address_of_start_7'] ?? 'true', 
            'showmap' 			=> 'true',
            'adresstext' 		=> $fotorama_elevation_options['text_for_start_address_8'] ?? 'Startadresse',
            'requiregps' 		=> $fotorama_elevation_options['images_with_gps_required_5'] ?? 'true',
            'maxwidth' 			=> $fotorama_elevation_options['max_width_of_container_12'] ?? '600', 
            'minrowwidth' 		=> $fotorama_elevation_options['min_width_css_grid_row_14'] ?? '480',
            'showcaption' 	=> $fotorama_elevation_options['show_caption_4'] ?? 'true',
            'eletheme' 			=> $fotorama_elevation_options['colour_theme_for_leaflet_elevation_1'] ?? 'martin-theme', 
            'showalltracks' 	=> $fotorama_elevation_options['showalltracks'] ?? 'false', // not in gtb block
            'mapcenter' 		=> $fotorama_elevation_options['mapcenter'] ?? '0.0, 0.0', // not in gtb block
            'zoom' 				=> $fotorama_elevation_options['zoom'] ?? 8,		// not in gtb block			
            'markertext' 		=> $fotorama_elevation_options['markertext'] ?? 'Home address', // not in gtb block
            'fit' 			=> $fotorama_elevation_options['fit'] ?? 'cover', // 'contain' Default, 'cover', 'scaledown', 'none'
            'ratio' 			=> $fotorama_elevation_options['ratio'] ?? '1.5',
            'background' 		=> $fotorama_elevation_options['background'] ?? 'darkgrey', // background color in CSS name
            'navposition' 	=> $fotorama_elevation_options['navposition'] ?? 'bottom', // 'top'
            'navwidth' 		=> $fotorama_elevation_options['navwidth'] ?? '100', // in percent
            'f_thumbwidth' 	=> $fotorama_elevation_options['f_thumbwidth'] ?? '100', // in pixels
            'f_thumbheight' => $fotorama_elevation_options['f_thumbheight'] ?? '75', // in pixels
            'thumbmargin' 	=> $fotorama_elevation_options['thumbmargin'] ?? '2', // in pixels
            'thumbborderwidth'  	=> $fotorama_elevation_options['thumbborderwidth'] ?? '2', // in pixels
            'thumbbordercolor' 	    => $fotorama_elevation_options['thumbbordercolor'] ?? '#ea0000', // background color in CSS name or HEX-value. The color of the last shortcode on the page will be taken.
            'transition' 		=> $fotorama_elevation_options['transition'] ?? 'crossfade', // 'slide' Default 'crossfade' 'dissolve'
            'transitionduration'    => $fotorama_elevation_options['transitionduration'] ?? '400', // in ms
            'loop' 				    => $fotorama_elevation_options['loop'] ?? 'true', // true or false
            'autoplay' 			    => $fotorama_elevation_options['autoplay'] ?? 'false', // on with 'true' or any interval in milliseconds.
            'arrows' 			    => $fotorama_elevation_options['arrows'] ?? 'true',  // true : Default, false, 'always' : Do not hide controls on hover or tap
            'shadows' 			    => $fotorama_elevation_options['shadows'] ?? 'true', // true or false
            'shortcaption'	=> 'false',
            'mapselector'       => $fotorama_elevation_options['mapselector'] ?? 'OpenTopoMap'
        ), $attr));

        // generate the html string to show on page
        $doc = new myDocument();
        $doc->registerNodeClass('DOMElement', 'mvbplugins\fotoramamulti\myElement');

        // create root div
        $root = $doc->setRoot('div');
        $root->setAttribute('id', 'swiper' . $this->shortcodecounter);
        $root->setAttribute('class', 'swiper myswiper');
        
        // create first level child divs with classes
        $wrapper = $root->appendElWithAttsDIV([['class', 'swiper-wrapper']]);

        // create wrapper for thumbnails
        $thumbsWrapper = $doc->createElement('div','');
        $thumbsWrapper->setAttribute('thumbsSlider', '');
        $thumbsWrapper->setAttribute('id', 'thumbsSwiper' . $this->shortcodecounter);
        $thumbsWrapper->setAttribute('class', 'swiper myswiper2');
        //$thumbsWrapper->setAttribute('style', 'height:'.$f_thumbheight.'px');
        $inner1 = $doc->createElement('div');
        $inner1->setAttribute('class', 'swiper-wrapper');
        $thumbsWrapper->appendChild($inner1);

        foreach ($this->imageData as $data) {

			// set the alt-tag and the title for SEO
			if ( 'notitle' === $data['title'] ) {
				$data['title'] = __('Galeriebild') . ' '. \strval( $this->imgnr );
			}
			$alttext = $data['alt'] !== '' ? $data['alt'] : $data['title'];

			// generate the caption for html and javascript
			if ( $shortcaption === 'false') {
				//$caption = 'data-caption="' .$this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . ' </br> ' . $data['camera'] . ' </br> ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'] . '"';
				$caption = array (0 => $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"],
                                  1 => $data['camera'],
                                  2 => $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal']);
				$jscaption = $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . ' || ' . $data['camera'] . ' || ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'];	
			} else {
				$caption = array( 0 => $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"]);
				$jscaption = $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"];
			};
			
			// --------------- Proceed with HTML -------------------
            $slide= $wrapper->appendElWithAttsDIV([['class', 'swiper-slide'],['data-hash', 'swiper' . $this->shortcodecounter . '/'.$data['file']]]);
            $this->zoom === true ? $zoom=$slide->appendElWithAttsDIV([['class', 'swiper-zoom-container']]) : $zoom=$slide;

            // create thumbnail slide
            $thumbsSlide = $doc->createElement('div','');
            $thumbsSlide->setAttribute('class', 'swiper-slide');
            $thumbsSlide->setAttribute('style', 'height:'.$f_thumbheight.'px');
            $inner1->appendChild($thumbsSlide);

            // img and a href
			if ( $data['thumbinsubdir'] ) {

			} elseif ( $data['thumbavail'] ) {

			} else { // do not add srcset here, because this else is for folders without thumbnails. If this is the case we don't have image-sizes for the srcset
                $img=$zoom->appendElement('img');
                // add further attributes to img
                $img->setAttribute('loading', 'lazy');
                $img->setAttribute('class', 'swiper-lazy');
                $img->setAttribute('alt', $alttext);
                $img->setAttribute('src', "{$up_url}/{$imgpath}/{$data['file']}{$data['extension']}");

                // append the img to thumbnail
                $img2 = $doc->createElement('img','');
                $img2->setAttribute('src', "{$up_url}/{$imgpath}/{$data['file']}{$data['extension']}");
                $thumbsSlide->appendChild($img2);
			};

            // add the button to open fslightbox
            if ( $this->fslightbox === true) {
                $lightbox=$slide->appendElement('a');
                $lightbox->setAttribute('data-fslightbox','1');
                $lightbox->setAttribute('data-type','image'); // TODO: correct for video
                $lightbox->setAttribute('data-caption', $alttext);
                $lightbox->setAttribute('href',"{$up_url}/{$imgpath}/{$data['file']}{$data['extension']}");
                $lbdiv=$lightbox->appendElement('div');
                $lbdiv->setAttribute('class', 'button-fslightbox');
            }
            
            // Ergänze den info button links oben. Position und styling mit Css
            if ( $this->showInfoButton ){ 
                $info=$slide->appendElWithAttsDIV([['class', 'swiper-attach-link']]);
                $infoChildA = $info->appendElement('a');
                $infoChildA->setAttribute('href', $data['permalink']); 
                $infoChildA->setAttribute('target', "_blank");
                $infoChildA->appendElWithAttsDIV([['class', 'fm-itemsButtons'],['type', 'info']]);
            }
            
            // Ergänze die Caption
            if ( $showcaption === 'false') {
				$jscaption = '';
			} else {
                $title=$slide->appendElWithAttsDIV([['class', 'swiper-slide-title']]);
                foreach ($caption as $p) {
                    $el=$doc->createElement('p',$p);
                    $title->appendChild($el);
                }
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

			$this->imgnr++;
		} // end for loop for image data

        $root->appendElWithAttsDIV([['class', 'swiper-button-prev']]);
        $root->appendElWithAttsDIV([['class', 'swiper-button-next']]);
        $this->showpagination === true ? $root->appendElWithAttsDIV([['class', 'swiper-pagination']]) : null;

        $comment = $doc->createComment('------- end of swiper ---------');
        $root->appendChild($comment);
        // append the thumbnails at the bottom the main slider
        $doc->appendChild($thumbsWrapper);

        isset($phpimgdata) ? null : $phpimgdata = []; 
        $this->imageDataToPassToJavascript = $phpimgdata;
        $this->sliderHtml = '<div class="fotorama_multi_images">' . rtrim( $doc->saveHTML() ) . '</div>';
    }
}