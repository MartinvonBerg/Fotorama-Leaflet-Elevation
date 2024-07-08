export function createGpxFileAsString(fileName, info, time, lats, lons, elevs, bounds=null) {
  return createGpxHeader() 
        + createGpxMeta( fileName, info, time, bounds) 
        + createGpxTrack(fileName, lats, lons, elevs) 
        + createGpxFooter();
}    

function createGpxHeader() {
    let header = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n';
    header += '<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="Fotorama-Upload" >\n';

    return header;
}

function createGpxMeta(fileName, info, time, bounds=null) {
    let meta = '<metadata>\n';

    if (fileName != '') meta += '<name>' + fileName + '</name>\n';
    if (info != '') meta += '<desc>' + info + '</desc>\n';
    if (time != '') meta += '<time>' + time + '</time>\n';
    if (bounds != null) meta += '<bounds minlat="'+ bounds.minlat +'" maxlat="'+ bounds.maxlat +'" minlon="'+ bounds.minlon +'" maxlon="'+ bounds.maxlon+'"/>\n';

    meta += '</metadata>\n';

    return meta;
}

function createGpxTrack(name, lats, lons, elevs) {
    if (lats.length != lons.length || lats.length != elevs.length || lats.length != lons.length) {
        return "";
    }

    let track = '<trk>';
    track += '<name>'+ name +'</name>';
    track += '<trkseg>\n';

    for (let i = 0; i < lats.length; i++) {
        track += '<trkpt lat="'+ lats[i].toFixed(6) +'" lon="'+ lons[i].toFixed(6) +'"><ele>'+ elevs[i].toFixed(1) +'</ele></trkpt>\n';
    }
    
    track += '</trkseg></trk>';
    return track;
}

function createGpxFooter() {
    return '</gpx>';
}

export default createGpxFileAsString;