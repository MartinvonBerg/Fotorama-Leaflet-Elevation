import { parseGPX } from "@we-gold/gpxjs"

// TODO : change to IIFE and load wo bootstrap, cleanup
// TODO : ursache für JS fehler bei onhover chart und map finden

let esm = 4.5;
let esmStore = 4.5;
let dsm = 0.025;
let dsmStore = 0.025;
let filter = 0.5;
let filterStore = 0.5;
let gpx_reduce = true;
let fileLength = 0;
let checksum = 0;
let filePath = "";
let newFile = "";
let fileSize = 0;
let out = {};
let elevs = [];
let dists = [];
let lats = [];
let lons = [];
let newlats = [];
let newlons = [];
let selectedRow = null;
let allMaps = [];

const hashCode = (str) => [...str].reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0)

const input = document.querySelector(".file-input");

const text1 = document.querySelector("#gpx_text1");
const coord = document.getElementById("gpx_coord");
//const parent = document.getElementById("gpx_canvas_parent");
const canvas1 = document.getElementById("gpx_canvas1"); // Mind: The ID is defined several times!
const canvas2 = document.getElementById("gpx_canvas2"); // Mind: The ID is defined several times!

const dsmsel = document.querySelector("#gpx_smooth");
const dsmval = document.querySelector("#gpx_smooth_val");
const dsmenable = document.querySelector("#gpx_smooth_enable");

const esmsel = document.querySelector("#gpx_elesmooth");
const esmval = document.querySelector("#gpx_elesmooth_val");
const esmenable = document.querySelector("#gpx_elesmooth_enable");

const filtsel = document.querySelector("#gpx_filter");
const filtval = document.querySelector("#gpx_filter_val");
const filterenable = document.querySelector("#gpx_filter_enable");

//const stats = new AllGpxStats(); 
const stats = {};
class Chart {};

//let chart1 = null;
//let chart2 = null;

let uploadPath = document.getElementById('wp-upload-path').innerText + '/';
const filesTable = document.getElementById('fm-gpx-file-table');
let tempCanvas;
let tempContext;

// define all Event listeners --------------------

// show the clicked gpx-file from server. Use the complete path on server.
filesTable.addEventListener("click", (event) => {  
    // get the clicked row
    const row = event.target.closest('tr');
    // skip if header was clicked
    if (row.previousSibling === null) { return; }

    // remove highlight for previously selected row
    if (selectedRow !== null) selectedRow.style.removeProperty("background-color");

    // highlight current row
    row.style.backgroundColor = "yellow"
    selectedRow = row;

    // get clicked file name and prepare file load
    let clickedFile = row.querySelector('td').innerText;
    
    // set the global variables
    stats.file_content = null;
    newFile = "";
    fileLength = 0;
    checksum = 0;
    if ( uploadPath === '' ) {
        uploadPath = document.getElementById('wp-upload-path').innerText + '/';
    }
    text1.innerHTML = "File: " + clickedFile;
    clickedFile = uploadPath + clickedFile;
    
    // load the file to string stats.file_content. This is similar in all Event handlers.
    loadFileToString(clickedFile, 'filelist').then( () => {
        // do not filter the file. Show as saved on server 
        if ( stats.file_content !== null && checksum != 0) {
            showGpxFileOnLeaflet();

            // show statistics as saved in file or calculated, Show hint not filtered. Show hint if no statsitics in file
            parseGpxString(text1);
        }
    })

})

filesTable.addEventListener("onwheel", (event) => {
    // TODO : implement
})

// show the last saved gpx-file. Use the complete path on server.
window.addEventListener('load', (event) => {

    let lastFileResult = document.getElementById('fm-gpx-file')?.innerText || "";
    
    if (lastFileResult == "" || lastFileResult == null) {
        return;
    } else {
        text1.innerHTML = "File: " + lastFileResult;
        lastFileResult = uploadPath + lastFileResult;
    
        // load the file to string stats.file_content. This is similar in all Event handlers.
        loadFileToString(lastFileResult, 'onload').then( () => {
            // do not filter the file. Show as saved on server 
            if ( stats.file_content !== null && checksum != 0) {
                showGpxFileOnLeaflet();

                // get statistics as saved in file , Show hint not filtered. Show hint if no statsitics in file
                parseGpxString(text1);
                
            }
        })
    }
}) 

