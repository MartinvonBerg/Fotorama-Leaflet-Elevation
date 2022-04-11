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


 //import ServerSideRender from '@wordpress/server-side-render';

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
    minrowwidth,
    fit,
    ratio,
    gpxpath,
    alttext,
    background,
    arrows,
    shadows,
    transition,
    transitionduration,
    loop,
    autoplay,
    ignoresort,
    navposition,
    navwidth,
    f_thumbwidth,
    f_thumbheight,
    thumbmargin,
    thumbborderwidth,
    thumbbordercolor
  } = attributes;

  const aff = (__webpack_require__(/*! ./block.json */ "./src/block.json").attributes); // aff: attributes from File loaded.


  let entries = Object.entries(aff);
  const ns = 'fotoramamulti'; // the namespace for i18n

  let mykey = '';
  let attsPart = '';

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

    if (aff[source].type === 'number' && source !== 'ratio') {
      if (isNaN(newContent)) newContent = 0;
      setAttributes({
        [source]: parseInt(newContent)
      });
    }

    if (aff[source].type === 'string' && source === 'ratio') {
      newContent = newContent.replace(/[^\d.-]/g, '');
      setAttributes({
        [source]: newContent
      });
    }
  };

  const ControlList = () => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, entries, {
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(attsPart, ns),
    initialOpen: attsPart === 'Select' ? true : false
  }), entries.map((attr, index) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, attr[1].section === attsPart && attr[1].type !== 'boolean' && attr[1]['options'] === undefined && !attr[1].label.includes('Colour') && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelRow, {
    key: index.toString()
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("fieldset", null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, mykey = attr[0], {
    key: mykey,
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(aff[mykey]['label'], ns),
    value: eval(mykey),
    onChange: newContent => onChangeHandler(newContent, attr[0]),
    help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(aff[mykey]['help'], ns)
  })))), attr[1].section === attsPart && attr[1].type !== 'boolean' && attr[1]['options'] === undefined && attr[1].label.includes('Colour') && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelRow, {
    key: index.toString()
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.BaseControl, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, mykey = attr[0], {
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(aff[mykey]['label'], ns)
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ColorPicker, {
    color: eval(mykey),
    onChange: newContent => onChangeHandler(newContent, attr[0]),
    enableAlpha: false,
    defaultValue: "#000",
    copyFormat: "hex"
  }))), attr[1].section == attsPart && attr[1]['options'] !== undefined && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.SelectControl, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, mykey = attr[0], {
    key: mykey,
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(aff[mykey]['label'], ns),
    value: eval(mykey),
    onChange: event => onChangeHandler(event, attr[0]),
    options: attr[1]['options']
  })), attr[1].section === attsPart && attr[1].type === 'boolean' && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelRow, {
    key: index.toString()
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("fieldset", null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, mykey = attr[0], {
    key: mykey,
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(aff[mykey]['label'], ns),
    checked: eval(mykey),
    onChange: event => onChangeHandler(event, attr[0])
  }))))))));

  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, null, ControlList(aff, attributes, attsPart = 'Select'), ControlList(aff, attributes, attsPart = 'Slider'), ControlList(aff, attributes, attsPart = 'Thumbs'), ControlList(aff, attributes, attsPart = 'Map'), ControlList(aff, attributes, attsPart = 'Chart')), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("div", blockProps, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("p", null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("strong", null, "Fotorama Settings on the right side."))));
}

function Ssr(attributes) {
  let blockContent = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Serve Side Render failed!'));
  let attr = attributes.attributes;
  blockContent = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(ServerSideRender, {
    block: "fotoramamulti/fotorama-multi",
    attributes: attr
  });
  if (blockContent.props.children == null) blockContent = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Serve Side Render failed!'));
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, blockContent);
}

