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
    leafletTrackID = 0;
    chart = {};
    track = {};

    constructor(number, elementOnPage, center=null, zoom=null) {
        super(number, elementOnPage, center=null, zoom=null);

        // load and show first track on map
        // TODO: multitracks feature
        let mapthis = {};
        mapthis = this; 
        this.track = new gpxTrackClass( number, mapthis, this.pageVariables.tracks );
        this.coords = this.track.coords;
        this.leafletTrackID = this.track.gpxTracks._leaflet_id;
              
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
            showChartHeader : false, // TODO: setting
            padding : 22, // TODO: setting, useful 0 ... 20 px or not?
            followSlider: true // TODO: setting
        }

        // show chart with the first track
        this.chart = new chartJsClass( this.track.elev_data, chartOptions );

        // update the slider if the marker on the map was clicked
        this.catchChartEvent(div);

        //this.group = L.layerGroup();

        let classThis = this;
        document.getElementById('map'+number).addEventListener('mouseoverpath', function charthover(e) {
            classThis.chart.triggerTooltip(e.detail.index);
            classThis.createSingleMarker(e.detail.position, "<p>" + classThis.coords[e.detail.index].meta.ele.toFixed(1) + " m</p>");
            //classThis.mapFlyTo(e.detail.position);
        });
    }

    setActiveMarker(markerNumber){
        super.setActiveMarker(markerNumber);
        if (this.chart.options.followSlider !== true) return;

        // get index for chartpos for pos of markernumber
        let coords = this.mrk[markerNumber]._latlng
        let index = this.track.getIndexForCoords(coords)
        if (index >-1) this.chart.triggerTooltip(index);
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
        //this.mapFlyTo(pos);
    }

    removeSingleMarker() {
        if (this.theMarker != undefined) {
            this.map.removeLayer(this.theMarker);
        };
    }

    catchChartEvent(div) {
        let classThis = this;

        document.getElementById(div).addEventListener('hoverchart', function charthover(e) {
            let x= e.detail.index;
            let xval = classThis.coords[x];
            //console.log(xval);
            // update the marker on the map 
            let GpxLayerNumber = -1;

            classThis.controlLayer._layerControlInputs.forEach((value, index) => {
               if (value.layerId === classThis.leafletTrackID) {
                GpxLayerNumber = index;
               }
            });
           
            if (GpxLayerNumber > -1 && classThis.controlLayer._layerControlInputs[GpxLayerNumber].checked) {
                classThis.createSingleMarker([xval.lat, xval.lng], "<p>" + xval.meta.ele.toFixed(1) + " m</p>")
            } else {
                classThis.removeSingleMarker();
            }
        
        });

        document.getElementById(div).addEventListener('mouseout', () => {
            classThis.removeSingleMarker();
        });
    }

    // internal code for interaction between chart and tracks
    //    - change track on map -> update chart and statistics
    //    - hover over chart -> show marker, indication on map to track. Hint: 
    //    - Hover over track -> show tooltip in chart
    //    - show image markers on chart and update with track
}