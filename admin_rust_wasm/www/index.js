import { AllGpxStats, get_array } from "../pkg/admin_rust_wasm.js";
import plotly from "plotly.js-dist";
import {mean, std} from "mathjs"
import KalmanFilter from "kalman-filter";

let esm = 4.5;
let esmStore = 4.5;
let dsm = 0.025;
let dsmStore = 0.025;
let filter = 0.5;
let filterStore = 0.5;
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

const stats = new AllGpxStats(); 
class Chart {};

let chart1 = null;
let chart2 = null;

let uploadPath = document.getElementById('wp-upload-path').innerText;
const filesTable = document.getElementById('fm-gpx-file-table');
let tempCanvas;
let tempContext;

filesTable.addEventListener("click", (event) => {
    const target = event.target;
    const row = target.closest('tr');
    // skip if header was clicked
    if (row.previousSibling === null) { return; }

    // remove highlight for previously selected row
    if (selectedRow !== null) selectedRow.style.removeProperty("background-color");

    // highlight current row
    row.style.backgroundColor = "yellow"
    selectedRow = row;

    // get file name and pas it to showGpxFileOnCanvas
    const clickedFile = row.querySelector('td').innerText;
    showGpxFileOnCanvas(clickedFile);
})

input.addEventListener("change", () => {
    stats.file_content = 'NULL';
    checksum = 0;
    parseInputFile();
})

esmsel.addEventListener("input", () => {
    esm = esmsel.value;
    esmStore = esm;

    if (esmenable.checked) {
        esm = esmStore;
    } else {
        esm = 0.0;
    }
    esmval.innerHTML = esm + " m";
    parseInputFile();
})

dsmsel.addEventListener("input", () => {
    dsm = dsmsel.value / 1000;
    dsmStore = dsm;

    if (dsmenable.checked) {
        dsm = dsmStore;
    } else {
        dsm = 0.0;
    }
    dsmval.innerHTML = dsm * 1000 + " m";
    parseInputFile();
})

filtsel.addEventListener("input", () => {
    filter = filtsel.value;
    filterStore = filter;

    if (filterenable.checked) {
        filter = filterStore;
    } else {
        filter = 0.0;
    }
    filtval.innerHTML = filter;
    parseInputFile();
})

filterenable.addEventListener("input", () => {
    
    if (filterenable.checked) {
        filter = filterStore;
    } else {
        filter = 0.0;
    }
    parseInputFile();
})

esmenable.addEventListener("input", () => {

    if (esmenable.checked) {
        esm = esmStore;
    } else {
        esm = 0.0;
    }
    parseInputFile();
})

dsmenable.addEventListener("input", () => {

    if (dsmenable.checked) {
        dsm = dsmStore;
    } else {
        dsm = 0.0;
    }
    parseInputFile();
})

/**
 * Asynchronously parses the input file and updates the webpage based on the file content and various calculations.
 *
 */
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

// ----------------------------------------------------
// If you only use `npm` you can simply
// import { Chart } from "wasm-demo" and remove `setup` call from `bootstrap.js`.
/** This function is used in `bootstrap.js` to setup imports. */
export function setup(WasmChart) {
    Chart = WasmChart;
    setupCanvas();
    window.addEventListener("resize", () => {setupCanvas();parseInputFile();});
    window.addEventListener("mousemove", onMouseMove);
}

/** Setup canvas to properly handle high DPI and redraw current plot. */
function setupCanvas() {
    if (text1.attributes.getNamedItem("data-info") != null) {
        if (text1.attributes.getNamedItem("data-info").value == "uploaded-drawn") {
            return;
        }
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

/** Update displayed coordinates. */
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

window.addEventListener('load', showGpxFileOnCanvas(null) );

function showGpxFileOnCanvas(file=null) {
    let lastFileResult = file;
    let infoText = "";

    if (lastFileResult == null) {
        lastFileResult = document.getElementById('fm-gpx-file')?.innerText || "";
        infoText = "Uploaded File: ";
    } else {
        infoText = "File in Table: ";
    }
    let lastFile = uploadPath + '/' + lastFileResult;
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

// Write a Function to calculate the position of a pixel on an existing html canvas that shows GPS positions
// in a rectangular bounding box. The Pixel Position should be extracted from the array with coordinates where
// the index gives the current coordinates in the array.

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

function kalmFilter(lats, lons) {
    let kfilt = new KalmanFilter.KalmanFilter({observation: 2});
    let obs = [];

    for (let i = 0; i < lats.length; i++) {
        obs.push([lats[i], lons[i]]);
    }

    return kfilt.filterAll(obs);
}

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