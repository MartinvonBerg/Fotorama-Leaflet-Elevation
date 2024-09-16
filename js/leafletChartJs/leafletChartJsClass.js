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
import { calculateEquallyDistributedColors } from '../libs/colorLib.js'

// local Styles  
import './leafletChartJsClass.css'

export {LeafletChartJs};

class LeafletChartJs extends LeafletMap {

    coords = [];
    theMarker = {};
    elev_data = [];
    leafletTrackID = 0;
    chart = {};
    track = [];
    trackStartColour = '#ff0000';
    trackColours = [];
    allBounds =[];
    currentTrack = 0;
    preload = true;

    constructor(number, elementOnPage, preload=null, center=null, zoom=null ) {
        super(number, elementOnPage, center=null, zoom=null);

        if (preload !== null) {
          this.preload = preload;
        }

        this.createTrackOnMap().then(() => {
          this.initChart();
        }).then(() => {
          this.handleEvents();
        }).catch((error) => {
          console.log('Error in LeafletChartJs: ' + error);
        });
    };

    async createTrackOnMap() {
        // generate the track colors
        let number = this.number;
        this.trackStartColour = pageVarsForJs[number].sw_options.trackcolour ?? '#ff0000';
        // calculate track colours for the different tracks.
        this.trackColours = calculateEquallyDistributedColors(this.trackStartColour, this.pageVariables.ngpxfiles);

        // generate all tracks on the map 
        for (const [key, track] of Object.entries( this.pageVariables.tracks )) {
            let trackNumber = parseInt(key.replace(/\D/g,''));
            this.track[trackNumber] = await this.createTrack(number, trackNumber).then(results => { 
              return results ;
            });
            // get all bounds from all tracks. These bounds are not available if asyncLoading is true.
            if ( this.track[trackNumber].bounds !== null && this.track[trackNumber].bounds.isValid() ) {
              this.allBounds[trackNumber] = this.track[trackNumber].bounds;
            } else if ( this.bounds ) {
              this.allBounds[trackNumber] = this.bounds;
            } 
        };

        // set the bounds for the map. handling of parameter showalltracks is ignored here.
        let maxBounds = this.findMaxBounds(this.allBounds);
        if (maxBounds !== null && maxBounds.isValid()) {
          super.setBounds(maxBounds); // bounds might not correctly set leaflet-overlay-pane
          this.map.fitBounds(maxBounds);
        }
        this.map.currentTrack = this.currentTrack; 
    };

    async createTrack(number, trackNumber) {
      if ( this.preload ) {
        let track_x = `track_${trackNumber}`;  // where x is 0, 1, 2, etc.
        let path = this.pageVariables.tracks[track_x].url;
        let newFile = await fetch(path).then(response => response.text());
        this.pageVariables.tracks[track_x].url = newFile;
      }

      return new gpxTrackClass(number, this, this.pageVariables.tracks, trackNumber, this.trackColours[trackNumber]);
    };

    initChart() {
      // ----------- start chartjs parameters
      let number = this.number;
      this.coords = this.track[this.currentTrack].coords; // for catchChartEvent
      this.leafletTrackID = this.track[this.currentTrack].gpxTracks._leaflet_id; // for catchChartEvent
            
      // show line chart with first track. example: https://jsfiddle.net/Geoapify/2pjhyves/
      let div = 'fm-elevation-chartjs'+number; // do not handle the empty element here if not chart should be shown. This causes errors.

      let chartOptions = {
          // set i18n for chart (map is done in parent class 'leafletMapClass')
          // set the CSS, styling for the chart 
          // set the units for the chart and statistics
          // set the responsive options for the chart
          number : number,
          divID : div,
          // theme color options
          theme : pageVarsForJs[number].eletheme,
          CssBackgroundColor : pageVarsForJs[number].sw_options.chart_background_color,
          chart_fill_color :  pageVarsForJs[number].sw_options.chart_fill_color,
          chartHeight : pageVarsForJs[number].chartheight,
          pageVariables : pageVarsForJs[number],
          // responsive
          responsive : true, // always, no setting
          aspRatio : pageVarsForJs[number].mapaspect, // * pageVarsForJs[number].mapheight / pageVarsForJs[number].chartheight,
          chartAnimation : pageVarsForJs[number].sw_options.chart_animation===false? false : true, // always, no setting
          showChartHeader : false, // always, no setting
          padding : pageVarsForJs[number].sw_options.chartjspadding ? parseInt(pageVarsForJs[number].sw_options.chartjspadding) : 20,
          followSlider: false // this.track.length > 1 ? false : true // whether the image position should be shown in chartjs with moving tooltip. for future use
          // add an option for parsing gpx data here. 
          // Mit parsing müssen aber alle handler, events u.s.w an die neue Datenstruktur angepasst werden! Mit Fallunterscheidung! 
          // Die Optimierung spart ca. 10% der Skriptlaufzeit, wenn nur ein Track angezeigt wird. Also ca. 20ms .. 25 ms.
      }

      // show chart with the first track
      this.chart = new chartJsClass( this.track[this.currentTrack].elev_data, chartOptions );
      // handle empty chart if something went wrong
      if ( this.isObjEmpty(this.chart.chart) ) {
          this.chart = null;
          return;
      }
    }

