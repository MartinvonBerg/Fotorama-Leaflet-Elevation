// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// start this class without leaflet elevation and inherit with leaflet from this class!
// only work with markers and controls in the first step.
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
    hasFotorama = false;

    // from defMapVar
    static numberOfMaps = null;
    storemarker = [];
    newmarker = [];
    mrk = [];
    //chartheight = 0; // for elevation
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
    baseLayers2 = [];
    controlLayer2 = [];
    //controlElevation = []; // for elevation
    //eleopts = []; // for elevation
    //traces = []; // for elevation
    //tracks = []; // for elevation
    //grouptracks = []; // for elevation
    //group1 = []; // for elevation

    /**
     * Constructor Function
     * @param {int} number current number
     * @param {string} elementOnPage id of the div on the page that shall contain the map
     */
    constructor(number, elementOnPage) {
        LeafletMap.count++; // update the number of instances on construct.
        this.number = number; 
        this.elementOnPage = elementOnPage; 
        this.pageVariables = pageVarsForJs[number];
        this.#isMobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
       
        // object to handle event 'showend' and 'load'
        this.el = document.querySelector('#'+elementOnPage);

        // define the variables for one map
        // from defMapVar
        if (LeafletMap.numberOfMaps === null) {
            LeafletMap.numberOfMaps = document.querySelectorAll('[id^=boxmap]').length;
        }
        this.hasFotorama = document.querySelectorAll('[id^=mfotorama'+ number +']').length == 1;

        // from defMapAndChartVar // for elevation
        /*
        this.showalltracks = (this.pageVariables.showalltracks === 'true'); // info: wpfm_phpvars0 is defined on the page by wp_localize_script in PHP
        if (LeafletMap.numberOfMaps > 1 && this.showalltracks) {
            this.showalltracks = false; 
        }
        */

        // Icons definieren
        this.myIcon1 = this.setIcon(this.pageVariables.imagepath, 'photo.png', 'shadow.png');
        this.myIcon2 = this.setIcon(this.pageVariables.imagepath, 'pin-icon-wpt.png', 'shadow.png');
        this.myIcon3 = this.setIcon(this.pageVariables.imagepath, 'active.png', 'shadow.png');

        // Kartenoptionen definieren --> in den constructor verlagert.
      
        //change options for maps without gpx-tracks so without elevation.
        if ((parseInt(this.pageVariables.ngpxfiles) === 0) && ( ! this.hasFotorama)) {
            this.opts.map.center = this.pageVariables.mapcenter;
            this.opts.map.zoom = this.pageVariables.zoom;
        }

        // define Map Base Layers
        this.defMapLayers();

        // static set the language strings. same for all instances.
        if (LeafletMap.myLocale === null) {
            LeafletMap.myLocale = this.setLanguage();
        }

        // initiate the leaflet map
        this.map = new L.Map('map' + number, this.opts.map);

        // show the selected map
        this.showSelectedMap();
        this.bounds = this.map.getBounds();
        this.zpadding = [0,0];

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
            L.registerLocale(lang, eval(lang) );
            L.setLocale(lang);
            return lang;
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
            title: L._('Show fullscreen'),
            titleCancel: L._('Exit fullscreen'),
            content: null,
            forceSeparateButton: true,
            forcePseudoFullscreen: true,
            fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
        }).addTo(this.map);
        
        // Functions and Overlays for Show-all (Magnifying glass) in the top left corner
        L.Control.Watermark = L.Control.extend({
            onAdd: function () {
                let img = L.DomUtil.create('img');
                img.src = classThis.pageVariables.imagepath + "/lupe_p_32.png";
                img.style.background = 'white';
                img.style.width = '32px';
                img.style.height = '32px';
                img.style.cursor = 'pointer';
                img.title = L._('Show all');
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

    // show the selected map

    // set map controls

    // create tracks and elecation chart

    // update track and elecation chart

    // change elevation chart on change of gpx-track

    // create markers

    // update marker

    // set bounds

    // update bounds

    // function for map resizing for responsive devices

    // --------------------------- Class API method definitions
    // TODO: what is the interface? Marker number or geo-data?
    // map.flyto is with coordinates. zoom is unchanged
    // set map to marker

    // trigger click on marker: marker.on('click', ....)

}