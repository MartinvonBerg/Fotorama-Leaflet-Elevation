<?php
use PHPUnit\Framework\TestCase;
use function Brain\Monkey\setUp;
use function Brain\Monkey\tearDown;
use function Brain\Monkey\Functions\when;
use function Brain\Monkey\Functions\expect;
use function Brain\Monkey\Actions\expectDone;
use function Brain\Monkey\Filters\expectApplied;
use Brain\Monkey;
use Brain\Monkey\Functions;

final class SwiperClassTest extends TestCase {

    public function setUp(): void 
    {
		parent::setUp();
		setUp(); 

        $data = array (
            "gpxpath" => "gpx",
            "gpxfile" => "test.gpx",
            "mapheight" => "1000",
            "mapaspect" => "1.5",
            "chartheight" => "200",
            "imgpath" => "Galleries",
            "dload" => "true",
            "alttext" => "Fotorama Slider mit Karte",
            "ignoresort" => "false",
            "showadress" => "true",
            "showmap" => "true",
            "adresstext" => "Start address",
            "requiregps" => "false",
            "maxwidth" => "1500",
            "minrowwidth" => "400",
            "showcaption" => "true",
            "eletheme" => "martin-theme",
            "showalltracks" => "false",
            "mapcenter" => "0.0, 0.0",
            "zoom" => 8,
            "markertext" => "Home address",
            "fit" => "scaledown",
            "ratio" => "1.5",
            "background" => "darkgrey",
            "navposition" => "bottom",
            "navwidth" => "100",
            "f_thumbwidth" => "100",
            "f_thumbheight" => "67",
            "thumbmargin" => "2",
            "thumbborderwidth" => "2",
            "thumbbordercolor" => "blue",
            "transition" => "dissolve",
            "transitionduration" => "400",
            "loop" => "true",
            "autoplay" => "false",
            "arrows" => "always",
            "shadows" => "false",
            "shortcaption" => "true",
            "mapselector" => "OpenStreetMap",
            "useCDN_13" => "false"
        );

        expect( 'get_option')
            //->once()
            ->zeroOrMoreTimes()
            ->with('fotorama_elevation_option_name')
            ->andReturn( $data );

        expect( 'shortcode_atts')
            ->andReturn( $data );
        
        include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\fm_functions.php';
        include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\swiperClass.php';
	}

	public function tearDown(): void 
    {
		tearDown();
		parent::tearDown();
	}

    public function testSwiperClassLoad() 
    {          
        $tested = new mvbplugins\fotoramamulti\SwiperClass(0, [], false);
       
        expect('gpxview_get_upload_dir')
            -> andReturn('gpx');
        expect('wp_get_upload_dir')
            -> andReturn( ['basedir' => 'upload', 'baseurl' => 'wp-content/upload']);
        expect('shortcode_atts')
            -> andReturn( ['basedir' => 'upload']);

        $r2 = '<div id="swiper0" class="swiper myswiper"><div class="swiper-wrapper"></div><div class="swiper-button-prev"></div><div class="swiper-button-next"></div><div class="swiper-pagination"></div><!--------- end of swiper -----------></div>';
        
        $html=$tested->getSliderHtml([]);
        $this->assertEquals($html, $r2);

        // print the result to console
        $h2 = $this->tidyHTML(PHP_EOL . $html . PHP_EOL);
        echo PHP_EOL;
        echo $h2;
    }