// show the selected file. Use the preloaded content from the fakepath as xml-string
input.addEventListener("change", (event) => { 
    // set the global variables
    stats.file_content = null;
    newFile = "";
    fileLength = 0;
    checksum = 0;
    uploadPath = '';

    if (input.files[0].name === null || input.files.length === 0) { 
        return;
    } else {
        text1.innerHTML = "File: " + input.files[0].name;
        // load the file to string 
        // load the file to string stats.file_content. This is similar in all Event handlers.
        loadFileToString('no-filepath-required-here', 'input').then( () => {
            // do not filter the file. Show as saved on server 
            if ( stats.file_content !== null && checksum != 0) {
                // filter the file and return as xml-string to global variable newFile
                newFile = filterGPXTrack(stats.file_content);

                // show filtered file
                showGpxFileOnLeaflet();
                
                // show other results like statistics after filtering
                parseGpxString(text1);
            }
        })
    }
    
})


// ---------- listeners for file filter inputs
esmsel.addEventListener("input", () => { // update the selected file. Use the preloaded content from the fakepath as xml-string
    esm = esmsel.value;
    esmStore = esm;

    if (esmenable.checked) {
        esm = esmStore;
    } else {
        esm = 0.0;
    }
    esmval.innerHTML = esm + " m";

    // filter the file and return as xml-string to global variable newFile
    filterEventListener();
})

dsmsel.addEventListener("input", () => { // update the selected file. Use the preloaded content from the fakepath as xml-string
    dsm = dsmsel.value / 1000;
    dsmStore = dsm;

    if (dsmenable.checked) {
        dsm = dsmStore;
    } else {
        dsm = 0.0;
    }
    dsmval.innerHTML = dsm * 1000 + " m";
    // filter the file and return as xml-string to global variable newFile
    filterEventListener();
})

filtsel.addEventListener("input", () => { // update the selected file. Use the preloaded content from the fakepath as xml-string
    filter = filtsel.value;
    filterStore = filter;

    if (filterenable.checked) {
        filter = filterStore;
    } else {
        filter = 0.0;
    }
    filtval.innerHTML = filter;
    // filter the file and return as xml-string to global variable newFile
    filterEventListener();
})

filterenable.addEventListener("input", () => { // update the selected file. Use the preloaded content from the fakepath as xml-string
    
    if (filterenable.checked) {
        filter = filterStore;
    } else {
        filter = 0.0;
    }
    // filter the file and return as xml-string to global variable newFile
    filterEventListener();
})

esmenable.addEventListener("input", () => { // update the selected file. Use the preloaded content from the fakepath as xml-string

    if (esmenable.checked) {
        esm = esmStore;
    } else {
        esm = 0.0;
    }
    // filter the file and return as xml-string to global variable newFile
    filterEventListener();
})

dsmenable.addEventListener("input", () => { // update the selected file. Use the preloaded content from the fakepath as xml-string

    if (dsmenable.checked) {
        dsm = dsmStore;
    } else {
        dsm = 0.0;
    }
    // filter the file and return as xml-string to global variable newFile
    filterEventListener();
})

function filterEventListener() {
    // filter the file and return as xml-string to global variable newFile
    if (newFile === "") {
        text1.innerHTML = "No file selected";
        return;
    }
    newFile = filterGPXTrack(stats.file_content);

    // show filtered file
    showGpxFileOnLeaflet();
    
    // show other results like statistics after filtering
    parseGpxString(text1);

    // TODO: write the filtered file to server: either by REST-API or AJAX
}
// End: define all Event listeners --------------------


/**
 * Asynchronously loads a file to a string based on the provided file path and trigger origin.
 *
 * @param {string} filePath - The path to the file to be loaded.
 * @param {string} triggerorigin - The origin that triggers the file loading process.
 * 
 * @global {object} input - The file input DOM element
 * 
 * The following global variables are set:
 * @global {object} stats.file_content - The content of the file as string in an object
 * @global {string} newFile - The content of the file as string equaly to stats.file_content
 * @global {number} fileLength - The length of the file
 * @global {number} checksum - The checksum of the file
 * 
 * @return {boolean} Returns true if the file is successfully loaded to a string, else false.
 */
async function loadFileToString(filePath='', triggerorigin='none') {

    if (filePath === '' || filePath == null || triggerorigin == 'none' || triggerorigin == '') {
        return false;

    } else if ( (checksum == 0 || stats.file_content == null) && (triggerorigin == 'filelist' || triggerorigin == 'onload') ) {
        // load the file to string and set the global variable for the file content
        newFile = await fetch(filePath).then(response => response.text());

    } else if ( (checksum == 0 || stats.file_content == null) && triggerorigin == 'input') {
        // load the file to string and set the global variable for the file content
        const file = input.files[0];
        newFile = await file.text();

    } else {
        return false;
    }

    // set the global variables
    stats.file_content = newFile;
    fileLength = newFile.length;
    checksum = hashCode(newFile);

    return true;
}

