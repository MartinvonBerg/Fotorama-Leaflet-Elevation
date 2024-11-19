export function createGpxFileAsString(fileName, info, type, time, lats, lons, elevs, bounds=null, waypoints=null) {
  return createGpxHeader() 
        + createGpxMeta( fileName, info, time, bounds, waypoints) 
        + createGpxTrack(fileName, type, lats, lons, elevs) 
        + createGpxFooter();
}    

export function createGpxHeader() {
    let header = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n';
    header += '<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="Slider-Map-Chart-Upload" >\n';

    return header;
}

export function createGpxMeta(fileName, info, time, bounds=null, waypoints=null) {
    let meta = '<metadata>\n';

    if (fileName != '') meta += '<name>' + fileName + '</name>\n';
    if (info != '') meta += '<desc>' + info + '</desc>\n';
    if (time != '') meta += '<time>' + time + '</time>\n';
    if (bounds != null) meta += '<bounds minlat="'+ bounds.minlat +'" maxlat="'+ bounds.maxlat +'" minlon="'+ bounds.minlon +'" maxlon="'+ bounds.maxlon+'"/>\n';

    meta += '</metadata>\n';

    if (waypoints != null) {
        for (let i = 0; i < waypoints.length; i++) {
            meta += '<wpt lat="'+ waypoints[i].latitude +'" lon="'+ waypoints[i].longitude +'"><name>'+ waypoints[i].name +'</name></wpt>\n';
        }
    }

    return meta;
}

export function createGpxTrack(name, type, lats, lons, elevs, descr='') {
    if (lats.length != lons.length || lats.length != elevs.length || lats.length != lons.length) {
        return "";
    }

    let track = '<trk>';
    track += '<name>'+ name +'</name>\n';
    if (type != '') track += '<type>'+ type +'</type>\n';
    if (descr != '') track += '<desc>'+ descr +'</desc>\n';
    track += '<trkseg>\n';

    for (let i = 0; i < lats.length; i++) {
        track += '<trkpt lat="'+ lats[i].toFixed(6) +'" lon="'+ lons[i].toFixed(6) +'"><ele>'+ elevs[i].toFixed(1) +'</ele></trkpt>\n';
    }
    
    track += '</trkseg></trk>';
    return track;
}

export function createGpxFooter() {
    return '</gpx>';
}

//export {createGpxFileAsString, createGpxHeader, createGpxMeta, createGpxTrack, createGpxFooter};