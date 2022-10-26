/*!
	ElevationClass 0.12.0
	license: GPL 2.0
	Martin von Berg
*/
/*
import LeafletMap from './leafletMapClass';

// webpack import information for bundling. localhost won't work with that.
// local Styles from leafletMapClass
import './leaflet/leaflet.css';
import './fullscreen/Control.FullScreen.css';
// local Scripts from leafletMapClass
import './leaflet/leaflet.js';
import './leaflet-ui/leaflet-ui-short.js';
import './fullscreen/Control.FullScreen.js';

// local Styles for LEAFLET-ELEVATION 
import './elevation/dist/leaflet-elevation.css';
// register local Scripts - load dependencies first
import './elevation/dist/d3.min.js';
import './libs/gpx.js';
import './elevation/libs/leaflet-gpxgroup.min.js';
import './elevation/dist/togeojson.umd.js';
import './elevation/dist/leaflet.geometryutil.min.js'
import './elevation/dist/leaflet-elevation.min.js';
*/
class LeafletElevation extends LeafletMap {

    controlElevation = {};
    eleopts = [];
    timesMoveendCalled = 0;
    tracks = [];
   
    static showalltracks = false;

    constructor(number, elementOnPage, center=null, zoom=null) {
        super(number, elementOnPage, center=null, zoom=null);

        //this.showalltracks = this.pageVariables.showalltracks;
        // if (numberOfMaps>1 && showalltracks) {showalltracks = false;} nicht übernommen

        // set options for elevation chart
        this.setChartOptions(number);

        // create tracks
        if (parseInt( this.pageVariables.ngpxfiles) === 1) {
            this.createOneTrack();
        } else if ( parseInt( this.pageVariables.ngpxfiles) > 1 ) {
            // part to show multiple tracks in one map.            
            let routes = {};
                        
            // put all tracks in one js array and set local variable for the window closure.
            for (let key in this.pageVariables.tracks) {
                this.tracks.push(this.pageVariables.tracks[key].url)
            }

            // set the bounds only after the second move. The first move is fired after the movement to the given center.
            let classThis = this;

            this.map.on('moveend', function(e) {
                classThis.timesMoveendCalled++;
                let m = e.sourceTarget._container.id;
                
                //load the tracks on the map: kein Event gefunden map.on('load') geht nicht.
                if (classThis.timesMoveendCalled === 1) {
                    routes = L.gpxGroup(classThis.tracks, {
                        elevation: true,
                        elevation_options: classThis.eleopts.elevationControl.options, //
                        legend: true,
                        legend_options: {
                            position: "bottomright",
                            collapsed: true,
                        },
                        distanceMarkers: false,
                    });
                      
                    routes.addTo(classThis.map);
                }

                if (classThis.timesMoveendCalled === 2) {   
                    // write track statistics values to the summmary.
                    classThis.map.on('legend_selected', function(e){
                       classThis.setTrackStatistics(e);
                    });
                    // activate the first track.
                    let q = document.querySelector('#'+m+' > div.leaflet-control-container > div.leaflet-bottom.leaflet-right > div.leaflet-control-layers.leaflet-control > section > div.leaflet-control-layers-base > label:nth-child(1)');
                    if (q !== null) {
                        q.click();
                    }
                } 

                // change the bounds to all tracks
                if (classThis.timesMoveendCalled === 3) {
                    classThis.setBounds(routes.getBounds() );
                    classThis.map.fitBounds(classThis.bounds);
                }

            });

            
        
            
        } // no else here: This would be the part for no tracks at all. What is not useful here.
    }