/**
 * Parses the GPX string and returns the parsed file or an error if there was one.
 * 
 * @global {string} newFile - The content of the file as string equaly to stats.file_content or filtered result
 * @global {number} fileSize - The length of the file
 *
 * @return {[null, Error] | [{object}, null]} An object containing the parsed file or an error message.
 */
function parseGpxString(element) {
    
    let NTrkPts = 0;
    let NRtePts = 0;
    let NWayPts = 0;
    let fileName = "";

    const getFileName = (innerHTML) => {
        const regex = /File: ([^<]+)/;
        const match = innerHTML.match(regex);
        return match ? match[1] : null;
    }

    // set the global fileSize
    fileSize = new Blob([newFile]).size / 1024;

    // parse the GPX file as stored in global variable newfile
    // TODO: parse only if current filtered file was not parsed yet
    const [parsedFile, error] = parseGPX(newFile);

    if (error) {
        element.innerHTML = "Error parsing loaded GPXFile as XML: " + error;
        return error;
    } else {
        parsedFile.tracks.forEach(element => {
            NTrkPts += element.points.length;
        });

        parsedFile.routes.forEach(element => {
            NRtePts += element.points.length;
        });

        parsedFile.waypoints.forEach(element => {
            NWayPts += element.points.length;
        });
        fileName = getFileName(element.innerHTML); 
        element.innerHTML = "<strong>File: " + fileName + "</strong>" + " / Size: " + fileSize.toFixed(1) + " kB"
        + "<br>Stats in File: " + parsedFile.metadata.description 
        + "<br>N Tracks: " + parsedFile.tracks.length + " / with N Points: " + NTrkPts
        + "<br>N Routes: " + parsedFile.routes.length + " / with N Points: " + NRtePts
        + "<br>N Waypoints: " + parsedFile.waypoints.length + " / with N Points: " + NWayPts
        return parsedFile;
    }
}

/**
 * Displays a GPX file on a Leaflet map. If a file is not provided, it retrieves the file name from the 'fm-gpx-file' element 
 * and constructs the file path using the 'uploadPath' variable. It then retrieves the current filter settings and filters 
 * the GPX track with those settings. The filtered track is written as a string to the 'lastFile' variable. 
 * The function then loads the file and displays it on a Leaflet map. If a Leaflet map already exists, it is removed. 
 * If a Chart.js chart exists, it is destroyed. The function also imports the LeafletChartJsClass module and creates a new LeafletChartJs object.
 *
 * @param {string} file - The path to the GPX file or the content as string to display. Defaults to null.
 * 
 * @globel {string} newFile - The content of the file as string equaly to stats.file_content or filtered result
 * @global {string} pageVarsForJs[0]['tracks']['track_0']['url'] : The path to the GPX file to display or the content of file as xml formatted string.
 * @global {object} allMaps[0] : The Leaflet map object.
 * 
 * @return {void} This function does not return a value.
 */
function showGpxFileOnLeaflet(file=null) {

    // load the file
    if (file == null) {
        pageVarsForJs[0]['tracks']['track_0']['url'] = newFile;
    } else {
        pageVarsForJs[0]['tracks']['track_0']['url'] = file;
    }


    if ( allMaps[0] != 'undefined' && ( allMaps[0] != null ) ) {
        try {
            allMaps[0].map.remove(); // leaflet map
        } catch (error) {
            console.log(error);
        }
        
        try {
            allMaps[0].chart.chart.destroy(); // chartjs
            // rework for not understood behaviour of destroy funtion on canvas
            allMaps[0].chart.elementOnPage.width = allMaps[0].chart.elementOnPage.clientWidth;
        } catch (error) {
            console.log(error);
        }
        //allMaps[0].controlElevation.clear(); // elevation
    }
    import(/* webpackChunkName: "leaflet_chartjs" */'../../js/leafletChartJs/leafletChartJsClass.js').then( (LeafletChartJs) => {
        allMaps[0] = [];
        LeafletChartJs.LeafletChartJs.count = 0;
        LeafletChartJs.LeafletChartJs.numberOfMaps = null;
        allMaps[0] = new LeafletChartJs.LeafletChartJs(0, 'boxmap' + 0 );
    })
    //import(/* webpackChunkName: "elevation-admin" */'../../js/elevationClass.js').then( (LeafletElevation) => {
        //allMaps[0] = [];
        //LeafletElevation.LeafletElevation.count = 0;
        //LeafletElevation.LeafletElevation.numberOfMaps = null;
        //allMaps[0] = new LeafletElevation.LeafletElevation(0, 'boxmap' + 0 );            
    //});

}

