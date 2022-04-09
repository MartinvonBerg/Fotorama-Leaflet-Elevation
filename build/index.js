/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/edit.js":
/*!*********************!*\
  !*** ./src/edit.js ***!
  \*********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Edit; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./editor.scss */ "./src/editor.scss");



/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */



/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */


/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */

function Edit(_ref) {
  let {
    attributes,
    setAttributes
  } = _ref;
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.useBlockProps)();
  const {
    imgpath,
    gpxfile,
    eletheme,
    chartheight,
    mapheight,
    showmap,
    showadress,
    adresstext,
    requiregps,
    showcaption,
    shortcaption,
    dload,
    maxwidth,
    minrowwidth
  } = attributes;

  const aff = (__webpack_require__(/*! ./block.json */ "./src/block.json").attributes); // attributes from File loaded.


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
      setAttributes({
        [source]: newContent
      });
    }

    if (aff[source].type === 'boolean') {
      setAttributes({
        [source]: newContent
      });
    }

    if (aff[source].type === 'number') {
      setAttributes({
        [source]: parseInt(newContent)
      });
    }
  };

  const ControlList = () => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, entries, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(attsPart, ns),
    initialOpen: false
  }), entries.map((attr, index) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, attr[1].section === attsPart && attr[1].type !== 'boolean' && attr[1]['options'] === undefined && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelRow, {
    key: index.toString()
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("fieldset", null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, mykey = attr[0], {
    key: mykey,
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(aff[mykey]['label'], ns),
    value: eval(mykey) //onChange={ eval(aff[mykey]['callback']) }
    ,
    onChange: newContent => onChangeHandler(newContent, attr[0]),
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(aff[mykey]['help'], ns)
  })))), attr[1].section == attsPart && attr[1]['options'] !== undefined && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.SelectControl, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, mykey = attr[0], {
    key: mykey,
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(aff[mykey]['label'], ns),
    value: eval(mykey) //onChange={ eval(aff[mykey]['callback']) }
    ,
    onChange: event => onChangeHandler(event, attr[0]),
    options: attr[1]['options']
  })), attr[1].section === attsPart && attr[1].type === 'boolean' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelRow, {
    key: index.toString()
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("fieldset", null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, mykey = attr[0], {
    key: mykey,
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(aff[mykey]['label'], ns),
    checked: eval(mykey) // onChange={ eval(aff[mykey]['callback']) }
    ,
    onChange: event => onChangeHandler(event, attr[0])
  }))))))));

  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, null, ControlList(aff, attributes, attsPart = 'fotorama'), ControlList(aff, attributes, attsPart = 'map'), ControlList(aff, attributes, attsPart = 'chart')), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("div", blockProps, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("p", null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("strong", null, "Your Fotorama Settings:")), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(TextList, {
    aff: aff,
    values: attributes
  })));
}

function TextList(props) {
  const aff = props.aff;
  let entries = Object.entries(aff);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("ul", null, entries.map((attr, index) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("p", {
    key: index.toString()
  }, attr[1].label, ": ", (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("strong", null, props.values[attr[0]].toString()))));
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

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style.scss */ "./src/style.scss");
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./edit */ "./src/edit.js");
/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */


/**
 * Internal dependencies
 */


/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */

(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)('fotoramamulti/fotorama-multi', {
  /**
   * @see ./edit.js
   */
  edit: _edit__WEBPACK_IMPORTED_MODULE_2__["default"],

  /**
   * Front end output is rendered by ServerSideCallback in PHP. So no function here.
   */
  save() {
    null;
  }

});

/***/ }),

/***/ "./src/editor.scss":
/*!*************************!*\
  !*** ./src/editor.scss ***!
  \*************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/style.scss":
/*!************************!*\
  !*** ./src/style.scss ***!
  \************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ (function(module) {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ (function(module) {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ (function(module) {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ (function(module) {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ (function(module) {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/extends.js":
/*!************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/extends.js ***!
  \************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _extends; }
/* harmony export */ });
function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

