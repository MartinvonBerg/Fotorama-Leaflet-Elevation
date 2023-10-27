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
	private $language = '';
	
	/**
	 * load settings and hook on 'admin_init' to register settings, sections and fields. Init the Database with settings.
	 *
	 * @param  array $settings to generate on admin page
	 */
	public function __construct( array $settings, string $language ) {
		$this->settings = $settings;
		$this->uploadDirectory = wp_get_upload_dir()['basedir']; // upload_dir
		$this->language = $language;

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

		// Register a new section in the admin settings page.
		add_settings_section(
			$this->settings['section'],
			$this->settings['sectionsText'],
			array($this,'section_callback'),
			$this->settings['pre']
		);

		// Get all settings from the array and register all new fields in the section, inside the page.
		foreach($this->settings as $key => $param) {
			if ( \gettype($param) === 'array') {
				add_settings_field(
					$this->settings[$key]['label'], // As of WP 4.6 this value is used only internally. // Use $args' label_for to populate the id inside the callback.
					$this->settings[$key]['text'],
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
		if ( $options === false || $options === '' || \gettype($options) !== 'array') $options = [];

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

			if ( \gettype($param) === 'array' ) {

				switch ( $param['type'] ) {
					case 'checkbox':
						if ( \array_key_exists( $param['label'], $args) && ( $args[ $param['label'] ] === 'true' || $args[ $param['label'] ] === 'on') ) {
							$args[$param['label']] = 'true';
						} else {
							$args[$param['label']] = 'false';
						}
						break;

					case 'path':
						$args[$param['label']] = $this->my_sanitize_path( $args[$param['label']] );
						break;

					case 'text':
						if ( $param['label'] === 'autoplay') {
							$args[$param['label']] = $this->my_sanitize_autoplay( $args[$param['label']], array('false', 'true', array('integer', 0, 5000) ) );
						} else {
							$args[$param['label']] = $this->my_sanitize_text( $args[$param['label']] );
						}
						break;

					case 'number':
						$args[$param['label']] = \strval( filter_var( $args[$param['label']], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION ) );
						break;

					case 'select':
						$args[$param['label']] = $this->my_sanitize_text( $args[$param['label']] );
						break;

					case 'color':
						$args[$param['label']] = \sanitize_hex_color( $args[$param['label']]);
						break;
				}
				if ( $args[$param['label']] === null || $args[$param['label']] === '') $args[$param['label']] = $param['default'];

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
		<p id="<?php echo esc_attr( $args['id'] ); ?>"><?php echo esc_attr( $this->settings['subTitle'] ); ?></p>
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
	function number_callback( array $args ) {
		// Get the value of the setting we've registered with register_setting()
		$options = get_option( $this->settings['options'] );

		if ( $this->settings[ $args['param']]['type'] === 'number') {
			$current = isset( $options[$args['label_for']] ) ? $options[$args['label_for']] : '';
			$step = \array_key_exists('step',$this->settings[ $args['param'] ]) ? $this->settings[ $args['param']]['step'] : ''
			?>
			<input type="number" min="<?php echo esc_attr( $this->settings[ $args['param']]['min']) ?>" max="<?php echo esc_attr( $this->settings[ $args['param']]['max']) ?>" step="<?php echo esc_attr( $step ) ?>" 
                name="<?php echo esc_attr( $this->settings['options'])?>[<?php echo esc_attr($args['label_for']) ?>]"
				id="<?php echo esc_attr( $args['label_for'] ); ?>" 
				value="<?php echo esc_attr( $current ); ?>">
			<label>  Min: <?php echo esc_attr( $this->settings[ $args['param']]['min']) ?>, Max: <?php echo esc_attr( $this->settings[ $args['param']]['max']) ?></label>
			<?php
		}
	}

	function checkbox_callback( array $args ) {
		// Get the value of the setting we've registered with register_setting()
		$options = get_option( $this->settings['options'] );

		if ($this->settings[ $args['param']]['type'] === 'checkbox') {
			$optset =  \array_key_exists( $args['label_for'], $options ) && $options[$args['label_for']] === 'true' ? 'checked' : '';
			?>
			<input type="checkbox" 
				   id="<?php echo esc_attr( $args['label_for'] ); ?>"
				   data-custom="<?php echo esc_attr( $args['custom_data'] ); ?>"
				   name="<?php echo esc_attr( $this->settings['options'])?>[<?php echo esc_attr($args['label_for']) ?>]"
				   <?php echo esc_attr( $optset ); ?>
				   >
			<label for="<?php echo esc_attr( $args['label_for'] ); ?>"><?php echo esc_attr( $this->settings[ $args['param']]['description'] );?></label>
			<?php
		}
	}

	function select_callback( array $args ) {
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
					<option value="<?php echo esc_attr($key); ?>" <?php echo esc_attr( isset( $options[ $args['label_for'] ] )) ? ( selected( $options[ $args['label_for'] ], $key, false ) ) : ( '' ); ?>>
						<?php 
						echo esc_attr( $value ); 
						?>
					</option>
					<?php
				}
				?>
			</select>
			<?php
		}
	}

	function path_callback( array $args ) {
		// Get the value of the setting we've registered with register_setting()
		$options = get_option( $this->settings['options'] );

		if ($this->settings[ $args['param']]['type'] === 'path' || ($this->settings[ $args['param']]['type'] === 'text') ) {
			
			$optset = \array_key_exists( $args['label_for'], $options ) ? $options[ $args['label_for'] ] : '';
			$path = $this->settings[ $args['param']]['type'] === 'path' ? $path = $this->uploadDirectory . '/' . $options[ $args['label_for'] ]: '';
			$label = $this->settings[ $args['param']]['type'] === 'text' ? $this->settings[ $args['param']]['description'] : '';
			
			if ( \key_exists('pattern',$this->settings[ $args['param']])) {
				$pattern = 'pattern="'.$this->settings[ $args['param']]['pattern'].'"';
				$pattern = '';
				$path = __('Recommendation', 'fotoramamulti') . ': (max-width: '.\number_format( (intval(get_option('fm_common_options')['min_width_css_grid_row_14']) * 2 + 5) * 1.15) .'px) 100vw, 50vw'; 
			} else {
				$pattern = '';
			}
			
			?>
			<input class="regular-text"
					type="text"
					<?php echo esc_attr( $this->settings[ $args['param']]['required'] );?>
					placeholder="<?php echo esc_attr( $this->settings[ $args['param']]['description'] );?>" 
					name="<?php echo esc_attr( $this->settings['options'])?>[<?php echo esc_attr( $args['label_for'] ); ?>]" 
					id="<?php echo esc_attr( $args['label_for'] ); ?>" 
					value="<?php echo esc_attr($optset); ?>"
					<?php if ($pattern!=='') echo  esc_attr($pattern); ?>>
					<label><?php echo esc_attr($label);?></label>
					<p><?php echo esc_attr($path);?></p>
			<?php
		}
	}

	function text_callback( array $args ) {
		// Get the value of the setting we've registered with register_setting()
		$this->path_callback( $args );
	}

	function color_callback( array $args ) {
		// Get the value of the setting we've registered with register_setting()
		$options = get_option( $this->settings['options'] );

		if ($this->settings[ $args['param']]['type'] === 'color' ) {
			
			$optset = \array_key_exists( $args['label_for'], $options ) ? $options[ $args['label_for'] ] : '';
			
			?>
			<input class="color-picker"
					type="color"
					name="<?php echo esc_attr( $this->settings['options'])?>[<?php echo esc_attr( $args['label_for'] ); ?>]" 
					id="<?php echo esc_attr( $args['label_for'] ); ?>" 
					value="<?php echo esc_attr($optset); ?>">
					<label><?php echo esc_attr('hex: '.$optset);?></label>
			<?php
		}
	}

	function file_input_callback ( array $args ) {
		$options = get_option( $this->settings['options'] );

		if ($this->settings[ $args['param']]['type'] === 'file_input' ) {
			
			$optset = \array_key_exists( $args['label_for'], $options ) ? $options[ $args['label_for'] ] : '';
			$optset = html_entity_decode($optset);

			?>
			<input class="file-input"
					type="file"
					name="uploadedfile" style='width:400px;'
					accept="<?php echo esc_attr( $this->settings[ $args['param']]['accept'] );?>">
			<?php 
			if (\array_key_exists( $args['label_for'], $options ) && $args['label_for'] === 'gpxfile') {
				echo htmlspecialchars_decode( esc_html('</br>' . __('Upload', 'fotoramamulti') . ': ' .  $optset) );
			}
		}
	}

	/**
	 * Provides a download link or a help text based on whether the settings file exists.
	 *
	 * @param array $args An array of arguments.
	 * @throws None
	 * @return void
	 */
	function download_callback ( array $args ) :void {
		$options = get_option( $this->settings['options'] );
		$optset = \array_key_exists( $args['label_for'], $options ) ? $options[ $args['label_for'] ] : '';
		$optset = html_entity_decode($optset);

		$exportFileExists = false;
		// Check if file exists
		$path = $path = plugin_dir_path(__DIR__) . $optset;
		$exportFileExists = \file_exists( $path);

		if ( $exportFileExists && $path !== '') {
			// if yes provide download link
			$path = $path = plugin_dir_url(__DIR__) . $optset;	
			echo htmlspecialchars_decode( esc_html('<a download="' .  $optset . '" href="'. $path .'">' . __('Download', 'fotoramamulti' ) . ': <strong>'. $optset .'</strong></a>') );
		} else {
			// if not provide help text
			echo htmlspecialchars_decode( esc_html( __('File', 'fotoramamulti') . ': <strong>' .  $optset . '</strong> ' . __('does not exist', 'fotoramamulti') . '.</br>' . __('Leave Import File empty and press Save Button before', 'fotoramamulti') ) ); 
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
			// add settings saved message with the class of "updated". This message seems not to be used
			//add_settings_error( $this->settings['pre'].'_messages', $this->settings['pre'].'_message', __( 'Settings saved', 'fotoramamulti' ), 'updated' ); 
		}

		?>
		<div class="wrap">
			<form action="options.php" method="post" <?php if ( $this->hasFileInput === true) { echo 'enctype="multipart/form-data"';} ?>>
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
	private function my_sanitize_text ( string $inp ) :string
	{
		$inp = sanitize_text_field( $inp);
		$inp = \htmlspecialchars($inp);
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
	private function my_sanitize_path (string $inp ) :string
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
		$inp = $this->my_sanitize_text( $inp );
		
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
			//("Variable value is not within the legal range"); Restrict to min / max-Value.
			($val < $min) ? $val = $min : $val = $max;
		} else {
			// ("Variable value is within the legal range"). Do nothing.
		}
		
		return strval($val);
	}

	/**
	 * sanitize the options for the page and store the GPX-File. This function works only with dedicated settings!
	 *
	 * @param  array  $option the current options settings on the page
	 * @return array the sanitized options to handle with options.php
	 */
	public function handle_file_upload(array $option ) :array { 

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
					$gpxParser = new parseGpxFile();
					$values = $gpxParser->parsegpx ($tmp_name, $path, $name_file, $smooth, $elesmooth, $ignoreZeroElev);
					$gpxParser = null;
					$result = strpos($values, 'Skip') === false;
				} else {
					$values = __('File not touched', 'fotoramamulti' ) .'!';
					$result = move_uploaded_file( $tmp_name, $path. '/'.$name_file );
				}

				if( $result )  {
					$temp = '"'. $name_file . '" ' . __('successful', 'fotoramamulti' ) . '! </br>' . $values;
				} else {
					$temp = ". " . __('Error during File processing', 'fotoramamulti' ) . ' ! ' . $values;
				}

			} else { $temp = __('File alread exists', 'fotoramamulti' )  .'!'; }

		} else { 
			$temp = __('No Filename given', 'fotoramamulti' ) . '!';
		}

		$option['gpxfile'] = $temp;
		return $option;
	}

	public function handle_settings( $option ) { 
		// sanitize options
		// is not required here. 
		
		// get and generate file names and upload directory if not exists
		$result = true;
		
		// generate export settings file
		if ( $_FILES['uploadedfile']['name'] === '' ) {
			$options = get_option( $this->settings['options'] );
			$optset = $options['export_settings_file'];
			$path = plugin_dir_path(__DIR__) . $optset;
			// write all settings to json file
			$settings = [];
			$allSettings = [
				'fm_common_options',
				'fm_gpx_options',
				'fm_leaflet_options',
				'fm_fotorama_options',
				'fm_swiper_options',
				'fm_masonry_options',
			];
			foreach( $allSettings as $val) {
				$cur = \get_option( $val);
				$settings[$val] = $cur;
			}
			$prettyJsonString = json_encode($settings, JSON_PRETTY_PRINT);
			$result = \file_put_contents( $path, $prettyJsonString);
			if ($result > 0) {
				add_settings_error(
					'fotoramamulti_json_ok',
					'file_generated',
					__('Settings File generated. Use Download link below', 'fotoramamulti' ),
					'success'
				);
				$result = true;
			} else {
				add_settings_error(
					'fotoramamulti_json_nok',
					'file_failed',
					__('Could not generate File!', 'fotoramamulti' ),
					'error'
				);
			}
		} 
		else if ( $_FILES["uploadedfile"]["type"] === 'application/json' && $_FILES["uploadedfile"]["error"] === 0 ) // if ( \file_exists($_FILES['uploadedfile']['tmp_name'] !== '' ) )
		{
			$upd_result = [];

			// read tmp file to json
			$prettyJsonString = \file_get_contents( $_FILES['uploadedfile']['tmp_name']);
			$allSettings = \json_decode( $prettyJsonString, true );
			
			foreach( $allSettings as $key => $newval) {
				$cur = \get_option( $key ); // special treatment for key : gpxfile in fm_gpx_options required! Do not change it!
				if ( $key === 'fm_gpx_options') {
					//remove the key gpxfile in both arrays. Do not update and don not check.
					unset( $cur['gpxfile'] );
					unset( $newval['gpxfile']);
				}

				if ( $cur != $newval) {
					$one_result = update_option( $key, $newval );
					$updated = \get_option($key);
					$upd_result[$key] = ($one_result || $updated == $newval) ? 'success' : 'failed';
				} else {
					$upd_result[$key] ="identical";
				}
			}

			if ( \in_array('failed', $upd_result) || $allSettings === [] || $allSettings === null ) {
				add_settings_error(
					'fotoramamulti_settingsupdate_nok',
					'settings_update_failed', 
					__('Something Failed! Settings were not upated! Or set to default values.', 'fotoramamulti'),
					'error'
				);
			}
		}
		/*
		else {
			$var = \implode(', ', $_FILES);

			add_settings_error(
				'fotoramamulti_settingsupdate_tmpfile_nok',
				'settings_update_failed', 
				__('Something Failed! Temporary File empty. ' . $var . ' End', 'fotoramamulti'),
				'error'
			);

			$result = false;
		}
		*/
		return $result;
	}
}