function filterGPXTrack(fileContent) {
    let info = '';
    let newFileContent = '';

    //elevation
    let lastConsideredElevation = 0;
    let cumulativeElevationGain = 0;
    let cumulativeElevationLoss = 0;
    
    // distance
    let lastConsideredPoint = [0, 0];
    let cumulativeDistance = 0;

    // set all arrays to empty
    elevs = [];
    dists = [];
    lats = [];
    lons = [];

    getCurrentFilterSettings();

    // parse the GPX file as stored in global variable newfile
    // TODO: parse only if current filtered file was not parsed yet
    const [parsedFile, error] = parseGPX(fileContent);

    if (error) {
        element.innerHTML = "Error parsing loaded GPXFile as XML: " + error;
        return error;

    // parse and combine tracks and routes to one track if gpx_reduce is checked. Skip the Waypoints.
    } else if (gpx_reduce) {
        parsedFile.tracks.forEach(element => {
            lastConsideredElevation = element.points[0].elevation;
            lastConsideredPoint = [element.points[0].latitude, element.points[0].longitude];
            // TODO: point mit Höhe = 0 ignorieren, falls einstellung gesetzt
            // TODO: höhendaten und coords filtern: Wie? Beide Kalman? 
            element.points.forEach(point => {
                
                let elevationDelta = point.elevation - lastConsideredElevation;
                if ( Math.abs(elevationDelta) > esm ) {
                    elevationDelta>0 ? cumulativeElevationGain += elevationDelta : '';
                    elevationDelta<0 ? cumulativeElevationLoss -= elevationDelta : '';
                    lastConsideredElevation = point.elevation;
                }

                let curPoint = [point.latitude, point.longitude];
                let curDist = 1000 * calcdistance(lastConsideredPoint[0], lastConsideredPoint[1], curPoint[0], curPoint[1]);
                if (Math.abs(curDist) > dsm) {
                    cumulativeDistance += curDist;
                    lastConsideredPoint = curPoint;
                    elevs.push(point.elevation);
                    dists.push(curDist);
                    lats.push(point.latitude);
                    lons.push(point.longitude);
                }
                
            });

            info = 'Dist: '+ (cumulativeDistance/1000).toFixed(1) +' km, Gain: '+ cumulativeElevationGain.toFixed(0) +' Hm, Loss: '+ cumulativeElevationLoss.toFixed(0) +' Hm';
            });
        
        // skip the routes currently; TODO: implement
        parsedFile.routes.forEach(element => {});

        newFileContent = createGpxHeader() + createGpxMeta( parsedFile.metadata.name, info, parsedFile.metadata.time ) + createGpxTrack(parsedFile.metadata.name, lats, lons, elevs) + createGpxFooter();
        
        return newFileContent;

    // else : return the original file
    } else {
        return fileContent;
    }
}

/**
 * Retrieves the current filter settings from the UI and updates the `pageVarsForJs` object.
 * 
 * @global {object} pageVarsForJs[0]['tracks']['track_0']['info'] 
 * @global {object} pageVarsForJs[0]['sw_options']['gpx_distsmooth' / 'gpx_elesmooth']
 *
 * @return {void}
 */
function getCurrentFilterSettings() {
    gpx_reduce = document.getElementById("gpx_reduce").checked;
    
    if (gpx_reduce) {
        // get the filter values
        dsm = parseInt( document.getElementById("gpx_smooth").value );
        if ( ! dsmenable.checked) dsm = 0.0;
        pageVarsForJs[0]['sw_options']['gpx_distsmooth'] = dsm;
        
        esm = parseFloat( document.getElementById("gpx_elesmooth").value );
        if ( ! esmenable.checked) esm = 0.0;
        pageVarsForJs[0]['sw_options']['gpx_elesmooth'] = esm;
    } else {
        // reset the filter values
        pageVarsForJs[0]['sw_options']['gpx_distsmooth'] = 0.0;
        dsm = 0.0;
        pageVarsForJs[0]['sw_options']['gpx_elesmooth'] = 0.0;
        esm = 0.0;
    }
}

/**
 * Calculates the distance between two coordinates by using the haversine formula (in km).
 * @param {number} lat1 - Latitude of the first location.
 * @param {number} lon1 - Longitude of the first location.
 * @param {number} lat2 - Latitude of the second location.
 * @param {number} lon2 - Longitude of the second location.
 * @returns {number} - The distance between the two coordinates in km.
 */
