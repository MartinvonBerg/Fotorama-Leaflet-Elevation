(function(){"use strict";var __webpack_modules__={888:function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{Z:function(){return Edit}});var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__(462),_wordpress_element__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(307),_wordpress_element__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__),_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(736),_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__),_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(175),_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__),_wordpress_components__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(609),_wordpress_components__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);function Edit(_ref){let{attributes:attributes,setAttributes:setAttributes}=_ref;const blockProps=(0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)(),{imgpath:imgpath,gpxfile:gpxfile,eletheme:eletheme,chartheight:chartheight,mapheight:mapheight,showmap:showmap,showadress:showadress,adresstext:adresstext,requiregps:requiregps,showcaption:showcaption,shortcaption:shortcaption,dload:dload,maxwidth:maxwidth,minrowwidth:minrowwidth,fit:fit,ratio:ratio,gpxpath:gpxpath,alttext:alttext,background:background,arrows:arrows,shadows:shadows,transition:transition,transitionduration:transitionduration,loop:loop,autoplay:autoplay,ignoresort:ignoresort,mapselector:mapselector,navposition:navposition,navwidth:navwidth,f_thumbwidth:f_thumbwidth,f_thumbheight:f_thumbheight,thumbmargin:thumbmargin,thumbborderwidth:thumbborderwidth,thumbbordercolor:thumbbordercolor,mapaspect:mapaspect}=attributes,aff=__webpack_require__(289).Y4;let entries=Object.entries(aff);const ns="fotoramamulti";let mykey="",attsPart="";const onChangeHandler=(e,t)=>{"string"===aff[t].type&&setAttributes({[t]:e}),"boolean"===aff[t].type&&setAttributes({[t]:e}),"number"===aff[t].type&&"ratio"!==t&&(e=e.replace(/[^\d-]/g,""),setAttributes({[t]:e})),"string"===aff[t].type&&"ratio"===t&&(e=e.replace(/[^\d.-]/g,""),setAttributes({[t]:e}))},ControlList=()=>(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment,null,(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody,(0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_4__.Z)({},entries,{title:(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)(attsPart,ns),initialOpen:"Select"===attsPart}),entries.map(((attr,index)=>(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment,null,attr[1].section===attsPart&&"boolean"!==attr[1].type&&void 0===attr[1].options&&!attr[1].label.includes("Colour")&&(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow,{key:index.toString()},(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("fieldset",null,(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl,(0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_4__.Z)({},mykey=attr[0],{key:mykey,label:(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)(aff[mykey].label,ns),value:eval(mykey),onChange:e=>onChangeHandler(e,attr[0]),help:(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)(aff[mykey].help,ns)})))),attr[1].section===attsPart&&"boolean"!==attr[1].type&&void 0===attr[1].options&&attr[1].label.includes("Colour")&&(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow,{key:index.toString()},(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl,(0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_4__.Z)({},mykey=attr[0],{label:(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)(aff[mykey].label,ns)}),(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ColorPicker,{color:eval(mykey),onChange:e=>onChangeHandler(e,attr[0]),enableAlpha:!1,defaultValue:"#000",copyFormat:"hex"}))),attr[1].section==attsPart&&void 0!==attr[1].options&&(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl,(0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_4__.Z)({},mykey=attr[0],{key:mykey,label:(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)(aff[mykey].label,ns),value:eval(mykey),onChange:e=>onChangeHandler(e,attr[0]),options:attr[1].options})),attr[1].section===attsPart&&"boolean"===attr[1].type&&(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow,{key:index.toString()},(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("fieldset",null,(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl,(0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_4__.Z)({},mykey=attr[0],{key:mykey,label:(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)(aff[mykey].label,ns),checked:eval(mykey),onChange:e=>onChangeHandler(e,attr[0])})))))))));return(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment,null,(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls,null,ControlList(aff,attributes,attsPart="Select"),ControlList(aff,attributes,attsPart="Slider"),ControlList(aff,attributes,attsPart="Thumbs"),ControlList(aff,attributes,attsPart="Map"),ControlList(aff,attributes,attsPart="Chart")),(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div",blockProps,(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("p",null,(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong",null,"Fotorama Settings on the right side."))))}function TextList(e){const t=e.aff;let _=Object.entries(t);return createElement("ul",null,_.map(((t,_)=>createElement("p",{key:_.toString()},t[1].label,": ",createElement("strong",null,e.values[t[0]].toString())))))}},576:function(e,t,_){var r=window.wp.blocks,a=_(888);(0,r.registerBlockType)("fotoramamulti/fotorama-multi",{edit:a.Z,save:()=>null})},175:function(e){e.exports=window.wp.blockEditor},609:function(e){e.exports=window.wp.components},307:function(e){e.exports=window.wp.element},736:function(e){e.exports=window.wp.i18n},462:function(e,t,_){function r(){return r=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var _=arguments[t];for(var r in _)Object.prototype.hasOwnProperty.call(_,r)&&(e[r]=_[r])}return e},r.apply(this,arguments)}_.d(t,{Z:function(){return r}})},289:function(e){e.exports=JSON.parse('{"Y4":{"imgpath":{"type":"string","default":"Bilder","section":"Select","label":"Image Path","help":"Path to your images in the uploads folder."},"showadress":{"type":"boolean","default":true,"section":"Slider","label":"Show Address","help":"Show start adress of the tour"},"adresstext":{"type":"string","default":"Startadresse","section":"Slider","label":"Start Address Text","help":"Text for header above start address"},"requiregps":{"type":"boolean","default":true,"section":"Slider","label":"GPS-Data in Image required","help":"Show image only if it provides GPS-Data in its EXIF"},"ignoresort":{"type":"boolean","default":false,"section":"Slider","label":"Ignore Custom Sort","help":"Ignore custom sort even if provided by Wordpress. Sort ascending by date taken if checked"},"showcaption":{"type":"boolean","default":true,"section":"Slider","label":"Show Caption","help":"Show the caption in the fotorama slider"},"shortcaption":{"type":"boolean","default":false,"section":"Slider","label":"Short Caption","help":"Shorten Caption to first line only"},"maxwidth":{"type":"string","default":800,"section":"Slider","label":"Max Width of Container","help":"Maximum width of the whole container with slider and map in px"},"minrowwidth":{"type":"string","default":480,"section":"Slider","label":"Minimum row width","help":"Minimum width of one row (slider or map) of the CSS-Grid in px"},"fit":{"type":"string","default":"cover","section":"Slider","label":"Fit Images","help":"","options":[{"value":null,"label":"Select how to fit the images","disabled":true},{"value":"cover","label":"cover"},{"value":"contain","label":"contain"}]},"ratio":{"type":"string","default":1.5,"section":"Slider","label":"Width / Height (Aspect) Ratio","help":"Define the width / height ratio of the slider"},"background":{"type":"string","default":"darkgrey","section":"Slider","label":"Background Colour","help":"Background Colour as CSS-Name."},"arrows":{"type":"string","default":"true","section":"Slider","label":"Show Arrows","help":"","options":[{"value":null,"label":"Select when to show Arrows","disabled":true},{"value":"true","label":"Only on hover"},{"value":"false","label":"Never"},{"value":"always","label":"Always"}]},"shadows":{"type":"boolean","default":true,"section":"Slider","label":"Show Shadows"},"transition":{"type":"string","default":"crossfade","section":"Slider","label":"Transition Effect","help":"","options":[{"value":null,"label":"Select the slide transition effect","disabled":true},{"value":"slide","label":"slide"},{"value":"crossfade","label":"crossfade"},{"value":"dissolve","label":"dissolve"}]},"transitionduration":{"type":"string","default":400,"section":"Slider","label":"Transition Duration","help":"Duration of slide transition in ms"},"loop":{"type":"boolean","default":true,"section":"Slider","label":"Loop through images (proceed with first once reached the last)"},"autoplay":{"type":"string","default":"false","section":"Slider","label":"Autoplay","help":"Autoplay the slider. On with true or any numeric interval in milliseconds. Of with false"},"gpxfile":{"type":"string","default":"test.gpx","section":"Select","label":"GPX-File","help":"The GPX-file in your GPX-directory (see Admin Settings)"},"gpxpath":{"type":"string","default":"gpx","section":"Map","label":"GPX-Path","help":"Path to file(s) with GPX-Track(s) relative to the Wordpress uploads folder"},"alttext":{"type":"string","default":"","section":"Slider","label":"Alt-Text","help":"Alltext for the whole fotorama slider for SEO"},"dload":{"type":"boolean","default":true,"section":"Map","label":"Allow Download GPX-File","help":"Provide download link for the GPX-Track(s)"},"mapheight":{"type":"string","default":1000,"section":"Map","label":"Maximum Height of Map","help":"Max. Height of the leaflet elevation map in px. Mind the relation to Aspect Ratio of Map."},"mapaspect":{"type":"string","default":1.5,"section":"Map","label":"Width / Height (Aspect) Ratio","help":"Define the width / height ratio of the Map"},"showmap":{"type":"boolean","default":true,"section":"Map","label":"Show map","help":"show map"},"mapselector":{"type":"string","default":"OpenStreetMap","section":"Map","label":"Select Map","help":"","options":[{"value":null,"label":"Select Map","disabled":true},{"value":"OpenStreetMap","label":"OpenStreetMap"},{"value":"OpenTopoMap","label":"OpenTopoMap"},{"value":"CycleOSM","label":"CycleOSM"},{"value":"Satellit","label":"Satellit"}]},"eletheme":{"type":"string","default":"martin-theme","section":"Chart","label":"Chart Theme","help":"","options":[{"value":null,"label":"Select Chart Theme","disabled":true},{"value":"lightblue-theme","label":"lightblue-theme"},{"value":"lime-theme","label":"lime-theme"},{"value":"magenta-theme","label":"magenta-theme"},{"value":"martin-theme","label":"martin-theme"},{"value":"purple-theme","label":"purple-theme"},{"value":"red-theme","label":"red-theme"},{"value":"steelblue-theme","label":"steelblue-theme"},{"value":"yellow-theme","label":"yellow-theme"}]},"chartheight":{"type":"string","default":200,"section":"Chart","label":"Height of Chart","help":"Height of the leaflet elevation chart in px (is recalculated in Browser. Might show no effect if too big.)"},"navposition":{"type":"string","default":"bottom","section":"Thumbs","label":"Thumbnails Position","help":"","options":[{"value":null,"label":"Select Thumbnails Position","disabled":true},{"value":"bottom","label":"Bottom"},{"value":"top","label":"Top"}]},"navwidth":{"type":"string","default":100,"section":"Thumbs","label":"Thumbnails bar width","help":"Width of Thumbnails bar in Percent of Slider width."},"f_thumbwidth":{"type":"string","default":100,"section":"Thumbs","label":"Thumbs Width","help":"Width of single Thumbnail in px"},"f_thumbheight":{"type":"string","default":75,"section":"Thumbs","label":"Thumbs Height","help":"Height of Thumbnails in px"},"thumbmargin":{"type":"string","default":2,"section":"Thumbs","label":"Thumbs Margin","help":"Margin of Thumbnails in px"},"thumbborderwidth":{"type":"string","default":2,"section":"Thumbs","label":"Thumbs Border","help":"Border of Thumbnails in px"},"thumbbordercolor":{"type":"string","default":"#ea0000","section":"Thumbs","label":"Thumbs Border Colour","help":"Colour of Thumbnails Border as CSS Hex Color"}}}')}},__webpack_module_cache__={},deferred;function __webpack_require__(e){var t=__webpack_module_cache__[e];if(void 0!==t)return t.exports;var _=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](_,_.exports,__webpack_require__),_.exports}__webpack_require__.m=__webpack_modules__,deferred=[],__webpack_require__.O=function(e,t,_,r){if(!t){var a=1/0;for(i=0;i<deferred.length;i++){t=deferred[i][0],_=deferred[i][1],r=deferred[i][2];for(var l=!0,o=0;o<t.length;o++)(!1&r||a>=r)&&Object.keys(__webpack_require__.O).every((function(e){return __webpack_require__.O[e](t[o])}))?t.splice(o--,1):(l=!1,r<a&&(a=r));if(l){deferred.splice(i--,1);var n=_();void 0!==n&&(e=n)}}return e}r=r||0;for(var i=deferred.length;i>0&&deferred[i-1][2]>r;i--)deferred[i]=deferred[i-1];deferred[i]=[t,_,r]},__webpack_require__.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return __webpack_require__.d(t,{a:t}),t},__webpack_require__.d=function(e,t){for(var _ in t)__webpack_require__.o(t,_)&&!__webpack_require__.o(e,_)&&Object.defineProperty(e,_,{enumerable:!0,get:t[_]})},__webpack_require__.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},function(){var e={826:0,431:0};__webpack_require__.O.j=function(t){return 0===e[t]};var t=function(t,_){var r,a,l=_[0],o=_[1],n=_[2],i=0;if(l.some((function(t){return 0!==e[t]}))){for(r in o)__webpack_require__.o(o,r)&&(__webpack_require__.m[r]=o[r]);if(n)var s=n(__webpack_require__)}for(t&&t(_);i<l.length;i++)a=l[i],__webpack_require__.o(e,a)&&e[a]&&e[a][0](),e[a]=0;return __webpack_require__.O(s)},_=self.webpackChunkfotorama_multi=self.webpackChunkfotorama_multi||[];_.forEach(t.bind(null,0)),_.push=t.bind(null,_.push.bind(_))}();var __webpack_exports__=__webpack_require__.O(void 0,[431],(function(){return __webpack_require__(576)}));__webpack_exports__=__webpack_require__.O(__webpack_exports__)})();