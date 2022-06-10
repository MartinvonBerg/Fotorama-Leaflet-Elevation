/* d3 migration guide: https://observablehq.com/@d3/d3v6-migration-guide */

(function (window, document, $, undefined) {
    "use strict";
    let numberOfboxes = document.querySelectorAll('[id^=multifotobox]').length;

    if ( numberOfboxes > 0 ) {

        // fotorama variables
        let allSliders = [];
        
        // map and chart var. The var is intentional here.
        var allMaps = [];
        
        // do it for all shortcodes on the page or post
        for (var m = 0; m < numberOfboxes; m++) {

            //------------- fotorama part --------------------------------------
            let hasFotorama = document.querySelectorAll('[id^=mfotorama'+m+']').length == 1;

            //------------- leaflet - elevation part ---------------------------
            let hasMap = document.querySelectorAll('[id^=boxmap'+m+']').length == 1;

            // define fotorama
            if ( hasFotorama ) {
                // define the Slider class. This class has to be enqued (loaded) before this function.
                allSliders[m] = new SliderFotorama(m, 'mfotorama' + m );
                // Initialize fotorama manually.
                allSliders[m].defSlider();
            } else {
                  // get and set options for maps without gpx-tracks. only one marker to show.
                  if ( parseInt(pageVarsForJs[m].ngpxfiles) === 0 ) {
                    let center = pageVarsForJs[m].mapcenter;
                    let zoom = pageVarsForJs[m].zoom;
                    let text = pageVarsForJs[m].markertext;
                    allMaps[m] = new LeafletMap(m, 'boxmap' + m, center, zoom );
                    allMaps[m].createSingleMarker(text);
                } else {
                    // only leaflet elevation chart to show. This is true if there is a gpx-track provided.
                    // TODO: But this is the code for the child class. How to do this?
                }
            }
            
            // define map and chart
            if ( hasMap & hasFotorama ) {
                
                // initiate the leaflet map
                allMaps[m] = new LeafletMap(m, 'boxmap' + m );

                // create the markers on the map
                allMaps[m].createFotoramaMarkers( pageVarsForJs[m].imgdata );

                // update markers on the map if the active image changes
                document.querySelector('#mfotorama'+ m).addEventListener('sliderchange', function waschanged(e) {
                    //console.log('event:', e.detail.name, 'new slide:', e.detail.newslide, 'in slider:',e.detail.slider);

                    allMaps[e.detail.slider].mapFlyTo( pageVarsForJs[e.detail.slider].imgdata[e.detail.newslide-1]['coord'] ); // change only

                    // mark the new image with red icon and remove the red icon from others
                    // first get the right numbers
                    let m = e.detail.slider;
                    let nr = e.detail.newslide-1;

                    // remove old markers - on change only.
                    allMaps[m].map.removeLayer(allMaps[m].newmarker);
                    allMaps[m].storemarker.setIcon(allMaps[m].myIcon1);
                    allMaps[m].newmarker.setZIndexOffset(-500);
                    allMaps[m].storemarker.addTo(allMaps[m].map);

                    // mark now the marker for the active image
                    allMaps[m].storemarker = allMaps[m].mrk[nr];
                    allMaps[m].newmarker = allMaps[m].mrk[nr];
                    allMaps[m].map.removeLayer( allMaps[m].mrk[nr]);
                    allMaps[m].newmarker.setIcon(allMaps[m].myIcon3);
                    allMaps[m].newmarker.setZIndexOffset(500);
                    allMaps[m].newmarker.addTo(allMaps[m].map);

                });
                document.querySelector('#mfotorama'+ m).addEventListener('sliderload', function wasloaded(e) {
                    //console.log('event:', e.detail.name, 'new slide:', e.detail.newslide, 'in slider:',e.detail.slider);

                    // mark the first image marker to red with myIcon3.
                    // first get the right numbers
                    let m = e.detail.slider;
                    let nr = e.detail.newslide-1;

                    // mark now the marker for the active image
                    allMaps[m].storemarker = allMaps[m].mrk[nr];
                    allMaps[m].newmarker = allMaps[m].mrk[nr];
                    allMaps[m].map.removeLayer( allMaps[m].mrk[nr]);
                    allMaps[m].newmarker.setIcon(allMaps[m].myIcon3);
                    allMaps[m].newmarker.setZIndexOffset(500);
                    allMaps[m].newmarker.addTo(allMaps[m].map);
                });

                // update the slider if the marker on the map was clicked
                document.querySelector('#boxmap'+ m).addEventListener('mapmarkerclick', function markerclicked(e) {
                    //console.log('event:', e.detail.name, 'new slide:', e.detail.marker, 'in slider:',e.detail.map);
                    allSliders[e.detail.map].setSliderIndex(e.detail.marker);
                });
            }
            
        } // end for m maps
        
        // function for map resizing for responsive devices
        // TODO: funktioniert nicht
        $(window).on("resize load", mapResize() );
    }
    /*
    function showMultipleTracks(zpadding) {
        m = 0;
        grouptracks[m] = [];
        var routes;
        var i = 0;
        zpadding = [0, 0];

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
        window.setTimeout(function (e) {
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
        maps[0].on('eledata_loaded eledata_added eledata_clear', function () {
            m = 0;
            //bounds[m] = maps[m].getBounds(); //.pad(0.5); // 0 .. -0.5 possible: -0.2 best
            // Select the node that will be observed for mutations
            const targetNode = document.getElementsByClassName('leaflet-bottom')[1];
            // Options for the observer (which mutations to observe)
            const config = { childList: true, subtree: true, attributes: true };
            // Callback function to execute when mutations are observed
            const callback = function () {
                let div = document.getElementsByClassName('leaflet-control-layers-base');
                let len = div[1].childElementCount;
                let track = '';
                let keyarray = Object.keys(routes._routes);
                //let endstyle = '';;
                // find the track in div
                for (var c = 0; c < len; c++) {
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
                        if (info) { info = info.split(' '); } else { info = ''; };
                        if (info[1] && info[4] && info[7]) {
                            q('#data-summary' + m + ' .totlen .summarylabel').innerHTML = L._('Distance') + ': ';
                            q('#data-summary' + m + ' .totlen .summaryvalue').innerHTML = info[1] + " km";

                            q('#data-summary' + m + ' .gain .summarylabel').innerHTML = L._('Ascent') + ': ';
                            q('#data-summary' + m + ' .gain .summaryvalue').innerHTML = info[4] + " m";

                            q('#data-summary' + m + ' .loss .summarylabel').innerHTML = L._('Descent') + ': ';
                            q('#data-summary' + m + ' .loss .summaryvalue').innerHTML = info[7] + " m";

                        } else {
                            q('#data-summary' + m + ' .totlen .summarylabel').innerHTML = L._('Distance') + ': ';
                            q('#data-summary' + m + ' .totlen .summaryvalue').innerHTML = (trace.gpx.get_distance() / 1000).toFixed(2) + " km";

                            q('#data-summary' + m + ' .gain .summarylabel').innerHTML = L._('Ascent') + ': ';
                            q('#data-summary' + m + ' .gain .summaryvalue').innerHTML = trace.gpx.get_elevation_gain().toFixed(0) + " m";

                            q('#data-summary' + m + ' .loss .summarylabel').innerHTML = L._('Descent') + ': ';
                            q('#data-summary' + m + ' .loss .summaryvalue').innerHTML = trace.gpx.get_elevation_loss().toFixed(0) + " m";
                        }
                    }
                });

            };
            // Create an observer instance linked to the callback function
            const observer = new MutationObserver(callback);
            // Start observing the target node for configured mutations
            observer.observe(targetNode, config);

        });
        return { i, track, zpadding };
    }

    function createElevChart(phptracks) {
        eleopts[m] = {
            elevationControl: {
                options: {
                    theme: phptracks.eletheme,
                    elevationDiv: "#elevation-div" + m,
                    detachedView: true,
                    summary: false,
                    downloadLink: false,
                    followMarker: false,
                    skipNullZCoords: true,
                    legend: true,
                    lazyLoadJS: true,
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
            controlLayer2[m] = L.control.layers(baseLayers2[m], null, { collapsed: true });
            controlLayer2[m].setPosition('bottomright');
            controlLayer2[m].addTo(maps[m]);
            controlElevation[m] = L.control.elevation(eleopts[m].elevationControl.options);
            controlElevation[m].addTo(maps[m]);
            controlElevation[m].loadChart(maps[m]);
        }

        // load all tracks from array
        traces[m] = [];
        tracks[m] = phptracks.tracks;
    }

    function defMapAndChart(chartheight, phpmapheight, hasFotorama, maxZoomValue, mobile) {
        let phptracks = eval('wpfm_pageVarsForJs' + m);
        chartheight[m] = phptracks.chartheight;
        phpmapheight[m] = phptracks.mapheight;

        //get options for maps without gpx-tracks
        if ((parseInt(phptracks.ngpxfiles) == 0) && (!hasFotorama)) {
            opts.map.center = phptracks.mapcenter;
            opts.map.zoom = phptracks.zoom;
        }

        // define map layers 
        layer1[m] = new L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: maxZoomValue,
            attribution: 'MapData &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | MapStyle:&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        layer2[m] = new L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/ {y}.png', {
            maxZoom: maxZoomValue,
            attribution: 'MapData &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        layer3[m] = new L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
            maxZoom: maxZoomValue,
            attribution: 'MapData &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        layer4[m] = new L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: maxZoomValue,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri User Community'
        });

        // set map attribution for mobile devices to a short string
        if (mobile) {
            layer1[m].options.attribution = layer2[m].options.attribution;
            layer3[m].options.attribution = layer2[m].options.attribution;
            layer4[m].options.attribution = layer2[m].options.attribution;
        };

        // define base layers for leaflet map
        baseLayers[m] = {
            "OpenStreetMap": layer2[m],
            "OpenTopoMap": layer1[m],
            "CycleOSM": layer3[m],
            "Satellit": layer4[m]
        };
        return phptracks;
    }

    // functions for track loading
    function loadTrace(m, track, i) {
        let trace = {};
        let filename = tracks[m][track].url.split('/').pop().split('#')[0].split('?')[0];

        trace.gpx = new L.GPX(tracks[m][track].url, {
            async: true,
            index: i,
            marker_options: {
                wptIconUrls: {
                    '': wpfm_pageVarsForJs0.imagepath + 'pin-icon-wpt.png', // see: https://github.com/mpetazzoni/leaflet-gpx#about-waypoints
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

    function mapResize() {
                    
        let fotowidth = $('[id^=mfotorama]').width();
        if (fotowidth<480) {
            $('.fotorama__caption__wrapm, .fotorama__caption').hide();   
        } else {
            $('.fotorama__caption__wrapm, .fotorama__caption').show();
        }
        
        for (let m = 0; m < numberOfboxes; m++) {    
            // w: width, h: height as shortform.  
            let wbox = $('#boxmap' + m).width();
            let wmap = $('#map' + m).width();
            let hmap = $('#map' + m).height();
            let ratioMap = wmap / hmap;
            
            if ( ! ('ratioMap' in pageVarsForJs[m]) ) {
                pageVarsForJs[m]['ratioMap'] = ratioMap;
                $('#map' + m).css('aspect-ratio', ratioMap);
            }
            
            let hele = $('#elevation-div' + m).height(); // ?? 0;
            hele = (typeof hele === 'undefined') ? 0 : hele;

            let hsum = $('#data-summary' + m).height(); // ?? 0;
            hsum = (typeof hsum === 'undefined') ? 0 : hsum;

            let hdld = $('#boxmap' + m + ' .fm-dload').height(); // ?? 0;
            hdld = (typeof hdld === 'undefined') ? 0 : hdld;

            let eleheight = wbox / 3;
            eleheight = Math.min(Math.max(parseInt(eleheight), 140), pageVarsForJs[m].chartheight); 
            $('#elevation-div'+m).css("height", eleheight);
          
            let mapheight = wbox / pageVarsForJs[m]['ratioMap'];
            mapheight = Math.min(Math.max(parseInt(mapheight), 280), pageVarsForJs[m].phpmapheight);
            $('#map'+m).css("height", mapheight);

            let _group = new L.featureGroup( allMaps[m].mrk );

            // skip boundary setting for boxmap that doesn't have a map
            if ( ! isNaN(ratioMap)) {
                allMaps[m].bounds = allMaps[m].setBoundsToMarkers(m, _group);
            } 
        }
    
    }

})(window, document, jQuery);
