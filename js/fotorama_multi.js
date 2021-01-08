"use strict";

(function (window, document, undefined) {
    var numberOfFotorama = document.querySelectorAll('[id^=mfotorama]').length;
    var numberOfMaps = document.querySelectorAll('[id^=boxmap]').length;
    let mobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

    var mapdiv = new Array();
    
    for (var i = 0; i < numberOfFotorama; i++) {
        // 1. Initialize fotorama manually.
        var $fotoramaDiv = jQuery('#mfotorama' + i ).fotorama();
        // 2. Get the API object.
        var fotorama = eval('mfotorama'+i);
        fotorama = $fotoramaDiv.data('fotorama');
        // get the mapdiv
        var mapdiv = document.getElementById("map" + i);
        var phpvars = eval('wpfm_phpvars'+i);

        if (mapdiv) {
            if (phpvars) {
                //let g_numb_gpxfiles = parseInt( phpvars.ngpxfiles );
                //let g_maprescale = parseInt(phpvars.maprescale);
            }
        }

        if (fotorama) {
            let newimages = phpvars.imgdata; 
            let olddata = fotorama.data;
            let newdata = [];
            var width = $fotoramaDiv[0].parentElement.clientWidth;
    
            if (newimages) {
                if (olddata.length == newimages.length) {
                    // Assumption: array newimages has the same sorting as olddata and the srcset is the same for all images
                    var srcarray = newimages[0].srcset
                    let srcindex = 0;
    
                    for (const [key, value] of Object.entries(srcarray)) {
                        //console.log(`${key}: ${value}`);
                        if (key > width) {
                            srcindex = key;
                            break;
                        }
                    }
                    
                    olddata.forEach(replaceimg);
                    
                    function replaceimg(item, index){
                        if (mobile) {
                            newdata[index] = {img: newimages[index].srcset[ srcindex ], thumb: item.thumb, caption: item.caption};
                        }
                        else {
                            newdata[index] = {img: newimages[index].srcset[ srcindex ], thumb: item.thumb, full: newimages[index].srcset['2560'], caption: item.caption};
                        }
                    }
                }
            }
    
        // nur ausführen wenn images vorhanden! ansonsten das ursprüngliche belassen! php liefert reduzierte bilder nur mit wpid also wenn in wp medialib
            fotorama.load(newdata);
        }
    }

    jQuery('.fotorama').on('fotorama:showend',
    function (e, fotorama, extra) {
        var nr = fotorama.activeIndex;
        console.log('change in: ' + e.currentTarget.id + ' index: ' + nr);               
    });

    
    jQuery('.fotorama').on('fotorama:fullscreenenter fotorama:fullscreenexit', function (e, fotorama) {
        if (e.type === 'fotorama:fullscreenenter') {
            // Options for the fullscreen
            fotorama.setOptions({
                fit: 'contain'
            });
        } else {
            // Back to normal settings
            fotorama.setOptions({
                fit: 'cover'
            });
        }
    });

    // disable right-click completely
    //jQuery('document').contextmenu(function() {
    //   return false;
    //});   

    //------------- leaflet - elevation part ---------------------------
    //let glob_leaf_gpxfile = "https://raruto.github.io/leaflet-elevation/examples/via-emilia.gpx"; // übergabe aus PHP, count ? mehrere / Karte? Array?
    
    var opts = { // Kartenoptionen definieren : können NICHT für alle Karten gleich sein
        map: {
            center: [41.4583, 12.7059],
            zoom: 5,
            markerZoomAnimation: false,
            zoomControl: false,
            gestureHandling: true,
            gestureHandlingOptions: {
            text: {
                touch: "Use two Fingers to move the Map",
                scroll: "Use Ctrl + Scrollwheel to zoom the Map",
                scrollMac: "use \u2318 + scroll to zoom the map"
                }
            }
        },
        zoomControl: {
            position: 'topleft',
        },
        layersControl: {
            options: {
            collapsed: true, //mobile == true, // mobile: false // desktop: true
            },
        },
    };
    
    var maps = new Array();
    var baseLayers = new Array();
    var layer1 = new Array();
    var layer2 = new Array();
    var layer3 = new Array();
    var layer4 = new Array();
    var bounds = new Array();
    var controlZoom = new Array();
    var scale = new Array();
    var controlLayer = new Array();
    var baseLayers2 = new Array();
    var controlLayer2 = new Array();
    var controlElevation = new Array();
    var eleopts = new Array();
    var traces = new Array();
    let tracks = new Array(); 
    //var trace = new Array();

    for (var m = 0; m < numberOfMaps; m++) {
        // Kartenlayer definieren 
        layer1[m] = new L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: 'MapData:&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | MapStyle:&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            });
        layer2[m] = new L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/ {y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
        layer3[m] = new L.tileLayer('https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });
        layer4[m] = new L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri User Community'
            });

        if ( mobile ) {
            layer1[m].options.attribution = layer2[m].options.attribution;
            layer3[m].options.attribution = layer2[m].options.attribution;
            layer4[m].options.attribution = layer2[m].options.attribution;
        };      

        baseLayers[m] = { // Kartenoptionen definieren 
            "OpenStreetMap": layer2[m],
            "OpenTopoMap": layer1[m],
            "Bike-Hike-Map": layer3[m],
            "Satellit": layer4[m]
        }  

        maps[m] = new L.Map('map' + m, opts.map); 
        maps[m].addLayer(baseLayers[m].OpenTopoMap);
        bounds[m] = maps[m].getBounds;  
    
        // create scale control top left
        if ( ! mobile ) { // mobile: zoom deactivate. use fingers!
            controlZoom[m] = new L.Control.Zoom(opts.zoomControl); 
            controlZoom[m].addTo(maps[m]); 
        }

        // Creating scale control bottom left
        scale[m] = L.control.scale();
        // Adding scale control to the map
        scale[m].addTo(maps[m]);

        // create Map selector top right 
        controlLayer[m] = L.control.layers(baseLayers[m], null, opts.layersControl.options); 
        controlLayer[m].addTo(maps[m]);

        // create Track selector bottom right
        baseLayers2[m] = {};
        controlLayer2[m] = L.control.layers(baseLayers2[m], null, {collapsed:true}); 
        controlLayer2[m].setPosition('bottomright')
        controlLayer2[m].addTo(maps[m]);

        // create elevation chart(s) -----------------------
        eleopts[m] = { // Kartenoptionen definieren : können für alle Karten gleich sein
            elevationControl: {
              //data: glob_leaf_gpxfile,
              options: {
                theme: "yellow-theme", // CHANGE: theme anpassen martin-theme, lime-theme, steelblue-theme, purple-theme, yellow-theme, red-theme, magenta-theme, lightblue-theme
                elevationDiv: "#elevation-div" + m, // zähler verwenden
                detachedView: true,
                summary: true,
                downloadLink:true,
                followMarker: false,
                skipNullZCoords: true,
                legend: true,
              }
            }
        };

        controlElevation[m] = L.control.elevation(eleopts[m].elevationControl.options); 
        controlElevation[m].addTo(maps[m]);
        controlElevation[m].loadChart(maps[m]);

        // load all tracks from array
        traces[m] = [];
        var phptracks = eval('wpfm_phpvars'+m);
        tracks[m] = phptracks.tracks[0]; 
       
		var i = 0;
		for (var track in tracks[m]) {
			loadTrace(m, track, i++)
        } 

        // change elevation chart on change
        maps[m].on('baselayerchange', function(e) {
            var ename = e.name;
            var mapchange = false;
            var source = e.sourceTarget._container.id;
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

    } // end for m maps

      

    // functions for track loading
    function loadTrace(m, track, i) {
        var trace = {};
        var filename = tracks[m][track].url.split('/').pop().split('#')[0].split('?')[0];

        trace.gpx = new L.GPX(tracks[m][track].url, {
            async: true,
            index: i,
            marker_options: {
                startIconUrl: null,
                endIconUrl: null,
                shadowUrl: null,
            },
            polyline_options: {
                //color: tracks[track].color,
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

    function setElevationTrace(m, index) {
        var trace = traces[m][index];

        controlElevation[m].clear();

        var q = document.querySelector.bind(document);
        controlElevation[m].addData(trace.line);

        maps[m].fitBounds(trace.gpx.getBounds());
        bounds[m] = trace.gpx.getBounds();

        trace.gpx.setStyle({
            color: 'blue',
            weight: 4,
            opacity: 0.8,
        });

        //q('.totlen .summaryvalue').innerHTML = (trace.gpx.get_distance() / 1000).toFixed(2) + " km";
        //q('.gain .summaryvalue').innerHTML = "+" + trace.gpx.get_elevation_gain().toFixed(0) + " m";
        //q('.loss .summaryvalue').innerHTML = "-" + trace.gpx.get_elevation_loss().toFixed(0) + " m";
    }
    
})(window, document);