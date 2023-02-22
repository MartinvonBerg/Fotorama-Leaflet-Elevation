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


export {LeafletChartJs};

class LeafletChartJs extends LeafletMap {

    static showalltracks = false;

    constructor(number, elementOnPage, center=null, zoom=null) {
        super(number, elementOnPage, center=null, zoom=null);

        // load and show first track on map 
        const track = new gpxTrackClass( number, this.map, this.pageVariables.tracks );
              
        // set i18n for chart (map is done in parent class 'leafletMapClass')
        // set the CSS, styling for the chart 
        // set the units for the chart and statistics
        // set the responsive options for the chart

        // show line chart with first track. example: https://jsfiddle.net/Geoapify/2pjhyves/
        let div = 'route-elevation-chart'+number; // TODO : change the ids and classnames of chart different to example!
        const chart = new chartJsClass( div, track.elev_data, {} );

        
        
    }

    // internal code for interaction between chart and tracks
    //    - change track on map -> update chart and statistics
    //    - hover over chart -> show marker, indication on map to track. Hint: 
    //    - Hover over track -> show tooltip in chart
    //    - show image markers on chart and update with track

    

    
    
}