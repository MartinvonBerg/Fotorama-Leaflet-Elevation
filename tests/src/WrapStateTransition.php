<?php
namespace mvbplugins\fotoramamulti;

include_once 'C:\Bitnami\wordpress-5.2.2-0\apps\wordpress\htdocs\wp-content\plugins\fotorama_multi\inc\stateTransitions.php';

/**
 * wrapper class
 */
class WrapStateTrans {

    public $classCalled = false;
   
    public function __construct() {
        $this->classCalled = true;
    }

    public function do ( $state1, $state2) {
        global $post_state_pub_2_draft;
        global $post_state_draft_2_pub;
        on_all_status_transitions( $state1, $state2);
        return array($post_state_draft_2_pub, $post_state_pub_2_draft);
    }
}
