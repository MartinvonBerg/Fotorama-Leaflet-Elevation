<?php

// define the wpseo_sitemap_urlimages callback to add images of post to the yoast-seo xml-sitemap
// the function is called on the fly when the XML-Sitemap is requested! would be better to save it in the functions.php!
// On the other hand it belongs to this plugin, so we keep it here to prevent its loss on theme-change
namespace mvbplugins\fotoramagpxviewer;

function filter_wpseo_sitemap_urlimages( $images, $post_id ) { 
	//$postimages  = array('src' => 'https://127.0.0.1/wordpress/wp-content/uploads/Alben_Website/Rettenstein/Kitzb_Alpen_2018-5.jpg', 
	//				'title' => 'Test-Bild', 
	//				'alt' => 'bild mit nix drin', ); 
	//$isyoastseo = is_plugin_active('wordpress-seo/index.php'); // works only if admin is logged in!
	$myimgfrompost = get_post_meta($post_id,'postimg'); // read array with post_images from custom-field of post
	if ( ! empty($myimgfrompost) ) {
		$test = $myimgfrompost[0]; // we need only the first index
		$postimages = maybe_unserialize($test);	// type conversion to array
		foreach ($postimages as $singleimg) {
			$images[] = $singleimg; // write image to XML-Sitemap
		}			
	
	}
	return $images; 
}; 
         
// add the filter for wpseo_sitemap_urlimages callback
add_filter( 'wpseo_sitemap_urlimages', '\mvbplugins\fotoramagpxviewer\filter_wpseo_sitemap_urlimages', 10, 2 );