(function (window, document, undefined) {
    "use strict";
    let numberOfBoxes = document.querySelectorAll('[id^=multifotobox]').length;

    if ( numberOfBoxes > 0 ) {
        //TODO: load script files here like raruto does!
        // fotorama variables
        let allSliders = [ numberOfBoxes-1 ];
        
        // map and chart var. The var is intentional here.
        let allMaps = [ numberOfBoxes-1 ];
        
        // do it for all shortcodes on the page or post
        for (let m = 0; m < numberOfBoxes; m++) {

            //------------- fotorama part --------------------------------------
            let hasFotorama = document.querySelectorAll('[id^=mfotorama'+m+']').length == 1;

            //------------- leaflet - elevation part ---------------------------
            let hasMap = document.querySelectorAll('[id^=boxmap'+m+']').length == 1;

            // remove grid class is parent is a column
            let el = document.getElementById('multifotobox'+m);
            let parentClass = el.parentElement.className;
            if (parentClass.includes('column')) {
                el.classList.remove('mfoto_grid');
                el = document.getElementById('boxmap'+m);
                el.style.padding = "0px 0px 0px 0px";
                // missing: the class fm-dload margin-bottom is set in CSS. This could be set manually.
            }

            // define fotorama
            if ( hasFotorama ) {
                // define the Slider class. This class has to be enqued (loaded) before this function.
                allSliders[m] = new SliderFotorama(m, 'mfotorama' + m );
                // Initialize fotorama manually.
                allSliders[m].defSlider();
            } else {
                  // no fotorama, no gpx-track: get and set options for maps without gpx-tracks. only one marker to show.
                  if ( parseInt(pageVarsForJs[m].ngpxfiles) === 0 ) {
                    let center = pageVarsForJs[m].mapcenter;
                    let zoom = pageVarsForJs[m].zoom;
                    let text = pageVarsForJs[m].markertext;
                    allMaps[m] = new LeafletMap(m, 'boxmap' + m, center, zoom );
                    allMaps[m].createSingleMarker(text);
                } else {
                    // no fotorama, one or more gpx-tracks: only leaflet elevation chart to show. This is true if there is a gpx-track provided.
                    // initiate the leaflet map
                    allMaps[m] = new LeafletElevation(m, 'boxmap' + m );
                }
            }
            
            // define map and chart
            if ( hasMap & hasFotorama ) {
                
                // initiate the leaflet map
                allMaps[m] = new LeafletElevation(m, 'boxmap' + m );

                // create the markers on the map
                allMaps[m].createFotoramaMarkers( pageVarsForJs[m].imgdata );
                
                // update markers on the map if the active image changes
                document.querySelector('#mfotorama'+ m).addEventListener('sliderchange', function waschanged(e) {
                    // move map
                    allMaps[e.detail.slider].mapFlyTo( pageVarsForJs[e.detail.slider].imgdata[e.detail.newslide-1]['coord'] ); // change only

                    // remove old markers - on change only. 
                    allMaps[ e.detail.slider ].unSetActiveMarker();

                    // mark now the marker for the active image --> 
                    allMaps[ e.detail.slider ].setActiveMarker( e.detail.newslide-1 );
                   
                });

                // update markers on the map if the active image changes
                document.querySelector('#mfotorama'+ m).addEventListener('sliderload', function wasloaded(e) {
                    // mark now the marker for the active image --> setActiveMarker
                    allMaps[e.detail.slider ].setActiveMarker( e.detail.newslide-1 );
                });

                // update the slider if the marker on the map was clicked
                document.querySelector('#boxmap'+ m).addEventListener('mapmarkerclick', function markerclicked(e) {
                    allSliders[e.detail.map].setSliderIndex(e.detail.marker);
                });

                // catch the event if the fullscreen button was clicked. 
                /*
                document.addEventListener('pointerdown', function(event) {
                    if (event.srcElement.className === 'leaflet-control-zoom-fullscreen fullscreen-icon') {
                        
                        for (let m = 0; m < event.path.length; m++) {
                            if (event.path[m].id.includes('boxmap') ) {
                                // get the index of the map that triggered the event
                                let mapNumber = parseFloat( event.path[m].id.replace('boxmap','') )
                                
                                // filter the event, as it is triggerd more than once.
                                if (event.timeStamp > allMaps[mapNumber].timeStamp) {
                                    allMaps[mapNumber].fullScreen = ! allMaps[mapNumber].fullScreen; 
                                    allMaps[mapNumber].timeStamp = event.timeStamp;

                                    if ( allMaps[mapNumber].timeStamp > 0 && allMaps[mapNumber].fullScreen === false) {
                                        let elem = document.querySelector('#boxmap'+mapNumber+' > #map'+mapNumber+' > .leaflet-control-container > .leaflet-top > #undefined');
                                        const eventClick = new Event('click');
                                        setTimeout(function(){ elem.dispatchEvent(eventClick); }, 200);
                                    }
                                }
                                break;
                            }
                        };
                    }
                });
                */
            }
            
        } // end for m maps
        
        // function for map resizing for responsive devices
        window.addEventListener('load', resizer, false );
        //window.addEventListener('resize', resizer, false );
        
        /**
         * Resize the map div on load or resize of the browser window.
         * Show / hide the caption depending on window size.
         */
        function resizer(event) {
            // hide the fotorama caption on small screens
            try {
                let fotowidth = parseFloat( getComputedStyle( document.querySelector('[id^=mfotorama]'), null).width.replace("px", ""));

                if (fotowidth<480) {
                    document.querySelector('.fotorama__caption__wrapm, .fotorama__caption').style.display='none';
                } else {
                    document.querySelector('.fotorama__caption__wrapm, .fotorama__caption').style.display='';
                }
            } catch {}
            
            for (let m = 0; m < numberOfBoxes; m++) {    
                // w: width, h: height as shortform.  
                let wmap = parseFloat( getComputedStyle( document.querySelector('#map' + m), null).width.replace("px", ""));
                let hmap = parseFloat( getComputedStyle( document.querySelector('#map' + m), null).height.replace("px", ""));
                let ratioMap = wmap / hmap;
                
                if ( ! ('ratioMap' in pageVarsForJs[m]) ) {
                    pageVarsForJs[m]['ratioMap'] = ratioMap;
                }
    
                let _group = new L.featureGroup( allMaps[m].mrk );
    
                // skip boundary setting for boxmap that doesn't have a map
                if ( ! isNaN(ratioMap)) {
                    allMaps[m].bounds = allMaps[m].setBoundsToMarkers(m, _group);
                } 
            }
        }
    }
})(window, document);
