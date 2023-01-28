<?php declare(strict_types = 1);

namespace mvbplugins\fotoramamulti;

/**
 * PHP Class for Wordpress YOAST SEO plugin to append images to the sitemap.
 * The images are added as \<image\> 'under' the post were the fotorama shortcode was added.
 * Optionally the permalink is added instead of the link to the image file.
 * If the shortcode is used more than once on different posts / pages the images are also 
 * added more the once to the sitemap.
 *
 */
class fotoramaSitemaps
{
	protected $thumbs;
	protected $requiregps = true;
	protected $up_url;
	protected $up_dir;
	protected $doSitemap = false;
	protected $addPermalink = false; 
	
	/* for PHP 7.4+
	protected string $thumbs;
	protected string $requiregps;
	protected string $up_url;
	protected string $up_dir;
	protected bool $doSitemap; 
	protected bool $addPermalink = true;
	*/

	/**
	 * fotoramaSitemaps::__construct()
	 */
	function __construct()
	{

		// Get Values from Admin settings page and global Constant
		$fotorama_elevation_options = get_option('fm_common_options');
		$this->doSitemap  = $fotorama_elevation_options['doYoastXmlSitemap_16'] === 'true';
		$this->requiregps = $fotorama_elevation_options['images_with_gps_required_5'] === 'true';
		$this->addPermalink = $fotorama_elevation_options['useCDN_13'] === 'true';
		$this->thumbs = THUMBSDIR;

		// Define path and url variables
		$this->up_url = gpxview_get_upload_dir('baseurl');  // upload_url
		$this->up_dir = wp_get_upload_dir()['basedir'];     // upload_dir

		if ($this->doSitemap)
			add_filter('wpseo_sitemap_urlimages', [$this, 'fm_add_wpseo_xml_sitemap_images'], 10, 2);
	}

	/**
	 * Filter support for WordPress SEO by Yoast 0.4.0 or higher ( http://wordpress.org/extend/plugins/wordpress-seo/ )
	 * Function updated and tested by Martin von Berg, 01/2022 (WP 5.9, PHP 7.3 and 8.0.1)
	 * The function is only executed if Yoast is active and the filter-hook wpseo_sitemap_urlimages is available.
	 * The function is called on the fly when the XML-Sitemap is requested.
	 *
	 * @param array<int, array{src: string, title?: string, alt?: string}> $images images that were already found by yoastXmlSitemap-function
	 * @param int $post_id current postid
	 *
	 * @return array<int, array{src: string, title?: string, alt?: string}> array of arrays of all founded images
	 */
	function fm_add_wpseo_xml_sitemap_images($images, $post_id)
	{

		// first get the content of the post/page.
		$p = get_post($post_id);
		$content = $p->post_content;

		// Search now for fotorama shortcode.
		$has_fotorama = has_shortcode($content, 'gpxview');
		$pattern = "\[\s?gpxview\s.*\]";

		// get all the shortcodes from the content
		if ($has_fotorama) {
			preg_match_all('/' . $pattern . '/i', $content, $matches);
			$all_shortcodes = $matches[0];

			// loop through all shortcodes
			foreach ($all_shortcodes as $shortcode) {

				// extract parameters from shortcode
				$shortcode = \str_replace(']', '', $shortcode);
				$atts = \shortcode_parse_atts(($shortcode));
				if ($atts === '') $atts = [];

				if (array_key_exists('requiregps', $atts)) {
					$reqgps = $atts['requiregps'];
				} else {
					$reqgps = $this->requiregps;
				}

				// only proceed if shortcode contains a path to image files
				if (array_key_exists('imgpath', $atts)) {
					$imgpath = $this->up_dir . '/' . $atts['imgpath'];   // path to the images-url in uploads directory
					$imageurl = $this->up_url . '/' . $atts['imgpath'];  // url to the images-url in uploads directory

					// Loop through all webp- and jpg-files in the given folder, and get the required data
					require_once __DIR__ . '/readImageFolder.php'; 
					$folder = new ReadImageFolder($imgpath, $this->thumbs, $imageurl, $reqgps, 'true');
					$folderImages = $folder->getImagesForGallery();
					$folder = null;

					// loop through all images and append to output array. skip image if already in.
					foreach ($folderImages as $item) {
						
						$newimage = [];
						if ($item['wpid'] > 0 && $this->addPermalink === true) {
							$newimage['src'] = \get_the_permalink( $item['wpid']);
						} else {
							$newimage['src'] = $imageurl . '/' . $item['file'] . $item['extension'];
						}

						if (!empty($item['title'])) {
							$newimage['title'] = strip_tags($item['title']);
						}
						if (!empty($item['alt'])) {
							$newimage['alt'] = strip_tags($item['alt']);
						}

						// append the image only if it is not in the array yet. It is maybe used twice or more on the page.
						$key = array_search($newimage['src'], array_column($images, 'src'));
						if ($key === false) {
							$images[] = $newimage;
						}
					}
				}
			}
		}
		return $images;
	}
}

$fmSitemaps = new fotoramaSitemaps();
