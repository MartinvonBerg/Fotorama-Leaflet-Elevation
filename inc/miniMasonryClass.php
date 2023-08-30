<?php declare(strict_types = 1);
namespace mvbplugins\fotoramamulti;

/**
 * Class MiniMasonryClass to generate the html for the MiniMasonry Gallery.
 *
 * PHP version 7.4 - 8.1.x
 *
 * Summary     Class MiniMasonryClass to generate the html for the MiniMasonry Gallery.
 * Description This Class generates the html for the MiniMasonry Gallery.
 * @author     Martin von Berg <mail@mvb1.de>
 * @copyright  Martin von Berg, 2023
 * @license    https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * @link       https://github.com/MartinvonBerg/Fotorama-Leaflet-Elevation
 * @since      0.16.0
 * @version    0.23.1
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
 * Class MiniMasonryClass to generate the html for the MiniMasonry Gallery.
 */
final class MiniMasonryClass
{
    // PHP 7.4 version
    protected string $sliderHtml = '';
    protected int $imgnr = 0;
    protected int $shortcodecounter = 0;
    protected array $imageData = [];
    protected int $imageNumber = 0;
    protected array $imageDataToPassToJavascript = [];
    protected bool $fslightbox = false;
    protected array $options = [];
    public string $googleAPIkey = ''; //google key as admin setting. No shortcode
    protected string $dialogHeader = 'h5'; //header as admin setting. shortcode

    /**
     * constructor function for the class to do the initialization settings.
     *
     * @param  integer $shortcodecounter The static number of shortcodes on the page / post.
     * @param  array   $imageData The array with all required imageData.
     * @param  array  $options the options for the html code generation.
     */
    public function __construct( int $shortcodecounter=0, array $imageData=[], array $options = [])
    {
        $this->shortcodecounter = $shortcodecounter;
        $this->imgnr = 1;
        $this->imageData = $imageData;
        $this->imageNumber = count($this->imageData);
        // set the options from shortcode or admin setting
        $this->options = $options;
        $this->fslightbox = $options['mm_fslightbox'] === 'true';
        $this->dialogHeader = $options['mm_dialogHeader'];
    }

    /**
     * Get the generated HTML and pass it to the caller.
     *
     * @param  array $attributes All attributes passed from the shortcode.
     * @return string The generated html code as string.
     */
    public function getSliderHtml() : string
    {
        $this->generateDomHtml();
        return $this->sliderHtml;
    }

    /**
     * Get the number of images that are in the slider.
     *
     * @return integer The number of images that are in the slider.
     */
    public function getNumberImagesInHtml() : int
    {
        return $this->imgnr;
    }

    /**
     * Get the array with all imageData required for further processing.
     *
     * @return array the array with all imageData required for further processing.
     */
    public function getImageDataForJS () : array
    {
        return $this->imageDataToPassToJavascript;
    }

    /**
     * get all currently image subsizes and return that one that is bigger than width.
     *
     * @param integer $wpid the WordPress ID of the image
     * @param integer $width the minimum width to use return as image
     * @return string the sorted array of available subsizes
     */
    public function get_best_image_subsize( int $wpid, int $width) : string
    {
        $src = '';
        $sizes = wp_get_attachment_metadata( $wpid);
        
        if (( $sizes === null) || ($sizes === false)) {
            return $src;
        } else {
            $sizes = $sizes['sizes'];
        }

        // sort array by weight
        $csort = array_column($sizes, 'width');
        array_multisort($csort, SORT_ASC, $sizes);
        $src = '';
      
        foreach ($sizes as $key => $size) {
            if ($size['width']  > $width) {
                $src = $sizes[$key]['file'];
                break;
            }
        }
        return $src;
    }

