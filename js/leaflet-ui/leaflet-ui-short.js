/*!
	extract of leaflet-ui-src.js v 0.12.0
	license: GPL 2.0
	Martin von Berg
*/
// This is an extract of leaflet-ui-src.js and uses only the i18n functions.
(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
  }((function () { 'use strict';
  
    var version = "0.5.9";
  
    // Following https://github.com/Leaflet/Leaflet/blob/master/PLUGIN-GUIDE.md
    (function (factory, window) {
  
        // define an AMD module that relies on 'leaflet'
        //if (typeof define === 'function' && define.amd) {
        //    define(['leaflet'], factory);
  
        // define a Common JS module that relies on 'leaflet'
        //} else if (typeof exports === 'object') {
            //module.exports = factory(require('leaflet'));
        //}
  
        // attach your plugin to the global 'L' variable
        if (typeof window !== 'undefined' && window.L) {
            factory(window.L);
  
        }
    }(function (L) {
        L.locales = {};
        L.locale = null;
        L.registerLocale = function registerLocale(code, locale) {
            L.locales[code] = L.Util.extend({}, L.locales[code], locale);
        };
        L.setLocale = function setLocale(code) {
            L.locale = code;
        };
        return L.i18n = L._ = function translate(string, data) {
            if (L.locale && L.locales[L.locale] && L.locales[L.locale][string]) {
                string = L.locales[L.locale][string];
            }
            try {
                // Do not fail if some data is missing
                // a bad translation should not break the app
                string = L.Util.template(string, data);
            }
            catch (err) {/*pass*/
            }
  
            return string;
        };
    }, window));
})));