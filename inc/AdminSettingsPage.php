<?php
namespace mvbplugins\fotoramamulti;

/**
 *  by Martin von Berg
 * Almost general Class to create an Admin Settings Page (in Tabs) from given Settings in an Array.
 */

class AdminSettingsPage {
	
	private $uploadDirectory = '';
	private $hasFileInput = false;
	private $settings = [];
	
	/**
	 * load settings and hook on 'admin_init' to register settings, sections and fields. Init the Database with settings.
	 *
	 * @param  array $settings to generate on admin page
	 */
	public function __construct( array $settings ) {
		$this->settings = $settings;
		$this->uploadDirectory = wp_get_upload_dir()['basedir']; // upload_dir

		// check if settings contains a file_input field
		if (array_search('file_input', array_column($settings, 'type')) !== false) $this->hasFileInput = true;

		/**
		 * Register our initSettingsSectionsFields to the admin_init action hook.
		 */
		add_action( 'admin_init', array( $this, 'initSettingsSectionsFields') );
	}

	/**
	 * init the option and settings. See constructor.
	 */
	public function initSettingsSectionsFields() {
		// init the option_name
		$this->initOptionsinDatabase();

		// Register a new setting for "swiper" page.
		register_setting( 
			$this->settings['pre'], // option_group
			$this->settings['options'], // option_name
			array('sanitize_callback' => array($this, $this->settings['sanitizer']) )
		);

		// Register a new section in the "swiper" page.
		add_settings_section(
			$this->settings['section'],
			__( $this->settings['sectionsText'], $this->settings['namespace'] ), array($this,'section_callback'),
			$this->settings['pre']
		);

		// Get all settings from the array and register all new fields in the section, inside the page.
		foreach($this->settings as $key => $param) {
			if ( \gettype($param) === 'array') {
				add_settings_field(
					$this->settings[$key]['label'], // As of WP 4.6 this value is used only internally. // Use $args' label_for to populate the id inside the callback.
					__( $this->settings[$key]['text'], $this->settings['namespace'] ),
					array( $this, $this->settings[$key]['type'] . '_callback'), // integer_cb, checkbox_cb, select_cb
					$this->settings['pre'],
					$this->settings['section'],
					array(
						'label_for'   => $this->settings[$key]['label'],
						'class'       => $this->settings[$key]['class'],
						'custom_data' => $this->settings[$key]['custom_data'],
						'param'		  => $key
					)
				);
			}
		}
	}

	/**
	 * Initialize the settings in the database from the array with settings.
	 *
	 * @return boolean result of the initialization process so the update_option
	 */
	function initOptionsinDatabase() {
		$options = get_option( $this->settings['options'] );
		if ( $options === false || $options === '') $options = [];

		// not at all = false, partly, completely
		foreach($this->settings as $key => $param) {
			if ( \gettype($param) === 'array' ) {
				if ( ! \array_key_exists( $param['label'], $options )){
					$options[ $param['label'] ] = $param['default'];
				}
			}
		}
		return \update_option( $this->settings['options'], $options);
	}

	/**
	 * sanitize the array with input arguments. Only for checkbox the setting is converted to true / false.
	 *
	 * @param  array $args to sanitize
	 * @return array $args sanitized
	 */
	function options_sanitizer( array $args ) {
		foreach($this->settings as $key => $param) {

			if ( \gettype($param) === 'array' && $param['type'] === 'checkbox') {

				if ( isset($args[ $param['label'] ]) ) { // ist immer gesetzt, egal ob true oder false key ist da und (true oder on)
                //if ( \array_key_exists( $param['label'], $args) && ( $args[ $param['label'] ] === 'true' || $args[ $param['label'] ] === 'on') ) {
					$args[$param['label']] = 'true';

				} else {
					$args[$param['label']] = 'false';
				}

			} else if ( \gettype($param) === 'array' && $param['type'] === 'path') {
				$args[$param['label']] = $this->my_sanitize_path( $args[$param['label']] );

			} else if ( \gettype($param) === 'array' && $param['type'] === 'text') {
				if ( $param['label'] === 'autoplay') {
					$args[$param['label']] = $this->my_sanitize_autoplay( $args[$param['label']], array('false', 'true', array('integer', 0, 5000) ) );

				} else {
					$args[$param['label']] = $this->my_sanitize_text( $args[$param['label']] );
				}
			} 
		}
		return $args;
	}