    public function testSwiperClassOneImage() 
    {          
        $data2 = [];
        $data2[0]['id'] = 0;
        $data2[0]['lat'] = 12;
        $data2[0]['lon'] = 48;
        $data2[0]['file'] = 'testfile';
        $data2[0]['wpid'] = 9999;
        $data2[0]['thumbavail'] = false;
        $data2[0]['thumbinsubdir'] = false;
        $data2[0]['thumbs'] = '';
        $data2[0]['extension'] = '.jpg';
        $data2[0]['permalink'] = '';
        $data2[0]['title'] = 'notitle';
        $data2[0]['alt'] = ''; 
        $data2[0]['type'] = 'image'; 

        $sw_options = [ 'addPermalink' => 'false',
                        'allImgInWPLibrary' => 'false',
                        'sw_effect'			=> 'flip',
                        'sw_zoom'			=> 'true',
                        'sw_fslightbox'		=> 'true',
                        'sw_pagination'		=> 'false',
                        'sw_slides_per_view' => 6,
                        'sw_transition_duration'=> 300,
                        'sw_mousewheel'		=> 'true',
                        'sw_hashnavigation'  => 'true',
                        'sw_max_zoom_ratio'	=> 3,
                        'showcaption'		=> 'true',
                        'shortcaption'		=> 'true',
                        'imgpath'			=> 'test_imgpath',
                        'f_thumbheight'		=> 100,
                        'sw_aspect_ratio'	=> 1.5,
                        'slide_fit'			=> 'contain',
                        'thumbbartype'		=> 'special', ];

        $tested = new mvbplugins\fotoramamulti\SwiperClass(0, $data2, $sw_options);
       
        expect('gpxview_get_upload_dir')
            -> andReturn('gpx');
        expect('wp_get_upload_dir')
            -> andReturn( ['basedir' => 'upload', 'baseurl' => 'wp-content/upload']);
        
        Functions\when('is_ssl')->justReturn(true);
        Functions\when('__')->returnArg();
        Functions\when('current_user_can')->justReturn(false);
        Functions\when('wp_get_attachment_image_srcset')->justReturn(false);
       
        //$r2 = '<div id="swiper0" class="swiper myswiper"><div class="swiper-wrapper"><div class="swiper-slide"><img loading="lazy" class="swiper-lazy" alt="Galeriebild 1" src="wp-content/upload/Galleries/testfile.jpg"><div class="swiper-slide-title">1 / 1: Galeriebild 1</div></div></div><div class="swiper-button-prev"></div><div class="swiper-button-next"></div><div class="swiper-pagination"></div><!--------- end of swiper -----------></div>';
        $r2 = '<div class="fotorama_multi_images"><div id="swiper0" class="swiper myswiper" style="aspect-ratio:1.5"><div class="swiper-wrapper"><div class="swiper-slide" data-hash="swiper0/testfile"><div class="swiper-zoom-container"><img class="swiper-lazy" alt="Galeriebild 1" object-fit="contain" data-src="wp-content/upload/test_imgpath/testfile.jpg"></div><a data-fslightbox="swiper0" data-type="image" data-caption="Galeriebild 1" href="wp-content/upload/test_imgpath/testfile.jpg" aria-label="Open fullscreen lightbox with current image"><div class="button-fslightbox"></div></a><div class="swiper-attach-link"><a href="" aria-label="Open page with image details" target="_blank"><div class="fm-itemsButtons" type="info"></div></a></div><div class="swiper-slide-title"><p>1 / 1: Galeriebild 1</p></div></div></div><div class="swiper-button-prev"></div><div class="swiper-button-next"></div><!--------- end of swiper -----------></div><div thumbsSlider="" id="thumbsSwiper0" class="swiper myswiper2"><div class="swiper-wrapper"><div class="swiper-slide"><img src="wp-content/upload/test_imgpath/testfile.jpg" alt="Thumbnail for image slider operation"></div></div></div></div>';
        
        $html=$tested->getSliderHtml( [] );
        //$this->assertEquals($html, $r2);

        // print the result to console
        $h2 = $this->tidyHTML(PHP_EOL . $html . PHP_EOL);
        echo PHP_EOL;
        echo $h2;
    }

