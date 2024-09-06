/*!
	gpxTrackClass 0.27.0
	license: GPL 2.0
	Martin von Berg
*/
// load gpx tracks and provide data, name and statistics

//import './gpx.js'
import { leafletGpxWrapper } from './leafletGpxWrapper.js';
import { calculateEquallyDistributedColors } from '../libs/colorLib.js'
import { calcDist, calcDist3D } from '../libs/gpxCalcLib.js';

export {gpxTrackClass};

class gpxTrackClass {
   
    coords = [];
    ascent = 0;
    descent = 0;
    tracklen = 0;
    trackurl = '';
    options = {};
    tracks = [];
    gpxTracks = {}
    asyncLoading = false;
    number = -1;
    eleSmoothing = 4; // value in meters // setting. take from admin panel
    distSmoothing = 5; // value in meters // setting. take from admin panel.
    doTrackCalc = true; // no setting. always calc track statistics if not in file because leafelet-gpx is too inaccurate.
    trackNumber = 0;
    pageVariables = []; // array of pageVariables passed by php. needs .sw_options.gpx_distsmooth, .sw_options.gpx_elesmooth, .sw_options.trackwidth, .imagepath, .tracks[...].info
    mapobject = {};
    trackColour = '';
    bounds = null;

    /**
     * Constructs a new instance of the class. Sets all Class variables.
     *
     * @param {number} number - The number used to retrieve pageVariables from pageVarsForJs.
     * @param {object} mapobject - The leaflet map object to be assigned to the instance.
     * @param {array} tracks - The tracks array to be assigned to the instance.
     * @param {number} trackNumber - The track number to be assigned to the instance.
     * @param {string} [trackColour='#ff0000'] - The track colour to be assigned to the instance. Defaults to '#ff0000'.
     */
    constructor(number, mapobject, tracks, trackNumber, trackColour = '#ff0000') {
        
        this.pageVariables = pageVarsForJs[number];
        this.distSmoothing = parseInt(this.pageVariables.sw_options.gpx_distsmooth);
        this.eleSmoothing = parseFloat(this.pageVariables.sw_options.gpx_elesmooth);
        this.mapobject = mapobject;
        this.trackNumber = trackNumber;
        this.trackColour = trackColour;
        this.trackurl = tracks['track_'+ trackNumber.toString() ].url; // set track url : might be url or string in xml format

        if (this.#getTrackType(this.trackurl) === 'geojson') {
            this.trackName = this.trackurl.properties.name;
            this.showGeoJson();
        } else if (this.#getTrackType(this.trackurl) === 'xml') {
            this.showXmlTrack();
        }
        else {
            this.showTrack(); 
        }
    }

    /** Get the type of the track.
     * 
     * @param {string|object} input 
     * @returns {string} 'geojson', 'xml' or 'url'
     */
    #getTrackType(input) {