	/**
	 * Section callback function which outputs the subtitle under the header.
	 *
	 * @param array $args  The settings array, defining title, id, callback.
	 * @return void
	 */
	function section_callback( array $args ) {
		?>
		<p id="<?php echo esc_attr( $args['id'] ); ?>"><?php esc_html_e( $this->settings['subTitle'], $this->settings['namespace'] ); ?></p>
		<?php
	}

	/**
	 * WordPress has magic interaction with the following keys: label_for, class.
	 * - the "label_for" key value is used for the "for" attribute of the <label>.
	 * - the "class" key value is used for the "class" attribute of the <tr> containing the field.
	 * Note: you can add custom key value pairs to be used inside your callbacks.
	 *
	 * @param array $args
	 * @return void
	 */
	function number_callback( array $args) {
		// Get the value of the setting we've registered with register_setting()
		$options = get_option( $this->settings['options'] );

		if ( $this->settings[ $args['param']]['type'] === 'number') {
			$current = isset( $options[$args['label_for']] ) ? $options[$args['label_for']] : '';
			$step = \array_key_exists('step',$this->settings[ $args['param'] ]) ? $this->settings[ $args['param']]['step'] : ''
			?>
			<input type="number" min="<?php echo( $this->settings[ $args['param']]['min']) ?>" max="<?php echo( $this->settings[ $args['param']]['max']) ?>" step="<?php echo( $step ) ?>" 
                name="<?php echo( $this->settings['options'])?>[<?php echo($args['label_for']) ?>]"
				id="<?php echo esc_attr( $args['label_for'] ); ?>" 
				value="<?php echo esc_attr( $current ); ?>">
			<label>  Min: <?php echo( $this->settings[ $args['param']]['min']) ?>, Max: <?php echo( $this->settings[ $args['param']]['max']) ?></label>
			<?php
		}
	}

	function checkbox_callback( array $args) {
		// Get the value of the setting we've registered with register_setting()
		$options = get_option( $this->settings['options'] );

		if ($this->settings[ $args['param']]['type'] === 'checkbox') {
			$optset =  \array_key_exists( $args['label_for'], $options ) && $options[$args['label_for']] === 'true' ? 'checked' : '';
			?>
			<input type="checkbox" 
				   id="<?php echo esc_attr( $args['label_for'] ); ?>"
				   data-custom="<?php echo esc_attr( $args['custom_data'] ); ?>"
				   name="<?php echo( $this->settings['options'])?>[<?php echo($args['label_for']) ?>]"
				   <?php echo esc_attr( $optset ); ?>
				   >
			<label for="<?php echo esc_attr( $args['label_for'] ); ?>"><?php esc_attr_e($this->settings[ $args['param']]['description'], $this->settings['namespace']);?></label>
			<?php
		}
	}

	function select_callback( array $args) {
		// Get the value of the setting we've registered with register_setting()
		$options = get_option( $this->settings['options'] );

		if ($this->settings[ $args['param']]['type'] === 'select') {
			?>
			<select id="<?php echo esc_attr( $args['label_for'] ); ?>"
					data-custom="<?php echo esc_attr( $args['custom_data'] ); ?>"
					name="<?php echo esc_attr( $this->settings['options']) ?>[<?php echo esc_attr( $args['label_for'] ); ?>]">

				<?php
				foreach($this->settings[ $args['param']]['values'] as $key => $value) {
					?>
					<option value="<?php echo esc_attr($key); ?>" <?php echo isset( $options[ $args['label_for'] ] ) ? ( selected( $options[ $args['label_for'] ], $key, false ) ) : ( '' ); ?>>
						<?php 
						esc_html_e( $value, $this->settings['pre'] ); 
						?>
					</option>
					<?php
				}
				?>
			</select>
			<?php
		}
	}