    handleEvents() {
      // update the slider if the marker on the map was clicked
      let number = this.number;
      let div = 'fm-elevation-chartjs'+number;
      this.catchChartEvent(div);

      let classThis = this;
      document.getElementById('map'+number).addEventListener('mouseoverpath', function charthover(e) {
        try {
          classThis.chart.triggerTooltip(e.detail.index);
          classThis.createSingleMarker(e.detail.position, "<p>" + classThis.coords[e.detail.index].meta.ele.toFixed(1) + " m</p>");
        } catch (error) {
          //console.log(error);
        }
      });

      document.getElementById('map'+number).addEventListener('changetrack', function charthover(e) {
        classThis.currentTrack = e.detail.newtrack;
        let newdata = classThis.chart.prepareChartData(classThis.track[classThis.currentTrack].elev_data)
        classThis.chart.chart.data.datasets[0].data = newdata.data;
        classThis.chart.chart.data.labels = newdata.labels;
        classThis.chart.setAxesMinMax(classThis.chart.chart)
        classThis.chart.chart.update();
        classThis.chart.setTrackStatistics(classThis.currentTrack);
        classThis.coords = classThis.track[classThis.currentTrack].coords;
      });
    }

    /**
     * Finds the maximum bounds from an array of map bounds.
     *
     * @param {Array<L.LatLngBounds>} mapBoundsArray - An array of map bounds.
     * @return {L.LatLngBounds|null} The maximum bounds from the array, or null if the array is empty or invalid.
     */
    findMaxBounds(mapBoundsArray) {
      if ( mapBoundsArray[0] === null || !Array.isArray(mapBoundsArray) || mapBoundsArray.length === 0) {
        return null; // Return null for an empty or invalid array
      }
    
      let maxBounds = mapBoundsArray[0]; // Initialize with the first bounds in the array
    
      for (let i = 1; i < mapBoundsArray.length; i++) { // performance
        const currentBounds = mapBoundsArray[i];
    
        // Compare the latitude and longitude values to find the maximum bounds
        maxBounds._southWest.lat = Math.min(maxBounds._southWest.lat, currentBounds._southWest.lat);
        maxBounds._southWest.lng = Math.min(maxBounds._southWest.lng, currentBounds._southWest.lng);
        maxBounds._northEast.lat = Math.max(maxBounds._northEast.lat, currentBounds._northEast.lat);
        maxBounds._northEast.lng = Math.max(maxBounds._northEast.lng, currentBounds._northEast.lng);
      }
    
      return maxBounds;
    }

    /**
     * Sets the active marker on the map and triggers a tooltip on the chart if the chart is following the slider.
     *
     * @param {number} markerNumber - The index of the marker to set as active.
     * 
     * @global {object} this.chart
     * @global {boolean} this.chart.options.followSlider
     * @global {method} this.chart.triggerTooltip()
     * @global {object} this.mrk[...]._latlng
     * @global {number} this.currentTrack[...].getIndexForCoords()
     * 
     * @return {void} This function does not return anything.
     */
    setActiveMarker(markerNumber){
        super.setActiveMarker(markerNumber);
        if (this.isObjEmpty(this.chart) || markerNumber === undefined || this.chart.options.followSlider !== true) return;

        // get index for chartpos for pos of markernumber
        let coords = this.mrk[markerNumber]._latlng
        let index = this.track[this.currentTrack].getIndexForCoords(coords)
        if (index >-1) this.chart.triggerTooltip(index);
    }

    /**
     * Create a single marker on the map with myIcon2.
     * @param {array} pos [50.505, 30.57]
     * @param {string} markertext text to show on hover over marker.
     * 
     * @global {object} this.theMarker
     * @global {object} this.map
     * 
     * @return {void}
     */
    createSingleMarker(pos, markertext) {
        if (this.theMarker != undefined) {
            this.map.removeLayer(this.theMarker);
        };

        let myDivIcon = L.divIcon({className: 'div-icon-height', html: markertext, bgPos: [0, 40]});
        //L.marker(pos, { icon: myDivIcon, pane: 'heightmarker', autoPanOnFocus: false } ).addTo(this.map);
        try {
          this.theMarker = L.marker(pos, { icon: myDivIcon, autoPanOnFocus: false } ).addTo(this.map);
        } catch (error) {
          //console.log(error);
        }
        //this.mapFlyTo(pos);
    }

    /**
     * Remove a single marker from the map.
     * @global {object} this.theMarker
     * @global {object} this.map
     * 
     * @return {void} TODO : shold return the result as boolean
     */
    removeSingleMarker() {
        if (this.theMarker != undefined) {
            this.map.removeLayer(this.theMarker);
        };
    }

    /**
     * Catches the 'hoverchart' event and updates the marker on the map accordingly.
     * 
     * @global {object} this is used as classThis
     *
     * @param {string} div - The ID of the element to attach the event listeners to.
     * @return {void} This function does not return anything.
     */
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
           
            if (xval !== undefined && GpxLayerNumber > -1 && classThis.controlLayer._layerControlInputs[GpxLayerNumber].checked) {
                classThis.createSingleMarker([xval.lat, xval.lng], "<p>" + xval.meta.ele.toFixed(1) + " m</p>")
            } else {
                classThis.removeSingleMarker();
            }
        
        });

        document.getElementById(div).addEventListener('mouseout', () => {
            classThis.removeSingleMarker();
        });
    }

    /**
     * Checks if an object is empty.
     *
     * @param {Object} obj - The object to check.
     * @return {boolean} Returns true if the object is empty, false otherwise.
     */
    isObjEmpty (obj) {
      return Object.values(obj).length === 0 && obj.constructor === Object;
    }
}