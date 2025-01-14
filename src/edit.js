import { __ } from '@wordpress/i18n';

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

//import ServerSideRender from '@wordpress/server-side-render';
//import { useEffect } from '@wordpress/element';

import './editor.scss';
//import { mainLogic } from '../js/fm_main_func.js';

export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps();
	const { 
		imgpath, gpxfile, eletheme, chartheight, mapheight, showmap, showadress, adresstext, 
		requiregps, showcaption, shortcaption, dload, maxwidth, minrowwidth, fit, ratio, gpxpath, alttext,
		background, arrows, shadows, transition, transitionduration, loop, autoplay, ignoresort, mapselector,
		navposition, navwidth, f_thumbwidth, f_thumbheight, thumbmargin, thumbborderwidth, thumbbordercolor, mapaspect,
		// Hinzugefügte fehlende Parameter
		showchart, chart_fill_color, chart_background_color, charttype, chartjspadding, trackwidth, trackcolour,
		showalltracks, sw_button_color, sw_effect, sw_zoom, sw_fslightbox, 
		sw_mousewheel, sw_hashnavigation, sw_max_zoom_ratio,
		sw_thumbbartype, sw_bar_margin_top, sw_activetype, slider, sortorder, filefilter, 
	} = attributes;
	const aff =  require('./block.json')['attributes']; // aff: attributes from File loaded.
	let entries = Object.entries(aff);
	const ns = 'fotoramamulti'; // the namespace for i18n
	let attsPart = '';
		
	const onChangeHandler = (newContent, source) => {
		if (aff[source].type === 'string') {
			setAttributes( {[source]: newContent} )
		} 
		if (aff[source].type === 'boolean') {
			setAttributes( {[source]: newContent} )
		}
		if (aff[source].type === 'number' && source !== 'ratio') {
			newContent = newContent.replace(/[^\d-]/g, '');
			setAttributes( {[source]: newContent } )
		}
		if (aff[source].type === 'string' && source === 'ratio') {
			newContent = newContent.replace(/[^\d.-]/g, '');
			setAttributes( {[source]: newContent } ) 
		}	
	}
		
	const ControlList = () => (
		<>  
			<PanelBody 
				title={ __( attsPart, ns )} 
				initialOpen={attsPart === 'Select' ? true : false}
			>
				{entries.map((attr, index) => (
					<React.Fragment key={`fragment-${index}`}>
						{attr[1].section === attsPart && attr[1].type !== 'boolean' && attr[1]['options'] === undefined && !attr[1].label.includes('Colour') && (
							<PanelRow key={`panelrow-${index}`}>
								<fieldset key={`fieldset-${index}`}>
									<TextControl
										label={__(aff[attr[0]]['label'], ns)}
										value={eval(attr[0])}
										onChange={(newContent) => onChangeHandler(newContent, attr[0])}
										help={__(aff[attr[0]]['help'], ns)}
									/>
								</fieldset>
							</PanelRow>
						)}
						{attr[1].section === attsPart && attr[1].type !== 'boolean' && attr[1]['options'] === undefined && attr[1].label.includes('Colour') && (
							<PanelRow key={`panelrow-color-${index}`}>
								<BaseControl 
									label={__(aff[attr[0]]['label'], ns)}
								>
									<ColorPicker
										color={eval(attr[0])}
										onChange={(newContent) => onChangeHandler(newContent, attr[0])}
										enableAlpha={false}
										defaultValue="#000"
										copyFormat="hex"
									/>
								</BaseControl>
							</PanelRow>
						)}
						{attr[1].section === attsPart && attr[1]['options'] !== undefined && (
							<SelectControl
								key={`selectcontrol-${index}`}
								label={__(aff[attr[0]]['label'], ns)}
								value={eval(attr[0])}
								onChange={(event) => onChangeHandler(event, attr[0])}
								options={attr[1]['options']}
							/>
						)}
						{attr[1].section === attsPart && attr[1].type === 'boolean' && (
							<PanelRow key={`panelrow-toggle-${index}`}>
								<fieldset key={`fieldset-toggle-${index}`}>
									<ToggleControl
										label={__(aff[attr[0]]['label'], ns)}
										checked={eval(attr[0])}
										onChange={(event) => onChangeHandler(event, attr[0])}
									/>
								</fieldset>
							</PanelRow>
						)}
					</React.Fragment>
				))}
			</PanelBody> 
		</>
	);
	/*
	function updateAttr(attr) {
		for (const [key, value] of Object.entries(attr)) {
			if (typeof value === "number") {
				attr[key] = String(value); // Zahlen in Strings umwandeln
			} else {
				attr[key] = value; // Andere Werte unverändert lassen
			}
		}
		return attr;
	}
	
	const onLoad = (doc, win, vars) => {
		let numberOfBoxes = doc.querySelectorAll('[id^=multifotobox]').length;
        console.log('SSR onLoad: Anzahl der Boxen:', numberOfBoxes);

        if (numberOfBoxes > 0) {
            console.log('Boxes gefunden!');
            // Hier kannst du weitere Logik ausführen
			if (typeof mainLogic == 'function') {
				console.log('mainLogic wird ausgeführt.');
				mainLogic(window, document, doc, win, vars); // iframe-Dokument übergeben
			}
        } else {
            console.log('Keine Boxen gefunden.');
        }
    };

	// Überwache Änderungen im DOM bei Iframe
	/*
	useEffect(() => {
		const observer = new MutationObserver(() => {
			const numberOfBoxes = document.querySelectorAll('[id^=multifotobox]').length;
	
			if (numberOfBoxes > 0) {
				console.log('Boxen gefunden nach Mutation:', numberOfBoxes);
				onLoad();
			}
		});
	
		const targetNode = document.querySelector('.wp-block'); // Container von ServerSideRender
		if (targetNode) {
			observer.observe(targetNode, { childList: true, subtree: true });
		}
	
		return () => observer.disconnect(); // Cleanup
	}, []);
	
	useEffect(() => {
		// Finde das iframe im Hauptdokument (only for curren themes)
		const iframe = document.querySelector('iframe[name="editor-canvas"]'); // Passe den Selektor ggf. an
		if (!iframe) {
			console.log('Iframe nicht gefunden!');
			return;
		} else {
			console.log('Iframe gefunden!');
		}
	
		// Greife auf das Dokument innerhalb des iframe zu
		const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
		const iframeWin = iframe.contentWindow;
		let mainPageVars = pageVarsForJs;

		if (!iframeDoc) {
			console.error('Inhalt des iframe-Dokuments konnte nicht geladen werden!');
			return;
		}
	
		// MutationObserver für den iframe-Inhalt
		const observer = new MutationObserver(() => {
			const numberOfBoxes = iframeDoc.querySelectorAll('[id^=multifotobox]').length;
	
			if (numberOfBoxes > 0) {
				console.log('Boxen gefunden im iframe:', numberOfBoxes);
				//onLoad(iframeDoc, iframeWin, mainPageVars);
			}
		});
	
		// Zielknoten im iframe-Dokument überwachen
		const targetNode = iframeDoc.body;
		if (targetNode) {
			observer.observe(targetNode, { childList: true, subtree: true });
		}
	
		return () => {
			observer.disconnect(); // Cleanup des Observers
		};
	}, []);
	*/

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
				<p>Slider-Map-Chart Settings on the right side.</p>
				
				{/*<ServerSideRender
						block="fotoramamulti/fotorama-multi"
						attributes = {updateAttr(attributes)}
					/>*/}
				
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