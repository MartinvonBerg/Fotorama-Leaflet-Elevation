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
    track = [];
    trackStartColour = '#ff0000';
    trackColours = [];
    allBounds =[];
    currentTrack = 0;

    constructor(number, elementOnPage, center=null, zoom=null) {
        super(number, elementOnPage, center=null, zoom=null);

        // generate the track colors
        this.trackStartColour = pageVarsForJs[number].sw_options.trackcolour ?? '#ff0000';
        this.trackColours = this.calculateEquallyDistributedColors(this.trackStartColour, this.pageVariables.ngpxfiles);

        // store the map object
        let mapthis = {};
        mapthis = this; 

        // generate all tracks on the map 
        for (const [key, track] of Object.entries( this.pageVariables.tracks )) {
            let trackNumber = parseInt(key.replace(/\D/g,''));
            this.track[trackNumber] = new gpxTrackClass( number, mapthis, this.pageVariables.tracks, trackNumber, this.trackColours[trackNumber] );
            // get all bounds from all tracks
            this.allBounds[trackNumber] = this.track[trackNumber].bounds;
        };

        // set the bounds for the map. handling of parameter showalltracks is ignored here.
        let maxBounds = this.findMaxBounds(this.allBounds);
        super.setBounds(maxBounds); // TODO : bounds are not correctly set leaflet-overlay-pane
        mapthis.map.fitBounds(maxBounds);
        mapthis.map.currentTrack = this.currentTrack;

        // start chartjs pars
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
            aspRatio : pageVarsForJs[number].mapaspect * pageVarsForJs[number].mapheight / pageVarsForJs[number].chartheight,
            chartAnimation : true, // always, no setting
            showChartHeader : false, // always, no setting
            padding : pageVarsForJs[number].sw_options.chartjspadding,
            followSlider: false // this.track.length > 1 ? false : true // whether the image position should be shown in chartjs with moving tooltip. for future use
        }

        // show chart with the first track
        this.chart = new chartJsClass( this.track[this.currentTrack].elev_data, chartOptions );

        if ( this.isObjEmpty(this.chart.chart) ) {
            this.chart = null;
            return;
        }
        
        // update the slider if the marker on the map was clicked
        this.catchChartEvent(div);

        let classThis = this;
        document.getElementById('map'+number).addEventListener('mouseoverpath', function charthover(e) {
            classThis.chart.triggerTooltip(e.detail.index);
            classThis.createSingleMarker(e.detail.position, "<p>" + classThis.coords[e.detail.index].meta.ele.toFixed(1) + " m</p>");
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

    findMaxBounds(mapBoundsArray) {
      if (!Array.isArray(mapBoundsArray) || mapBoundsArray.length === 0) {
        return null; // Return null for an empty or invalid array
      }
    
      let maxBounds = mapBoundsArray[0]; // Initialize with the first bounds in the array
    
      for (let i = 1; i < mapBoundsArray.length; i++) {
        const currentBounds = mapBoundsArray[i];
    
        // Compare the latitude and longitude values to find the maximum bounds
        maxBounds._southWest.lat = Math.min(maxBounds._southWest.lat, currentBounds._southWest.lat);
        maxBounds._southWest.lng = Math.min(maxBounds._southWest.lng, currentBounds._southWest.lng);
        maxBounds._northEast.lat = Math.max(maxBounds._northEast.lat, currentBounds._northEast.lat);
        maxBounds._northEast.lng = Math.max(maxBounds._northEast.lng, currentBounds._northEast.lng);
      }
    
      return maxBounds;
    }

    isObjEmpty (obj) {
        return Object.values(obj).length === 0 && obj.constructor === Object;
    }

    setActiveMarker(markerNumber){
        super.setActiveMarker(markerNumber);
        if (this.chart === null || markerNumber === undefined || this.chart.options.followSlider !== true) return;

        // get index for chartpos for pos of markernumber
        let coords = this.mrk[markerNumber]._latlng
        let index = this.track[this.currentTrack].getIndexForCoords(coords)
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

    /**
     * Calculates equally distributed colors based on a starting color hex value.
     *
     * @param {string} startHex - The starting color hex value e.g. '#aa1111'.
     * @param {number} numColors - The number of colors to calculate.
     * @return {Array<string>} The array of equally distributed colors.
     */
    calculateEquallyDistributedColors(startHex, numColors) {
        // Parse the starting color hex value
        const r = parseInt(startHex.slice(1, 3), 16);
        const g = parseInt(startHex.slice(3, 5), 16);
        const b = parseInt(startHex.slice(5, 7), 16);
      
        // Convert to HSL color space
        const hslStart = this.rgbToHsl(r, g, b);
      
        // Calculate the step size for equally distributed colors
        const step = 360 / numColors;
      
        // Calculate the colors
        const colors = [];
        colors.push(startHex);

        for (let i = 1; i < numColors; i++) {
          const hue = (hslStart.h + i * step) % 360;
          const hexColor = this.hslToHex(hue, hslStart.s, hslStart.l);
          colors.push(hexColor);
        }
      
        return colors;
    }
      
    /**
     * Converts an RGB color to HSL color.
     *
     * @param {number} r - The red component of the RGB color (0-255).
     * @param {number} g - The green component of the RGB color (0-255).
     * @param {number} b - The blue component of the RGB color (0-255).
     * @return {object} An object representing the HSL color with properties h, s, and l.
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
      
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
      
        let h, s, l = (max + min) / 2;
      
        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }
      
          h /= 6;
        }
      
        return { h: h * 360, s: s, l: l };
    }

    /**
     * Converts an HSL color to a hexadecimal color code.
     *
     * @param {number} h - The hue value of the HSL color (0-360).
     * @param {number} s - The saturation value of the HSL color (0-1).
     * @param {number} l - The lightness value of the HSL color (0-1).
     * @return {string} The hexadecimal color code.
     */
    hslToHex(h, s, l) {
        // treatment of wrong input values
        if ( (h<0) || (h>360) || (s<0) || (s>1) || (l<0) || (l>1) ) {
          	return '#000000';
        }
      
        const C = (1 - Math.abs(2 * l - 1)) * s;
        const X = C * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - C / 2;
        let r, g, b;
      
        if (0 <= h && h < 60) {
          r = C;
          g = X;
          b = 0;
        } else if (60 <= h && h < 120) {
          r = X;
          g = C;
          b = 0;
        } else if (120 <= h && h < 180) {
          r = 0;
          g = C;
          b = X;
        } else if (180 <= h && h < 240) {
          r = 0;
          g = X;
          b = C;
        } else if (240 <= h && h < 300) {
          r = X;
          g = 0;
          b = C;
        } else {
          r = C;
          g = 0;
          b = X;
        }
      
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
      
        return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
    }
}