(function (window, document, undefined) {
    "use strict";
    let numberOfBoxes = document.querySelectorAll('[id^=multifotobox]').length;

    if ( numberOfBoxes > 0 ) {
        let isMobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
        let hasFotorama = false;
        let hasSwiper = false;
        let hasMasonry1 = false;
        let hasMap = false;
        let hasChartJS = false;
        let hasLeafElev = false;
        
        // slider variables
        let allSliders = [ numberOfBoxes-1 ];
                
        // map and chart var. The var is intentional here.
        let allMaps = [ numberOfBoxes-1 ];
        let moveMapOnSlideChange = true; // 'no', 'all', 'mobile'
        if ((pageVarsForJs[0].preventMapMove === 'all') || (pageVarsForJs[0].preventMapMove === 'mobile' && isMobile)) {
            moveMapOnSlideChange = false;
        }
        
        // do it for all shortcodes on the page or post
        for (let m = 0; m < numberOfBoxes; m++) {

            //------------- Slider part --------------------------------------
            hasFotorama = document.querySelectorAll('[id^=mfotorama'+m+']').length === 1;
            hasSwiper = document.querySelectorAll('[id^=swiper'+m+']').length === 1;
            hasMasonry1 = document.querySelectorAll('[id^=minimasonry'+m+']').length === 1;

            let sliderSel = '';

            //------------- leaflet - elevation - chart part ---------------------------
            hasMap = document.querySelectorAll('[id^=boxmap'+m+']').length === 1;
            hasChartJS = document.querySelectorAll('[id^=chartjs-profile-container'+m+']').length === 1;
            hasLeafElev = document.querySelectorAll('[id^=elevation-div'+m+']').length === 1; 

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
                import(/* webpackChunkName: "fotorama" */ './fotoramaClass.js').then( (SliderFotorama) => {
                    allSliders[m] = new SliderFotorama.SliderFotorama(m, sliderSel + m );
                    allSliders[m].defSlider(); 
                })

            } else if ( hasSwiper ) {
                sliderSel = 'swiper';
                import(/* webpackChunkName: "swiper" */'./swiperClass.js').then( (SliderSwiper) => {
                    if ( numberOfBoxes > 1 ) { pageVarsForJs[m].sw_options.sw_keyboard = 'false';}
                    allSliders[m] = new SliderSwiper.SliderSwiper(m, sliderSel + m );
                    allSliders[m].defSlider(); 
                })
            } else if ( hasMasonry1 ) {
                sliderSel = '#minimasonry';
                import(/* webpackChunkName: "minimasonry" */'./miniMasonryClass.js').then( (MiniMasonryWrap) => {
                    allSliders[m] = new MiniMasonryWrap.MiniMasonryWrap(m, sliderSel + m );
                    //allSliders[m].defSlider();
                })
            } else {
                  // no fotorama, no gpx-track: get and set options for maps without gpx-tracks. only one marker to show.
                  if ( parseInt(pageVarsForJs[m].ngpxfiles) === 0 ) {
                    let center = pageVarsForJs[m].mapcenter;
                    let zoom = pageVarsForJs[m].zoom;
                    let text = pageVarsForJs[m].markertext;
                    import(/* webpackChunkName: "leaflet" */'./leafletMapClass.js').then( (LeafletMap) => {
                        allMaps[m] = new LeafletMap.LeafletMap(m, 'boxmap' + m, center, zoom );
                        // create the markers on the map
                        allMaps[m].createSingleMarker(text);
                    })                    
                    
                } else if ( hasLeafElev ) {
                    // no slider, one or more gpx-tracks: only leaflet elevation chart to show. This is true if there is a gpx-track provided.
                    // initiate the leaflet map
                    import(/* webpackChunkName: "elevation" */'./elevationClass.js').then( (LeafletElevation) => {
                        allMaps[m] = new LeafletElevation.LeafletElevation(m, 'boxmap' + m );
                    })
                } else {
                    // only map with gpx-tracks and eventually a chart.
                    import(/* webpackChunkName: "leaflet_chartjs" */'./leafletChartJs/leafletChartJsClass.js').then( (LeafletChartJs) => {
                        allMaps[m] = new LeafletChartJs.LeafletChartJs(m, 'boxmap' + m );
                    })
                } 
            }
            
            // define map and chart
            if ( hasMap && (hasFotorama || hasSwiper) ) {
                
                // initiate the leaflet map
                if ( pageVarsForJs[m].ngpxfiles === 0 ) {
                    import(/* webpackChunkName: "leaflet" */'./leafletMapClass.js').then( (LeafletMap) => {
                        allMaps[m] = new LeafletMap.LeafletMap(m, 'boxmap' + m );
                        // create the markers on the map
                        allMaps[m].createFotoramaMarkers( pageVarsForJs[m].imgdata );
                    })

                } else if ( hasLeafElev ) {
                    import(/* webpackChunkName: "elevation" */'./elevationClass.js').then( (LeafletElevation) => {
                        allMaps[m] = new LeafletElevation.LeafletElevation(m, 'boxmap' + m );
                        // create the markers on the map
                        allMaps[m].createFotoramaMarkers( pageVarsForJs[m].imgdata );
                    })
                    
                } else if ( hasChartJS) {
                    import(/* webpackChunkName: "leaflet_chartjs" */'./leafletChartJs/leafletChartJsClass.js').then( (LeafletChartJs) => {
                        allMaps[m] = new LeafletChartJs.LeafletChartJs(m, 'boxmap' + m );
                        // create the markers on the map
                        allMaps[m].createFotoramaMarkers( pageVarsForJs[m].imgdata, false );
                    })
                } else {
                    import(/* webpackChunkName: "leaflet_chartjs" */'./leafletChartJs/leafletChartJsClass.js').then( (LeafletChartJs) => {
                        allMaps[m] = new LeafletChartJs.LeafletChartJs(m, 'boxmap' + m );
                        // create the markers on the map
                        allMaps[m].createFotoramaMarkers( pageVarsForJs[m].imgdata, false);
                        allMaps[m].map.fitBounds(allMaps[m].bounds);
                    })
                }

                // update markers on the map if the active image changes
                document.querySelector('#'+sliderSel+ m).addEventListener('sliderchange', function waschanged(e) {
                    // move map only if object is available (added for slow connections)
                    if (typeof(allMaps[e.detail.slider]) === 'object'){
                        // move map only if settings is set
                        moveMapOnSlideChange ? allMaps[e.detail.slider].mapFlyTo( pageVarsForJs[e.detail.slider].imgdata[e.detail.newslide ]['coord'] ) : null;

                        // remove old markers - on change only. 
                        allMaps[ e.detail.slider ].unSetActiveMarker();

                        // mark now the marker for the active image --> 
                        allMaps[ e.detail.slider ].setActiveMarker( e.detail.newslide );
                    }
                });

                // update markers on the map if the active image changes
                document.querySelector('#'+sliderSel+ m).addEventListener('sliderload', function wasloaded(e) {
                    // mark now the marker for the active image --> setActiveMarker
                    //allMaps[e.detail.slider ].setActiveMarker( e.detail.newslide-1 ); allMaps is generated asynchronously, so it might not be available here.
                    allSliders[e.detail.slider].activeIndex = e.detail.newslide-1;
                });

                // update the slider if the marker on the map was clicked
                document.querySelector('#boxmap'+ m).addEventListener('mapmarkerclick', function markerclicked(e) {
                    allSliders[e.detail.map].setSliderIndex(e.detail.marker);
                    //console.log('set from map to:', e.detail.marker);
                });
            }
            
        } // end for m maps
        
        // function for map resizing for responsive devices
        //window.addEventListener('load', resizer, false );
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
            /*
            if( isMobile && hasSwiper) {
                const el = document.querySelectorAll('.swiper-slide-title');
                el.forEach(element => {
                    element.style.display = 'none';
                });
            }
            */           
            for (let m = 0; m < numberOfBoxes; m++) {
                // w: width, h: height as shortform.
                if (typeof(allMaps[m]) === 'object') {
                    // mark now the marker for the active image --> setActiveMarker
                    allMaps[m].setActiveMarker( allSliders[m].activeIndex );

                    let wmap = parseFloat( getComputedStyle( document.querySelector('#map' + m), null).width.replace("px", ""));
                    let hmap = parseFloat( getComputedStyle( document.querySelector('#map' + m), null).height.replace("px", ""));
                    let ratioMap = wmap / hmap;
                    
                    if ( ! ('ratioMap' in pageVarsForJs[m]) ) {
                        pageVarsForJs[m]['ratioMap'] = ratioMap;
                    }
                    
                    // skip boundary setting for boxmap that doesn't have a map
                    if ( ! isNaN(ratioMap)) {
                        let _group = allMaps[m].getFeatureGroup( allMaps[m].mrk );
                        allMaps[m].bounds = allMaps[m].setBoundsToMarkers(_group);
                    } 
                }
            }
        }
    }
})(window, document);
