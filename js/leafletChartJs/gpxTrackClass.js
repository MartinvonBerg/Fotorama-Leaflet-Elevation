/*!
	gpxTrackClass 0.25.0
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
    eleSmoothing = 4; // value in meters // TODO: setting. take from admin panel
    distSmoothing = 5; // value in meters // TODO: setting. Do not take from admin panel. Or give a hint.
    doTrackCalc = true; // no setting. always calc track statistics if not in file because leafelet-gpx is too inaccurate.
    trackNumber = 0;
    pageVariables = [];
    mapobject = {};
    trackColour = '';
    bounds = null;

    constructor(number, mapobject, tracks, trackNumber, trackColour = '#ff0000') {
        this.tracks = tracks;
        this.pageVariables = pageVarsForJs[number];
        this.mapobject = mapobject;
        this.trackNumber = trackNumber;
        this.trackColour = trackColour;
        this.showTrack(this.trackNumber);
    }

    showTrack( trackNumber) {
        this.trackurl = this.tracks['track_'+ trackNumber.toString() ].url;

        // show first track on map. track color, width, tooltip font color, background color
        this.gpxTracks = new L.GPX(this.trackurl, {
            async: this.asyncLoading,
            polyline_options: {
                color: this.trackColour,
                weight: 4, // TODO: setting
            },
            /*
            marker_options: {
                startIconUrl: this.pageVariables.imagepath +'/pin-icon-start.png',
                endIconUrl: this.pageVariables.imagepath +'/pin-icon-end.png',
                shadowUrl: this.pageVariables.imagepath +'/pin-shadow.png'
            }
            */
            marker_options: {
                startIconUrl: '', // TODO: setting
                endIconUrl: '',// TODO: setting 
                shadowUrl: '' // TODO: setting
            }

        }).addTo(this.mapobject.map);
        
        this.elev_data = this.gpxTracks.get_elevation_data(); // no function here to get the gpx data
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

    setTrackInfo() {
        let info = this.gpxTracks._info.desc;
        if (info) {info = info.split(' ')} else {info='';};

        if (info[0]=='Dist:' && info[1] && info[4] && info[7]) {
            return;
        } else {
            this.pageVariables.tracks['track_'+ this.trackNumber.toString() ].info = this.calcGpxTrackdata();
        }

    }

    getIndexForCoords(point) {
        let n = this.coords.length
        let dist = Infinity;
        let index = -1;

        //let startTime = performance.now();
        for (let i = 0; i < n; i++) {
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
     * @returns {number} - The distance between the two coordinates.
     */
    calcCrow(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const radLat1 = this.toRad(lat1);
        const radLat2 = this.toRad(lat2);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }

    /**
     * Converts degrees to radians.
     * @param {number} degrees - The value in degrees.
     * @returns {number} - The value in radians.
     */
    toRad(degrees) {
        return (degrees * Math.PI) / 180;
    }

    /**
     * Calculate the distance and elevation data for the track.
     * @param {array} gpxdata 
     * @returns {object} the sorted data
     */
    calcGpxTrackdata() {
        let info = '';

        //elevation
        let lastConsideredElevation = this.coords[0].meta.ele;
        let cumulativeElevationGain = 0;
        let cumulativeElevationLoss = 0;
        
        // distance
        let lastPoint = [this.coords[0].lat, this.coords[0].lng];
        let cumulativeDistance = 0;
        

        if ( this.doTrackCalc) {
            this.coords.forEach((point, index) => {
                let curElevation = point.meta.ele;
                
                if ( typeof(curElevation === 'number') && curElevation > 0.01){ // filter elevation data // TODO: setting
                    let elevationDelta = curElevation - lastConsideredElevation;

                    if ( Math.abs(elevationDelta) > this.eleSmoothing ) {
                        elevationDelta>0 ? cumulativeElevationGain += elevationDelta : '';
                        elevationDelta<0 ? cumulativeElevationLoss -= elevationDelta : '';
                    }
                    lastConsideredElevation = curElevation;

                    let curPoint = [point.lat, point.lng];
                    let curDist = 1000 * this.calcCrow(lastPoint[0], lastPoint[1], curPoint[0], curPoint[1]);
                    if (Math.abs(curDist) > this.distSmoothing) {
                        cumulativeDistance += curDist;
                    }
                    lastPoint = curPoint;
                }
            });

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