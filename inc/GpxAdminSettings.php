<?php
namespace mvbplugins\fotoramamulti;

/**
 *  by Martin von Berg
 * 
 */


$path = plugin_dir_path(__FILE__);
require_once $path . 'custom_mime_types.php'; 
require_once $path . 'parseGPX.php';
require_once $path . 'AdminSettingsPage.php';

class GpxAdminSettings extends AdminSettingsPage {

    public function __construct( array $settings ) {
        parent::__construct( $settings );
    }

    function show_options_page_html() {
        $this->hasFileInput = true;
        parent::show_options_page_html();
        
    }
}