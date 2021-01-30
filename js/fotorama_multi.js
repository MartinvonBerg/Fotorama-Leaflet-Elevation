(function (document, $, undefined) {
    "use strict";
    var numberOfboxes = document.querySelectorAll('[id^=multifotobox]').length;

    if (numberOfboxes > 0) {

        var numberOfFotorama = document.querySelectorAll('[id^=mfotorama]').length;
        var numberOfMaps = document.querySelectorAll('[id^=boxmap]').length;

        var mobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
        var fotorama = new Array();
        var phpvars = new Array();
        var circlemarker = new Array();
        var storemarker = new Array();
        var newmarker = new Array();
        var mrk = new Array(); 
        
        // Icons definieren, TODO: besser als Klasse und als LOOP, abhängig von der Anzahl der Kategorien!
        if ( numberOfMaps > 0) {
            var myIcon1 = L.icon({ 
                iconUrl: wpfm_phpvars0.imagepath + "photo.png",
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -16],
                shadowUrl: wpfm_phpvars0.imagepath + 'shadow.png',
                shadowSize: [48, 32],
                shadowAnchor: [16, 32],
            });
            /*
            var myIcon2 = L.icon({ // hiking     $icon = "hiking";
                iconUrl: wpfm_phpvars0.imagepath + "circle-big.png",
                iconSize: [48, 48],
                iconAnchor: [24, 24],
                keyboard: false,
                interactive: false,
            });
            */
            var myIcon3 = L.icon({ 
                iconUrl: wpfm_phpvars0.imagepath + "active.png",
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -16],
                shadowUrl: wpfm_phpvars0.imagepath + 'shadow.png',
                shadowSize: [48, 32],
                shadowAnchor: [16, 32],
            });

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
            var tracks = new Array(); 
            var group1 = new Array();
            //let marker = new Array();

            $(document).ready(function() {
                // get height
                //var chartheight = jQuery('#elevation-div0').clientHeight;
                var chartheight = document.getElementById('elevation-div0').clientHeight;
                $('.elevation-control.elevation .background').css("height", chartheight);
                //console.log(chartheight);
            });
        }
        
        for (var m = 0; m < numberOfboxes; m++) {

            var hasFotorama = document.querySelectorAll('[id^=mfotorama'+m+']').length == 1;
            // define fotorama
            if ( hasFotorama ) {
                // 1. Initialize fotorama manually.
                let $fotoramaDiv = $('#mfotorama' + m ).fotorama();
                // 2. Get the API object.
                fotorama[m] = $fotoramaDiv.data('fotorama');
               
                phpvars[m] = eval('wpfm_phpvars'+m);

                let newimages = phpvars[m].imgdata; 
                let olddata = fotorama[m].data;
                let newdata = [];
                let width = $fotoramaDiv[0].parentElement.clientWidth;
        
                if (newimages[0].srcset) {
                    if (olddata.length == newimages.length) {
                        // Assumption: array newimages has the same sorting as olddata and the srcset is the same for all images
                        let srcarray = newimages[0].srcset
                        let srcindex = 0;
        
                        // get the image size with is just bigger than current width
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
                        // nur ausführen wenn images vorhanden! ansonsten das ursprüngliche belassen! php liefert reduzierte bilder nur mit wpid also wenn in wp medialib
                        fotorama[m].load(newdata);
                    }
                }
            }
        
            //------------- leaflet - elevation part ---------------------------
            var hasMap = document.querySelectorAll('[id^=boxmap'+m+']').length == 1;

            if ( hasMap) {
                // get js-variable from php-output
                let phptracks = eval('wpfm_phpvars'+m);

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
                        let img = L.DomUtil.create('img');
                        //img.src = g_wp_postmap_path + 'lupe_p_32.png';
                        img.src = phptracks.imagepath + "/lupe_p_32.png";
                        img.style.background = 'white';
                        img.style.width = '32px';
                        img.style.height = '32px';
                        img.style.cursor = 'pointer';
                        img.title = 'Alles anzeigen';
                        img.id = m;
                        img.onclick = function (e) {
                            let m = parseInt(e.srcElement.id);
                            maps[m].fitBounds(bounds[m], {padding: [30,30]}); 
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
                            theme: phptracks.eletheme, // CHANGE: theme anpassen martin-theme, lime-theme, steelblue-theme, purple-theme, yellow-theme, red-theme, magenta-theme, lightblue-theme
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
                
                if ( hasFotorama ) {
                    // ---------Foto Marker Cluster ------------------
                    // Creating markergroups ----------------------- 
                    //var LayerSupportGroup = L.markerClusterGroup.layerSupport({
                        //disableClusteringAtZoom: 15,
                        //showCoverageOnHover: true,
                        //zoomToBoundsOnClick: true,
                        //spiderfyOnMaxZoom: true,
                    //}), 
                    group1[m] = L.layerGroup(); 
                    let testgroup = L.featureGroup();
                    //LayerSupportGroup.addTo(maps[m]);

                    // Creating markers -----------------------
                    let marker = new Array();
                    let j = 0;
                
                    phptracks.imgdata.forEach(tour => { 
                        if ( (tour["coord"][0] == null) || (tour["coord"][1] == null) ) {
                            // do nothing
                        }
                        else {
                            marker.push(new L.Marker(tour["coord"], { title: tour["title"], icon: myIcon1, id: j, riseOnHover: true, })); 
                            
                            if ("srcset" in tour) { 
                                var key = Object.keys(tour.srcset)[0];
                                marker[j].bindPopup( tour["title"] + '<br><img src="' + tour.srcset[key] + '">' );
                            } else {
                                marker[j].bindPopup( tour["title"]  );
                            }

                            marker[j].addTo(group1[m]);
                            marker[j].on('click', function (a) {
                                //var title = this.options.title;
                                var source = a.originalEvent.currentTarget.id;
                                source = source.replace('map','');
                                m = parseInt( source);
                                //console.log('Map '+ m +' Marker Nr.' + this.options.id + ' clicked');
                                // remove circlemarker[m]
                                fotorama[m].show(this.options.id); // Fotorama und Karte müssen denselben Index haben!
                            });
                            marker[j].on('mouseover', function (e) {
                                this.openPopup();
                            });
                            marker[j].on('mouseout', function (e) {
                                this.closePopup();
                            });
                            marker[j].addTo(testgroup);
                            j++; 
                        }
                    });

                    if (marker.length > 0) {
                        mrk[m] = marker;
                        //LayerSupportGroup.checkIn([group1]); 
                        controlLayer[m].addOverlay(group1[m], 'Fotos (' + j + ')');    
                        group1[m].addTo(maps[m]); 
                    
                        if(bounds[m].length == 0) {
                            bounds[m] = testgroup.getBounds().pad(0.5);
                            maps[m].fitBounds(bounds[m] );
                        }
                    } else {
                        bounds[m] = maps[m].getBounds();
                    }
                } else if (parseInt(phptracks.ngpxfiles) == 0) {
                    bounds[m] = maps[m].getBounds();
                }
            }
        } // end for m maps
        
        // jQuery fotorama funktionen for fullscreen and map interaction
        if ( numberOfFotorama > 0) {
            if (numberOfMaps > 0) {
                $('.fotorama').on('fotorama:showend fotorama:load',
                function (e, fotorama, extra) {
                    let nr = fotorama.activeIndex;
                    let source = e.currentTarget.id;
                    source = source.replace('mfotorama','');
                    m = parseInt(source);

                    if (circlemarker[m]) {
                        maps[m].removeLayer(circlemarker[m])
                    };

                    if ((maps != 'undefined') && phpvars[m].imgdata[nr].coord[0]) {
                        //console.log('change in: ' + e.currentTarget.id + ' index: ' + nr + 'Koord: ' + phpvars[m].imgdata[nr].coord[0] + ':' + phpvars[m].imgdata[nr].coord[1] ); 
                        if (e.type === 'fotorama:load') {
                            storemarker[m] = mrk[m][nr];
                            newmarker[m] = mrk[m][nr];
                            maps[m].removeLayer(mrk[m][nr]);
                            newmarker[m].setIcon(myIcon3);
                            newmarker[m].setZIndexOffset(500);
                            newmarker[m].addTo(maps[m]);
                        }
                        if (e.type === 'fotorama:showend') {
                            maps[m].flyTo([phpvars[m].imgdata[nr].coord[0] , phpvars[m].imgdata[nr].coord[1] ]);
                        }
                        //circlemarker[m] = L.marker([phpvars[m].imgdata[nr].coord[0] , phpvars[m].imgdata[nr].coord[1] ], { icon: myIcon2  }).addTo(maps[m]);
                        if (storemarker[m].options.id != mrk[m][nr].options.id) {
                            maps[m].removeLayer(newmarker[m]);
                            storemarker[m].setIcon(myIcon1);
                            newmarker[m].setZIndexOffset(-500);
                            storemarker[m].addTo(maps[m]);
                            storemarker[m] = mrk[m][nr]
                            newmarker[m] = mrk[m][nr];
                            maps[m].removeLayer(mrk[m][nr]);
                            newmarker[m].setIcon(myIcon3);
                            newmarker[m].setZIndexOffset(500);
                            newmarker[m].addTo(maps[m]);
                        }

                    }
                });
            }
            
            $('.fotorama').on('fotorama:fullscreenenter fotorama:fullscreenexit', function (e, fotorama) {
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
        }

        // disable right-click completely
        //jQuery('document').contextmenu(function() {
        //   return false;
        //});   

        // functions for track loading
        function loadTrace(m, track, i) {
            let trace = {};
            let filename = tracks[m][track].url.split('/').pop().split('#')[0].split('?')[0];

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
            let trace = traces[m][index];

            controlElevation[m].clear();

            let q = document.querySelector.bind(document);
            controlElevation[m].addData(trace.line);

            maps[m].fitBounds(trace.gpx.getBounds(), {padding: [30,30]});
            bounds[m] = trace.gpx.getBounds();

            trace.gpx.setStyle({
                color: 'blue',
                weight: 4,
                opacity: 0.8,
            });

            var info = trace.gpx._info.desc;
            if ( info) { 
                info = info.split(' '); 
                // TODO: ascent / descent calculation is wrong. Mine is better
                if (parseFloat(info.includes[1]) != NaN) {
                    q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = info[1] + " km";
                } 
                if (parseFloat(info.includes[3]) != NaN) {
                    q('#data-summary'+m+' .gain .summaryvalue').innerHTML = "+" + info[3] + " m";
                } 
                if (parseFloat(info.includes[5]) != NaN) {
                    q('#data-summary'+m+' .loss .summaryvalue').innerHTML = "-" + info[5] + " m";
                } 
            } else {
                q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = (trace.gpx.get_distance() / 1000).toFixed(2) + " km";
                q('#data-summary'+m+' .gain .summaryvalue').innerHTML = "+" + trace.gpx.get_elevation_gain().toFixed(0) + " m";
                q('#data-summary'+m+' .loss .summaryvalue').innerHTML = "-" + trace.gpx.get_elevation_loss().toFixed(0) + " m";
            }
        }
 
    }
})(document, jQuery);