	function path_callback( array $args) {
		// Get the value of the setting we've registered with register_setting()
		$options = get_option( $this->settings['options'] );

		if ($this->settings[ $args['param']]['type'] === 'path' || ($this->settings[ $args['param']]['type'] === 'text') ) {
			
			$optset = \array_key_exists( $args['label_for'], $options ) ? esc_attr( $options[ $args['label_for'] ]) : '';
			$path = $this->settings[ $args['param']]['type'] === 'path' ? $path = $this->uploadDirectory . '/' . $options[ $args['label_for'] ]: '';
			$label = $this->settings[ $args['param']]['type'] === 'text' ? $this->settings[ $args['param']]['description'] : '';
			
			?>
			<input class="regular-text"
					type="text"
					<?php echo( $this->settings[ $args['param']]['required'] );?>
					placeholder="<?php echo esc_attr( $this->settings[ $args['param']]['description'] );?>" 
					name="<?php echo esc_attr( $this->settings['options'])?>[<?php echo esc_attr( $args['label_for'] ); ?>]" 
					id="<?php echo esc_attr( $args['label_for'] ); ?>" 
					value="<?php echo($optset); ?>">
					<label><?php echo($label);?></label>
					<p><?php echo($path);?></p>
			<?php
		}
	}

	function text_callback( array $args) {
		// Get the value of the setting we've registered with register_setting()
		$this->path_callback( $args );
	}

	function color_callback( array $args) {
		// Get the value of the setting we've registered with register_setting()
		$options = get_option( $this->settings['options'] );

		if ($this->settings[ $args['param']]['type'] === 'color' ) {
			
			$optset = \array_key_exists( $args['label_for'], $options ) ? esc_attr( $options[ $args['label_for'] ]) : '';
			
			?>
			<input class="color-picker"
					type="color"
					name="<?php echo esc_attr( $this->settings['options'])?>[<?php echo esc_attr( $args['label_for'] ); ?>]" 
					id="<?php echo esc_attr( $args['label_for'] ); ?>" 
					value="<?php echo($optset); ?>">
					<label><?php echo('hex: '.$optset);?></label>
			<?php
		}
	}

	function file_input_callback ( array $args) {
		$options = get_option( $this->settings['options'] );

		if ($this->settings[ $args['param']]['type'] === 'file_input' ) {
			
			$optset = \array_key_exists( $args['label_for'], $options ) ? esc_attr( $options[ $args['label_for'] ]) : '';
			$optset = html_entity_decode($optset);

			?>
			<input class="file-input"
					type="file"
					name="uploadedfile" style='width:400px;'
					accept="<?php echo( $this->settings[ $args['param']]['accept'] );?>">
			<?php 
			echo ('</br>Upload: ' .  $optset );
		}
	}

