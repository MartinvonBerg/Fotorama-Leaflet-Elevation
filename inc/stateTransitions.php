<?php

// define globals for detection of status change of the post from published to draft and back
// I don't like this, but I didn't find another solution.
// This works only because the post is rendered at status transitions, otherwise not.
namespace mvbplugins\fotoramamulti;

global $post_state_pub_2_draft; 
global $post_state_draft_2_pub;
$post_state_pub_2_draft = false;
$post_state_draft_2_pub = false;

/**
 * set globals for status transitions
 *
 * @param  string $new_status
 * @param  string $old_status
 * @return void
 */
function on_all_status_transitions( $new_status, $old_status ) {
	global $post_state_pub_2_draft;
	global $post_state_draft_2_pub;

	if ( $new_status != $old_status ) {
		if ( $old_status == "draft" ) {
			$post_state_draft_2_pub = true;	
			$post_state_pub_2_draft = false;
		}
		elseif ($old_status == "publish") {
			$post_state_pub_2_draft = true;
			$post_state_draft_2_pub = false;
		}		
	}
}

// bind the function to the action hook
add_action(  'transition_post_status',  '\mvbplugins\fotoramamulti\on_all_status_transitions', 10, 3 );