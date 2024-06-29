/*!
	gpxTrackClass 0.26.0
	license: GPL 2.0
	Martin von Berg
*/
// load gpx tracks and provide data, name and statistics
import './gpx.js'

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
        this.tracks = tracks;
        this.pageVariables = pageVarsForJs[number];
        this.distSmoothing = parseInt(this.pageVariables.sw_options.gpx_distsmooth);
        this.eleSmoothing = parseFloat(this.pageVariables.sw_options.gpx_elesmooth);
        this.number = number;
        this.mapobject = mapobject;
        this.trackNumber = trackNumber;
        this.trackColour = trackColour;
        this.showTrack(this.trackNumber);
    }

    /**
     * Shows a GPX-track on the leaflet map. (in Principle as part of the constructor).
     * Uses all class variables.
     *
     * @param {number} trackNumber - The number of the track to be shown.
     * @return {void} This function does not return anything.
     */
    showTrack( trackNumber ) {
        this.trackurl = this.tracks['track_'+ trackNumber.toString() ].url; // set track url : might be url or string in xml format

        // show first track on map. track color, width, tooltip font color, background color
        this.gpxTracks = new L.GPX(this.trackurl, {
            async: this.asyncLoading,
            polyline_options: {
                color: this.trackColour,
                weight: parseInt(this.pageVariables.sw_options.trackwidth),
            },
            
            marker_options: {
                startIconUrl: this.pageVariables.imagepath +'/pin-icon-start.png',
                endIconUrl: this.pageVariables.imagepath +'/pin-icon-end.png',
                shadowUrl: this.pageVariables.imagepath +'/pin-shadow.png',
                iconSize: [16, 22],
                iconAnchor: [8, 22],
                shadowSize: [16, 22],
                shadowAnchor: [8, 22],
            }
        }).addTo(this.mapobject.map);
        
        this.elev_data = this.gpxTracks.get_elevation_data();
        this.coords = this.gpxTracks.get_coords();

        // set info
        this.setTrackInfo();
      
        this.mapobject.controlLayer.addOverlay(this.gpxTracks, this.gpxTracks._info.name);
        //this.mapobject.map.fitBounds(this.gpxTracks.getBounds(), {padding: [150, 150]});
        this.mapobject.bounds = this.gpxTracks.getBounds();
        this.bounds = this.mapobject.bounds;

        let classThis = this;
        this.gpxTracks.on('mouseover', function(e) {
            if ( e.type === 'mouseover' && (classThis.trackNumber == classThis.mapobject.currentTrack ) ) {
                // let thecoords = e.propagatedFrom.latlngs;
                // get id in coords. triggerEvent
                // classThis.trackNumber : is the hovered track // classThis.mapobject.currentTrack : ist the current track
                const changed = new CustomEvent('mouseoverpath', {
                    detail: {
                        name: 'mouseoverpath',
                        track: this._info.name,
                        position: e.latlng,
                        index: classThis.getIndexForCoords(e.latlng),
                    }
                  });
            
                  this._map._container.dispatchEvent(changed);
            } else if ( e.type === 'mouseover' && (classThis.trackNumber != classThis.mapobject.currentTrack ) ) {
                const changed = new CustomEvent('changetrack', {
                    detail: {
                        name: 'changetrack',
                        newtrack: classThis.trackNumber,
                    }
                  });
            
                  this._map._container.dispatchEvent(changed);
            }
        })
    }

    /**
     * A function that sets the track statistics based on availabla data.
     * 
     * @global {array} this.pageVariables.tracks['track_<number>'].info
     * @global {number} this.trackNumber
     * @global {method} this.calcGpxTrackdata()
     * 
     * @returns {void}
     */
    setTrackInfo() {
        let info = this.gpxTracks._info.desc;
        if (info) {info = info.split(' ')} else {info='';};

        if (info[0]=='Dist:' && info[1] && info[4] && info[7]) {
            this.pageVariables.tracks['track_'+ this.trackNumber.toString() ].info = this.gpxTracks._info.desc;
        } else {
            this.pageVariables.tracks['track_'+ this.trackNumber.toString() ].info = this.calcGpxTrackdata();
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
            let newdist = this.calcCrow(point.lat, point.lng, this.coords[i].lat, this.coords[i].lng);

            if (newdist < dist) {
                index = i;
                dist = newdist;
            }
        }
        return index;
    }

    /**
     * Calculates the distance between two coordinates as the crow flies (in km).
     * @param {number} lat1 - Latitude of the first location.
     * @param {number} lon1 - Longitude of the first location.
     * @param {number} lat2 - Latitude of the second location.
     * @param {number} lon2 - Longitude of the second location.
     * @returns {number} - The distance between the two coordinates in km.
     */
    calcCrow(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const toRad = (degrees) => degrees * (Math.PI / 180);

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const radLat1 = toRad(lat1);
        const radLat2 = toRad(lat2);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }

    /**
     * Calculates the distance between two coordinates by using the haversine formula (in km).
     * @param {number} lat1 - Latitude of the first location.
     * @param {number} lon1 - Longitude of the first location.
     * @param {number} lat2 - Latitude of the second location.
     * @param {number} lon2 - Longitude of the second location.
     * @returns {number} - The distance between the two coordinates in km.
     */
    calcdistance(lat1, lon1, lat2, lon2) {
        const r = 12742; // 6371 * 2
        const toRadians = (degrees) => degrees * (Math.PI / 180);
    
        const dLat = Math.sin((toRadians(lat2) - toRadians(lat1)) / 2);
        const dLon = Math.sin((toRadians(lon2) - toRadians(lon1)) / 2);
    
        const a = dLat * dLat + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * dLon * dLon;
        const d = r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
        return d;
    }

    /**
     * Calculate the distance and elevation data for the track.
     * @global {object} this.coords[...].meta.ele / .lat / .lng
     * @global {number} this.distSmoothing : is used for distance smoothing in meters
     * @global {number} this.eleSmoothing : is used for elevation smoothing in meters
     * @global {boolean} this.doTrackCalc : is used to determine if the track data should be calculated
     * @global {method} this.calcdistance : method is used
     * @global {number} this.tracklen  : is set by the function
     * @global {number} this.ascent  : is set by the function
     * @global {number} this.descent : is set by the function
     *  
     * @returns {string} 'Dist: 11 km, Gain: 22 Hm, Loss: 33 Hm' : The distance and elevation data for the track.
     */
    calcGpxTrackdata() {
        let info = '';

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
                    let curDist = 1000 * this.calcdistance(lastConsideredPoint[0], lastConsideredPoint[1], curPoint[0], curPoint[1]);
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
                    let curDist = 1000 * this.calcdistance(lastConsideredPoint[0], lastConsideredPoint[1], curPoint[0], curPoint[1]);
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