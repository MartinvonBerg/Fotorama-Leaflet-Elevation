// TODO: TBD: provide the multitrack feature or leave it?

class LeafletElevation extends LeafletMap {

    controlElevation = {};
    eleopts = [];
   
    static showalltracks = false;

    constructor(number, elementOnPage, center=null, zoom=null) {
        super(number, elementOnPage, center=null, zoom=null);

        this.showalltracks = this.pageVariables.showalltracks;
        // TODO: if (numberOfMaps>1 && showalltracks) {showalltracks = false;} nicht übernommen

        // set options for elevation chart
        this.setChartOptions(number);

        // create tracks
        if (parseInt( this.pageVariables.ngpxfiles) === 1) {
            this.createOneTrack();
        } else {
            // TODO: do this for more than on track
        }      
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
                distanceMarkers: { lazy: true, distance: false, direction: true },
                closeBtn: false,
                hotline: true, // the coloured line
                waypoints: false,
                wptLabels: false,
                autofitBounds: true,
                legend: true,
                followMarker: false,
                skipNullZCoords: true,
                height: this.pageVariables.chartheight,
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
        // TODO: write the data from php-skript to avoid loading of L.GPX.
        // get the trace info from the gpx-file
        let trace = {};
        
        trace = new L.GPX(this.pageVariables.tracks.track_0.url, {
            async: false,
            index: 1,
            marker_options: {
                wptIconUrls: null,
                startIconUrl: null,
                endIconUrl: null,
                shadowUrl: null,
            },
            polyline_options: {
                color: "blue",
            }
        });
        
        trace.on('error', function(e) {
            console.log('Error loading file: ' + e.err);});
       
        this.bounds = trace.getBounds();

        let info = '';
        info = trace._info.desc;
        if (info) {info = info.split(' ')} else {info='';};

        let q = document.querySelector.bind(document);
        let m = this.number;

        if (info[0]=='Dist:' && info[1] && info[4] && info[7]) { 
            q('#data-summary'+m+' .totlen .summarylabel').innerHTML = L._('Distance') + ': ';
            q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = info[1] + " km"; 
    
            q('#data-summary'+m+' .gain .summarylabel').innerHTML   = L._('Ascent') + ': ' ;
            q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = info[4] + " m";
    
            q('#data-summary'+m+' .loss .summarylabel').innerHTML   = L._('Descent') + ': ';
            q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = info[7] + " m";
          
        } else {
            q('#data-summary'+m+' .totlen .summarylabel').innerHTML = L._('Distance') + ': ';
            q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = event.track_info.distance.toFixed(1) + " km";
    
            q('#data-summary'+m+' .gain .summarylabel').innerHTML   = L._('Ascent') + ': ' ;
            q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = event.track_info.elevation_avg.toFixed(1) + " m";
    
            q('#data-summary'+m+' .loss .summarylabel').innerHTML   = L._('Descent') + ': ';                                            
            q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = event.track_info.elevation_avg.toFixed(1) + " m";
        }

        this.controlLayer.addOverlay(event.layer, event.name );
    }
    
}