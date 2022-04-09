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
	const { imgpath, gpxfile, eletheme, chartheight,
		 	mapheight, showmap, showadress, adresstext, requiregps, showcaption, shortcaption,
			dload, maxwidth, minrowwidth} = attributes;
	const aff =  require('./block.json')['attributes']; // attributes from File loaded.
	let entries = Object.entries(aff);
	const ns = 'fotoramamulti';
	let mykey = '';
	let attsPart = '';
		/*
	var a = ["aab1","aac6","aad5","aag5","aahs9"];
	for (var i = 0; i < a.length; i++) {        
    	window[aff[i]] = function(){
    	};
	}
	
	entries.map((attr, index) => {
		document[attr[1].callback] = function( newContent ){
			let mykey=eval(attr[0]);
			setAttributes( {mykey:newContent} )
		}
	})
	debugger;
	
	// functions for the fotorama
	const onChangeImgpath = ( newContent ) => {
		setAttributes( { imgpath: newContent } )
	}
	const toggleShowadress = () => {
		setAttributes( { showadress: ! showadress } )
	}
	const onChangeAdresstext = ( newContent ) => {
		setAttributes( { adresstext: newContent } )
	}
	const toggleRequiregps = () => {
		setAttributes( { requiregps: ! requiregps } )
	}
	const toggleShowcaption = () => {
		setAttributes( { showcaption: ! showcaption } )
	}
	const toggleShortcaption = () => {
		setAttributes( { shortcaption: ! shortcaption } )
	}
	const onChangeMaxwidth = ( newContent ) => {
		setAttributes( { maxwidth: parseInt(newContent) } )
	}
	const onChangeMinrowwidth = ( newContent ) => {
		setAttributes( { minrowwidth: parseInt(newContent) } )
	}


	// functions for the map
	const onChangeGpxfile = ( newContent ) => {
		setAttributes( { gpxfile: newContent } )
	}
	const toggleDload = () => {
		setAttributes( { dload: ! dload } )
	}
	const onChangeMapheight = ( newContent ) => {
		setAttributes( { mapheight: parseInt(newContent) } )
	}
	const toggleShowmap = () => {
		setAttributes( { showmap: ! showmap } )
	}

	// functions for the chart
	const onChangeEletheme = ( newContent ) => {
		setAttributes( { eletheme: newContent } )
	}
	const onChangeChartheight = ( newContent ) => {
		setAttributes( { chartheight: parseInt(newContent) } )
	} 
	*/
	const onChangeHandler = (newContent, source) => {
		if (aff[source].type === 'string') {
			setAttributes( {[source]: newContent} )
		} 
		if (aff[source].type === 'boolean') {
			setAttributes( {[source]: newContent} )
		}
		if (aff[source].type === 'number') {
			setAttributes( {[source]: parseInt(newContent) } )
		}	
	}
	
	const ControlList = () => (
		<>	
		<PanelBody {...entries}
			title={ __( attsPart, ns )}
			initialOpen={false}>

			{entries.map((attr, index) => (
				<>
				  {attr[1].section === attsPart && attr[1].type !== 'boolean' && attr[1]['options'] === undefined &&
					<PanelRow key={index.toString()}>
						<fieldset>
							<TextControl {...mykey=attr[0]}
								key={mykey}
								label={__(aff[mykey]['label'], ns) }
								value = { eval(mykey) } 
								//onChange={ eval(aff[mykey]['callback']) }
								onChange={(newContent) => onChangeHandler(newContent, attr[0])}
								help={__(aff[mykey]['help'], ns)}
							/>
						</fieldset>	
					</PanelRow>
				  }
				  {attr[1].section == attsPart && attr[1]['options'] !== undefined &&	
					<SelectControl {...mykey=attr[0]}
						key={mykey}
						label={__(aff[mykey]['label'], ns) }
						value = { eval(mykey) } 
						//onChange={ eval(aff[mykey]['callback']) }
						onChange={(event) => onChangeHandler(event, attr[0])}
						options={ attr[1]['options'] }
					/>
				  }
				  {attr[1].section === attsPart && attr[1].type === 'boolean' &&
					<PanelRow key={index.toString()}>
						<fieldset>
							<ToggleControl {...mykey=attr[0]}
								key={mykey}
								label={__(aff[mykey]['label'], ns) }
								checked={ eval(mykey) }
								// onChange={ eval(aff[mykey]['callback']) }
								onChange={(event) => onChangeHandler(event, attr[0])}
							/>
						</fieldset>
					</PanelRow>
			 	  }
				</>
			)
			)}
		</PanelBody> 
		</>
	)

	return (
		<>
			<InspectorControls>
				{ControlList (aff, attributes, attsPart='fotorama' )}
				{ControlList (aff, attributes, attsPart='map' )}
				{ControlList (aff, attributes, attsPart='chart' )}
			</InspectorControls>

			<div {...blockProps}>
				<p><strong>Your Fotorama Settings:</strong></p>
				<TextList aff={aff} values={attributes} />
			</div>
		</>
	);
}

function TextList(props) {
	const aff = props.aff;
	let entries = Object.entries(aff);
	
	return (
	  <ul>
		{entries.map((attr, index) =>
		   <p key={index.toString()}>{attr[1].label}: <strong>{props.values[attr[0]].toString()}</strong></p>
		)}
	  </ul>
	);
}

/*
	**** Fotorama
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