function calcdistance(lat1, lon1, lat2, lon2) {
    const r = 12742; // 6371 * 2
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const dLat = Math.sin((toRadians(lat2) - toRadians(lat1)) / 2);
    const dLon = Math.sin((toRadians(lon2) - toRadians(lon1)) / 2);

    const a = dLat * dLat + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * dLon * dLon;
    const d = r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return d;
}

function createGpxHeader() {
    let header = "";
    header += '<?xml version="1.0" encoding="UTF-8"?>';
    header += '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">';
 
    return header;
}

function createGpxMeta(fileName, info, time, bounds=null) {
    let meta = "";
  
    meta += '<metadata>';
    meta += '<name>' + fileName + '</name>';
    meta += '<desc>' + info + '</desc>';
    meta += '<time>' + time + '</time>';
    if (bounds != null) meta += '<bounds minlat="'+ bounds.minlat +'" minlon="'+ bounds.minlon +'" maxlat="'+ bounds.maxlat +'" maxlon="'+ bounds.maxlon+'"/>';
    meta += '</metadata>';
 
    return meta;
}

function createGpxTrack(name, lats, lons, elevs) {
    if (lats.length != lons.length || lats.length != elevs.length || lats.length != lons.length) {
        return "";
    }

    let track = "";
    track += '<trk>';
    track += '<name>'+ name +'</name>';
    track += '<trkseg>\n';

    for (let i = 0; i < lats.length; i++) {
        track += '<trkpt lat="'+ lats[i] +'" lon="'+ lons[i] +'">';
        track += '<ele>'+ elevs[i] +'</ele>';
        track += '</trkpt>\n';
    }
    
    track += '</trkseg>';
    track += '</trk>';
 
    return track;
}

function createGpxFooter() {
    let footer = "";
    footer += '</gpx>';
 
    return footer;
}


// Unused functions ---------------------------------------------------------------

/**
 * Asynchronously parses the input file and updates the webpage based on the file content and various calculations.
 *
 */
/*
async function parseInputFile() {
    
    if (input.file === null || input.files.length === 0) {
        if (text1.attributes.getNamedItem("data-info").value != "uploaded-drawn") {
            text1.innerHTML = "No file selected";
        }
        return;
    }

    if (checksum == 0) {
        const file = input.files[0];
        filePath = input.value;
        fileSize = file.size / 1024;
        newFile = await file.text();
        //console.log('The file has been loaded successfully.');
        stats.file_content = newFile;
        fileLength = newFile.length;
        checksum = hashCode(newFile); 
        //console.log("New Length: ", fileLength, "Checksum: ", checksum);
    } 
    out = {}; elevs = []; dists = []; lats = []; lons = []; newlats = []; newlons = [];
    out = await stats.get_url(esm, dsm, fileLength, filter);
    elevs = get_array( out.eleptr, out.npts );
    dists = get_array( out.disptr, out.npts );
    lats = get_array( out.latptr, out.npts );
    lons = get_array( out.lonptr, out.npts );

    // TODO: clean lats, lons arrays
    for (let i = 0; i < lats.length; i++) {
        if (lats[i] > 1e-2 && lons[i] > 1e-2) {
            newlats.push(lats[i]);
            newlons.push(lons[i]);
        }
    }

    canvas1.setAttribute("data-info", "drawn");
    canvas2.setAttribute("data-info", "drawn");
    tempCanvas = null;
    tempContext = null;
    //showCurrentTrackStatistics(dists);
    const kfiltered = kalmFilter(newlats, newlons);
    showGpxTracks(kfiltered, newlats, newlons);
    
    if (out == undefined) {
        text1.innerHTML = "Parsing File: <bold style='font-weight: bold'>" + filePath + "</bold> Size: " + parseFloat(fileSize).toFixed(1) + " kB<br>with: EleSm: " 
        + esm + " m / DistSm: " + parseFloat(dsm*1000,0) + " m / LowPass: " + filter;
    } else {
        text1.innerHTML = "Parsing File: <bold style='font-weight: bold'>" + filePath + "</bold> Size: " + parseFloat(fileSize).toFixed(1) + " kB<br>with: EleSm: "
         + esm + " m / DistSm: " + parseFloat(dsm*1000,0) + " m  / LowPass: " + filter + "<br>Anstieg: " + parseFloat(out.asc).toFixed(1) + " m <br>Abstieg: "
         + parseFloat(out.desc).toFixed(1) + " m <br>Min: " + parseFloat(out.min).toFixed(1) + " m <br>Max: " + parseFloat(out.max).toFixed(1) + " m <br>Distanz: "
         + parseFloat(out.dist).toFixed(2)  + " km <br>N Points: " + out.npts + "<br>Bounds: " + out.minlat + ", " + out.minlon + ", " + out.maxlat + ", " + out.maxlon ;
    }
}
*/

