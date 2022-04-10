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
	ColorPicker,
	BaseControl
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
	const { imgpath, gpxfile, eletheme, chartheight, mapheight, showmap, showadress, adresstext, 
			requiregps, showcaption, shortcaption, dload, maxwidth, minrowwidth, fit, ratio,
			background, arrows, shadows, transition, transitionduration, loop, autoplay, ignoresort,
			navposition, navwidth, f_thumbwidth, f_thumbheight, thumbmargin, thumbborderwidth, thumbbordercolor, color} = attributes;
	const aff =  require('./block.json')['attributes']; // aff: attributes from File loaded.
	let entries = Object.entries(aff);
	const ns = 'fotoramamulti';
	let mykey = '';
	let attsPart = '';
		
	const onChangeHandler = (newContent, source) => {
		if (aff[source].type === 'string') {
			setAttributes( {[source]: newContent} )
		} 
		if (aff[source].type === 'boolean') {
			setAttributes( {[source]: newContent} )
		}
		if (aff[source].type === 'number' && source !== 'ratio') {
			if (isNaN(newContent)) newContent = 0;
			setAttributes( {[source]: parseInt(newContent) } )
		}
		if (aff[source].type === 'string' && source === 'ratio') {
			newContent = newContent.replace(/[^\d.-]/g, '');
			setAttributes( {[source]: newContent } ) 
		}	
	}
		
	const ControlList = () => (
		<>	
		<PanelBody {...entries}
			title={ __( attsPart, ns )}
			initialOpen={attsPart === 'Select' ? true : false}
		>
			{entries.map((attr, index) => (
				<>
				  {attr[1].section === attsPart && attr[1].type !== 'boolean' && attr[1]['options'] === undefined && ! attr[1].label.includes('Colour')  &&
					<PanelRow key={index.toString()}>
						<fieldset>
							<TextControl {...mykey=attr[0]}
								key={mykey}
								label={__(aff[mykey]['label'], ns) }
								value = { eval(mykey) } 
								onChange={(newContent) => onChangeHandler(newContent, attr[0])}
								help={__(aff[mykey]['help'], ns)}
							/>
						</fieldset>	
					</PanelRow>
				  }
				  {attr[1].section === attsPart && attr[1].type !== 'boolean' && attr[1]['options'] === undefined && attr[1].label.includes('Colour')  &&
				    <PanelRow key={index.toString()}>	
						<BaseControl 
							{...mykey=attr[0]}
							label={__(aff[mykey]['label'], ns) }>		
							<ColorPicker 
								color={ eval(mykey) }
								onChange={(newContent) => onChangeHandler(newContent, attr[0])}
								enableAlpha={false}
								defaultValue="#000"
								copyFormat="hex"
							/>
						</BaseControl>
					</PanelRow>		
				  }
				  {attr[1].section == attsPart && attr[1]['options'] !== undefined &&	
					<SelectControl {...mykey=attr[0]}
						key={mykey}
						label={__(aff[mykey]['label'], ns) }
						value = { eval(mykey) } 
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
				{ControlList (aff, attributes, attsPart='Select' )}
				{ControlList (aff, attributes, attsPart='Slider' )}
				{ControlList (aff, attributes, attsPart='Thumbs' )}
				{ControlList (aff, attributes, attsPart='Map' )}
				{ControlList (aff, attributes, attsPart='Chart' )}
			</InspectorControls>
			<div {...blockProps}>
				<p><strong>Fotorama Settings on the right side.</strong></p>
				{/*<TextList aff={aff} values={attributes} />*/}
			</div>
		</>
	)
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
 