    /**
     * Generate the HTML code for the masonry gallery based on DOMClass and on options.
     * used parameters: 
     *  general: shortcaption, showcaption, minrowwidth, imgpath, JS: background, 
     *  minimasonry : mm_fslightbox
     *
     * @return void no return value: just set the class attributes as result.
     */
    private function generateDomHtml() : void
    {
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
			$phpimgdata[$this->imgnr-1]['coord'][0] = (is_float($data['lat']) || is_int($data['lat'])) ? round( $data['lat'], 6 ) : null;
			$phpimgdata[$this->imgnr-1]['coord'][1] = (is_float($data['lon']) || is_int($data['lon'])) ? round( $data['lon'], 6 ) : null;
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
                    if ( $srcset !== '') {
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
                    $title=$slide->appendElWithAttsDIV([['class', 'masonry-caption']]);

                    // append the title
                    $p = $data["title"];
                    $el=$doc->createElement('p',$p); 
                    $el->setAttribute('class', 'masonry-title');
                    $title->appendChild($el);
                    
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
                    
                    // Modal content
                    $mod=$doc->createElement('dialog', $p);
                    $mod->setAttribute('class','modal-dialog');
                    $mod->setAttribute('id','dialog'. $this->imgnr);

                    $span=$doc->createElement('button', 'X');
                    $span->setAttribute('class', 'masonry-dialog-close');
                    $mod->appendChild($span);

                    $meta=$doc->createElement($this->dialogHeader, __('Details'));
                    $mod->appendChild($meta);

                    $caption = array (0 => $data['camera'],
                                1 => $data['focal_length_in_35mm'] . 'mm / f/' . $data['aperture'] . ' / ' . $data['exposure_time'] . 's / ISO' . $data['iso'],
                                2 => $data['DateTimeOriginal']);

                    foreach ($caption as $p) {
                        $subel=$doc->createElement('p',$p); 
                        $mod->appendChild($subel);
                    }

                    // GPS coords (won't work on localhost)
                    if (\key_exists('lat', $data) && \key_exists('lon', $data)) {
                        $geo = number_format($data['lat'], 4, '.', '') . ',' . number_format($data['lon'], 4, '.', '');
                        $key = $this->googleAPIkey; 
                        $geotitle=$doc->createElement($this->dialogHeader,__('Standort'));
                        $mod->appendChild($geotitle);

                        if ($geo !== '0.0000,0.0000' && $key !== '') { 
                            $subgeo=$doc->createElement('a');
                            $subgeo->setAttribute('href', 'https://www.google.com/maps/place/' . $geo );
                            $subgeo->setAttribute('target', '_blank');
                            $subgeo->setAttribute('rel','noopener');
                            $geoimg=$doc->createElement('img');
                            $geoimg->setAttribute('class', 'noLazy');
                            $geoimg->setAttribute('src', "https://maps.googleapis.com/maps/api/staticmap?key=".$key."&size=320x240&zoom=10&scale=2&maptype=roadmap&markers=".$geo );
                            $geoimg->setAttribute('alt', '');
                            $geoimg->setAttribute('width', '320');
                            $geoimg->setAttribute('height', '240');

                            $subgeo->appendChild($geoimg);
                            $mod->appendChild($subgeo);
                        } else {
                            $subgeo=$doc->createElement('div','No GPX-Data or empty Google-API-Key');
                            $mod->appendChild($subgeo);
                        } 
                    }

                    // tags
                    // get the tags and add the link to the tag if available
                    //$tags = implode(', ', $data['keywords']);
                    $tags = '';
                    if (key_exists('keywords', $data)){
                        foreach ($data['keywords'] as $tagname) {
                            $tag = get_term_by('name', $tagname, 'post_tag');
                            if ( $tag != false) {
                                $taglink = get_term_link($tag->term_id);
                                $tags .= '<a href="' . $taglink . '">' . $tagname .' </a>';
                            } else {
                                $tags .= $tagname . ' ';
                            }	
                        }
                    }

                    if ( $tags !== '' ) {
                        $subtags=$doc->createElement('div');
                        $tagstitle=$doc->createElement($this->dialogHeader,__('Stichwörter'));
                        $subtags->appendChild($tagstitle);
                        $template = $doc->createDocumentFragment();
                        //$tags = \esc_html($tags);
                        $template->appendXML($tags);
                        $subtags->appendChild($template);
                        $mod->appendChild($subtags);
                    }

                    $but=$doc->createElement('button', 'info' ); 
                    $but->setAttribute('class', 'masonry-dialog-open');
                    $but->setAttribute('id', 'popup'. $this->imgnr);
                    
                    $title->appendChild($but);
                    $title->appendChild($mod);

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