(function (document, $, undefined) {
    "use strict";
    var numberOfboxes = document.querySelectorAll('[id^=multifotobox]').length;

    if (numberOfboxes > 0) {

        var numberOfFotorama = document.querySelectorAll('[id^=mfotorama]').length;
        var numberOfMaps = document.querySelectorAll('[id^=boxmap]').length;

        var mobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
        var fotorama = new Array();
        var phpvars = new Array();
        var storemarker = new Array();
        var circlemarker = new Array(); // weg
        var newmarker = new Array();
        var mrk = new Array();   
        var chartheight = new Array();
        var phpmapheight = new Array();   
        var zoomDiv = null;   
        var fotoramaState = null;
        
        // Variable definitions for maps
        if ( numberOfMaps > 0) {
            var showalltracks = (wpfm_phpvars0.showalltracks === 'true');
            if (numberOfMaps>1 && showalltracks) {showalltracks = false;}
    
            // Icons definieren
            var myIcon1 = L.icon({ 
                iconUrl: wpfm_phpvars0.imagepath + "photo.png",
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -16],
                shadowUrl: wpfm_phpvars0.imagepath + 'shadow.png',
                shadowSize: [48, 32],
                shadowAnchor: [16, 32],
            });
            var myIcon3 = L.icon({ 
                iconUrl: wpfm_phpvars0.imagepath + "active.png",
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -16],
                shadowUrl: wpfm_phpvars0.imagepath + 'shadow.png',
                shadowSize: [48, 32],
                shadowAnchor: [16, 32],
            });

            var opts = { // Kartenoptionen definieren 
                map: {
                    center: [41.4583, 12.7059],
                    zoom: 5,
                    markerZoomAnimation: false,
                    zoomControl: false,
                    gestureHandling: true,            
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
            var grouptracks = [];  
            var group1 = new Array();
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

                if (mobile) {
                    var h = window.screen.height;
                    var w = window.screen.width;
                    h>w ? width = h : width = w;
                }
        
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
                chartheight[m] = phptracks.chartheight;
                phpmapheight[m] = phptracks.mapheight;

                //get options for maps without tracks
                if ( (parseInt(phptracks.ngpxfiles) == 0) && (! hasFotorama) ) {
                    opts.map.center = phptracks.mapcenter;
                    opts.map.zoom = phptracks.zoom;
                }

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
                // set the language strings
                var mylocale = setlang();

                maps[m] = new L.Map('map' + m, opts.map); 
                if (numberOfMaps == 1 && showalltracks){
                    maps[m].addLayer(baseLayers[m].OpenStreetMap); 
                } else {
                    maps[m].addLayer(baseLayers[m].OpenTopoMap); 
                }
                bounds[m] = maps[m].getBounds;  
            
                // create scale control top left // mobile: zoom deactivate. use fingers!
                if ( ! mobile ) { 
                    controlZoom[m] = new L.Control.Zoom(opts.zoomControl); 
                    controlZoom[m].addTo(maps[m]); 
                }

                //------- Lupe, Image-Marker und Base-Layer-Change handling --------------------------------

                // create a fullscreen button and add it to the map
                L.control.fullscreen({
                    position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
                    title: L._('Show fullscreen'), // change the title of the button, default Full Screen
                    titleCancel: L._('Exit fullscreen'), // change the title of the button when fullscreen is on, default Exit Full Screen
                    content: null, // change the content of the button, can be HTML, default null
                    forceSeparateButton: true, // force seperate button to detach from zoom buttons, default false
                    forcePseudoFullscreen: true, // force use of pseudo full screen even if full screen API is available, default false
                    fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
                }).addTo(maps[m]);

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
                        img.title = L._('Show all');
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
                    // create elevation chart(s) -----------------------
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

                    if (showalltracks === false) {
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

                    if ( parseInt(phptracks.ngpxfiles) > 1 && showalltracks === true) {
                        m = 0;
                        grouptracks[m] = [];
                        var routes; 
                        var i = 0;
                        var page= $('html, body');

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
                                collapsed: false,
                            },
                            distanceMarkers: false,
                        });
                   
                        routes.addTo(maps[m]);
                        bounds[m] = maps[m].getBounds().pad(0.5);

                        window.setTimeout( function(e) { 
                            maps[0].zoomOut(1); // nur mit m=0, da zu Anfang geladen, kein Event gefunden map.on('load') geht nicht

                            // Did not managa that: Preload a default chart / track. according to https://github.com/Raruto/leaflet-elevation/issues/7
                            // So, we are using a click event, 3 times, due to another bug. It works
                            var elem1 = document.getElementsByClassName('leaflet-control-layers-base')[1].children[0].childNodes[0];
                            var elem2 = document.getElementsByClassName('leaflet-control-layers-base')[1].children[1].childNodes[0];
                            elem1.click();
                            elem2.click();
                            elem1.click();

                        }, 1000);

                        $('#boxmap0').on('scroll touchmove mousewheel', function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        });
                           
                        maps[0].on( 'eledata_loaded eledata_added eledata_clear', function() {
                            m = 0; 
                            page.stop();
                            bounds[m] = maps[m].getBounds().pad(0.5); // 0 .. -0.5 possible: -0.2 best

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

                                 keyarray.forEach(key => {
                                    //
                                    let info = routes._routes[key]._info.desc;
                                    let name = routes._routes[key]._info.name;
                                    let q = document.querySelector.bind(document);

                                    if (name == track) {
                                        if (info) {info = info.split(' ')} else {info='';};
                                        if (info[1] && info[4] && info[7]) { 
                                            q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = L._('Distance') + ': ' + info[1] + " km"; 
                                            q('#data-summary'+m+' .gain .summaryvalue').innerHTML = L._('Ascent') + ': +' + info[4] + " m";
                                            q('#data-summary'+m+' .loss .summaryvalue').innerHTML = L._('Descent') + ': -' + info[7] + " m";
                                        
                                        } else {
                                            q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = L._('Distance') + ': '  + (trace.gpx.get_distance() / 1000).toFixed(2) + " km";
                                            q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = L._('Ascent')   + ': +' + trace.gpx.get_elevation_gain().toFixed(0) + " m";
                                            q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = L._('Descent')  + ': -' + trace.gpx.get_elevation_loss().toFixed(0) + " m";
                                        }
                                    }
                                 });
                                 //console.log('Nr ' + activetrack + ' : ' + track + ' : ' + endstyle + ' is avtive');
                            };
                            // Create an observer instance linked to the callback function
                            const observer = new MutationObserver(callback);
                            // Start observing the target node for configured mutations
                            observer.observe(targetNode, config);                      

                        } ); 

                    } else {
                        var i = 0;
                        for (var track in tracks[m]) {
                            loadTrace(m, track, i++)
                        } 
                    }
                } else {
                    // Create simple marker
                    L.marker(opts.map.center, { title: phptracks.markertext,}).addTo(maps[m]);
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
                        controlLayer[m].addOverlay(group1[m], L._('Images') + '(' + j + ')');    
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
        
        // jQuery fotorama functions for fullscreen, map interaction e.q marker settings
        if ( numberOfFotorama > 0) {
            if (numberOfMaps > 0) {
              $('.fotorama').on('fotorama:showend fotorama:load',
                function (e, fotorama, extra) {
                    let nr = fotorama.activeIndex;
                    let source = e.currentTarget.id;
                    source = source.replace('mfotorama','');
                    m = parseInt(source);
                    var elem;

                    //if (circlemarker[m]) {
                    //    maps[m].removeLayer(circlemarker[m])
                    //};

                    if ((maps != 'undefined') && phpvars[m].imgdata[nr].coord[0]) {
                        //console.log('change in: ' + e.currentTarget.id + ' index: ' + nr + 'Koord: ' + phpvars[m].imgdata[nr].coord[0] + ':' + phpvars[m].imgdata[nr].coord[1] ); 
                        if (e.type === 'fotorama:load') {
                            storemarker[m] = mrk[m][nr];
                            newmarker[m] = mrk[m][nr];
                            maps[m].removeLayer(mrk[m][nr]);
                            newmarker[m].setIcon(myIcon3);
                            newmarker[m].setZIndexOffset(500);
                            newmarker[m].addTo(maps[m]);
                           
                            for (var fi = 0; fi < fotorama.data.length; fi++) {  
                                fotorama.data[fi].$navThumbFrame[0].id = 'f' + m + '-' + fi;
                            }
                            //fotorama.data[nr].$stageFrame[0].id = 'f' + m + '-' + nr;
                            //fotorama.data[1].$stageFrame[0].id = 'f' + m + '-1';
                            
                        }

                        if (e.type === 'fotorama:showend') {
                            //console.log(fotorama.activeFrame.$stageFrame[0].children[0].src);
                            fotorama.activeFrame.$stageFrame[0].id = fotorama.activeFrame.$navThumbFrame[0].id;
                            //elem = fotorama.activeFrame.$stageFrame[0].children[0];
                            //elem = document.getElementsByClassName('fotorama__stage__frame fotorama__loaded fotorama__loaded--img fotorama__active')[0]; 
                            //elem = $('.fotorama__stage__frame.fotorama__loaded.fotorama__loaded--img.fotorama__active')[0];
                            elem = document.getElementById('f' + m + '-' + nr).firstChild;
                            zoomDiv = null;

                            if (fotoramaState == 'full') {
                                zoomDiv = Panzoom(elem, {
                                    maxScale: 5,
                                    minScale: 1,
                                    step : 0.25,
                                    exclude: ['fotorama__caption', 'fotorama__caption__wrap'],
                                    panOnlyWhenZoomed: true,
                                });
                                zoomDiv.pan(0, 0);
                                zoomDiv.zoom(1, { animate: true });
                                elem.parentElement.addEventListener('wheel', zoomDiv.zoomWithWheel);
                            } else {
                                zoomDiv = Panzoom(elem, {
                                    maxScale: 1,
                                    minScale: 1,
                                    //exclude: ['fotorama__caption', 'fotorama__caption__wrap'],
                                    panOnlyWhenZoomed: true,
                                    disableZoom: true,
                                    cursor: 'arrow',
                                });
                                zoomDiv.zoom(1);
                                zoomDiv.pan(0, 0);
                                //elem.parentElement.addEventListener('wheel', zoomDiv.zoomWithWheel);
                            }        
                        

                            //console.log(fotoramaState, m, nr);
                          
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
            
            $('.fotorama').on('fotorama:fullscreenenter fotorama:fullscreenexit', function (e, fotorama, extra) {
                if (e.type === 'fotorama:fullscreenenter') {
                    let nr = fotorama.activeIndex;
                    let source = e.currentTarget.id;
                    source = source.replace('mfotorama','');
                    m = parseInt(source);
                    var elem;
                    fotoramaState = 'full';

                    // Options for the fullscreen
                    fotorama.setOptions({
                        fit: 'contain'
                    });

                    // zooming 
                    elem = document.getElementById('f' + m + '-' + nr).firstChild;
                    zoomDiv = null;
                    zoomDiv = Panzoom(elem, {
                        maxScale: 5,
                        minScale: 1,
                        step : 0.25,
                        exclude: ['fotorama__caption', 'fotorama__caption__wrap'],
                        panOnlyWhenZoomed: true,
                    });
                    zoomDiv.pan(0, 0);
                    zoomDiv.zoom(1, { animate: true });
                    elem.parentElement.addEventListener('wheel', zoomDiv.zoomWithWheel);
                
                } else {
                    zoomDiv.zoom(1, { animate: true });
                    zoomDiv.pan(0, 0);
                    //zoomDiv.reset();
                    //zoomDiv.destroy();
                    zoomDiv = null;

                    // Back to normal settings
                    fotorama.setOptions({
                        fit: 'cover'
                    }); 
                    fotoramaState = 'normal';
                
                }
            });
        }

        // disable right-click for fotorama
        //$('[id^=mfotorama]').contextmenu(function() {
        //   return false;
        //});  
        
        $(window).on("resize", function() {
                    
            var fotowidth = $('[id^=mfotorama]').width();
            if (fotowidth<480) {
                $('.fotorama__caption__wrapm, .fotorama__caption').hide();   
            } else {
                $('.fotorama__caption__wrapm, .fotorama__caption').show();
            }
            
            for (var m = 0; m < numberOfboxes; m++) {      
                var wbox = $('#boxmap' + m).width();

                var hbox = $('#boxmap' + m).height();
                //var hmap = $('#map' + m).height() ?? 0;

                var hele = $('#elevation-div' + m).height(); // ?? 0;
                hele = (typeof hele === 'undefined') ? 0 : hele;

                var hsum = $('#data-summary' + m).height(); // ?? 0;
                hsum = (typeof hsum === 'undefined') ? 0 : hsum;

                var hdld = $('#boxmap' + m + ' .fm-dload').height(); // ?? 0;
                hdld = (typeof hdld === 'undefined') ? 0 : hdld;

                var hmapnew = hbox - hele - hsum - hdld; 

                /* don't show leaflet attribution if screen is too small
                if (wbox<480) {  
                    $('.leaflet-control-attribution').hide();
                } else {
                    $('.leaflet-control-attribution').show();
                }
                */
                var eleheight = wbox / 3;
                eleheight = Math.min(Math.max(parseInt(eleheight), 100), chartheight[m]); 
                $('#elevation-div'+m).css("height", eleheight);

                if (hele < 5) {
                    var mapheight = hmapnew; 
                } else {
                    var mapheight = wbox * 0.6; 
                }
                mapheight = Math.min(Math.max(parseInt(mapheight), 280), phpmapheight[m]);
                $('#map'+m).css("height", mapheight);
            }
        
        }).trigger('resize');
        
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

            //controlElevation[m].summaryDiv.getElementsByClassName('totlen')[0].children[0].innerHTML = L._('Distance') + ': ';

            var info = trace.gpx._info.desc;
            if (info) {info = info.split(' ')} else {info='';};
            if (info[1] && info[4] && info[7]) { 
                q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = L._('Distance') + ': ' + info[1] + " km"; 
                q('#data-summary'+m+' .gain .summaryvalue').innerHTML = L._('Ascent') + ': +' + info[4] + " m";
                q('#data-summary'+m+' .loss .summaryvalue').innerHTML = L._('Descent') + ': -' + info[7] + " m";
              
            } else {
                q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = L._('Distance') + ': '  + (trace.gpx.get_distance() / 1000).toFixed(2) + " km";
                q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = L._('Ascent')   + ': +' + trace.gpx.get_elevation_gain().toFixed(0) + " m";
                q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = L._('Descent')  + ': -' + trace.gpx.get_elevation_loss().toFixed(0) + " m";
            }
        }

        function setlang() {
            let de = {
                'Show all' : "Alles anzeigen",
                'Distance' : "Strecke",
                "Ascent"   : "Anstieg",
                "Descent"  : "Abstieg",
                "Altitude" : "Höhe", // is in file /src/altitude.js
                "Images"   : "Fotos",
                'Show fullscreen' : 'Zeige Vollbild',
                'Exit fullscreen' : 'Vollbild beenden',
            };

            let it = {
                'Show all' : "Mostra Tutti",
                'Distance' : "Distanza",
                "Ascent"   : "Salita",
                "Descent"  : "Discesa",
                "Altitude" : "Altitudine", // is in file /src/altitude.js
                "Images"   : "Foto",
                'Show fullscreen' : 'Mappa a schermo intero',
                'Exit fullscreen' : 'Esci schermo intero',
            };

            let fr = {
                'Show all' : "Afficher Tout",
                'Distance' : "Distance",
                "Ascent"   : "Ascente",
                "Descent"  : "Descente",
                "Altitude" : "Altitude", // is in file /src/altitude.js
                "Images"   : "Images",
                'Show fullscreen' : 'Afficher carte en plein écran',
                'Exit fullscreen' : 'Quitter le mode plein écran',
            };

            var lang = navigator.language;
            lang = lang.split('-')[0];

            if ( (lang == 'de') || (lang == 'it') || (lang == 'fr') ) {
                L.registerLocale(lang, eval(lang) );
                L.setLocale(lang);
                return mylocale;
            } else {return;}
        }; 
    }
})(document, jQuery);