	/**
	 * produces the HTML for the settings page using high level WP-functions and shows the result of the settings submit button.
	 * @return void
	 */
	function show_options_page_html() {
		// check user capabilities
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// add error/update messages

		// check if the user have submitted the settings
		// WordPress will add the "settings-updated" $_GET parameter to the url
		if ( isset( $_GET['settings-updated'] ) ) {
			// add settings saved message with the class of "updated"
			add_settings_error( $this->settings['pre'].'_messages', $this->settings['pre'].'_message', __( 'Settings saved', $this->settings['namespace'] ), 'updated' );
		}

		$extendForm = '';
		if ( $this->hasFileInput === true) {
			$extendForm = 'enctype="multipart/form-data"';
		}

		?>
		<div class="wrap">
			<form action="options.php" method="post" <?php echo( $extendForm );?>>
				<?php
				// output save settings button
				//submit_button();
				?><hr><?php
				// output security fields for the registered setting "swiper"
				settings_fields( $this->settings['pre'] );
				// output setting sections and their fields
				// (sections are registered for "swiper", each field is registered to a specific section)
				do_settings_sections( $this->settings['pre'] );
				?><hr><?php
				// output save settings button
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	// -------------- helpers ------------------
	/**
	 * Clean user input to one single string containing only relevant characters with using 'sanitize_text_field'
	 * filter_var with 'FILTER_SANITIZE_STRING'.
	 *
	 * @param  string $inp the input string to be sanitized
	 * @return string sanitized string
	 */	
	private static function my_sanitize_text ( string $inp) :string
	{
		$inp = sanitize_text_field( $inp);
		$inp = filter_var($inp, FILTER_SANITIZE_STRING);
		return $inp;
	}

	/**
	 * Standardize a path:
	 *  - no leading or trailing slashes
	 *  - no other characters than 'A-Za-z0-9-_/'
	 *  - and clean user input to one single string containing only relevant characters
	 *
	 * @param  string $inp the input path to be sanitized
	 * @return string sanitized path
	 */
	private function my_sanitize_path (string $inp) :string
	{
		//$inp = $this::my_sanitize_text( $inp );
		$inp = \sanitize_file_name($inp);
		
		$inp = preg_replace("/[^A-Za-z0-9-_\/]/", "", $inp);
		$inp = rtrim($inp,'/');
		$inp = rtrim($inp,'\\');
		$inp = ltrim($inp,'/');
		$inp = ltrim($inp,'\\');
		return $inp;
	}

	/**
	 * Convert a string value to an integer within given min- / max-Limits or to 'false' / 'true' if input is 'FaLse' or 'TrUe' or so. Return 'false' as fallback.
	 *
	 * @param  string $inp the input value from field autoplay which could be true, false or an integer-value
	 * @param  array  $checks array of arrays where $checks[0] and $checks[1] are not used. 
	 * 				  $checks[2] defines the target value for the type conversion (only integer supported) and the min / max-Value.
	 * @return string the converted input value: 'false' or 'true' or string from integer value from $inp
	 */
	private function my_sanitize_autoplay( string $inp, array $checks ) :string
	{
		$inp = $this::my_sanitize_text( $inp );
		
		if ( strtolower ( $inp ) == 'false' ) { return 'false'; }
		if ( strtolower ( $inp ) == 'true'  ) { return 'true'; }

		if ( ($checks[2][0] == 'integer') && \is_numeric( $inp ) ) {
			$val = intval( $inp );
		} else {
			return 'false';
		}

		$min = $checks[2][1];
		$max= $checks[2][2];

		if (filter_var($val, FILTER_VALIDATE_INT, array("options" => array("min_range"=>$min, "max_range"=>$max))) === false) {
			// echo("Variable value is not within the legal range"); Restrict to min / max-Value.
			($val < $min) ? $val = $min : $val = $max;
		} else {
			//echo("Variable value is within the legal range"). Do nothing.
		}
		
		return strval($val);
	}

	/**
	 * helper function to show the settings
	 *
	 * @return void
	 */
	function show_settings() {
		$options = get_option( $this->settings['options'] );
		//$string =\var_export($options);
		?><p><?php //echo $string;?></p><?php
		?><pre><?php print_r($options);?></pre><?php
	}

	/**
	 * sanitize the options for the page and store the GPX-File. This function works only with dedicated settings!
	 *
	 * @param  array  $option the current options settings on the page
	 * @return array the sanitized options to handle with options.php
	 */
	public function handle_file_upload(array $option) :array { 

		// sanitize options
		$option = $this->options_sanitizer( $option );
		
		// convert options to boolean variables
		$parsegpxfile = $option["gpx_reduce"] == 'true';
		$overwrite = $option["gpx_overwrite"] == 'true';
		$smooth = intval($option['gpx_smooth']);
		$elesmooth = intval($option['gpx_elesmooth']);
		$ignoreZeroElev = $option["gpx_ignore_zero_elev"] === "true";
		
		// get and generate file names and upload directory if not exists
		$file = $_FILES['uploadedfile']['name'];
		$path = $this->uploadDirectory . '/' . $option['path_to_gpx_files_2']; 
		$complete = $path . '/' . $file;
		if( ! is_dir($path) ) { mkdir($path , 0777); }

		// store gpx-file. The mime-type for the gpx-file is not checked here. Any text-file would be accepted. Mime-types are not consistent.
		if ($file !== '') {

			if (! is_file($complete) || ($overwrite) ) {
				$name_file = $_FILES['uploadedfile']['name'];
				$tmp_name = $_FILES['uploadedfile']['tmp_name']; 

				if ($parsegpxfile) { 
					$values = parsegpx ($tmp_name, $path, $name_file, $smooth, $elesmooth, $ignoreZeroElev);
					$result = strpos($values, 'Skip') === false;
				} else {
					$values = __('File not touched!');
					$result = move_uploaded_file( $tmp_name, $path. '/'.$name_file );
				}

				if( $result )  {
					$temp = ' of "'. $name_file . '" successful! </br> With: ' . $values;
				} else {
					$temp = ". " . __('Error during File processing!. ') . $values;
				}

			} else { $temp = __("File alread exists!"); }

		} else { 
			$temp = __('No Filename given!') ;
		}

		$option['gpxfile'] = $temp;
		return $option;
	}	
}