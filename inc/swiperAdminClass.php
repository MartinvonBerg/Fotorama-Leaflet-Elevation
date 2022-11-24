<?php

/**
 *  by Martin von Berg
 * 
 */
// TODO: add swiper parameters to html table
	// TODO: use the options for the slider
	// TODO: split fotorama and leaflet settings and correct sanitizer
    // TODO: translation i18n

namespace mvbplugins\fotoramamulti;

final class SwiperAdmin {
	
	private $up_dir = '';
	
	private $fotoramaSettings = [ // currently unused. For future extension.
		'addPermalink' 			,//=> $addPermalink, 
		'allImgInWPLibrary' 	,//=> $allImgInWPLibrary,
		'sw_effect'				,//=> $sw_effect,
		'sw_zoom'				,//=> $sw_zoom,
		'sw_fslightbox'			,//=> $sw_fslightbox,
		'sw_pagination'			,//=> $sw_pagination,
		'sw_slides_per_view' 	,//=> $sw_slides_per_view, // unused with martins thumbnails
		'sw_transition_duration',//=> $sw_transition_duration,
		'sw_mousewheel'			,//=> $sw_mousewheel,
		'sw_hashnavigation'  	,//=> $sw_hashnavigation,
		'sw_max_zoom_ratio'		,//=> $sw_max_zoom_ratio,
		'showcaption'			,//=> $showcaption,
		'shortcaption'			,//=> $shortcaption,
		'imgpath'				,//=> $imgpath,
		'slide_fit'				,//=> $fit,
		'sw_aspect_ratio'		,//=> $ratio,
		// thumbnails settings
		'f_thumbwidth'			,//=> $f_thumbwidth, // for swiper thumbs and for videos without thumbnails
		'bar_min_height'		,//=> $f_thumbheight . 'px', // now two values for the height!
		'nail_margin_side' 		,//=> $thumbmargin . 'px', // left and right margin of single thumb in pixels
		// only for active_border 
		'active_border_width'	,//=> $thumbborderwidth . 'px', // in pixels. only bottom border here!
		'active_border_color'	,//=> $thumbbordercolor, // '#ea0000', 
	];

	public function __construct( $settings ) {
		$this->settings = $settings;
		$this->up_dir = wp_get_upload_dir()['basedir'];     // upload_dir

		/**
		 * Register our swiper_settings_init to the admin_init action hook.
		 */
		add_action( 'admin_init', array( $this, 'swiper_settings_init') );
	}

	/**
	 * @internal never define functions inside callbacks.
	 * these functions could be run multiple times; this would result in a fatal error.
	 */

	/**
	 * custom option and settings
	 */
	public function swiper_settings_init() {
		// init the option_name
		$this->initOptionInDb();

		// Register a new setting for "swiper" page.
		register_setting( 
			$this->settings['pre'], // option_group
			$this->settings['options'], // option_name
			array('sanitize_callback' => array($this, 'options_sanitizer') )
		);

		// Register a new section in the "swiper" page.
		add_settings_section(
			$this->settings['section'],
			__( $this->settings['sectionsText'], $this->settings['namespace'] ), array($this,'section_callback'),
			$this->settings['pre']
		);

		// Register all new fields in the section, inside the page.
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

	function initOptionInDb() {
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

	function options_sanitizer( $args ) {
		foreach($this->settings as $key => $param) {
			if ( \gettype($param) === 'array' && $param['type'] === 'checkbox') {
				if ( isset($args[ $param['label'] ]) ) { // ist immer gesetzt, egal ob true oder false key ist da und (true oder on)
                //if ( \array_key_exists( $param['label'], $args) && ( $args[ $param['label'] ] === 'true' || $args[ $param['label'] ] === 'on') ) {
					$args[$param['label']] = 'true';
				} else {
					$args[$param['label']] = 'false';
				}
			}
		}
		return $args;
	}

	/**
	 * Custom option and settings:
	 *  - callback functions
	 */


	/**
	 * Developers section callback function.
	 *
	 * @param array $args  The settings array, defining title, id, callback.
	 */
	function section_callback( $args ) {
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
	 */
	function number_callback( $args) {
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

	function checkbox_callback( $args) {
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

	function select_callback( $args) {
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

	function path_callback( $args) {
		// Get the value of the setting we've registered with register_setting()
		$options = get_option( $this->settings['options'] );

		if ($this->settings[ $args['param']]['type'] === 'path' || ($this->settings[ $args['param']]['type'] === 'text') ) {
			
			$optset = \array_key_exists( $args['label_for'], $options ) ? esc_attr( $options[ $args['label_for'] ]) : '';
			$path = $this->settings[ $args['param']]['type'] === 'path' ? $path = $this->up_dir . '/' . $options[ $args['label_for'] ]: '';
			
			?>
			<input class="regular-text"
					type="text"
					<?php echo( $this->settings[ $args['param']]['required'] );?>
					placeholder="<?php echo esc_attr( $this->settings[ $args['param']]['description'] );?>" 
					name="<?php echo esc_attr( $this->settings['options'])?>[<?php echo esc_attr( $args['label_for'] ); ?>]" 
					id="<?php echo esc_attr( $args['label_for'] ); ?>" 
					value="<?php echo($optset); ?>">
					<p><?php echo($path);?></p>
			<?php
		}
	}

	function text_callback( $args) {
		// Get the value of the setting we've registered with register_setting()
		$this->path_callback( $args );
	}

	/**
	 * Top level menu callback function
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

		?>
		<div class="wrap">
			<form action="options.php" method="post">
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

	function show_settings() {
		$options = get_option( $this->settings['options'] );
		//$string =\var_export($options);
		?><p><?php //echo $string;?></p><?php
		?><pre><?php print_r($options);?></pre><?php
	}
}