// ----------------------------------------------------
// If you only use `npm` you can simply
// import { Chart } from "wasm-demo" and remove `setup` call from `bootstrap.js`.
/** This function is used in `bootstrap.js` to setup imports. */
export function setup(WasmChart) {
    //Chart = WasmChart;
    //setupCanvas();
    //window.addEventListener("resize", () => {setupCanvas();parseInputFile();});
    //window.addEventListener("mousemove", onMouseMove);
}

/** Setup canvas to properly handle high DPI and redraw current plot. */
/*
function setupCanvas() {
    if (text1 != null && text1.attributes.getNamedItem("data-info") != null) {
        if (text1.attributes.getNamedItem("data-info").value == "uploaded-drawn") {
            return;
        }
    } else {
        return;
    }

    let aspectRatio = canvas1.clientWidth / canvas1.clientHeight;
    let parentWidth = canvas1.parentNode.offsetWidth;
    let minWidth = getComputedStyle(canvas1).minWidth;
    let oneRow = (parseFloat(minWidth) *2.0) < parseFloat(parentWidth); 
    
    if (!oneRow) {
        canvas1.style.width = parentWidth + "px";
        canvas1.style.height = parentWidth / aspectRatio + "px";
        canvas1.width = parentWidth;
        canvas1.height = parentWidth / aspectRatio;

        canvas2.style.width = parentWidth + "px";
        canvas2.style.height = parentWidth / aspectRatio + "px";
        canvas2.width = parentWidth;
        canvas2.height = parentWidth / aspectRatio;
    } else {
        canvas1.style.width = canvas1.clientWidth + "px";
        canvas1.style.height = canvas1.clientHeight + "px";
        canvas1.width = canvas1.clientWidth;
        canvas1.height = canvas1.clientHeight;	
        
        canvas2.style.width = canvas2.clientWidth + "px";
        canvas2.style.height = canvas2.clientHeight + "px";
        canvas2.width = canvas2.clientWidth;
        canvas2.height = canvas2.clientHeight;
    }
}
*/
/** Update displayed coordinates. */
/*
function onMouseMove(event) {
    var text = "";
    let N = out.npts;
    let dist = out.dist;

    if( (event.target.id == 'gpx_canvas1') && canvas1.getAttribute("data-info") == "drawn") {
        let xmax = Math.ceil(out.dist / 10) * 10;
        let ymin = Math.floor(out.min / 100) * 100; // out.min / 100;
        let ymax = Math.ceil(out.max / 100) * 100; // (out.max / 100)out.max;

        let [dataX, dataY] = getCoords(event, canvas1, 0, xmax, ymin, ymax);
        let index = parseInt(dataX * N / dist);
        let [cvX, cvY] = getPosOnCanvasFromIndex(canvas2, lons[index], lats[index]);
        addToCanvas('gpx_canvas2', ' X ' + index, cvX, cvY);
        

        if (dataX != null && dataY != null) {
            text = `${dataY.toFixed(0)} m / ${dataX.toFixed(1)} km`;
            coord.innerText = text;
            coord.style.top = (event.pageY - 30) + "px";
            coord.style.left = (event.pageX - 160) + "px";
            coord.style.cursor="crosshair";
            coord.style.opacity = 1;
        } 
    }
    else if( (event.target.id == 'gpx_canvas2') && canvas2.getAttribute("data-info") == "drawn") {
        let xmin = out.minlon;
        let xmax = out.maxlon;
        let ymin = out.minlat;
        let ymax = out.maxlat;

        let [dataX, dataY] = getCoords(event, canvas2, xmin, xmax, ymin, ymax);

        if (dataX != null && dataY != null) {
            text = `${dataX.toFixed(4)} / ${dataY.toFixed(4)}`;
            coord.innerText = text;
            coord.style.top = (event.pageY - 30) + "px";
            coord.style.left = (event.pageX - 160) + "px";
            coord.style.cursor="crosshair";
            coord.style.opacity = 1;
        }
    } else {
        coord.style.opacity = 0;
    }
}
*/
/**
 * Calculates the coordinates of a mouse event on a canvas.
 *
 * @param {MouseEvent} event - The mouse event.
 * @param {HTMLCanvasElement} canvas - The canvas element.
 * @param {number} xmin - The minimum x value.
 * @param {number} xmax - The maximum x value.
 * @param {number} ymin - The minimum y value.
 * @param {number} ymax - The maximum y value.
 * @return {Array<number|null>} An array containing the x and y coordinates of the mouse event, or [null, null] if the coordinates are outside the specified range.
 */
