<?php

/**
 * THIS FILE IS UNUSED !!!!!!!!!
 *  by Martin von Berg
 * 
 */

namespace mvbplugins\fotoramamulti;

$path = plugin_dir_path(__FILE__);
require_once $path . 'custom_mime_types.php'; 
require_once $path . 'parseGPX.php'; 

final class GpxSettingsPage {
    private $fotorama_elevation_options;
	private $fotorama_option2;
	private $up_dir = '';
	
    /**
	* Register our settings_page_init to the admin_init action hook.
	*/
	public function __construct() {
        $this->up_dir = wp_get_upload_dir()['basedir'];
        $this->fotorama_elevation_options = get_option( 'fm_leaflet_options' );

		add_action( 'admin_init', array( $this, 'gpx_settings_page_init') );
	}

    // --------------- GPX-Tab --------------------------------------------------------
	/**
	 * TODO: Undocumented function
	 *
	 * @return void
	 */
	public function gpx_settings_page_init() { 

        register_setting(
            "gpx_section", 
            "gpx-file", 
            array('sanitize_callback' => array($this, 'handle_file_upload') ) 
        );

        add_settings_section("gpx_section", __('GPX-File', 'fotoramamulti') . ' settings + upload', null, "gpx_file");
    	
        add_settings_field(
            "gpx-file", 
            __('Select GPX-File', 'fotoramamulti') , 
            array( $this, "gpx_file_callback"), 
            "gpx_file", 
            "gpx_section"
        );  

        add_settings_field(
			'gpx_reduce', // id
			__('GPX-File-Parsing', 'fotoramamulti'), // title
			array( $this, 'gpx_reduce_callback' ), // callback
			'gpx_file', // page
			'gpx_section' // section
		);

		add_settings_field(
			'gpx_smooth', // id
			__('Distance Smooth', 'fotoramamulti'), // title
			array( $this, 'gpx_smooth_callback' ), // callback
			'gpx_file', // page
			'gpx_section' // section
		);

		add_settings_field(
			'gpx_elesmooth', // id
			__('Elevation Smooth', 'fotoramamulti'), // title
			array( $this, 'gpx_elesmooth_callback' ), // callback
			'gpx_file', // page
			'gpx_section' // section
		);

		add_settings_field(
			'gpx_overwrite', // id
			__('Overwrite GPX-File', 'fotoramamulti'), // title
			array( $this, 'gpx_overwrite_callback' ), // callback
			'gpx_file', // page
			'gpx_section' // section
		);

        // TODO: Database options for GPX-File-Upload Section. not quite correct but we are in the admin_init hook
		if ( ! get_option('fotorama_option2')){
			$this->fotorama_option2 = array(
				'gpx_reduce' => true,
				'gpx_smooth' => 25, // Distance smooth in meters
				'gpx_elesmooth' => 4, // Elevation smooth in meters
				'gpx_overwrite' => true);
			add_option('fotorama_option2', $this->fotorama_option2);
			} else {
				$this->fotorama_option2 = get_option('fotorama_option2');
		}
    }

	/**
	 * TODO: Undocumented function
	 *
	 * @return void
	 */
    function show_options_page_html() {
		// check user capabilities
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
        ?>
			<form method="post" action="options.php" enctype="multipart/form-data">
				<?php
				// output save settings button
				//submit_button();
				?><hr><?php
               	settings_fields("gpx_section");
				do_settings_sections("gpx_file");
				?>
				<p><b><?php esc_html_e('Hint: GPX-routes without elevation data should be converted to tracks with','fotoramamulti') ?> <a href="https://www.gpsvisualizer.com/elevation" target="_blank">www.gpsvisualizer.com.</a></br> 
				<?php esc_html_e('Trackdata without elevation will be skipped. Tracksegments will be combined. Routes and waypoints will be ignored. Trackname will be set to filename.','fotoramamulti') ?></b></br>
				<?php esc_html_e('Button Save GPX-File underneath will save settings and / or GPX-File.','fotoramamulti') ?></p> 
				<?php
				submit_button( __('Save GPX-File', 'fotoramamulti') );
				?>
            </form>
		<?php
    }

    // --------------------- GPX Calllbacks -------------------------------//
	/**
	 * TODO: Undocumented function. for all callbacks
	 *
	 * @return void
	 */
	public function gpx_file_callback() {
		?><input type="file" name="uploadedfile" /><?php // create html button for file name
		echo( '</br>Upload path: ' . $this->up_dir . '/' . $this->fotorama_elevation_options['path_to_gpx_files_2']);
		echo ('</br>(Last) uploaded: ' .  get_option('gpx-file') );
	}

