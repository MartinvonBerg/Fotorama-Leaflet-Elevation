<?php

/**
 * Class SwiperClass to generate the html for the swiper slider.
 *
 * PHP version 7.3.0 - 8.0.x
 *
 * Summary     Class SwiperClass to generate the html for the swiper slider.
 * Description This Class generates the html for the Swiper slider.
 * @author     Martin von Berg <mail@mvb1.de>
 * @copyright  Martin von Berg, 2022
 * @license    https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * @link       https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation
 * @since      0.12.0
 * @version    0.12.0
 */

// TODO: fslightbox steuert im Vollbild auch den Swiper an?
// TODO: mehrere Videoquellen berücksichtigen für media größen? 
// TODO: slider overlay mit file info?
// webpack environment umschaltung: geht nicht import muss auf top-level sein, daher nicht in if-else-
// TODO: testen auf local WP 6.0 und bei webgo 
// TODO: Demo Seite für Video erstellen
// TODO: doku machen und release machen
//

namespace mvbplugins\fotoramamulti;

use DOMDocument;

/**
 * Class to ease the generation of DOM Elements in HTML.
 * Provides a function to append an Element and 
 * a function to generate a <DIV>-Tag with attributes from an array.
 */
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

/**
 * Class to ease the generation of DOM Elements in HTML.
 * Provides a funtion to ses the root of the DOM.
 */
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
    protected $showpagination = false;
    protected $fslightbox = true;
    protected $zoom = true;
    protected $effect = 'slide';
    protected $showInfoButton = true;
    protected $options = [];

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
    protected boolean $showInfoButton = true;
    protected array $options = [];
    */

    /**
     * constructor function for the class to do the initialization settings.
     *
     * @param  integer $shortcodecounter The static number of shortcodes on the page / post.
     * @param  array   $imageData The array with all required imageData.
     * @param  array  $options the options for the swiper slider.
     */
    public function __construct( int $shortcodecounter=0, array $imageData=[], array $options = [])
    {
        $this->shortcodecounter = $shortcodecounter;
        $this->imgnr = 1;
        $this->imageData = $imageData;
        $this->imageNumber = count($this->imageData);
        // set the options from shortcode or admin setting
        $this->options = $options;
        $this->showpagination = $options['sw_pagination'] === 'true';
        $this->fslightbox = $options['sw_fslightbox'] === 'true';
        $this->zoom = $options['sw_zoom'] === 'true';
        $this->effect = $options['sw_effect'];
        $this->showInfoButton = $this->showInfoButton && $options['addPermalink'] && $options['allImgInWPLibrary'];

        // change swiper settings for certain cases. Because cube does not work with this settings.
        if ( $this->effect === 'cube') {
            $this->zoom = false;
            $this->showInfoButton = false;
            $this->showpagination = false;
            $this->fslightbox = false;
        }

    }

    /**
     * Get the generated HTML and pass it to the caller.
     *
     * @param  array $attributes All attributes passed from the shortcode.
     * @return string The generated html code as string.
     */
    public function getSliderHtml()
    {
        $this->generateDomHtml();
        return $this->sliderHtml;
    }

    /**
     * Get the number of images that are in the slider.
     *
     * @return integer The number of images that are in the slider.
     */
    public function getNumberImagesInHtml()
    {
        return $this->imgnr;
    }

    /**
     * Get the array with all imageData required for further processing.
     *
     * @return array the array with all imageData required for further processing.
     */
    public function getImageDataForJS () {
        return $this->imageDataToPassToJavascript;
    }

    /**
     * get the mime type from file extension.
     *
     * @param  string $ext file extension as 'jpg' or '.jpg'
     * @return false | string the mime type as string or false if not found.
     */
    private function mime_type( string $ext) {
        $ext = \str_replace('.','',$ext);
        $mime_types = array(
           
           // images
           'jpe' => 'image/jpeg',
           'jpeg' => 'image/jpeg',
           'jpg' => 'image/jpeg',
           'webp' => 'image/webp',
       
           // video
           'm4v' => 'video/x-m4v',
           'mp4' => 'video/mp4',
           'webm' => 'video/webm',
           'flv' => 'video/x-flv',
           'wmv' => 'video/x-ms-vmv',
           'ogv' => 'video/ogg',
           'mpeg' => 'video/mpeg',
           'mpg' => 'video/mpeg',
           'mpe' => 'video/mpeg',
        );
      
        $ext = strtolower($ext);
       
        if (array_key_exists($ext, $mime_types)) {
          return (is_array($mime_types[$ext])) ? $mime_types[$ext][0] : $mime_types[$ext];
        } else {
            return false;
        }
    }

    /**
     * get the first part of the mime type from file extension.
     *
     * @param  string $ext file extension as 'jpg' or '.jpg'
     * @return false | string the first part of the mime type as string or false if not found.
     */
    private function getMimeType ( string $ext ) {
        $ext = \str_replace('.','',$ext);
        $mime = $this->mime_type($ext);

        if ( $mime !== false) {
            $mime = explode('/',$mime)[0];
            return $mime;
        } 
        return false;
        /*
        if ( ($ext === 'jpg') || ($ext === 'jpeg') || ($ext === 'webp') ) 
        { 
            return 'image'; 
        }
        else if (($ext === 'mp4') || ($ext === 'm4v') || ($ext === 'webm') || ($ext === 'ogv') || ($ext === 'wmv') || ($ext === 'flv')) 
        { 
            return 'video';
        }
        else return false;
        */
    }

    /**
     * Generate the HTML as DOMElements for the Video Slide
     *
     * @param  DOMDocument $doc the overall DOMDocument 
     * @param  array       $data the video and poster data
     * @param  string      $up_url upload URL
     * @param  string      $thumbsdir directory with thumbnails
     * @return [DOMElement, DOMElement]
     */
    private function genVideoSlide ( DOMDocument $doc, array $data, string $up_url, string $thumbsdir) {
        
        // video slide  
        $videoSlide = $doc->createElement('div','');
        $videoSlide->setAttribute('class', 'swiper-slide');
        $this->options['sw_hashnavigation']==='true' ? $videoSlide->setAttribute('data-hash', 'swiper' . $this->shortcodecounter . '/'. $data['file']) : null;
        $video = $doc->createElement('video','Your browser does not support the video tag.');
        $video->setAttribute('class', 'swiper-lazy');
        $video->setAttribute('controls',''); 
        $video->setAttribute('controlsList','nodownload');
        $video->setAttribute('oncontextmenu','return false');
        //$video->setAttribute('title', $data['title']);
        if (key_exists('poster', $data)) {
            $video->setAttribute('preload','none'); 
            $video->setAttribute('poster', "{$up_url}/{$this->options['imgpath']}/{$data['poster']}"); 
        } else {
            $video->setAttribute('preload','auto'); 
        }

        // generate and add the source element with the video
        $videoSource =$doc->createElement('source','');
        $videoSource->setAttribute('type', $this->mime_type( $data['extension'])); // imageData
        $videoSource->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}");
        $video->appendChild($videoSource);
        $videoSlide->appendChild($video);

        //thumbnail
        $thumbEl = $doc->createElement('div','');
        $thumbEl->setAttribute('class', 'swiper-slide');
        $thumbEl->setAttribute('title', $data['title']);
        $thumbEl->setAttribute('style', 'height:'. $this->options['f_thumbheight'].'px');
        //$thumbEl->setAttribute('style', 'width:'. $this->options['f_thumbwidth'].'px');

        // create and append the img2 to thumbnail
        if ( $data['thumbinsubdir'] ) {
            $img2 = $doc->createElement('img','');
            $img2->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$thumbsdir}/{$data['file']}{$data['thumbs']}");

        } elseif ( $data['thumbavail'] ) {
            $img2 = $doc->createElement('img','');
            $img2->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['thumbs']}"); 

        } elseif (\key_exists('poster', $data) ) {
            // use the poster as thumbnail
            $img2 = $doc->createElement('img','');
            $img2->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['poster']}");

        } else { 
            // do not use video as thumbnail
            $img2 = $doc->createElement('div','No Thumbnail');
        };

        $img2->setAttribute('alt','Thumbnail for image slider operation');
        $thumbEl->appendChild($img2);

        return [$videoSlide, $thumbEl];
    }

    /**
     * Generate the HTML code for the swiper based on DOMClass and on options.
     *
     * @return void no return value: just set the class attributes as result.
     */
    private function generateDomHtml() {
        // Define path and url variables
	    $up_url = gpxview_get_upload_dir('baseurl');  // upload_url
	    $up_dir = wp_get_upload_dir()['basedir'];     // upload_dir
        $thumbsdir = THUMBSDIR; // we use a fixed name for the subdir containing the thumbnails
        
        // generate the html string to show on page
        $doc = new myDocument();
        $doc->registerNodeClass('DOMElement', 'mvbplugins\fotoramamulti\myElement');

        // create root div
        $root = $doc->setRoot('div');
        $root->setAttribute('id', 'swiper' . $this->shortcodecounter);
        $root->setAttribute('class', 'swiper myswiper');
        $root->setAttribute('style', 'aspect-ratio:'. $this->options['sw_aspect_ratio']);
        
        // create first level child divs with classes
        $wrapper = $root->appendElWithAttsDIV([['class', 'swiper-wrapper']]);

        // create wrapper for thumbnails
        $thumbsWrapper = $doc->createElement('div','');
        $thumbsWrapper->setAttribute('thumbsSlider', '');
        $thumbsWrapper->setAttribute('id', 'thumbsSwiper' . $this->shortcodecounter);
        $thumbsWrapper->setAttribute('class', 'swiper myswiper2');
        $inner1 = $doc->createElement('div');
        $inner1->setAttribute('class', 'swiper-wrapper');
        $thumbsWrapper->appendChild($inner1);

        foreach ($this->imageData as $data) {

            if ( $this->imgnr===1 && $this->shortcodecounter===0 && \current_user_can('edit_posts') ) {
                // generate the srcset and write to a custom field
                $postid = \get_the_ID();
                \delete_post_meta($postid, 'fm_header_link');

                if ( $data['wpid']>0 ) {
                    $srcset = wp_get_attachment_image_srcset($data['wpid']);
                    if ( $srcset !== false) {
                        $hrefsrc = "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}";
                        $args = '<link rel="preload" as="image" href="' . $hrefsrc . '" imagesrcset="' . $srcset . '" ';
                        update_post_meta( $postid,'fm_header_link', $args);
                    }
                }
            }

            // set the alt-tag and the title for SEO
			if ( 'notitle' === $data['title'] ) {
				$data['title'] = __('Galeriebild') . ' '. \strval( $this->imgnr );
			}
			$alttext = $data['alt'] !== '' ? $data['alt'] : $data['title'];

			// get the image srcset if the image is in WP-Media-Catalog, otherwise not. in: $data, 
			// Code-Example with thumbs with image srcset (https://github.com/artpolikarpov/fotorama/pull/337)
            // $up_url, $up_dir, $thumbsdir
            // Mind: the srcset for video is wrong. It contains the video as image with big-image-size. But is not used for Video.
			$phpimgdata[] = getSrcset( $data, $up_url, $up_dir, $this->options['imgpath'], $thumbsdir );
			$phpimgdata[$this->imgnr-1]['id'] = $this->imgnr;
			$phpimgdata[$this->imgnr-1]['title'] = $alttext; 
			$phpimgdata[$this->imgnr-1]['coord'][0] = round( $data['lat'], 6 );
			$phpimgdata[$this->imgnr-1]['coord'][1] = round( $data['lon'], 6 );
			$phpimgdata[$this->imgnr-1]['permalink'] = $data['permalink'] ?? '';
			
			// --------------- Proceed with HTML -------------------
            if ( $this->getMimeType($data['extension'])==='image' ) 
            {
                // generate the caption for html and javascript
                if ( $this->options['shortcaption'] === 'false') {
                    //$caption = 'data-caption="' .$this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . ' </br> ' . $data['camera'] . ' </br> ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'] . '"';
                    $caption = array (0 => $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"],
                                    1 => $data['camera'],
                                    2 => $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal']);
                    $jscaption = $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . ' || ' . $data['camera'] . ' || ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'];	
                } else {
                    $caption = array( 0 => $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"]);
                    $jscaption = $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"];
                };

                if ( $this->options['sw_hashnavigation']==='true') {
                    $slide= $wrapper->appendElWithAttsDIV([['class', 'swiper-slide'], 
                                                        ['data-hash', 'swiper' . $this->shortcodecounter . '/'.$data['file']]]); // Is it better to use the title? But filename is always given. Title not.
                } else {
                    $slide= $wrapper->appendElWithAttsDIV([['class', 'swiper-slide']]);
                }
                
                $this->zoom ? $zoom=$slide->appendElWithAttsDIV([['class', 'swiper-zoom-container']]) : $zoom=$slide;

                // create thumbnail slide
                $thumbsSlide = $doc->createElement('div','');
                $thumbsSlide->setAttribute('class', 'swiper-slide');
                $thumbsSlide->setAttribute('style', 'height:'. $this->options['f_thumbheight'].'px');
                //$thumbsSlide->setAttribute('style', 'width:'. $this->options['f_thumbwidth'].'px');
                $inner1->appendChild($thumbsSlide);

                // img and a href
                $img=$zoom->appendElement('img');
                // add further attributes to img
                //$img->setAttribute('loading', 'lazy');
                $img->setAttribute('class', 'swiper-lazy');
                $img->setAttribute('alt', $alttext);
                $img->setAttribute('data-src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}");

                // append the img to thumbnail
                $img2 = $doc->createElement('img','');
                //$img->setAttribute('loading', 'lazy');
                //$img->setAttribute('class', 'swiper-lazy');

                if ( $data['thumbinsubdir'] ) {
                    $img2->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$thumbsdir}/{$data['file']}{$data['thumbs']}");
                } elseif ( $data['thumbavail'] ) {
                    $img->setAttribute('data-srcset', wp_get_attachment_image_srcset( $data['wpid']));
                    // sizes is missing. but not required in examples.
                    $img2->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['thumbs']}"); 
                } else { 
                    // do not add srcset here, because this else is for folders without thumbnails. If this is the case we don't have image-sizes for the srcset
                    $img2->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}"); 
                };

                $img2->setAttribute('alt','Thumbnail for image slider operation');
                $thumbsSlide->appendChild($img2);

                // add the button to open fslightbox
                if ( $this->fslightbox ) {
                    $lightbox=$slide->appendElement('a');
                    $lightbox->setAttribute('data-fslightbox','1');
                    $lightbox->setAttribute('data-type','image');
                    $lightbox->setAttribute('data-caption', $alttext);
                    $lightbox->setAttribute('href',"{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}");
                    $lightbox->setAttribute('aria-label','Open fullscreen lightbox with current image');
                    $lbdiv=$lightbox->appendElement('div');
                    $lbdiv->setAttribute('class', 'button-fslightbox');
                }
                
                // Ergänze den info button links oben. Position und styling mit Css
                if ( $this->showInfoButton ){ 
                    $info=$slide->appendElWithAttsDIV([['class', 'swiper-attach-link']]);
                    $infoChildA = $info->appendElement('a');
                    $infoChildA->setAttribute('href', $data['permalink']); 
                    $infoChildA->setAttribute('aria-label','Open page with image details');
                    $infoChildA->setAttribute('target', "_blank");
                    $infoChildA->appendElWithAttsDIV([['class', 'fm-itemsButtons'],['type', 'info']]);
                }
                
                // update and change Caption. Add to html and array for js-script.
                if ( $this->options['showcaption'] === 'false') {
                    $jscaption = '';
                } else {
                    $title=$slide->appendElWithAttsDIV([['class', 'swiper-slide-title']]);
                    foreach ($caption as $p) {
                        $el=$doc->createElement('p',$p);
                        $title->appendChild($el);
                    }
                }
            // end HTML for image
            } else if ($this->getMimeType($data['extension'])==='video') {
                [$vid, $thumb] = $this->genVideoSlide($doc, $data, $up_url, $thumbsdir);
                $wrapper->appendChild($vid);
                $inner1->appendChild($thumb);
            }
            // ----------- end HTML for one image or video. 
            $phpimgdata[$this->imgnr-1]['jscaption'] = $jscaption ?? '';

			$this->imgnr++;
		} // end for loop for image data

        $root->appendElWithAttsDIV([['class', 'swiper-button-prev']]);
        $root->appendElWithAttsDIV([['class', 'swiper-button-next']]);
        // append the thumbnails at the bottom OR the pagination. Both is useless.
        $this->showpagination ? $root->appendElWithAttsDIV([['class', 'swiper-pagination']]) : $doc->appendChild($thumbsWrapper);;

        $comment = $doc->createComment('------- end of swiper ---------');
        $root->appendChild($comment);
        
        isset($phpimgdata) ? null : $phpimgdata = []; 
        $this->imageDataToPassToJavascript = $phpimgdata;
        $this->sliderHtml = '<div class="fotorama_multi_images">' . rtrim( $doc->saveHTML() ) . '</div>';
    }
}