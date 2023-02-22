/*!
	gpxTrackClass 0.17.0
	license: GPL 2.0
	Martin von Berg
*/
// load gpx tracks and provide data, name and statistics
import 'leaflet-gpx'

export {gpxTrackClass};

class gpxTrackClass {
    trackname = '';
    trackdescr = '';
    trackbounds = {};
    ascent = 0;
    descent = 0;
    tracklen = 0;
    trackurl = '';
    options = {};
    tracks = [];
    gpxTracks = {}
    asyncLoading = false;

    constructor( number, mapobject, tracks, options=null) {
        this.tracks = tracks;
        this.options = options;
        this.trackurl = tracks.track_0.url;
        this.pageVariables = pageVarsForJs[number];

        this.gpxTracks = new L.GPX(this.trackurl, {
            async: this.asyncLoading,
            polyline_options: {
                color: '#aa1111'
            },
            marker_options: {
                startIconUrl: this.pageVariables.imagepath +'/pin-icon-start.png',
                endIconUrl: this.pageVariables.imagepath +'/pin-icon-end.png',
                shadowUrl: this.pageVariables.imagepath +'/pin-shadow.png'
            }
        }).on('loaded', function(e) {
            mapobject.fitBounds(e.target.getBounds());
        }).addTo(mapobject);
        
        this.tracklen = this.gpxTracks.get_distance();
        this.trackname = this.gpxTracks.get_name();
        this.ascent = this.gpxTracks.get_elevation_gain();
        this.descent = this.gpxTracks.get_elevation_loss();
        this.trackdescr = this.gpxTracks.get_desc();
        this.elev_data = this.gpxTracks.get_elevation_data(); // no function here to get the gpx data
        this.trackbounds = this.gpxTracks.getBounds();

        // this.gpxTracks.getLayers()[0].bindPopup('test')
        // https://meggsimum.de/webkarte-mit-gps-track-vom-sport/
        let distM = this.gpxTracks.get_distance();
        let distKm = distM / 1000;
        let distKmRnd = distKm.toFixed(1);
        let eleGain = this.gpxTracks.get_elevation_gain().toFixed(3);
        let eleLoss = this.gpxTracks.get_elevation_loss().toFixed(3);

        // register popup on click
        this.gpxTracks.getLayers()[0].bindPopup(
        "Distance " + distKmRnd + " km </br>" +
        "Elevation Gain " + eleGain + " m </br>" +
        "Elevation Loss " + eleLoss + " m"
        )

        this.gpxTracks.getLayers()[0].bindTooltip('test')
     
    }

}