    public function testSwiperClassOneVideo() 
    {          
        $data2 = [];
        $data2[0]['id'] = 0;
        $data2[0]['lat'] = 12;
        $data2[0]['lon'] = 48;
        $data2[0]['file'] = 'testvideo';
        $data2[0]['wpid'] = 9999;
        $data2[0]['thumbavail'] = false;
        $data2[0]['thumbinsubdir'] = false;
        $data2[0]['thumbs'] = '';
        $data2[0]['extension'] = '.wmv';
        $data2[0]['permalink'] = '';
        $data2[0]['title'] = 'video_title';
        $data2[0]['alt'] = 'pretty nice video'; 
        $data2[0]['type'] = 'video';

        $sw_options = [ 'addPermalink' => 'false',
                        'allImgInWPLibrary' => 'false',
                        'sw_effect'			=> 'flip',
                        'sw_zoom'			=> 'true',
                        'sw_fslightbox'		=> 'true',
                        'sw_pagination'		=> 'false',
                        'sw_slides_per_view' => 6,
                        'sw_transition_duration'=> 300,
                        'sw_mousewheel'		=> 'true',
                        'sw_hashnavigation'  => 'false',
                        'sw_max_zoom_ratio'	=> 3,
                        'showcaption'		=> 'true',
                        'shortcaption'		=> 'true',
                        'imgpath'			=> 'test_imgpath',
                        'f_thumbheight'		=> 100,
                        'sw_aspect_ratio'	=> 1.5,
                        'thumbbartype'			=> 'special', ];

        $tested = new mvbplugins\fotoramamulti\SwiperClass(0, $data2, $sw_options);
       
        expect('gpxview_get_upload_dir')
            -> andReturn('gpx');
        expect('wp_get_upload_dir')
            -> andReturn( ['basedir' => 'upload', 'baseurl' => 'wp-content/upload']);
        
        Functions\when('is_ssl')->justReturn(true);
        Functions\when('__')->returnArg();
        Functions\when('current_user_can')->justReturn(false);
        Functions\when('wp_get_attachment_image_srcset')->justReturn(false);
       
        //$r2 = '<div id="swiper0" class="swiper myswiper"><div class="swiper-wrapper"><div class="swiper-slide"><img loading="lazy" class="swiper-lazy" alt="Galeriebild 1" src="wp-content/upload/Galleries/testfile.jpg"><div class="swiper-slide-title">1 / 1: Galeriebild 1</div></div></div><div class="swiper-button-prev"></div><div class="swiper-button-next"></div><div class="swiper-pagination"></div><!--------- end of swiper -----------></div>';
        $r2 = '<div class="fotorama_multi_images"><div id="swiper0" class="swiper myswiper" style="aspect-ratio:1.5"><div class="swiper-wrapper"><div class="swiper-slide"><video class="swiper-lazy" controls="" controlsList="nodownload" oncontextmenu="return false" preload="auto">Your browser does not support the video tag.<source type="video/x-ms-vmv" src="wp-content/upload/test_imgpath/testvideo.wmv"></source></video><a data-fslightbox="swiper0" data-type="video" href="wp-content/upload/test_imgpath/testvideo.wmv" aria-label="Open fullscreen lightbox with current image"><div class="button-fslightbox"></div></a><div class="swiper-video-caption">video_title</div></div></div><div class="swiper-button-prev"></div><div class="swiper-button-next"></div><!--------- end of swiper -----------></div><div thumbsSlider="" id="thumbsSwiper0" class="swiper myswiper2"><div class="swiper-wrapper"><div class="swiper-slide" title="video_title"><div alt="Thumbnail for image slider operation">No Thumbnail</div></div></div></div></div>';
        
        $html=$tested->getSliderHtml( [] );
        $this->assertEquals($html, $r2);

        // print the result to console
        $h2 = $this->tidyHTML(PHP_EOL . $html . PHP_EOL);
        echo PHP_EOL;
        echo $h2;
    }

    public function tidyHTML($buffer) {
        // load our document into a DOM object
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        // we want nice output
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;
        $dom->loadHTML($buffer);
        libxml_clear_errors();
        return($dom->saveHTML());
    }
}