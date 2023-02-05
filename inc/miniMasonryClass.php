<?php
namespace mvbplugins\fotoramamulti;

/**
 * Class MiniMasonryClass to generate the html for the MiniMasonry Gallery.
 *
 * PHP version 7.3.0 - 8.0.x
 *
 * Summary     Class MiniMasonryClass to generate the html for the MiniMasonry Gallery.
 * Description This Class generates the html for the MiniMasonry Gallery.
 * @author     Martin von Berg <mail@mvb1.de>
 * @copyright  Martin von Berg, 2023
 * @license    https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * @link       https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation
 * @since      0.16.0
 * @version    0.16.0
 */


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
final class MiniMasonryClass
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
        $this->showInfoButton = $this->showInfoButton && $options['addPermalink'] && $options['allImgInWPLibrary'];
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
        $root->setAttribute('id', 'minimasonry' . $this->shortcodecounter);
        $root->setAttribute('class', 'fmmm_container fmmm_container_'  . $this->shortcodecounter);
        //$root->setAttribute('style', 'aspect-ratio:'. $this->options['sw_aspect_ratio']);
        
        foreach ($this->imageData as $data) {
            /*
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
            */
            // set the alt-tag and the title for SEO
			if ( $data['title'] === 'notitle' && $data['type'] === 'image' ) {
				$data['title'] = __('Galeriebild') . ' '. \strval( $this->imgnr );
			} if ( $data['title'] === 'notitle' && $data['type'] === 'video' ) {
                $data['title'] = __('Video') . ' '. \strval( $this->imgnr );
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
            $phpimgdata[$this->imgnr-1]['mime'] = $data['type'] ?? '';
			
			// --------------- Proceed with HTML -------------------
            if ( $data['type']==='image' ) 
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
               
                $slide = $root->appendElWithAttsDIV([['class', 'item']]);
                // get width and height of image. get minrowwidth and calc correct height for image
                //$asp = $data['width'] / $data['height'];
                //$height = intval($this->options['minrowwidth'] / $asp);
                //$slide->setAttribute('style', 'height:'.$height.'px;');

                // create img
                $img = $slide->appendElement('img');
                // add further attributes to img
                $img->setAttribute('loading', 'lazy');
                $img->setAttribute('alt', $alttext);
                $img->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}");
                if ( $data['thumbinsubdir'] ) {
                    //$img2->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$thumbsdir}/{$data['file']}{$data['thumbs']}");
                } elseif ( $data['thumbavail'] ) {
                    $srcset = wp_get_attachment_image_srcset( $data['wpid']);
                    if ( $srcset !== false) $img->setAttribute('srcset', wp_get_attachment_image_srcset( $data['wpid']));
                    // sizes is missing. but not required in examples.
                    //$img2->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['thumbs']}"); 
                } else { 
                    // do not add srcset here, because this else is for folders without thumbnails. If this is the case we don't have image-sizes for the srcset
                    //$img2->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}"); 
                };

                // add the button to open fslightbox TODO as href over image
                // todo add this as href for the item containger. remove button from css then
                if ( $this->fslightbox ) {
                    $lightbox=$slide->appendElement('a');
                    $lightbox->setAttribute('data-fslightbox', 'swiper' . $this->shortcodecounter); // rename this. use for masonry on page
                    $lightbox->setAttribute('data-type','image');
                    $lightbox->setAttribute('data-caption', $alttext);
                    $lightbox->setAttribute('href',"{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}");
                    $lightbox->setAttribute('aria-label','Open fullscreen lightbox with current image');
                    $lbdiv=$lightbox->appendElement('div');
                    $lbdiv->setAttribute('class', 'button-fslightbox');
                }
              
                // update and change Caption. Add to html and array for js-script.
                if ( $this->options['showcaption'] === 'false') {
                    $jscaption = '';
                } else {
                    $title=$slide->appendElWithAttsDIV([['class', 'masonry-title']]);

                    foreach ($caption as $p) {
                        $el=$doc->createElement('p',$p); // todo remove numbering from title
                        $title->appendChild($el);
                    }
                    $el=$doc->createElement('p', $data['datesort']); // todo create nice date format
                    $el->setAttribute('class', 'masonry-date');
                    $title->appendChild($el);
                    
                }
                
            // end HTML for image
            } 
            // ----------- end HTML for one image or video. 
            $phpimgdata[$this->imgnr-1]['jscaption'] = $jscaption ?? '';

			$this->imgnr++;
		} // end for loop for image data

        $comment = $doc->createComment('------- end of masonry gallery ---------');
        $root->appendChild($comment);
        
        isset($phpimgdata) ? null : $phpimgdata = []; 
        $this->imageDataToPassToJavascript = $phpimgdata;
        $this->sliderHtml = rtrim( $doc->saveHTML() );
    }
}