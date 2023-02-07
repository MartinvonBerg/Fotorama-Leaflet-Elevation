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
    protected $fslightbox = false;
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
        $this->fslightbox = $options['sw_fslightbox'] === 'true';
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
     * get all currently image subsizes and return that one that is bigger than width.
     *
     * @param integer $wpid the WordPress ID of the image
     * @param integer $width the minimum width to use return as image
     * @return string the sorted array of available subsizes
     */
    public function get_best_image_subsize( $wpid, $width) {
        $sizes = wp_get_attachment_metadata( $wpid)['sizes'];

        // sort array by weight
        $csort = array_column($sizes, 'width');
        array_multisort($csort, SORT_ASC, $sizes);
        $src = false;
      
        foreach ($sizes as $key => $size) {
            if ($size['width']  > $width) {
                $src = $sizes[$key]['file'];
                break;
            }
        }
        
        return $src;
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
                    $caption = array (0 => $data["title"],
                                    1 => $data['camera'],
                                    2 => $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal']);
                    $jscaption = $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"] . ' || ' . $data['camera'] . ' || ' . $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'] . ' / ' . $data['DateTimeOriginal'];	
                } else {
                    $caption = array( 0 => $data["title"]);
                    $jscaption = $this->imgnr. ' / ' .$this->imageNumber . ': ' . $data["title"];
                };
               
                $slide = $root->appendElWithAttsDIV([['class', 'item']]);

                // wrapper for fslightbox
                if ( $this->fslightbox ) {
                    $lightbox=$slide->appendElement('a');
                    $lightbox->setAttribute('data-fslightbox', 'mmasonry' . $this->shortcodecounter);
                    $lightbox->setAttribute('data-type','image');
                    $lightbox->setAttribute('data-caption', $alttext);
                    $lightbox->setAttribute('href',"{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}");
                    $lightbox->setAttribute('aria-label','Open fullscreen lightbox with current image');
                } else {
                    $lightbox = $slide;
                }
                
                // create img
                $img = $lightbox->appendElement('img');
                // add further attributes to img
                if ( $this->imgnr>1 ) $img->setAttribute('loading', 'lazy');
                $img->setAttribute('alt', $alttext);
                $img->setAttribute('class', 'fmmm-masonry-image');

                if ( $data['thumbinsubdir'] ) {
                    $img->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}");

                } elseif ( $data['thumbavail'] ) {
                    $srcset = $this->get_best_image_subsize( $data['wpid'], 2*$this->options['minrowwidth']);
                    if ( $srcset !== false) {
                        $img->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$srcset}");
                    } else {
                        $img->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}");
                    }

                } else { 
                    // do not add srcset here, because this else is for folders without thumbnails. If this is the case we don't have image-sizes for the srcset
                    $img->setAttribute('src', "{$up_url}/{$this->options['imgpath']}/{$data['file']}{$data['extension']}");
                };

                // update and change Caption. Add Caption and Date to html and array for js-script.
                if ( $this->options['showcaption'] === 'false') {
                    $jscaption = '';
                } else {
                    // show the title
                    $title=$slide->appendElWithAttsDIV([['class', 'masonry-title']]);
                    foreach ($caption as $p) {
                        $el=$doc->createElement('p',$p); 
                        $title->appendChild($el);
                    }
                    // append the date
                    if (\array_key_exists( 'created_timestamp', $data) ) {
                        $el=$doc->createElement('p', wp_date( get_option( 'date_format' ), ( $data['created_timestamp'] ) )); 
                        $el->setAttribute('class', 'masonry-date');
                        $title->appendChild($el);
                    } elseif (\array_key_exists( 'DateTimeOriginal', $data) ) {
                        $el=$doc->createElement('p', $data['DateTimeOriginal'] ); 
                        $el->setAttribute('class', 'masonry-date');
                        $title->appendChild($el);
                    }
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
        $this->imageDataToPassToJavascript = []; //$phpimgdata; is currently unused here
        $this->sliderHtml = rtrim( $doc->saveHTML() );
    }
}