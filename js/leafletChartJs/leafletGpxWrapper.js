/*!
	leafletGpxWrapper 0.29.0
	license: GPL 2.0
	Martin von Berg, 2024
    Wrapper for Leaflet-gpx to add / innclude some additional functions
*/

import './leaflet-gpx/gpx.js';


let leafletGpxWrapper = L.GPX.extend({
    coords: [],
    get_coords: function () { return this.coords.flat(); },
});

// hook right at the end of the initialize function. 
// Mind that the events 'addline' and 'loaded' were already fired at this moment.
// One could only react to this events (with .on('addline') and .on('loaded')) if asyncLoading is true, so the the track is loaded asynchronously.
// But this does not work with the wrapper class by unknown reason.
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