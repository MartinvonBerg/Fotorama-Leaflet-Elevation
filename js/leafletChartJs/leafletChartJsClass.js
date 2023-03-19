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

    coords = [];
    theMarker = {};
    elev_data = [];

    constructor(number, elementOnPage, center=null, zoom=null) {
        super(number, elementOnPage, center=null, zoom=null);

        // load and show first track on map
        let mapthis = {};
        mapthis = this; 
        const track = new gpxTrackClass( number, mapthis, this.pageVariables.tracks );
        this.coords = track.coords;
              
        // set i18n for chart (map is done in parent class 'leafletMapClass')
        // set the CSS, styling for the chart 
        // set the units for the chart and statistics
        // set the responsive options for the chart

        // show line chart with first track. example: https://jsfiddle.net/Geoapify/2pjhyves/
        let div = 'route-elevation-chart'+number; // TODO : change the ids and classnames of chart different to example!

        let chartOptions = {
            number : number,
            divID : div,
            // theme color options
            theme : pageVarsForJs[number].eletheme,
            CssBackgroundColor : pageVarsForJs[number].sw_options.chart_background_color,
            chart_fill_color :  pageVarsForJs[number].sw_options.chart_fill_color,
            chartHeight : pageVarsForJs[number].chartheight,
            pageVariables : pageVarsForJs[number],
            // responsive
            responsive : true, // TODO: setting
            aspRatio : pageVarsForJs[number].mapaspect * pageVarsForJs[number].mapheight / pageVarsForJs[number].chartheight,
            chartAnimation : true, // TODO: setting
            showChartHeader : false // TODO: setting
        }

        // show chart with the first track
        const chart = new chartJsClass( track.elev_data, chartOptions );

        // update the slider if the marker on the map was clicked
        this.catchChartEvent(div);

        //this.group = L.layerGroup();

        let classThis = this;
        document.getElementById('map'+number).addEventListener('mouseoverpath', function charthover(e) {
            chart.triggerTooltip(e.detail.index);
            classThis.createSingleMarker(e.detail.position, "<p>" + classThis.coords[e.detail.index].meta.ele + " m</p>");
        });
        /*
        // 1 second delay
        setTimeout(function(){
            console.log("Executed after 1 second");
            track.showTrack(1);
            this.coords = track.coords;
            this.elev_data = track.elev_data;
            chart.showElevationProfile(this.elev_data, 1);
        }, 1000);

         // 1 second delay
         setTimeout(function(){
            console.log("Executed after 1 second");
            track.showTrack(2);
            this.coords = track.coords;
            this.elev_data = track.elev_data;
            chart.showElevationProfile(this.elev_data, 2);
        }, 3000);
        */
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
            classThis.createSingleMarker([xval.lat, xval.lng], "<p>" + xval.meta.ele + " m</p>")
        
        });
    }

    // internal code for interaction between chart and tracks
    //    - change track on map -> update chart and statistics
    //    - hover over chart -> show marker, indication on map to track. Hint: 
    //    - Hover over track -> show tooltip in chart
    //    - show image markers on chart and update with track
}