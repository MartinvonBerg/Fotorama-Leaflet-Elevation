<?php
namespace mvbplugins\fotoramamulti;

/**
 * On Deactivation of the Plugin: Delete the option 'postimg' for all pages and posts as this option is no longer required.
 *
 * @return void none
 */
function fotoramamulti_deactivate() {
	$args = array(
        'post_type'      => array( 'post', 'page' ),
        'posts_per_page' => -1,
        'post_status'    => array( 'publish', 'draft' ),
        'meta_key'       => 'postimg'
	);
   
    $the_query = new \WP_Query( $args );
   
    if ( $the_query->have_posts() ) {
   
        while ( $the_query->have_posts() ) {
            $the_query->the_post();
			delete_post_meta( \get_the_ID(), 'postimg');
        }
   
    }
    wp_reset_postdata();
}