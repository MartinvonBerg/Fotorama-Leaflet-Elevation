(function (window, document, undefined) {
    "use strict";
    let numberOfBoxes = document.querySelectorAll('[id^=multifotobox]').length;

    if ( numberOfBoxes > 0 ) {

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
                // TODO: move parts of this to the map class? Similar to 'mapmarkerclick'?
                document.querySelector('#mfotorama'+ m).addEventListener('sliderchange', function waschanged(e) {
                    //console.log('event:', e.detail.name, 'new slide:', e.detail.newslide, 'in slider:',e.detail.slider);
                    allMaps[e.detail.slider].mapFlyTo( pageVarsForJs[e.detail.slider].imgdata[e.detail.newslide-1]['coord'] ); // change only

                    // mark the new image with red icon and remove the red icon from others
                    // first get the right numbers
                    let m = e.detail.slider;
                    let nr = e.detail.newslide-1;

                    // remove old markers - on change only. --> removeMarkers
                    allMaps[m].map.removeLayer(allMaps[m].newmarker);
                    allMaps[m].storemarker.setIcon(allMaps[m].myIcon1);
                    allMaps[m].newmarker.setZIndexOffset(-500);
                    allMaps[m].storemarker.addTo(allMaps[m].map);

                    // mark now the marker for the active image --> setActiveMarker
                    allMaps[m].storemarker = allMaps[m].mrk[nr];
                    allMaps[m].newmarker = allMaps[m].mrk[nr];
                    allMaps[m].map.removeLayer( allMaps[m].mrk[nr]);
                    allMaps[m].newmarker.setIcon(allMaps[m].myIcon3);
                    allMaps[m].newmarker.setZIndexOffset(500);
                    allMaps[m].newmarker.addTo(allMaps[m].map);

                });
                // TODO: move parts of this to the map class? Similar to 'mapmarkerclick'?
                document.querySelector('#mfotorama'+ m).addEventListener('sliderload', function wasloaded(e) {
                    //console.log('event:', e.detail.name, 'new slide:', e.detail.newslide, 'in slider:',e.detail.slider);

                    // mark the first image marker to red with myIcon3.
                    // first get the right numbers
                    let m = e.detail.slider;
                    let nr = e.detail.newslide-1;

                    // mark now the marker for the active image --> setActiveMarker
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
        window.addEventListener('load', () => resizer() );
        window.addEventListener('resize', () => resizer() );

        /**
         * Resize the map div on load or resize of the browser window.
         * Show / hide the caption depending on window size.
         */
        function resizer() {
            // hide the fotorama caption on small screens
            let fotowidth = parseFloat( getComputedStyle( document.querySelector('[id^=mfotorama]'), null).width.replace("px", ""));

            if (fotowidth<480) {
                document.querySelector('.fotorama__caption__wrapm, .fotorama__caption').style.display='none';
            } else {
                document.querySelector('.fotorama__caption__wrapm, .fotorama__caption').style.display='';
            }
            
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
