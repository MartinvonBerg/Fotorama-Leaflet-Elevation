class LeafletElevation extends LeafletMap {

    baseLayers2 = {};
    controlLayer2 = {};
    controlElevation = {};
    eleopts = [];
    traces = [];
    tracks = [];
    grouptracks = []; 

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
        }
      
    }

    setChartOptions(m) {
        this.eleopts = { // Kartenoptionen definieren : können für alle Karten gleich sein
            elevationControl: {
              options: {
                //theme: this.pageVariables.eletheme, // martin-theme, lime-theme, steelblue-theme, purple-theme, yellow-theme, red-theme, magenta-theme, lightblue-theme
                theme: 'lime-theme',
                elevationDiv: "#elevation-div" + m, 
                detachedView: true,
                summary: false,
                time: false,
                downloadLink:false,
                closeBtn: false,
                hotline: true,
                waypoints: false,
                wptLabels: false,
                autofitBounds: false,
                legend: true,
                followMarker: false,
                skipNullZCoords: true,
                legend: true,
                lazyLoadJS: true, // set the lazyLoadJS option to false to avoid automatically including missing javascript dependencies (i.e. not detected in the global scope).
                loadData: {
                    defer: true,
                    lazy: true,
                },
            },
            }
        };
        return;
    }

    createOneTrack() {
        this.controlElevation = L.control.elevation(this.eleopts.elevationControl.options).addTo(this.map); 
        this.controlElevation.load(this.pageVariables.tracks.track_0.url)
        return;
    }
    
}