        if (typeof input === 'string' && input.startsWith('<')) { // direct XML has to start with a <
            return 'xml'
        } 
        else if (typeof(input) === 'object') {
            return 'geojson';
        }
        else {
            return 'url';
        }
    }

    /**
     * Define Icons for the leaflet map.
     * @param {string} path 
     * @param {string} iconpng 
     * @param {string} shadowpng 
     * @returns {object} icon leaflet.icon-object-type
     */
    #setIcon(path, iconpng, shadowpng) {
        let icon = L.icon({ 
            iconUrl: path + iconpng,
            iconSize: [16, 22],
            iconAnchor: [8, 22],
            //popupAnchor: [0, -16],
            shadowUrl: path + shadowpng,
            shadowSize: [16, 22],
            shadowAnchor: [8, 22],
        });
        return icon;
    }

    #handleMouseOver(e) {
        if ( e.type === 'mouseover' && (this.trackNumber == this.mapobject.currentTrack ) ) {
            // get id in coords. triggerEvent
            const changed = new CustomEvent('mouseoverpath', {
                detail: {
                    name: 'mouseoverpath',
                    track: this.trackNumber, // different
                    position: e.latlng,
                    index: this.getIndexForCoords(e.latlng),
                }
              });
              e.layer._map._container.dispatchEvent(changed);

        } else if ( e.type === 'mouseover' && (this.trackNumber != this.mapobject.currentTrack ) ) {
            const changed = new CustomEvent('changetrack', {
                detail: {
                    name: 'changetrack',
                    newtrack: this.trackNumber,
                }
              });
              e.layer._map._container.dispatchEvent(changed);
        }
    }

    /**
     * showGeoJson() - function to show the track on the map
     * @description
     * This function is called once when the track is loaded and should be 
     * called again when the track is changed from the chart.
     * It shows the track on the map and adds markers for the start and end of the track.
     * It also sets the track statistics and track name in the leaflet control layer.
     * @param {none} - no parameters
     * @returns {none} - no return values
     */
    showGeoJson() {
        let coords = [];
        let elevs = [];
        let layers = [];
        /*
        const trackLayer = new L.LayerGroup();
        const routeLayer = new L.LayerGroup();
        const wptLayer = new L.LayerGroup();

        function onEachFeature(feature, layer) {
            switch (feature.geometry.type) {
                // TODO: how to differ tracks and routes?
                case 'Point':
                    wptLayer.addLayer(layer);
                    break;
                case 'LineString':
                    trackLayer.addLayer(layer);
                    break;
                default: //case 'Point':
                    routeLayer.addLayer(layer);
                    break;
            }
        }
        */
        // showGeoJson(); on the map
        L.Icon.Default.prototype.options.imagePath = this.pageVariables.imagepath;
        this.gpxTracks = new L.geoJSON(this.trackurl, { // loads from url or parses xml directly
           // options 
           //onEachFeature: onEachFeature,
        });
        this.gpxTracks.setStyle({color :this.trackColour, stroke: parseInt(this.pageVariables.sw_options.trackwidth)});
        layers.push(this.gpxTracks);

        // get the data this.elev_data, this.coords
        let i = 0;
        this.trackurl.features[0].geometry.coordinates.forEach(element => {
            let newElem = {
                "lat": element[1],
                "lng": element[0],
                "meta": {
                    "time": null,
                    "ele": element[2],
                    "hr": null,
                    "cad": null,
                    "atemp": null,
                    "speed": 0
                }
            };
            coords.push(newElem);
            
            let newelev = [
                i, // dist from null, also as string
                element[2],
                i.toFixed(2) + " km, " + element[2].toFixed(0) + " m",
                ];
            elevs.push(newelev);
            i+=1;
        });
        this.coords = coords;
        this.elev_data = elevs;

        // show start and end markers
        this.myIcon1 = this.#setIcon(this.pageVariables.imagepath, 'pin-icon-start.png', 'pin-shadow.png');
        this.myIcon2 = this.#setIcon(this.pageVariables.imagepath, 'pin-icon-end.png', 'pin-shadow.png');
        
        let marker1 = new L.marker(coords[0], { icon: this.myIcon1 });
        marker1.addTo(this.gpxTracks);
        layers.push(marker1);

        let marker2 = new L.marker(coords[coords.length-1], { icon: this.myIcon2 });
        marker2.addTo(this.gpxTracks);
        layers.push(marker2);

        this.gpxTracks.addTo(this.mapobject.map);

        // this.setTrackInfo(); // set track statistics
        this.gpxTracks._info = {};
        this.gpxTracks._info.desc = this.trackurl.properties.description || "";
        this.setTrackInfo();

        // set track name and bounds in leaflet
        this.mapobject.controlLayer.addOverlay(this.gpxTracks, this.trackName);
        this.mapobject.bounds = this.gpxTracks.getBounds();
        this.bounds = this.mapobject.bounds;

        // handle mouseover : same in both functions : seperate
        this.gpxTracks.on('mouseover', (event) =>this.#handleMouseOver(event))
    }

    /**
     * Shows a preloaded XML GPX-track on the leaflet map. 
     * @global {object} this
     * @global {string} this.trackurl - the preloaded GPX-track as xml string
     * @global {string} this.trackColour - the (starting) color of the trac(s)
     * @global {number} this.pageVariables.sw_options.trackwidth - the width of the track
     *
     * @return {void} This function does not return anything.
     */
    showXmlTrack() {
        console.log('showXmlTrack');
        // get number of tracks from xml
        let TypesInTrack = []; //this.trackurl.match(/\<type\>.*\<\/type\>/g) // TODO get text only 
        const resultSet = new Set();

        for (const match of this.trackurl.matchAll(/<type>(.*?)<\/type>/g)) {
            console.log(match[1]); // Gibt nacheinander "desiredContent1" und "desiredContent2" aus
            TypesInTrack.push(match[1]);
            resultSet.add(match[1]);
          }

        let nTypesInTrack = resultSet.size;

        // get the number of different trayk types in the track
        let i = 1;
        let arr = Object.assign(...Array.from(resultSet, v => ({[v]:i++}) ) ) ;
        // and calculate equally distributed colors

        let colors = calculateEquallyDistributedColors(this.trackColour, nTypesInTrack);
        // set polyline_options as array with different colors for each tracktype and repeat if same tracktype appears again
        let polyline_options = [];
        for (let i = 0; i < TypesInTrack.length; i++) {
            let index=arr[TypesInTrack[i]];
            polyline_options.push({
                color: colors[index-1],
                weight: parseInt(this.pageVariables.sw_options.trackwidth),
            });
        }
        // show track on map with polyline_options
        this.showTrack(polyline_options);
    }

    /**
     * Shows a GPX-track from file on the leaflet map. (in Principle as part of the constructor).
     * @global Uses all class variables.
     *
     * @return {void} This function does not return anything.
     */
    async showTrack( polyline_options = null ) {
        console.log('showTrack in gpxTrackClass');
        if (polyline_options == null) {
            polyline_options = {
                color: this.trackColour,
                weight: parseInt(this.pageVariables.sw_options.trackwidth),
            };
        }
        // show first track on map. track color, width, tooltip font color, background color
        let options = { // loads from url or parses xml directly
            async: this.asyncLoading,
            polyline_options: polyline_options,
            markers: {
                startIcon: this.pageVariables.imagepath +'/pin-icon-start.png',
                endIcon: this.pageVariables.imagepath +'/pin-icon-end.png',
            },
            marker_options: {
                //startIconUrl: this.pageVariables.imagepath +'/pin-icon-start.png',
                //endIconUrl: this.pageVariables.imagepath +'/pin-icon-end.png',
                //shadowUrl: this.pageVariables.imagepath +'/pin-shadow.png',
                iconSize: [16, 22],
                iconAnchor: [8, 22],
                shadowSize: [16, 22],
                shadowAnchor: [8, 22],
            }
        };
        
        this.gpxTracks = new leafletGpxWrapper(this.trackurl, options);
        this.gpxTracks.addTo(this.mapobject.map);
        this.elev_data = this.gpxTracks.get_elevation_data();
        this.coords = this.gpxTracks.get_coords();

        // set info
        this.trackName = this.gpxTracks._info.name;
        this.setTrackInfo();
      
        this.mapobject.controlLayer.addOverlay(this.gpxTracks, this.gpxTracks._info.name);
        this.mapobject.bounds = this.gpxTracks.getBounds();
        this.bounds = this.mapobject.bounds;

        // handle mouseover
        this.gpxTracks.on('mouseover', (event) =>this.#handleMouseOver(event));
    }

    /**
     * A function that sets the track statistics based on availabla data.
     * 
     * @global {array} this.pageVariables.tracks['track_<number>'].info
     * @global {number} this.trackNumber
     * @global {method} this.calcGpxTrackInfo()
     * 
     * @returns {void}
     */
    setTrackInfo() {
        let info = this.gpxTracks._info.desc;
        if (info) {info = info.split(' ')} else {info='';};

        if (info[0]=='Dist:' && info[1] && info[4] && info[7]) {
            this.pageVariables.tracks['track_'+ this.trackNumber.toString() ].info = this.gpxTracks._info.desc;
        } else {
            this.pageVariables.tracks['track_'+ this.trackNumber.toString() ].info = this.calcGpxTrackInfo();
        }

    }

    /**
     * Calculate the index in the array of coordinates for a given point based on the closest distance.
     * @global {object} this.coords[...].lat / .lng, this.coords.length
     * 
     * @param {object} point - The point for which to find the index.
     * @return {number} The index of the closest coordinate.
     */
    getIndexForCoords(point) {
        let n = this.coords.length
        let dist = Infinity;
        let index = -1;

        //let startTime = performance.now();
        for (let i = 0; i < n; i++) { // performance
            let newdist = calcDist(point.lat, point.lng, this.coords[i].lat, this.coords[i].lng);

            if (newdist < dist) {
                index = i;
                dist = newdist;
            }
        }
        return index;
    }

    /**
     * Calculate the distance and elevation data for the track.
     * @global {object} this.coords[...].meta.ele / .lat / .lng
     * @global {number} this.distSmoothing : is used for distance smoothing in meters
     * @global {number} this.eleSmoothing : is used for elevation smoothing in meters
     * @global {boolean} this.doTrackCalc : is used to determine if the track data should be calculated
     * @global {number} this.tracklen  : is set by the function
     * @global {number} this.ascent  : is set by the function
     * @global {number} this.descent : is set by the function
     *  
     * @returns {string} 'Dist: 11 km, Gain: 22 Hm, Loss: 33 Hm' : The distance and elevation data for the track.
     */
    calcGpxTrackInfo() {
        let info = '';

        if ( this.coords.length == 0 ) return 'No Data found';

        //elevation
        let lastConsideredElevation = this.coords[0].meta.ele;
        let cumulativeElevationGain = 0;
        let cumulativeElevationLoss = 0;
        
        // distance
        let lastConsideredPoint = [this.coords[0].lat, this.coords[0].lng];
        let cumulativeDistance = 0;
        

        if ( this.doTrackCalc && typeof(this.coords) === 'array' ) {
            this.coords.forEach((point, index) => {
                let curElevation = point.meta.ele;
                
                if ( typeof(curElevation === 'number') ){
                    let elevationDelta = curElevation - lastConsideredElevation;

                    if ( Math.abs(elevationDelta) > this.eleSmoothing ) {
                        elevationDelta>0 ? cumulativeElevationGain += elevationDelta : '';
                        elevationDelta<0 ? cumulativeElevationLoss -= elevationDelta : '';
                    }
                    lastConsideredElevation = curElevation;

                    let curPoint = [point.lat, point.lng];
                    let curDist = 1000 * calcDist3D(lastConsideredPoint[0], lastConsideredPoint[1], curPoint[0], curPoint[1]);
                    if (Math.abs(curDist) > this.distSmoothing) {
                        cumulativeDistance += curDist;
                    }
                    lastConsideredPoint = curPoint;
                }
            });

            this.tracklen = cumulativeDistance.toString(); 
            this.ascent = cumulativeElevationGain.toString();
            this.descent = cumulativeElevationLoss.toString();
            info = 'Dist: '+ cumulativeDistance/1000 +' km, Gain: '+ cumulativeElevationGain +' Hm, Loss: '+ cumulativeElevationLoss+' Hm';  

        } else if ( this.doTrackCalc && typeof(this.coords) === 'object' ) {
            for (const [index, point] of Object.entries(this.coords)) {
    
                let curElevation = point.meta.ele;
                
                if ( typeof(curElevation === 'number') ){

                    let elevationDelta = curElevation - lastConsideredElevation;
                    if ( Math.abs(elevationDelta) > this.eleSmoothing ) {
                        elevationDelta>0 ? cumulativeElevationGain += elevationDelta : '';
                        elevationDelta<0 ? cumulativeElevationLoss -= elevationDelta : '';
                        lastConsideredElevation = curElevation;
                    }

                    let curPoint = [point.lat, point.lng];
                    let curDist = 1000 * calcDist3D(lastConsideredPoint[0], lastConsideredPoint[1], curPoint[0], curPoint[1]);
                    if (Math.abs(curDist) > this.distSmoothing) {
                        cumulativeDistance += curDist;
                        lastConsideredPoint = curPoint;
                    }
                }
            };

            this.tracklen = cumulativeDistance.toString(); 
            this.ascent = cumulativeElevationGain.toString();
            this.descent = cumulativeElevationLoss.toString();
            info = 'Dist: '+ cumulativeDistance/1000 +' km, Gain: '+ cumulativeElevationGain +' Hm, Loss: '+ cumulativeElevationLoss+' Hm';  

        } else {
            let distKm = this.gpxTracks.get_distance() / 1000;
            let distKmRnd = distKm.toFixed(1);
            let eleGain = this.gpxTracks.get_elevation_gain().toFixed(1);
            let eleLoss = this.gpxTracks.get_elevation_loss().toFixed(1);
            info = 'Dist: '+distKmRnd+' km, Gain: '+ eleGain+' Hm, Loss: '+eleLoss+' Hm';   
        }

        return info;
    }

}