/***/ }),

/***/ "./src/block.json":
/*!************************!*\
  !*** ./src/block.json ***!
  \************************/
/***/ (function(module) {

module.exports = JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":2,"name":"fotoramamulti/fotorama-multi","version":"0.9.0","title":"Fotorama Elevation","category":"media","icon":"embed-photo","description":"Provide settings for the Fotorama-Elevation shortcode.","keywords":["fotorama","elevatin","map","chart","slider","image"],"supports":{"html":false,"customClassName":false},"textdomain":"fotorama-multi","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css","attributes":{"imgpath":{"type":"string","default":"none","section":"fotorama","label":"Image Path","help":"Path to your images in the uploads folder.","callback":"onChangeImgpath"},"showadress":{"type":"boolean","default":true,"section":"fotorama","label":"Show Address","help":"Show start adress of the tour","callback":"toggleShowadress"},"adresstext":{"type":"string","default":"Startadresse","section":"fotorama","label":"Start Address Text","help":"Text for header above start address","callback":"onChangeAdresstext"},"requiregps":{"type":"boolean","default":true,"section":"fotorama","label":"GPS-Data im Image required","help":"Show image only if it provides GPS-Data in its EXIF","callback":"toggleRequiregps"},"showcaption":{"type":"boolean","default":true,"section":"fotorama","label":"Show Caption","help":"Show the caption in the fotorama slider","callback":"toggleShowcaption"},"shortcaption":{"type":"boolean","default":false,"section":"fotorama","label":"Short Caption","help":"Shorten Caption to first line only","callback":"toggleShortcaption"},"maxwidth":{"type":"number","default":600,"section":"fotorama","label":"Max Width of Container","help":"Maximum width of the whole container with slider and map in px","callback":"onChangeMaxwidth"},"minrowwidth":{"type":"number","default":480,"section":"fotorama","label":"Minimum row width","help":"Minimum width of one row (slider or map) of the CSS-Grid in px","callback":"onChangeMinrowwidth"},"gpxfile":{"type":"string","default":"test.gpx","section":"map","label":"GPX-File","help":"The GPX-file in your GPX-directory (see Admin Settings)","callback":"onChangeGpxfile"},"dload":{"type":"boolean","default":true,"section":"map","label":"Allow Download GPX-File","help":"Provide download link for the GPX-Track(s)","callback":"toggleDload"},"mapheight":{"type":"number","default":450,"section":"map","label":"Height of Map","help":"Height of the leaflet elevation map in px","callback":"onChangeMapheight"},"showmap":{"type":"boolean","default":true,"section":"map","label":"Show map","help":"show map","callback":"toggleShowmap"},"eletheme":{"type":"string","default":"martin-theme","section":"chart","label":"Chart Theme","help":"","callback":"onChangeEletheme","options":[{"value":null,"label":"Select Chart Theme","disabled":true},{"value":"lightblue-theme","label":"lightblue-theme"},{"value":"lime-theme","label":"lime-theme"},{"value":"magenta-theme","label":"magenta-theme"},{"value":"martin-theme","label":"martin-theme"},{"value":"purple-theme","label":"purple-theme"},{"value":"red-theme","label":"red-theme"},{"value":"steelblue-theme","label":"steelblue-theme"},{"value":"yellow-theme","label":"yellow-theme"}]},"chartheight":{"type":"number","default":200,"section":"chart","label":"Height of Chart","help":"Height of the leaflet elevation chart in px","callback":"onChangeChartheight"}}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	!function() {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = function(result, chunkIds, fn, priority) {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var priority = deferred[i][2];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every(function(key) { return __webpack_require__.O[key](chunkIds[j]); })) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"index": 0,
/******/ 			"./style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = function(chunkId) { return installedChunks[chunkId] === 0; };
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some(function(id) { return installedChunks[id] !== 0; })) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkfotorama_multi"] = self["webpackChunkfotorama_multi"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["./style-index"], function() { return __webpack_require__("./src/index.js"); })
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map