/*!
	gpxTrackClass 0.17.0
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
    eleSmoothing = 1.25; // value in meters // TODO: setting
    distSmoothing = 25; // TODO: setting
    doTrackCalc = true; // TODO: setting
    trackNumber = 0;
    pageVariables = [];
    mapobject = {};

    constructor( number, mapobject, tracks, options=null) {
        this.tracks = tracks;
        this.pageVariables = pageVarsForJs[number];
        this.mapobject = mapobject;

        this.showTrack(0);
    }

    showTrack( trackNumber) {
        this.trackurl = this.tracks['track_'+ trackNumber.toString() ].url;

        // show first track on map. track color, width, tooltip font color, background color
        this.gpxTracks = new L.GPX(this.trackurl, {
            async: this.asyncLoading,
            polyline_options: {
                color: '#aa1111' // TODO: setting
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
        this.mapobject.map.fitBounds(this.gpxTracks.getBounds(), {padding: [150, 150]});
        this.mapobject.bounds = this.gpxTracks.getBounds();

        let classThis = this;
        this.gpxTracks.on('mouseover', function(e) {
            if ( e.type === 'mouseover' ) {
                //let thecoords = e.propagatedFrom.latlngs;
                // get id in coords. triggerEvent
                const changed = new CustomEvent('mouseoverpath', {
                    detail: {
                        name: 'mouseoverpath',
                        track: this._info.name,
                        position: e.latlng,
                        index: classThis.getIndexForCoords(e.latlng),
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
        let dist = 1e4;
        let newdist = 1e5;
        let index = -1;

        //let startTime = performance.now();
        for (let i = 0; i < n; i++) {
            newdist = this.calcCrow(point.lat, point.lng, this.coords[i].lat, this.coords[i].lng);
            //console.log(newdist);
            // the method from gpx.js leads to identical results. So the calc is correct.
            //newdist = 1e-3*this.gpxTracks._dist2d({lat:point.lat,lng:point.lng},{lat:this.coords[i].lat,lng:this.coords[i].lng}); 
            //console.log(newdist);

            if (newdist < dist) {
                index = i;
                dist = newdist;
            }
        }
        //let endTime = performance.now();
        //console.log(`Call took ${endTime - startTime} milliseconds`);

        return index;
    }

    // https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
    //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
    calcCrow(lat1, lon1, lat2, lon2) 
    {
      var R = 6371; // km
      var dLat = this.toRad(lat2-lat1);
      var dLon = this.toRad(lon2-lon1);
      var lat1 = this.toRad(lat1);
      var lat2 = this.toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

    // Converts numeric degrees to radians
    toRad(Value) 
    {
        return Value * Math.PI / 180;
    }

    /**
   * calc the distance and elevation data for the track.
   * @param {array} gpxdata 
   * @returns {object} the sorted data
   */
    calcGpxTrackdata() {
    let info = '';
    //elevation
    let cumulativeElevationGain = 0;
    let cumulativeElevationLoss = 0;
    let curElevation = 0;
    let lastConsideredElevation = this.coords[0].meta.ele;
    let elevationDelta = 0;
    // distance
    let lastPoint = [this.coords[0].lat, this.coords[0].lng];
    let curPoint = [0,0];
    let curDist = 0;
    let cumulativeDistance = 0;
    

    if ( this.doTrackCalc) {
        this.coords.forEach((point, index) => {
            curElevation = point.meta.ele;
            
            if ( typeof(curElevation === 'number') && curElevation > 0.1){ // filter elevation data // TODO: setting
                elevationDelta = curElevation - lastConsideredElevation;

                if ( Math.abs( elevationDelta) > this.eleSmoothing ) {
                    elevationDelta>0 ? cumulativeElevationGain += elevationDelta : '';
                    elevationDelta<0 ? cumulativeElevationLoss -= elevationDelta : '';
                }
                lastConsideredElevation = curElevation;

                // distance calc
                curPoint = [point.lat, point.lng];
                curDist = 1000 * this.calcCrow(lastPoint[0], lastPoint[1], curPoint[0], curPoint[1]);
                if ( Math.abs(curDist) > this.distSmoothing) {
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