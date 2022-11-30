<?php

/**
 *  by Martin von Berg
 * 
 */

namespace mvbplugins\fotoramamulti;

$path = plugin_dir_path(__FILE__);
require_once $path . 'custom_mime_types.php'; 
require_once $path . 'parseGPX.php';
require_once $path . 'AdminSettingsPage.php';

class GpxAdminSettings extends AdminSettingsPage {

    public function __construct( array $settings ) {
        parent::__construct( $settings );
    }

    function show_options_page_html() {
        parent::show_options_page_html();
        ?>
            <form method="post" enctype="multipart/form-data">
            <label>Wählen Sie eine Textdatei (*.txt, *.html usw.) von Ihrem Rechner aus.
                <input name="datei" type="file" size="50" accept=".gpx"> 
            </label>  
            <button>… und ab geht die Post!</button>
            </form>
        <?php

    }
}