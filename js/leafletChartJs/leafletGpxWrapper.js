/*!
	leafletGpxWrapper 0.30.0
	license: GPL 2.0
	Martin von Berg, 2024
    Wrapper for Leaflet-gpx to add / innclude some additional functions
*/

import './leaflet-gpx/gpx.js';


/**
 * This code creates an extension of the Leaflet GPX functionality (L.GPX) called leafletGpxWrapper. 
 * The purpose of this extension is to add new capabilities to handle GPS track coordinates in a web mapping application.
 * 
 * @class leafletGpxWrapper
 * @extends {L.GPX}
 * @property {Array<Array<L.LatLng>>} coords - An array of arrays of latitude/longitude coordinates for each layer in the GPX data.
 * @method get_coords() - Returns a flattened array of all the latitude/longitude coordinates in the GPX data.
 */
let leafletGpxWrapper = L.GPX.extend({
    coords: [],
    get_coords: function () { return this.coords.flat(); },
});

/**
 * Initialization hook that processes GPX track data after loading and hooks right at the end of the initialize function. 
 * @function addInitHook
 * @memberof leafletGpxWrapper
 * @description Processes loaded GPX tracks by extracting coordinates and calculating segment information
 * 
 * @note Events 'addline' and 'loaded' are fired before this hook when loading synchronously
 * 
 * @example
 * // Hook automatically runs after GPX track loading
 * // Performs the following:
 * // 1. Extracts track coordinates
 * // 2. Stores coordinates in wrapper's coords array
 * // 3. Calculates segment boundaries for multi-track files
 * // 4. Updates polyline options with indices and distances
 * 
 * @property {Array} coords - Stores extracted track coordinates
 * @property {Object} options.polyline_options - Contains segment information including:
 *    - startIndex: Starting index of segment
 *    - stopIndex: Ending index of segment
 *    - dist: Segment distance calculated from elevation points
 */
leafletGpxWrapper.addInitHook(function () {
    let id = this.getLayers()[0]._leaflet_id;
    let layers = this._layers[id]._layers;
    let startIndex = 0;
    let stopIndex = 0;
    let nCoordsLayers = 0;
    this.coords = [];

    // loop for each layer
    Object.entries(layers).forEach(([key, layer]) => {
        if (layer._latlngs != undefined) {
            this.coords.push(layer._latlngs);
            // this is only for a gpx file with several tracks in one file, e.g. for multisport tracks.
            if (this.options.polyline_options[nCoordsLayers]) {
                stopIndex = startIndex + layer._latlngs.length-1;
                this.options.polyline_options[nCoordsLayers].startIndex = startIndex;
                startIndex = stopIndex+1;
                this.options.polyline_options[nCoordsLayers].stopIndex = stopIndex;
                this.options.polyline_options[nCoordsLayers].dist = this._info.elevation._points[stopIndex][0] - this._info.elevation._points[this.options.polyline_options[nCoordsLayers].startIndex][0];
                nCoordsLayers++;
            }
        }
    })
})

export { leafletGpxWrapper };