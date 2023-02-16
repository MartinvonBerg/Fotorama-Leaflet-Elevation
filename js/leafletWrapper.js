// source : https://github.com/Leaflet/Leaflet/issues/7055
// use it like this in the calling js file:
//import './leafletWrapper.js';
//import {icon as impIcon } from './leafletWrapper.js';

/* leafletWrapper.js */  
import {
    Control,
    DomEvent,
    DomUtil,
    Evented,
    LatLng,
    LatLngBounds,
    Layer,
    icon,
    Map
  } from "../node_modules/leaflet/dist/leaflet-src.esm.js"
  
export {
    Control,
    DomEvent,
    DomUtil,
    Evented,
    LatLng,
    LatLngBounds,
    Layer,
    icon,
    Map
  }

/*
 * The global namespace L is required by a few plugins.  We provide one,
 * with the bare minimum content that they require.
 */
window.L = {
    Control,
    DomEvent,
    DomUtil
  }