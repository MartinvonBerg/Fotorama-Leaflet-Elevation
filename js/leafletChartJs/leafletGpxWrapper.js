/*!
	leafletGpxWrapper 0.27.0
	license: GPL 2.0
	Martin von Berg, 2024
    Wrapper for Leaflet-gpx to add / innclude some additional functions
*/

import './leaflet-gpx/gpx.js';


let leafletGpxWrapper = L.GPX.extend({
    coords: [],
    trk_types: [], 
    get_coords: function () { return this.coords.flat(); },
    get_trk_types: function() { return this.trk_types; },
});

// hook right at the end of the initialize function. 
// Mind that the events 'addline' and 'loaded' were already fired at this moment.
// One could only react to this events (with .on('addline') and .on('loaded')) if asyncLoading is true, so the the track is loaded asynchronously.
// But this does not work with the wrapper class by unknown reason.
leafletGpxWrapper.addInitHook(function () {
    let xml = this._gpx;
    
    console.log('addInitHook in leafletGpxWrapper');
})

export { leafletGpxWrapper };

/*
let myLGPX = L.GPX.extend({
    coords: [],
    trk_types: [], 
    set_coords: function () {
        
        this.on('addline', function (event) { 
            this.coords.push(event.line._latlngs);
            let subarray = [];
            subarray['type'] = line.getElementsByTagName('type')[0].innerHTML;
            subarray['len'] = coords.length;
            subarray['colour'] = polyline_options.color;
            this.trk_types.push(subarray);
            console.log('addline event');
        });
    },
    get_coords: function () { return this.coords.flat(); },
    get_trk_types: function() { return this.trk_types; },
})
*/