	public function gpx_reduce_callback() {
		printf(
			'<input type="checkbox" name="gpx-file[gpx_reduce]" id="gpx_reduce" value="gpx_reduce" %s><label for="gpx_reduce">%s %s</label>',
			( $this->fotorama_option2['gpx_reduce'] === 'true' ) ? 'checked' : '',
			__('GPX-File', 'fotoramamulti'),
			__(': Reduce with Settings below and add Track Statistics (Track length and difference in altitude).', 'fotoramamulti'),
		);
	}

	public function gpx_smooth_callback() {
		$this->fotorama_option2 = get_option('fotorama_option2');
		printf(
			'<input type="number" min="1" max="50" name="gpx-file[gpx_smooth]" id="gpx_smooth" value=%s><label> %s</label>',
			( isset( $this->fotorama_option2['gpx_smooth'] ) ? esc_attr( $this->fotorama_option2['gpx_smooth']): ''),
			__( 'Min. Distance of Track Points in Meters', 'fotoramamulti')
		);
	}

	public function gpx_elesmooth_callback() {
		$this->fotorama_option2 = get_option('fotorama_option2');
		printf(
			'<input type="number" min="1" max="50" name="gpx-file[gpx_elesmooth]" id="gpx_elesmooth" value=%s><label> %s</label>',
			( isset( $this->fotorama_option2['gpx_elesmooth'] ) ? esc_attr( $this->fotorama_option2['gpx_elesmooth']) : '' ),
			__( 'Min. Elevation between Track Points in Meters. Used for Statistics Calc only. Best is 4.', 'fotoramamulti')
		);
	}

	public function gpx_overwrite_callback() {
		printf(
			'<input type="checkbox" name="gpx-file[gpx_overwrite]" id="gpx_overwrite" value="gpx_overwrite" %s><label for="gpx_overwrite"> %s</label>',
			( $this->fotorama_option2['gpx_overwrite'] === 'true' ) ? 'checked' : '',
			__( 'Overwrite existing GPX-File', 'fotoramamulti')	
		);
	}

	/**
	 * TODO: Undocumented function
	 *
	 * @return void
	 */
	public function handle_file_upload($option) { 

		$this->fotorama_option2 = get_option('fotorama_option2');

		$parsegpxfile = $option["gpx_reduce"] == 'gpx_reduce';
		$parsegpxfile ? $this->fotorama_option2['gpx_reduce'] = 'true' : $this->fotorama_option2['gpx_reduce'] = 'false';

		$overwrite = $option["gpx_overwrite"] == 'gpx_overwrite';
		$overwrite ? $this->fotorama_option2['gpx_overwrite'] = 'true' : $this->fotorama_option2['gpx_overwrite'] = 'false';
		
		$this->fotorama_option2['gpx_smooth'] = intval($option["gpx_smooth"]);	
		$smooth = $this->fotorama_option2['gpx_smooth'];

		$this->fotorama_option2['gpx_elesmooth'] = intval($option["gpx_elesmooth"]);	
		$elesmooth = $this->fotorama_option2['gpx_elesmooth'];		
			
		update_option( 'fotorama_option2', $this->fotorama_option2 );

		$file = $_FILES['uploadedfile']['name'];
		$path = $this->up_dir . '/' . $this->fotorama_elevation_options['path_to_gpx_files_2'];
		$complete = $path . '/' . $file;

		if( ! is_dir($path) ) { mkdir($path , 0777); }

		if( (! is_file($complete) || ($overwrite) ) && ($file != '')) {
			$name_file = $_FILES['uploadedfile']['name'];
			$tmp_name = $_FILES['uploadedfile']['tmp_name']; 

			if ($parsegpxfile) { 
				$values = parsegpx ($tmp_name, $path, $name_file, $smooth, $elesmooth);
				$result = strpos($values, 'Skip') == false;
			} else {
				$result = move_uploaded_file( $tmp_name, $path. '/'.$name_file );
				$values = __('File not touched!');
			}

			if( $result )  {
				$temp = ' of "'. $name_file . '" successful! </br> With: ' . $values;
			} else {
				$temp = ". " . __('The file was not uploaded. ') . $values;
			}

			return $temp;  
		}
		
		if ($file == '') { $temp = __('No Filename given!') ;}
		else { $temp = __("File alread exists!"); }

		return $temp;
	}	
}