    /**
     * 
     * @param {int} m the current number of the chart = shortcode on the page
     */
    setChartOptions(m) {
        this.eleopts = { // Kartenoptionen definieren : können für alle Karten gleich sein
            elevationControl: {
              options: {
                theme: this.pageVariables.eletheme, // martin-theme, lime-theme, steelblue-theme, purple-theme, yellow-theme, red-theme, magenta-theme, lightblue-theme
                elevationDiv: "#elevation-div" + m, 
                detachedView: true,
                summary: false,
                time: false,
                downloadLink:false,
                closeBtn: false,
                distanceMarkers: { lazy: true, distance: false, direction: false }, // direction creates the black arrows
                hotline: true, // the coloured line. One color only if false
                polyline: {
                      weight: 3.111, // TODO: create a parameter for this? This changes the lineWidth. Mind that the original leaflet-elevation.js was changed for that.
                },
                waypoints: false,
                wptLabels: false,
                autofitBounds: true,
                legend: true,
                followMarker: false,
                skipNullZCoords: true,
                height: this.pageVariables.chartheight,
                handlers: ["Distance", "Altitude"],
                //lazyLoadJS: false, // set the lazyLoadJS option to false to avoid automatically including missing javascript dependencies (i.e. not detected in the global scope).
                //loadData: { 
                //    defer: true,
                //    lazy: true,
                //}
            }
            }
        }
    }

    /**
     * 
     */
    createOneTrack() {
        this.controlElevation = L.control.elevation(this.eleopts.elevationControl.options).addTo(this.map); 
        this.controlElevation.on('eledata_loaded', (event) => this.setTrackStatistics(event));
        this.controlElevation.load(this.pageVariables.tracks.track_0.url)
    }

    /**
     * Write the track statistics data to the dom element when the elevation data was loaded
     * @param {Event} event the leaflet control elevation event
     */
    setTrackStatistics(event) {
        // get the trace info from the gpx-file
        let track = '';
        let info = '';

        if (event.type === 'legend_selected') {
            let index = this.tracks.findIndex(element => { 
                if (element.includes(event.layer.options.name)) {
                    return true;
                }
            });
            track = Object.values(this.pageVariables.tracks)[index].url;
            info = Object.values(this.pageVariables.tracks)[index].info;

        } else {
            track = this.pageVariables.tracks.track_0.url;
            info = this.pageVariables.tracks.track_0.info;
            let key = Object.keys(event.layer._layers)[0];
            this.bounds = event.layer._layers[key]._bounds;
        }
        
        if (info) {info = info.split(' ')} else {info='';};

        let q = document.querySelector.bind(document);
        let m = this.number;

        if (info[0]=='Dist:' && info[1] && info[4] && info[7]) { 
            q('#data-summary'+m+' .totlen .summarylabel').innerHTML = L._('Distance') + ': ';
            q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = parseFloat(info[1].replace(',','.')).toLocaleString(navigator.languages[0], { useGrouping: false, maximumFractionDigits: 1 }) + " km";
    
            q('#data-summary'+m+' .gain .summarylabel').innerHTML   = L._('Ascent') + ': ' ;
            q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = parseFloat(info[4].replace(',','.')).toLocaleString(navigator.languages[0], { useGrouping: false, maximumFractionDigits: 0 }) + " m";
    
            q('#data-summary'+m+' .loss .summarylabel').innerHTML   = L._('Descent') + ': ';
            q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = parseFloat(info[7].replace(',','.')).toLocaleString(navigator.languages[0], { useGrouping: false, maximumFractionDigits: 0 }) + " m";
          
        } else {
            q('#data-summary'+m+' .totlen .summarylabel').innerHTML = L._('Distance') + ': ';
            q('#data-summary'+m+' .gain .summarylabel').innerHTML   = L._('Ascent') + ': ' ;
            q('#data-summary'+m+' .loss .summarylabel').innerHTML   = L._('Descent') + ': ';
            try {
                q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = event.track_info.distance.toLocaleString(navigator.languages[0], { useGrouping: false, maximumFractionDigits: 1 }) + " km";
                q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = event.track_info.elevation_avg.toLocaleString(navigator.languages[0], { useGrouping: false, maximumFractionDigits: 0 }) + " m";
                q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = event.track_info.elevation_avg.toLocaleString(navigator.languages[0], { useGrouping: false, maximumFractionDigits: 0 }) + " m";
            } catch {
                q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = '0.0';
                q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = '0.0';
                q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = '0.0';
            }
        }

        if (event.type !== 'legend_selected') this.controlLayer.addOverlay(event.layer, event.name );
    }
    
}