function TextList(props) {
  const aff = props.aff;
  let entries = Object.entries(aff);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("ul", null, entries.map((attr, index) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("p", {
    key: index.toString()
  }, attr[1].label, ": ", (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)("strong", null, props.values[attr[0]].toString()))));
}

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
  // TODO: Solve the issue with invalid json.
  save: () => {
    return null;
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

module.exports = JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":2,"name":"fotoramamulti/fotorama-multi","version":"0.9.0","title":"Fotorama Elevation","category":"media","icon":"embed-photo","description":"Provide settings for the Fotorama-Elevation shortcode.","keywords":["fotorama","elevatin","map","chart","slider","image"],"supports":{"html":false,"customClassName":false},"textdomain":"fotorama-multi","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css","attributes":{"imgpath":{"type":"string","default":"none","section":"Select","label":"Image Path","help":"Path to your images in the uploads folder."},"showadress":{"type":"boolean","default":true,"section":"Slider","label":"Show Address","help":"Show start adress of the tour"},"adresstext":{"type":"string","default":"Startadresse","section":"Slider","label":"Start Address Text","help":"Text for header above start address"},"requiregps":{"type":"boolean","default":true,"section":"Slider","label":"GPS-Data in Image required","help":"Show image only if it provides GPS-Data in its EXIF"},"ignoresort":{"type":"boolean","default":false,"section":"Slider","label":"Ignore Custom Sort","help":"Ignore custom sort even if provided by Wordpress. Sort ascending by date taken if checked"},"showcaption":{"type":"boolean","default":true,"section":"Slider","label":"Show Caption","help":"Show the caption in the fotorama slider"},"shortcaption":{"type":"boolean","default":false,"section":"Slider","label":"Short Caption","help":"Shorten Caption to first line only"},"maxwidth":{"type":"number","default":800,"section":"Slider","label":"Max Width of Container","help":"Maximum width of the whole container with slider and map in px"},"minrowwidth":{"type":"number","default":480,"section":"Slider","label":"Minimum row width","help":"Minimum width of one row (slider or map) of the CSS-Grid in px"},"fit":{"type":"string","default":"cover","section":"Slider","label":"Fit Images","help":"","options":[{"value":null,"label":"Select how to fit the images","disabled":true},{"value":"cover","label":"cover"},{"value":"contain","label":"contain"}]},"ratio":{"type":"string","default":1.5,"section":"Slider","label":"Width / Height Ratio","help":"Define the width / height ratio of the slider"},"background":{"type":"string","default":"darkgrey","section":"Slider","label":"Background Colour","help":"Background Colour as CSS-Name."},"arrows":{"type":"boolean","default":true,"section":"Slider","label":"Show Arrows"},"shadows":{"type":"boolean","default":true,"section":"Slider","label":"Show Shadows"},"transition":{"type":"string","default":"slide","section":"Slider","label":"Transition Effect","help":"","options":[{"value":null,"label":"Select the slide transition effect","disabled":true},{"value":"slide","label":"slide"},{"value":"crossfade","label":"crossfade"},{"value":"dissolve","label":"dissolve"}]},"transitionduration":{"type":"number","default":400,"section":"Slider","label":"Transition Duration","help":"Duration of slide transition in ms"},"loop":{"type":"boolean","default":true,"section":"Slider","label":"Loop through images (proceed with first once reached the last)"},"autoplay":{"type":"string","default":"false","section":"Slider","label":"Autoplay","help":"Autoplay the slider. On with true or any numeric interval in milliseconds. Of with false"},"gpxfile":{"type":"string","default":"test.gpx","section":"Select","label":"GPX-File","help":"The GPX-file in your GPX-directory (see Admin Settings)"},"gpxpath":{"type":"string","default":"gpx","section":"Map","label":"GPX-Path","help":"Path to file(s) with GPX-Track(s) relative to the Wordpress uploads folder"},"alttext":{"type":"string","default":"","section":"Slider","label":"Alt-Text","help":"Alltext for the whole fotorama slider for SEO"},"dload":{"type":"boolean","default":true,"section":"Map","label":"Allow Download GPX-File","help":"Provide download link for the GPX-Track(s)"},"mapheight":{"type":"number","default":450,"section":"Map","label":"Height of Map","help":"Height of the leaflet elevation map in px (is recalculated in Browser. Might show no effect if too big.)"},"showmap":{"type":"boolean","default":true,"section":"Map","label":"Show map","help":"show map"},"eletheme":{"type":"string","default":"martin-theme","section":"Chart","label":"Chart Theme","help":"","options":[{"value":null,"label":"Select Chart Theme","disabled":true},{"value":"lightblue-theme","label":"lightblue-theme"},{"value":"lime-theme","label":"lime-theme"},{"value":"magenta-theme","label":"magenta-theme"},{"value":"martin-theme","label":"martin-theme"},{"value":"purple-theme","label":"purple-theme"},{"value":"red-theme","label":"red-theme"},{"value":"steelblue-theme","label":"steelblue-theme"},{"value":"yellow-theme","label":"yellow-theme"}]},"chartheight":{"type":"number","default":200,"section":"Chart","label":"Height of Chart","help":"Height of the leaflet elevation chart in px (is recalculated in Browser. Might show no effect if too big.)"},"navposition":{"type":"string","default":"bottom","section":"Thumbs","label":"Thumbnails Position","help":"","options":[{"value":null,"label":"Select Thumbnails Position","disabled":true},{"value":"bottom","label":"Bottom"},{"value":"top","label":"Top"}]},"navwidth":{"type":"number","default":100,"section":"Thumbs","label":"Thumbnails bar width","help":"Width of Thumbnails bar in Percent of Slider width."},"f_thumbwidth":{"type":"number","default":100,"section":"Thumbs","label":"Thumbs Width","help":"Width of single Thumbnail in px"},"f_thumbheight":{"type":"number","default":75,"section":"Thumbs","label":"Thumbs Height","help":"Height of Thumbnails in px"},"thumbmargin":{"type":"number","default":2,"section":"Thumbs","label":"Thumbs Margin","help":"Margin of Thumbnails in px"},"thumbborderwidth":{"type":"number","default":2,"section":"Thumbs","label":"Thumbs Border","help":"Border of Thumbnails in px"},"thumbbordercolor":{"type":"string","default":"#ea0000","section":"Thumbs","label":"Thumbs Border Colour","help":"Colour of Thumbnails Border as CSS Hex Color"}}}');

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