/*
function getCoords(event, canvas, xmin, xmax, ymin, ymax) {
    // rust canvas settings (not synchronized!)
    let margin = 10; // px
    let xLabelSize = 30; // px
    let yLabelSize = 40; // px
    let actualRect = canvas.getBoundingClientRect();

    // get x value
    let CWidth = canvas.width;
    let Cxmin = margin + xLabelSize + 9; // body.marginleft +1. TODO!
    let CxRangeInPx = CWidth - 2 * margin - xLabelSize -9; // body.marginleft +1. TODO!
    let logicX = event.offsetX * CWidth / actualRect.width;
    let dx = xmax - xmin;
    let dataX = (logicX - Cxmin) * dx / CxRangeInPx + xmin;

    // get y value
    let CHeight = canvas.height; // px complete Canvas
    let Cymin = yLabelSize-2; // px area of Canvas with drawn diagram
    let CyRangeInPx = CHeight - 2 * (yLabelSize); // px
    let Cymax = Cymin + CyRangeInPx+1; // px area of Canvas with drawn diagram
    let logicY = event.offsetY * CHeight / actualRect.height; 
    let dy = ymax - ymin;
    let dataY = - ( logicY - Cymax) * dy / CyRangeInPx + ymin;

    //console.log("x: ", logicX, "y: ", logicY);
    if (dataX < 0.95*xmin || dataX > 1.05*xmax || dataY < 0.95*ymin || dataY > 1.05*ymax) {
        return [null, null];
    }
    
    return [dataX, dataY];
}
*/
//window.addEventListener('load', showGpxFileOnCanvas(null) );

/*
function showGpxFileOnCanvas(file=null) {
    let lastFileResult = file;
    let infoText = "";

    if (lastFileResult == null) {
        lastFileResult = document.getElementById('fm-gpx-file')?.innerText || "";
        infoText = "Uploaded File: ";
    } else {
        infoText = "File in Table: ";
    }
    let lastFile = uploadPath + lastFileResult;
    //console.log("uploadPath: " + lastFileResult);
    // load the file
    if (lastFileResult != "") {
        fetch(lastFile).then((response) => response.text().then(showGpxOnCanvas));

        async function showGpxOnCanvas( retrievedText ) {
            //console.log('The file has been loaded successfully.');
            stats.file_content = retrievedText;
            fileLength = retrievedText.length;
            out = {}; elevs = []; dists = []; lats = []; lons = []; newlats = []; newlons = [];
            out = await stats.get_url(0.0, 0.0, fileLength, 0.0);
            elevs = get_array( out.eleptr, out.npts );
            dists = get_array( out.disptr, out.npts );
            lats = get_array( out.latptr, out.npts );
            lons = get_array( out.lonptr, out.npts );

            // TODO: clean lats, lons arrays
            for (let i = 0; i < lats.length; i++) {
                if (lats[i] > 1e-2 && lons[i] > 1e-2) {
                    newlats.push(lats[i]);
                    newlons.push(lons[i]);
                }
            }

            canvas1.setAttribute("data-info", "drawn");
            canvas2.setAttribute("data-info", "drawn");
            tempCanvas = null;
            tempContext = null;
            text1.innerHTML = infoText + "<strong>" + lastFileResult + "</strong>" + "<br> Input Elements will have no Effect.";
            text1.setAttribute("data-info", "uploaded-drawn");
            // show statistics on the gpx_canvas3
            //showCurrentTrackStatistics(dists);
            const kfiltered = kalmFilter(newlats, newlons);
            showGpxTracks(kfiltered, newlats, newlons);
            }
        }
}
*/

