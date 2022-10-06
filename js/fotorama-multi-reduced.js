// webpack import information for bundling.
//import SliderFotorama from './fotoramaClass.js'
//import { SliderSwiper } from "./release/js/swiper/swiper_bundle.js";

(function (window, document, undefined) {
    "use strict";
    let numberOfBoxes = document.querySelectorAll('[id^=multifotobox]').length;

    if ( numberOfBoxes > 0 ) {
        let isMobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
        let hasFotorama = false;
        let hasSwiper = false;

        // slider variables
        let allSliders = [ numberOfBoxes-1 ];
                
        // map and chart var. The var is intentional here.
        let allMaps = [ numberOfBoxes-1 ];
        
        // do it for all shortcodes on the page or post
        for (let m = 0; m < numberOfBoxes; m++) {

            //------------- Slider part --------------------------------------
            hasFotorama = document.querySelectorAll('[id^=mfotorama'+m+']').length === 1;
            hasSwiper = document.querySelectorAll('[id^=swiper'+m+']').length === 1
            let sliderSel = '';

            //------------- leaflet - elevation part ---------------------------
            let hasMap = document.querySelectorAll('[id^=boxmap'+m+']').length === 1;

            // remove grid class if parent is a column.
            let el = document.getElementById('multifotobox'+m);
            let parentClass = el.parentElement.className;
            if (parentClass.includes('column')) {
                el.classList.remove('mfoto_grid');
                el = document.getElementById('boxmap'+m);
                el.style.padding = "0px 0px 0px 0px";
                // missing: the class fm-dload margin-bottom is set in CSS. This could be set manually.
            }

            // define slider
            if ( hasFotorama ) {
                // define the Slider class. This class has to be enqued (loaded) before this function.
                sliderSel = 'mfotorama';
                allSliders[m] = new SliderFotorama(m, sliderSel + m );
                allSliders[m].defSlider();

            } else if ( hasSwiper ) {
                sliderSel = 'swiper';
                // define the Slider class. This class has to be enqued (loaded) before this function.
                allSliders[m] = new window.A.SliderSwiper(m, sliderSel + m );
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
            if ( hasMap ) {
                
                // initiate the leaflet map
                if ( pageVarsForJs[m].ngpxfiles === 0) {
                    allMaps[m] = new LeafletMap(m, 'boxmap' + m );
                } else {
                    allMaps[m] = new LeafletElevation(m, 'boxmap' + m );
                }

                // create the markers on the map
                allMaps[m].createFotoramaMarkers( pageVarsForJs[m].imgdata );
                
                // update markers on the map if the active image changes
                document.querySelector('#'+sliderSel+ m).addEventListener('sliderchange', function waschanged(e) {
                    // move map
                    allMaps[e.detail.slider].mapFlyTo( pageVarsForJs[e.detail.slider].imgdata[e.detail.newslide-1]['coord'] ); // change only

                    // remove old markers - on change only. 
                    allMaps[ e.detail.slider ].unSetActiveMarker();

                    // mark now the marker for the active image --> 
                    allMaps[ e.detail.slider ].setActiveMarker( e.detail.newslide-1 );
                   
                });

                // update markers on the map if the active image changes
                document.querySelector('#'+sliderSel+ m).addEventListener('sliderload', function wasloaded(e) {
                    // mark now the marker for the active image --> setActiveMarker
                    allMaps[e.detail.slider ].setActiveMarker( e.detail.newslide-1 );
                });

                // update the slider if the marker on the map was clicked
                document.querySelector('#boxmap'+ m).addEventListener('mapmarkerclick', function markerclicked(e) {
                    allSliders[e.detail.map].setSliderIndex(e.detail.marker);
                });
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
            if( isMobile && hasFotorama) {
                document.querySelector('.fotorama__caption__wrapm, .fotorama__caption').style.display='none';
            }
            if( isMobile && hasSwiper) {
                const el = document.querySelectorAll('.swiper-slide-title');
                el.forEach(element => {
                    element.style.display = 'none';
                });
            }
                       
            for (let m = 0; m < numberOfBoxes; m++) {
                // w: width, h: height as shortform.
                if (typeof(allMaps[m]) === 'object') {
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
    }
})(window, document);
