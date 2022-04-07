/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { 
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';

 import {
	TextControl,
	PanelBody,
	PanelRow,
	ToggleControl,
	SelectControl,
} from '@wordpress/components';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps();
	const { imgpath, gpxfile, eletheme } = attributes;
	const aff= require('./block.json')['attributes']; // attributes from File loaded.
	const ns = 'fotoramamulti';
	let mykey = '';
	
	const onChangeImgpath = ( newContent ) => {
		debugger;
		setAttributes( {imgpath: newContent } )
	}

	const onChangeGpxfile= ( newContent ) => {
		setAttributes( {gpxfile: newContent } )
	}

	const onChangeEletheme= ( newContent ) => {
		setAttributes( {eletheme: newContent } )
	}

	/*
	**** Map
	'mapheight' 		=> $fotorama_elevation_options['height_of_map_10'] ?? '450',
	'showmap' 			=> 'true',

	**** Chart
	'chartheight' 		=> $fotorama_elevation_options['height_of_chart_11'] ?? '200',

	**** Fotorama
	'requiregps' 		=> $fotorama_elevation_options['images_with_gps_required_5'] ?? 'true',
	'dload' 			=> $fotorama_elevation_options['download_gpx_files_3'] ?? 'yes',

	'showadress' 		=> $fotorama_elevation_options['show_address_of_start_7'] ?? 'true', 
	'adresstext' 		=> $fotorama_elevation_options['text_for_start_address_8'] ?? 'Startadresse',

	'maxwidth' 			=> $fotorama_elevation_options['max_width_of_container_12'] ?? '600', 
	'minrowwidth' 		=> $fotorama_elevation_options['min_width_css_grid_row_14'] ?? '480',

	'showcaption' 		=> $fotorama_elevation_options['show_caption_4'] ?? 'true',
	'shortcaption'		=> 'false'

	'fit' 				=> $fotorama_elevation_options['fit'] ?? 'cover', // 'contain' Default, 'cover', 'scaledown', 'none'
	'ratio' 			=> $fotorama_elevation_options['ratio'] ?? '1.5',
	'background' 		=> $fotorama_elevation_options['background'] ?? 'darkgrey', // background color in CSS name
	'arrows' 			=> $fotorama_elevation_options['arrows'] ?? 'true',  // true : Default, false, 'always' : Do not hide controls on hover or tap
	'shadows' 			=> $fotorama_elevation_options['shadows'] ?? 'true' , // true or false

	'transition' 		=> $fotorama_elevation_options['transition'] ?? 'crossfade', // 'slide' Default 'crossfade' 'dissolve'
	'transitionduration' => $fotorama_elevation_options['transitionduration'] ?? '400', // in ms
	'loop' 				=> $fotorama_elevation_options['loop'] ?? 'true', // true or false
	'autoplay' 			=> $fotorama_elevation_options['autoplay'] ?? '3000', // on with 'true' or any interval in milliseconds.
		

	*** Thumbnails
	'navposition' 		=> $fotorama_elevation_options['navposition'] ?? 'bottom', // 'top'
	'navwidth' 			=> $fotorama_elevation_options['navwidth'] ?? '100', // in percent
	'f_thumbwidth' 		=> $fotorama_elevation_options['f_thumbwidth'] ?? '100', // in pixels
	'f_thumbheight' 	=> $fotorama_elevation_options['f_thumbheight'] ?? '75', // in pixels
	'thumbmargin' 		=> $fotorama_elevation_options['thumbmargin'] ?? '2', // in pixels
	'thumbborderwidth' 	=> $fotorama_elevation_options['thumbborderwidth'] ?? '2', // in pixels
	'thumbbordercolor' 	=> $fotorama_elevation_options['thumbbordercolor'] ?? '#ea0000', // background color in CSS name or HEX-value. The color of the last shortcode on the page will be taken.
	
	*/ 
	
	return (
		<>
			<InspectorControls>
				<PanelBody
							title={ __( 'Fotorama', ns )}
							initialOpen={true}
				>
					<PanelRow>
						<fieldset>
							<TextControl {...mykey='imgpath'}
								label={__(aff[mykey]['label'], ns) }
								value = { eval(mykey) } 
								onChange={ eval(aff[mykey]['callback']) }
								help={__(aff[mykey]['help'], ns)}
							/>
						</fieldset>
					</PanelRow>
				</PanelBody>
				<PanelBody
							title={ __( 'Map', ns )}
							initialOpen={true}
				>
					<PanelRow>
						<fieldset>
						<TextControl {...mykey='gpxfile'}
								label={__(aff[mykey]['label'], ns) }
								value = { eval(mykey) }
								onChange={eval(aff[mykey]['callback']) }
								help={__(aff[mykey]['help'], ns)}
							/>
						</fieldset>
					</PanelRow>
				</PanelBody>
				<PanelBody
							title={ __( 'Chart', ns )}
							initialOpen={true}
				>
					<SelectControl
						label={ __( 'Select Chart Theme:', ns  ) }
						value={ eletheme } // lime-theme, steelblue-theme, purple-theme, yellow-theme, red-theme, magenta-theme, lightblue-theme, martin-theme. 
						onChange={ onChangeEletheme }
						options={ [
							{ value: null, label: 'Select Chart Theme', disabled: true },
							{ value: 'lightblue-theme', label: 'lightblue-theme' },
							{ value: 'lime-theme', label: 'lime-theme' },
							{ value: 'magenta-theme', label: 'magenta-theme' },
							{ value: 'martin-theme', label: 'martin-theme' },
							{ value: 'purple-theme', label: 'purple-theme' },
							{ value: 'red-theme', label: 'red-theme' },
							{ value: 'steelblue-theme', label: 'steelblue-theme' },
							{ value: 'yellow-theme', label: 'yellow-theme' }
						] }
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<p><strong>Your Fotorama Settings:</strong></p>
				<p>Image-Path: <strong>{imgpath}</strong></p>
				<p>GPX-File: <strong>{gpxfile}</strong></p>
				<p>Chart Theme: <strong>{eletheme}</strong></p>
			</div>
		</>
	);
}