/*
function addToCanvas(canvasId, text, x=20, y=20, fontSize = 10, fontFamily = 'Arial') {
    
    // Get the existing canvas element
    var canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas element with ID ' + canvasId + ' not found.');
        return;
    }

    // Get the 2D context of the canvas
    var context = canvas.getContext('2d');
    if (!context) {
        console.error('Canvas context could not be obtained.');
        return;
    }

    // Create a temporary canvas to store the existing content
    if (!tempCanvas && !tempContext) {
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempContext = tempCanvas.getContext('2d');
        // Draw existing canvas content onto the temporary canvas
        tempContext.drawImage(canvas, 0, 0);
    }

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw the Text on canvas
    context.globalCompositeOperation = 'source-over'; // hard-light
    context.fillStyle = "red";
    context.font = fontSize + 'px ' + fontFamily;
    context.strokeText(text, x, y - 0.4 * fontSize);

    // Save the current context state
    context.save();

    // Set the global composite operation to "destination-over"
    context.globalCompositeOperation = 'destination-over'; // hard-light

    // Redraw the original existing canvas content
    context.drawImage(tempCanvas, 0, 0);

    // Restore the context state to its original settings
    context.restore();
}
*/
// Write a Function to calculate the position of a pixel on an existing html canvas that shows GPS positions
// in a rectangular bounding box. The Pixel Position should be extracted from the array with coordinates where
// the index gives the current coordinates in the array.
/*
function getPosOnCanvasFromIndex(canvas, curlon, curlat) {
    
    // rust canvas settings (not synchronized!)
    let margin = 10; // px
    let xLabelSize = 30; // px
    let yLabelSize = 40; // px

    // get x value
    let CWidth = canvas.width;
    let Cxmin = margin + xLabelSize + 9; // body.marginleft +1. TODO!
    let CxRangeInPx = CWidth - 2 * margin - xLabelSize -9; // body.marginleft +1. TODO!

    // get y value
    let CHeight = canvas.height; // px complete Canvas
    let Cymin = yLabelSize-2; // px area of Canvas with drawn diagram
    let CyRangeInPx = CHeight - 2 * (yLabelSize); // px
    let Cymax = Cymin + CyRangeInPx+1; // px area of Canvas with drawn diagram

    let minLongitude = out.minlon;
    let maxLongitude = out.maxlon;
    let minLatitude = out.minlat;
    let maxLatitude = out.maxlat;

    const xRatio = CxRangeInPx / (maxLongitude - minLongitude);
    const yRatio = CyRangeInPx / (maxLatitude - minLatitude);

    const x = (curlon - minLongitude) * xRatio + Cxmin;
    const y = CyRangeInPx - ((curlat - minLatitude) * yRatio) + Cymin;

    return [x, y];
}
*/
/*
function showCurrentTrackStatistics(data) {

    let newdata = [].slice.call(data);
    let curmean = mean(newdata);
    let curstd = std(newdata);
    let min1 = curmean - 3*curstd;
    let max1 = curmean + 3*curstd;
    let min2 = curmean - 6*curstd;
    let max2 = curmean + 6*curstd;

    let TESTER = document.getElementById('gpx_canvas3');
	plotly.newPlot( TESTER, [{
	    x: data,
	    type: 'histogram',}],
        {
        xaxis: {title: "Distance [m]"},
        yaxis: {title: "Frequency"},
        shapes: [
            {
                type: 'line',
                x0: curmean,
                y0: -10,
                x1: curmean,
                y1: 10,
                line: {
                color: 'red',
                width: 2,
                dash: 'dot'
                },},
            {
                type: 'line',
                x0: min1,
                y0: -10,
                x1: min1,
                y1: 10,
                line: {
                    color: 'red',
                    width: 2,
                    dash: 'dot'
                },},
            {
                type: 'line',
                x0: min2,
                y0: -10,
                x1: min2,
                y1: 10,
                line: {
                    color: 'red',
                    width: 2,
                    dash: 'dot'
            },},
            {
                type: 'line',
                x0: max1,
                y0: -10,
                x1: max1,
                y1: 10,
                line: {
                    color: 'red',
                    width: 2,
                    dash: 'dot'
                },},
            {
                type: 'line',
                x0: max2,
                y0: -10,
                x1: max2,
                y1: 10,
                line: {
                    color: 'red',
                    width: 2,
                    dash: 'dot'
                },},
          ],
        title: "Current Track Statistics",
        }
    );

    const dataSortedWithIndexes = newdata
        .map((f, i) => ({
            floatNumber: f,
            index: i, // <-- original index
        }));
}
*/
/*
function kalmFilter(lats, lons) {
    let kfilt = new KalmanFilter.KalmanFilter({observation: 2});
    let obs = [];

    for (let i = 0; i < lats.length; i++) {
        obs.push([lats[i], lons[i]]);
    }

    return kfilt.filterAll(obs);
}
*/
/*
function showGpxTracks(kfiltered, lons, lats) {
    let kfx = [];
    let kfy = [];

    for (let i = 0; i < kfiltered.length; i++) {
        kfx.push(kfiltered[i][0]); 
        kfy.push(kfiltered[i][1]);
    }

    let TESTER = document.getElementById('gpx_canvas4');

    plotly.newPlot( TESTER, 
        [{
            x: lats,
            y: lons,
            type: 'scatter',
        },
        {
            x: kfy,
            y: kfx,
            type: 'scatter',
        }],
        {
        xaxis: {title: "lons"},
        yaxis: {title: "lats"},
        title: "GPX Tracks compared",
        }
    );
}
*/