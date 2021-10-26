<?php

namespace mvbplugins\fotoramamulti;

/**
 * Retrieve images from the custom field 'postimg' and add them to the yoastXmlSitemap.
 * The function is only executed if Yoast is active and the filter-hook wpseo_sitemap_urlimages is available.
 * The function is called on the fly when the XML-Sitemap is requested.
 * In other cases it is useless, e.g. not executed.
 * Source: http://hookr.io/filters/wpseo_sitemap_urlimages/
 *
 * @param array $images images that were already found by yoastXmlSitemap-function
 * @param int $post_id current postid
 * @return array $images the images from the custom field 'postimg'
 */
function filter_wpseo_sitemap_urlimages( $images, $post_id ) { 
	// TODO: update this
	//$postimages  = array('src' => 'https://127.0.0.1/wordpress/wp-content/uploads/Alben_Website/Rettenstein/Kitzb_Alpen_2018-5.jpg', 
	//				       'title' => 'Test-Bild', 
	//				       'alt' => 'bild mit nix drin', ); 
	//$isyoastseo = is_plugin_active('wordpress-seo/index.php'); // works only if admin is logged in!
	$myimgfrompost = get_post_meta($post_id,'postimg'); // read array with post_images from custom-field of post
	
	if ( ! empty($myimgfrompost) ) {
		$test = $myimgfrompost[0]; // we need only the first index
		$postimages = maybe_unserialize($test);	// type conversion to array
		
		if ( 'array' == gettype( $postimages) || 'object' == gettype( $postimages) ) {
			foreach ($postimages as $singleimg) {
				if ( empty( $singleimg['title'] ) ) {
					$singleimg['title'] = $singleimg['alt'];
				}
				elseif ( empty( $singleimg['alt'] ) ) {
					$singleimg['alt'] = $singleimg['title'];
				}
				$images[] = $singleimg; // write image to XML-Sitemap TODO: add title if empty, or vice versa
			}			
		}
	}
	return $images; 
}; 
 
function do_addfilter_for_yoast() {
	// add the filter for wpseo_sitemap_urlimages callback
	add_filter( 'wpseo_sitemap_urlimages', '\mvbplugins\fotoramamulti\filter_wpseo_sitemap_urlimages', 10, 2 );
}