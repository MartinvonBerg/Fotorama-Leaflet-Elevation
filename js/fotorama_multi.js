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
            },
            //fullscreenControl: true,
            //fullscreenControlOptions: {
            //    position: 'topleft',
            //}
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
    let lupe = new Array();

    for (var m = 0; m < numberOfMaps; m++) {
        // get js-variable from php-output
        var phptracks = eval('wpfm_phpvars'+m);

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
    
        // create scale control top left // mobile: zoom deactivate. use fingers!
        if ( ! mobile ) { 
            controlZoom[m] = new L.Control.Zoom(opts.zoomControl); 
            controlZoom[m].addTo(maps[m]); 
        }

        //------- Lupe, Image-Marker und Base-Layer-Change handling --------------------------------
        // Functions and Overlays for Show-all in the top left corner
        L.Control.Watermark = L.Control.extend({
            onAdd: function () {
                var img = L.DomUtil.create('img');
                //img.src = g_wp_postmap_path + 'lupe_p_32.png';
                img.src = phptracks.imagepath + "/lupe_p_32.png";
                img.style.background = 'white';
                img.style.width = '32px';
                img.style.height = '32px';
                img.style.cursor = 'pointer';
                img.title = 'Alles anzeigen';
                img.id = m;
                img.onclick = function (e) {
                    var m = parseInt(e.srcElement.id);
                    maps[m].fitBounds(bounds[m]); 
                    //map.flyTo([40.737, -73.923]) // für fotorama nur Center, ohne Zoom-Änderung
                };
                return img;
            },
        });
        L.control.watermark = function (opts) {
            return new L.Control.Watermark(opts);
        }
        L.control.watermark({ position: 'topleft' }).addTo(maps[m]);

        // Creating scale control bottom left
        scale[m] = L.control.scale();
        // Adding scale control to the map
        scale[m].addTo(maps[m]);

        // create Map selector top right 
        controlLayer[m] = L.control.layers(baseLayers[m], null, opts.layersControl.options); 
        controlLayer[m].addTo(maps[m]);

        // create Track selector bottom right
        baseLayers2[m] = {};
        if (parseInt(phptracks.ngpxfiles) > 0) {
            controlLayer2[m] = L.control.layers(baseLayers2[m], null, {collapsed:true}); 
            controlLayer2[m].setPosition('bottomright')
            controlLayer2[m].addTo(maps[m]);

            // create elevation chart(s) -----------------------
            eleopts[m] = { // Kartenoptionen definieren : können für alle Karten gleich sein
                elevationControl: {
                //data: glob_leaf_gpxfile,
                options: {
                    theme: "lime-theme", // CHANGE: theme anpassen martin-theme, lime-theme, steelblue-theme, purple-theme, yellow-theme, red-theme, magenta-theme, lightblue-theme
                    elevationDiv: "#elevation-div" + m, // zähler verwenden
                    detachedView: true,
                    summary: false,
                    downloadLink:false,
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
            tracks[m] = phptracks.tracks; 
        
            var i = 0;
            for (var track in tracks[m]) {
                loadTrace(m, track, i++)
            } 
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

        // ---------Foto Marker Cluster ------------------
        // Creating markergroups ----------------------- 
        var LayerSupportGroup = L.markerClusterGroup.layerSupport(), 
        group1 = L.layerGroup(); // hiking     $icon = "hiking";
        LayerSupportGroup.addTo(maps[m]);

        // Creating markers -----------------------
        // TODO: fotorama setzt mapcenter und kreis um das aktive Bild bzw. cluster
        // TODO: click auf marker setzt fotorama
        // Icons definieren, TODO: besser als Klasse und als LOOP, abhängig von der Anzahl der Kategorien!
        var icnh = 32;
        var icnw = 32;

        var myIcon1 = L.icon({ // hiking     $icon = "hiking";
            iconUrl: "./js/images/hiking2.png",
            iconSize: [icnh, icnw],
            iconAnchor: [0, 0],
            popupAnchor: [0, 0],
            //shadowUrl: 'icon-shadow.png',
            //shadowSize: [100, 95],
            //shadowAnchor: [22, 94]
        });
        /*
        var marker = new Array();
        var nposts = [0]; 
        var j = 0;
        var icn, grp;

        imgmarker.forEach(tour => { // TODO: Loop
            switch (tour["category"]) {
            default:
                icn = myIcon1;
                grp = group1;
                nposts[0] = nposts[0] +1;
                    break;
            }
            marker.push(new L.Marker(tour["coord"], { title: tour["title"], icon: icn, id: j, })); 
            marker[j].bindPopup('Marker ' + j + ' ' + tour["title"]);
            marker[j].addTo(grp);
            marker[j].on('click', function (a) {
            var title = this.options.title;
            console.log('Marker Nr.' + this.options.id + ' clicked');
            // fotorama aktion für den Marker mit Nr.
            });
            j++;
        });

        LayerSupportGroup.checkIn([group1]); 

        controlLayer.addOverlay(group1, 'Fotos (' + nposts[0] + ')');               // hiking     $icon = "hiking";; 

        group1.addTo(map); 

        LayerSupportGroup.on('clustermouseover', function (a) {
            var children = a.layer.getAllChildMarkers();
            var max = children.length;
            var string = 'Zeige ' + max + ' Fotos';
            a.propagatedFrom.bindTooltip(string).openTooltip();
        });

        LayerSupportGroup.on('clustermouseout', function (a) {
            a.propagatedFrom.bindTooltip('').closeTooltip();
        });
        */

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
        // TODO: ascent / descent calculation is wrong. Mine is better
        q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = (trace.gpx.get_distance() / 1000).toFixed(2) + " km";
        q('#data-summary'+m+' .gain .summaryvalue').innerHTML = "+" + trace.gpx.get_elevation_gain().toFixed(0) + " m";
        q('#data-summary'+m+' .loss .summaryvalue').innerHTML = "-" + trace.gpx.get_elevation_loss().toFixed(0) + " m";
    }

    jQuery(window).on("load", function() {  
        jQuery('.leaflet-control-layers-toggle').css('background-image','');

        if (mobile) {
          jQuery('.leaflet-right .leaflet-control').css('margin-right', '0px');
          jQuery('.leaflet-bottom .leaflet-control').css('margin-bottom', '0px');
          
        }
      });
    
})(window, document);