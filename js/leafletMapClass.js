// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// start this class without leaflet elevation and inherit with leaflet from this class!
// only work with markers and controls in the first step.
// TODO: update and add leaflet elevation functions
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

class LeafletMap {
    // static attributes (fields)
    static count = 0; // counts the number of instances of this class.
    static myLocale = null;
            
    // private attributes (fields)
    #isMobile = false; // could be static

    // public attributes (fields). These can be set / get by dot-notation.
    width = 0;
    pageVariables = [];
    //hasFotorama = false; // TODO: inconsisent to know about fotorama here

    // from defMapVar
    static numberOfMaps = null;
    storemarker = [];
    newmarker = [];
    mrk = [];
    phpmapheight = 0;
    maxZoomValue = 19; // static ?
    zpadding = [30, 30]; // static ?

    // from defMapAndChartVar
    //showalltracks = false; // for elevation
    myIcon1 = {};
    myIcon2 = {};
    myIcon3 = {};
    opts = {
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
                collapsed: true,
            },
        }
    };
    maps = [];
    baseLayers = [];
    layer1 = [];
    layer2 = [];
    layer3 = [];
    layer4 = [];
    bounds = [];
    controlZoom = [];
    scale = [];
    controlLayer = [];
    //baseLayers2 = []; // for elevation
    //controlLayer2 = []; // for elevation
    group1 = [];
   
    /**
     * Constructor Function
     * @param {int} number current number
     * @param {string} elementOnPage id of the div on the page that shall contain the map
     * @param {array} center the map center as lat, lon coord value
     * @param {int} zoom the zoom factor to use for a map with center coords.
     */
    constructor(number, elementOnPage, center=null, zoom=null) {
        LeafletMap.count++; // update the number of instances on construct.
        this.number = number;
        this.elementOnPage = elementOnPage;
        this.pageVariables = pageVarsForJs[number];
        this.#isMobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

        // object to handle event 'showend' and 'load'
        this.el = document.querySelector('#'+elementOnPage);
       
        // define the variables for one map
        if (LeafletMap.numberOfMaps === null) {
            LeafletMap.numberOfMaps = document.querySelectorAll('[id^=boxmap]').length;
        }
        //this.hasFotorama = document.querySelectorAll('[id^=mfotorama'+ number +']').length == 1; // TODO: inconsisent to know about fotorama here

        // Icons definieren
        this.myIcon1 = this.setIcon(this.pageVariables.imagepath, 'photo.png', 'shadow.png');
        this.myIcon2 = this.setIcon(this.pageVariables.imagepath, 'pin-icon-wpt.png', 'shadow.png');
        this.myIcon3 = this.setIcon(this.pageVariables.imagepath, 'active.png', 'shadow.png');

        //change options for maps without gpx-tracks so without elevation.
        if ( center !== null & zoom !== null) { 
            this.opts.map.center = center;
            this.opts.map.zoom = zoom;
        }

        // define Map Base Layers
        this.defMapLayers();

        // static set the language strings. same for all instances.
        if (typeof(L.registerLocale) !== 'function') {
            // nothing
        } else if (LeafletMap.myLocale === null) {
            LeafletMap.myLocale = this.setLanguage();
        }

        // initiate the leaflet map
        this.map = new L.Map('map' + number, this.opts.map);

        // show the selected map
        this.showSelectedMap();
        this.bounds = this.map.getBounds();
        this.zpadding = [0,0]; // TODO: how to reset this to correct values?

        //------- Magnifying glass, fullscreen, Image-Marker und Base-Layer-Change handling --------------------------------
        // create scale control top left // for mobile: zoom deactivated. use fingers!
        this.setMapControls();
    }

    /**
     * Define Icons for the leaflet map.
     * @param {string} path 
     * @param {string} iconpng 
     * @param {string} shadowpng 
     * @returns {object} icon leaflet.icon-object-type
     */
    setIcon(path, iconpng, shadowpng) {
        let icon = L.icon({ 
            iconUrl: path + iconpng,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -16],
            shadowUrl: path + shadowpng,
            shadowSize: [48, 32],
            shadowAnchor: [16, 32],
        });
        return icon;
    }

    /**
     * Define the map layers that should be used for the Leaflet Map.
     */
    defMapLayers() {
       
        // define map layers 
        this.layer1 = new L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: this.maxZoomValue,
            attribution: 'MapData &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | MapStyle:&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        this.layer2 = new L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/ {y}.png', {
            maxZoom: this.maxZoomValue,
            attribution: 'MapData &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        this.layer3 = new L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
            maxZoom: this.maxZoomValue,
            attribution: 'MapData &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        this.layer4 = new L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: this.maxZoomValue,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri User Community'
        });

        // set map attribution for mobile devices to a short string
        if (this.#isMobile) {
            this.layer1.options.attribution = this.layer2.options.attribution;
            this.layer3.options.attribution = this.layer2.options.attribution;
            this.layer4.options.attribution = this.layer2.options.attribution;
        };

        // define base layers for leaflet map
        this.baseLayers = {
            "OpenStreetMap": this.layer2,
            "OpenTopoMap"  : this.layer1,
            "CycleOSM"     : this.layer3,
            "Satellit"     : this.layer4
        };
       
    }
    
    i18n(text) {
        if (typeof(L.registerLocale) !== 'function') {
            return text;
        } else  {
            return L._(text);
        }
    }
    /**
     * set the i18n values for the leaflet map.
     * @returns {string|null} the string value for the locale or null, if none available.
     */
    setLanguage() {
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

        let es = {
            'Show all' : "Mostrar Todo",
            'Distance' : "Distancia",
            "Ascent"   : "Ascenso",
            "Descent"  : "Descenso",
            "Altitude" : "Altura", // is in file /src/altitude.js
            "Images"   : "Fotos",
            'Show fullscreen' : 'Mostrar pantalla completa',
            'Exit fullscreen' : 'Salir de pantalla completa',
        };

        var lang = navigator.language;
        lang = lang.split('-')[0];

        if ( (lang == 'de') || (lang == 'it') || (lang == 'fr') || (lang == 'es') ) {
            try {
                L.registerLocale(lang, eval(lang) );
                L.setLocale(lang);
                return lang;
            } catch (e) {
                return null;
            }

        } else {
            return null;
        }
    }; 

    /**
     * show the map according to the PHP setting.
     */
    showSelectedMap() {
        if (this.pageVariables.mapselector === 'OpenStreetMap') {
            this.map.addLayer(this.baseLayers.OpenStreetMap); // this one is preselected for one gpx-track
        } else if (this.pageVariables.mapselector === 'OpenTopoMap') {
            this.map.addLayer(this.baseLayers.OpenTopoMap); // this one is preselected for one gpx-track
        } else if (this.pageVariables.mapselector === 'CycleOSM') {
            this.map.addLayer(this.baseLayers.CycleOSM); // this one is preselected for one gpx-track
        } else if (this.pageVariables.mapselector === 'Satellit') {
            this.map.addLayer(this.baseLayers.Satellit); // this one is preselected for one gpx-track
        } else {
            this.map.addLayer(this.baseLayers.OpenStreetMap);
        }
    }

    setMapControls() {
        let classThis = this;

        if ( ! this.#isMobile ) {
            this.controlZoom = new L.Control.Zoom(this.opts.zoomControl);
            this.controlZoom.addTo(this.map);
        }

        // create a fullscreen button and add it to the map
        L.control.fullscreen({
            position: 'topleft',
            title: this.i18n('Show fullscreen'),
            titleCancel: this.i18n('Exit fullscreen'),
            content: null,
            forceSeparateButton: true,
            forcePseudoFullscreen: false,
            fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
        }).addTo(this.map);
        // TODO: - enq scripts old / new - update this and other map scripts
        this.map.on('exitFullscreen', function(event){
            //console.log('exitFullscreen');
            //classThis.map.fitBounds(classThis.bounds, { padding: [30, 30], maxZoom: 13 });
        })
        
        
        
        // Functions and Overlays for Show-all (Magnifying glass) in the top left corner
        L.Control.Watermark = L.Control.extend({
            onAdd: function () {
                let img = L.DomUtil.create('img');
                img.src = classThis.pageVariables.imagepath + "/lupe_p_32.png";
                img.style.background = 'white';
                img.style.width = '32px';
                img.style.height = '32px';
                img.style.cursor = 'pointer';
                img.title = classThis.i18n('Show all');
                img.id = this.number;
                img.onclick = function () {
                    classThis.map.fitBounds(classThis.bounds, { padding: classThis.zpadding, maxZoom: 13 });
                };
                return img;
            },
        });
        L.control.watermark = function (opts) {
            return new L.Control.Watermark(opts);
        };
        L.control.watermark({ position: 'topleft' }).addTo(this.map);

        // Creating and add scale control bottom left
        this.scale = L.control.scale();
        this.scale.addTo(this.map);

        // create Map selector top right 
        this.controlLayer = L.control.layers(this.baseLayers, null, this.opts.layersControl.options);
        this.controlLayer.addTo(this.map);
    }

    /**
     * Create a single marker on the map with myIcon2.
     * @param {string} markertext text to show on hover over marker.
     */
    createSingleMarker(markertext) {
        L.marker(this.opts.map.center, { title: markertext, icon: this.myIcon2 } ).addTo(this.map);
    }

    /**
     * TODO
     * @param {array} markers
     */
    createFotoramaMarkers(markers) {
        let { marker, j, testgroup } = this.createMarkers(markers);
        this.mrk = marker;
        this.controlLayer.addOverlay(this.group1, this.i18n('Images') + '(' + j + ')');    
        this.group1.addTo(this.map); 
        this.bounds = undefined;
        this.bounds = this.setBoundsToMarkers(testgroup);
    }

    // create markers
    /**
     * TODO
     * @param {array} imgdata 
     * @returns {array} bounds
     */
    createMarkers(imgdata) {
        let classThis = this;
        this.group1 = L.layerGroup();
        let testgroup = L.featureGroup();
        //LayerSupportGroup.addTo(maps[m]);
        // Creating markers -----------------------
        let marker = [];
        let j = 0;

        // define image markers for map
        imgdata.forEach(tour => {
            if ((tour["coord"][0] == null) || (tour["coord"][1] == null)) {
                // do nothing. skip this image if no gpx-data provided.
            }
            else {
                marker.push(new L.Marker(tour["coord"], { title: tour["title"], icon: this.myIcon1, id: j, riseOnHover: true, }));

                if (("srcset" in tour) && (Object.keys(tour["srcset"]).length)) { // "srcset" in tour
                    var key = Object.keys(tour.srcset)[0];
                    marker[j].bindPopup('<div>' + tour["title"] + '<br><img class="leaf_pup_img" src="' + tour.srcset[key] + '"></div>', {
                        maxWidth: "auto",
                    });
                } else {
                    marker[j].bindPopup(tour["title"]);
                }

                marker[j].addTo(this.group1);

                // trigger click on marker: marker.on('click', ....)
                marker[j].on('click', function (a) {
                    // get the index number of the map on the page
                    let source = parseInt( a.originalEvent.currentTarget.id.replace('map', '') );
                                       
                    const changed = new CustomEvent('mapmarkerclick', {
                        detail: {
                        name: 'mapmarkerclick',
                        marker: this.options.id,
                        map: source
                        }
                    });

                    classThis.el.dispatchEvent(changed);
                    
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
        return { marker, j, testgroup };
    }

    /**
     * set new Bounds of Map according to the shown Markers and already predefined bounds.
     * @param {number} mapNumber number of the current map
     * @param {object} markergroup group of markery as leaflet markergroup
     */
    setBoundsToMarkers( markergroup ) {
        let _bounds = [];

        if ( (typeof(this.bounds) !== 'undefined') && ('_northEast' in this.bounds) && ('_southWest' in this.bounds) ) {
            _bounds = this.bounds; // bounds bereits definiert
        } else {
            try {
                _bounds = markergroup.getBounds().pad(0.1);
            } catch (e) {
                // nothing
            }
        }

        if ( _bounds.length !== 0) {
            this.map.fitBounds(_bounds);
            // set the max zoom level for markers exactly on the same postion
            let curzoom = this.map.getZoom();
            if ( curzoom == this.maxZoomValue ) {
                this.map.fitBounds(_bounds, {maxZoom : 13});
            }
        }
        return _bounds;
    }

    // update marker on click
    mapFlyTo(coordinates=[0,0]) {
        this.map.flyTo( coordinates );
    }

    // function for map resizing for responsive devices

}