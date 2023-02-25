/*!
	leafletChartJsClass 0.17.0
	license: GPL 2.0
	Martin von Berg
*/
// imports


import {LeafletMap} from '../leafletMapClass';
// import class for track on map for one or multiple tracks
import {gpxTrackClass} from './gpxTrackClass.js';
// import class for chart for one or multiple tracks
import {chartJsClass} from './chartJsClass.js';

// local Styles  
import './leafletChartJsClass.css'


export {LeafletChartJs};

class LeafletChartJs extends LeafletMap {

    static showalltracks = false;
    coords = [];
    theMarker = {};

    constructor(number, elementOnPage, center=null, zoom=null) {
        super(number, elementOnPage, center=null, zoom=null);

        // load and show first track on map 
        const track = new gpxTrackClass( number, this.map, this.pageVariables.tracks );
        this.coords = track.coords;
              
        // set i18n for chart (map is done in parent class 'leafletMapClass')
        // set the CSS, styling for the chart 
        // set the units for the chart and statistics
        // set the responsive options for the chart

        // show line chart with first track. example: https://jsfiddle.net/Geoapify/2pjhyves/
        let div = 'route-elevation-chart'+number; // TODO : change the ids and classnames of chart different to example!
        const chart = new chartJsClass( number, div, track.elev_data, {} );

        // update the slider if the marker on the map was clicked
        this.catchChartEvent(div);

        this.group = L.layerGroup();

        let classThis = this;
        document.getElementById('map'+number).addEventListener('mouseoverpath', function charthover(e) {
            chart.triggerTooltip(e.detail.index);
            classThis.createSingleMarker(e.detail.position, classThis.coords[e.detail.index].meta.ele+'m')
        });

        
    }

    /**
     * Create a single marker on the map with myIcon2.
     * @param {string} markertext text to show on hover over marker.
     * @param {array} pos [50.505, 30.57] 
     */
    createSingleMarker(pos, markertext) {
        if (this.theMarker != undefined) {
            this.map.removeLayer(this.theMarker);
        };

        let myDivIcon = L.divIcon({className: 'div-icon-height', html: markertext, bgPos: [0, 40]});
        //L.marker(pos, { icon: myDivIcon, pane: 'heightmarker', autoPanOnFocus: false } ).addTo(this.map);
        this.theMarker = L.marker(pos, { icon: myDivIcon, autoPanOnFocus: false } ).addTo(this.map);
    }

    catchChartEvent(div) {
        let classThis = this;

        document.getElementById(div).addEventListener('hoverchart', function charthover(e) {
            let x= e.detail.index;
            let xval = classThis.coords[x];
            //console.log(xval);
            // update the marker on the map
            classThis.createSingleMarker([xval.lat, xval.lng], ' '+xval.meta.ele+'m')
        
        });
    }

    // internal code for interaction between chart and tracks
    //    - change track on map -> update chart and statistics
    //    - hover over chart -> show marker, indication on map to track. Hint: 
    //    - Hover over track -> show tooltip in chart
    //    - show image markers on chart and update with track

    

    
    
}