/**

// get js-variables from php-output
-- let phptracks = eval('wpfm_phpvars'+m);
-- chartheight[m] = phptracks.chartheight;
-- phpmapheight[m] = phptracks.mapheight;
    
++ var baseLayers2 = new Array();
++ var controlLayer2 = new Array();
++ var controlElevation = new Array();
++ var eleopts = new Array();
++ var traces = new Array();
++ var tracks = new Array();
++ var grouptracks = [];  
// create Track selector bottom right
++ baseLayers2[m] = {};

// create tracks or marker
++if (parseInt(phptracks.ngpxfiles) > 0) {
 ++   // create elevation chart(s) -----------------------
    eleopts[m] = { // Kartenoptionen definieren : können für alle Karten gleich sein
        elevationControl: {
          options: {
            theme: phptracks.eletheme, // martin-theme, lime-theme, steelblue-theme, purple-theme, yellow-theme, red-theme, magenta-theme, lightblue-theme
            elevationDiv: "#elevation-div" + m, 
            detachedView: true,
            summary: false,
            downloadLink:false,
            followMarker: false,
            skipNullZCoords: true,
            legend: true,
            lazyLoadJS: true, // set the lazyLoadJS option to false to avoid automatically including missing javascript dependencies (i.e. not detected in the global scope).
            loadData: {
                defer: true,
                lazy: true,
            },
            margins: {
                top: 10,
                right: 20,
                bottom: 10,
                left: 50
            },
        },
        }
    };

    if (showalltracks === false) { // this is for the single gpx-track case
        controlLayer2[m] = L.control.layers(baseLayers2[m], null, {collapsed:true}); 
        controlLayer2[m].setPosition('bottomright')
        controlLayer2[m].addTo(maps[m]);
        controlElevation[m] = L.control.elevation(eleopts[m].elevationControl.options); 
        controlElevation[m].addTo(maps[m]);
        controlElevation[m].loadChart(maps[m]);
    }  
      
    // load all tracks from array
    traces[m] = [];
    tracks[m] = phptracks.tracks;                     

    // part to show multiple tracks in one map, a bit experimental and not perfect
    if ( parseInt(phptracks.ngpxfiles) > 1 && showalltracks === true) {
        m = 0;
        grouptracks[m] = [];
        var routes; 
        var i = 0;
        zpadding = [0,0];

        for (var track in tracks[m]) {
            grouptracks[m][i] = tracks[m][track].url;
            i++;
        };
    
        routes = L.gpxGroup(grouptracks[m], {
            elevation: true,
            elevation_options: eleopts[m].elevationControl.options,
            legend: true,
            legend_options: {
                position: "bottomright",
                collapsed: true,
            },
            distanceMarkers: false,
        });
   
        routes.addTo(maps[m]);

        // workaround to show the first track with elevation chart
        window.setTimeout( function(e) { 
            //nur mit m=0, da zu Anfang geladen, kein Event gefunden map.on('load') geht nicht
            var b = routes.bounds;
            maps[0].fitBounds([
                [b._northEast.lat, b._northEast.lng],
                [b._southWest.lat, b._southWest.lng],
               
            ]);
            maps[0].zoomOut(1);
            bounds[0] = maps[0].getBounds();

            // Did not manage that: Preload a default chart / track. according to https://github.com/Raruto/leaflet-elevation/issues/7
            // So, we are using a click event, 3 times, due to another bug. It works
            var elem1 = document.getElementsByClassName('leaflet-control-layers-base')[1].children[0].childNodes[0];
            var elem2 = document.getElementsByClassName('leaflet-control-layers-base')[1].children[1].childNodes[0];
            elem1.click();
            elem2.click();
            elem1.click();

        }, 1000);

        // function to show the current track statistics with an mutation observer                          
        maps[0].on( 'eledata_loaded eledata_added eledata_clear', function() {
            m = 0; 
            //bounds[m] = maps[m].getBounds(); //.pad(0.5); // 0 .. -0.5 possible: -0.2 best

            // Select the node that will be observed for mutations
            const targetNode = document.getElementsByClassName('leaflet-bottom')[1];
            // Options for the observer (which mutations to observe)
            const config = { childList: true, subtree: true, attributes:true };
            // Callback function to execute when mutations are observed
            const callback = function() {
                let div = document.getElementsByClassName('leaflet-control-layers-base');
                let len = div[1].childElementCount;
                let track = '';
                var keyarray = Object.keys(routes._routes);
                //let endstyle = '';;

                // find the track in div
                for (var c = 0; c < len; c++){
                    let child = div[1].children[c].children[0].children[1];
                 
                    let style = child.attributes.style;
                    if (style) {
                        style = child.attributes.style.nodeValue;
                        if (style.search('font-weight') > -1) {
                            track = child.innerText;
                            track = track.trim();
                        }
                    }       
                 }

                 // do this for all routes that were loaded
                 keyarray.forEach(key => {
                    //
                    let info = routes._routes[key]._info.desc;
                    let name = routes._routes[key]._info.name;
                    let q = document.querySelector.bind(document);

                    // update only for the active track
                    if (name == track) {
                        if (info) {info = info.split(' ')} else {info='';};
                        if (info[1] && info[4] && info[7]) { 
                            q('#data-summary'+m+' .totlen .summarylabel').innerHTML = L._('Distance') + ': ';
                            q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = info[1] + " km"; 

                            q('#data-summary'+m+' .gain .summarylabel').innerHTML   = L._('Ascent') + ': ' ;
                            q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = info[4] + " m";

                            q('#data-summary'+m+' .loss .summarylabel').innerHTML   = L._('Descent') + ': ';
                            q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = info[7] + " m";
                          
                        } else {
                            q('#data-summary'+m+' .totlen .summarylabel').innerHTML = L._('Distance') + ': ';
                            q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = (trace.gpx.get_distance() / 1000).toFixed(2) + " km";

                            q('#data-summary'+m+' .gain .summarylabel').innerHTML   = L._('Ascent') + ': ' ;
                            q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = trace.gpx.get_elevation_gain().toFixed(0) + " m";

                            q('#data-summary'+m+' .loss .summarylabel').innerHTML   = L._('Descent') + ': ';                                            
                            q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = trace.gpx.get_elevation_loss().toFixed(0) + " m";
                        }
                    }
                 });
                 
            };
            // Create an observer instance linked to the callback function
            const observer = new MutationObserver(callback);
            // Start observing the target node for configured mutations
            observer.observe(targetNode, config);                      

        } ); 

    } 
    // part to show one track at time
    else {
        var i = 0;
        for (var track in tracks[m]) {
            loadTrace(m, track, i++)
        } 
    }
} 

// change elevation chart on change of gpx-track
maps[m].on('baselayerchange', function(e) {
    let ename = e.name;
    let mapchange = false;
    let source = e.sourceTarget._container.id;
    source = source.replace('map','');
    m = parseInt( source);

    for (const [key, value] of Object.entries(baseLayers[m])) {
        if (ename == key) {
            mapchange = true;
        }
    }

    if ( ! mapchange) { // case sensitive ???
        for (var i in traces[m]) {
            if (traces[m][i].gpx._leaflet_id == e.layer._leaflet_id) {
                setElevationTrace(m, e.layer.options.index);
                break;
            }
        }
    }
});

// functions for track loading
function loadTrace(m, track, i) {
    let trace = {};
    let filename = tracks[m][track].url.split('/').pop().split('#')[0].split('?')[0];

    trace.gpx = new L.GPX(tracks[m][track].url, {
        async: true,
        index: i,
        marker_options: {
            wptIconUrls: {
                '': wpfm_phpvars0.imagepath + 'pin-icon-wpt.png', // see: https://github.com/mpetazzoni/leaflet-gpx#about-waypoints
            },
            startIconUrl: null,
            endIconUrl: null,
            shadowUrl: null,
        },
        polyline_options: {
            color: "blue",
        }
    });

    trace.gpx.on('error', function(e) {
        console.log('Error loading file: ' + e.err);});

    trace.gpx.on('loaded', function(e) {
        trace.gpx._info.name=filename;
        controlLayer2[m].addBaseLayer(e.target, e.target.get_name());
            if (e.target.options.index == 0) {
                setElevationTrace(m, 0);
            bounds[m] = trace.gpx.getBounds();
            } else {
                maps[m].removeLayer(e.target);
            }
        })

    trace.gpx.on("addline", function(e) {
        trace.line = e.line;
    })

    trace.gpx.addTo(maps[m]);
    traces[m].push(trace);
}

// Function to update the elevation trace
function setElevationTrace(m, index) {
    let trace = traces[m][index];

    controlElevation[m].clear();

    let q = document.querySelector.bind(document);
    controlElevation[m].addData(trace.line);

    maps[m].fitBounds(trace.gpx.getBounds(), {padding: zpadding});
    bounds[m] = trace.gpx.getBounds();

    trace.gpx.setStyle({
        color: 'blue',
        weight: 4,
        opacity: 0.8,
    });

    var info = trace.gpx._info.desc;
    if (info) {info = info.split(' ')} else {info='';};
    if (info[0]=='Dist:' && info[1] && info[4] && info[7]) { 
        q('#data-summary'+m+' .totlen .summarylabel').innerHTML = L._('Distance') + ': ';
        q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = info[1] + " km"; 

        q('#data-summary'+m+' .gain .summarylabel').innerHTML   = L._('Ascent') + ': ' ;
        q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = info[4] + " m";

        q('#data-summary'+m+' .loss .summarylabel').innerHTML   = L._('Descent') + ': ';
        q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = info[7] + " m";
      
    } else {
        q('#data-summary'+m+' .totlen .summarylabel').innerHTML = L._('Distance') + ': ';
        q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = (trace.gpx.get_distance() / 1000).toFixed(2) + " km";

        q('#data-summary'+m+' .gain .summarylabel').innerHTML   = L._('Ascent') + ': ' ;
        q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = trace.gpx.get_elevation_gain().toFixed(0) + " m";

        q('#data-summary'+m+' .loss .summarylabel').innerHTML   = L._('Descent') + ': ';                                            
        q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = trace.gpx.get_elevation_loss().toFixed(0) + " m";
    }
}
*/