import { parseGPX } from "@we-gold/gpxjs";
import plotly from "plotly.js-dist";
import {mean, std} from "mathjs";

(function (window, document, undefined) {
    // TODO : ursache für JS fehler bei onhover chart und map finden
    "use strict";

    let esm = 4.5;
    let esmStore = 4.5;
    let dsm = 0.025;
    let dsmStore = 0.025;
    let filter = 0.5;
    let filterStore = 0.5;
    let gpx_reduce = true;
    let fileLength = 0;
    let ignoreZeroElevs = true;
    let checksum = 0;
    let newFile = "";
    let fileSize = 0;
    let elevs = [];
    let dists = [];
    let lats = [];
    let lons = [];
    let origelevs = [];
    let origdists = [];
    let origlats = [];
    let origlons = [];
    let origtdelta = [];
    let origSpeedH = [];
    let origSpeed3D = [];
  
    let selectedRow = null;
    let allMaps = [];

    const input = document.querySelector(".file-input");
    const text1 = document.querySelector("#gpx_text1");
    const filesTable = document.getElementById('fm-gpx-file-table');

    const dsmsel = document.querySelector("#gpx_smooth");
    const dsmval = document.querySelector("#gpx_smooth_val");
    const dsmenable = document.querySelector("#gpx_smooth_enable");

    const esmsel = document.querySelector("#gpx_elesmooth");
    const esmval = document.querySelector("#gpx_elesmooth_val");
    const esmenable = document.querySelector("#gpx_elesmooth_enable");

    const filtsel = document.querySelector("#gpx_filter");
    const filtval = document.querySelector("#gpx_filter_val");
    const filterenable = document.querySelector("#gpx_filter_enable");

    const stats = {};
    const hashCode = (str) => [...str].reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0)

    let uploadPath = document.getElementById('wp-upload-path').innerText + '/';

    
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
        text1.innerHTML = "File: " + clickedFile + "<br>Stats<br>N<br>N<br>N";
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

    filesTable.addEventListener("mouseleave", () => {
        document.body.classList.remove('stop-scrolling');
    })

    filesTable.addEventListener("mousewheel", (event) => {
        
        let row;
        if (selectedRow == null) return;

        event.preventDefault();
        document.body.classList.add('stop-scrolling');
                
        if (event.deltaY > 0) {
            // scroll down
            // get the row below the current.
            if (selectedRow.nextSibling === null) { return; }
            row = selectedRow.nextSibling;
           
        } else {
            // scroll up
            // get the row above the current.
            if (selectedRow.previousSibling === null || selectedRow.previousSibling.previousSibling === null) { return; }
            row = selectedRow.previousSibling;
            
        }
        // remove highlight for previously selected row
        selectedRow.style.removeProperty("background-color");

        // highlight current row
        row.style.backgroundColor = "yellow"
        selectedRow = row;
        
        // get file from new row
        let clickedFile = row.querySelector('td').innerText;

        // set the global variables
        stats.file_content = null;
        newFile = "";
        fileLength = 0;
        checksum = 0;
        if ( uploadPath === '' ) {
            uploadPath = document.getElementById('wp-upload-path').innerText + '/';
        }
        text1.innerHTML = "File: " + clickedFile + "<br>Stats<br>N<br>N<br>N";
        clickedFile = uploadPath + clickedFile;

        // load the file to string stats.file_content. This is similar in all Event handlers. Do not filter
        loadFileToString(clickedFile, 'filelist').then( () => {
            // do not filter the file. Show as saved on server 
            if ( stats.file_content !== null && checksum != 0) {
                showGpxFileOnLeaflet();

                // show statistics as saved in file or calculated, Show hint not filtered. Show hint if no statsitics in file
                parseGpxString(text1);
            }
        })
        
    })

    // show the last saved gpx-file. Use the complete path on server.
    window.addEventListener('load', (event) => {

        let lastFileResult = document.getElementById('fm-gpx-file')?.innerText || "";
        
        if (lastFileResult == "" || lastFileResult == null) {
            return;
        } else {
            text1.innerHTML = "File: " + lastFileResult + "<br>Stats<br>N<br>N<br>N";
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
        updateCSS();
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
            text1.innerHTML = "File: " + input.files[0].name + "<br>Stats<br>N<br>N<br>N";
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

    function updateCSS() {
        // add inline CSS 
	
	    const style = document.createElement('style');
        style.innerHTML = `
            .scrollable-page { height: 1000px; }
 
            .stop-scrolling {
            height: 100%;
            overflow: hidden;
            }`;

        document.head.appendChild(style);
    }

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

        // time
        let lastConsideredTime = 0;
        let tDelta = 0;

        // set all arrays to empty
        elevs = [];
        dists = [];
        lats = [];
        lons = [];
        origelevs = [];
        origdists = [];
        origlats = [];
        origlons = [];
        origtdelta = [];
        origSpeedH = [];
        origSpeed3D = [];

        getCurrentFilterSettings();

        // parse the GPX file as stored in global variable newfile
        const [parsedFile, error] = parseGPX(fileContent);

        if (error) {
            element.innerHTML = "Error parsing loaded GPXFile as XML: " + error;
            return error;

        // parse and combine tracks and routes to one track if gpx_reduce is checked. Skip the Waypoints.
        } else if (gpx_reduce) {
            // remove points with zero elevation and calc speed values
            parsedFile.tracks.forEach(element => {
                lastConsideredElevation = element.points[0].elevation;
                lastConsideredPoint = [element.points[0].latitude, element.points[0].longitude];
                lastConsideredTime = element.points[0].time;
                
                element.points.forEach(point => {
                    // ignore / skip points with zero elevation and go to next point
                    if ( ignoreZeroElevs && (Math.abs(point.elevation) < 0.01) ) {
                        return; // is practically the same as continue
                    }
                    
                    let curPoint = [point.latitude, point.longitude];
                    let curDist = 1000 * calcdistance(lastConsideredPoint[0], lastConsideredPoint[1], curPoint[0], curPoint[1]);
                    let curDist3D = 1000 * calculate3DDistance(lastConsideredPoint[0], lastConsideredPoint[1], lastConsideredElevation, curPoint[0], curPoint[1], point.elevation);
                    
                    // save the original values
                    tDelta = (point.time.getHours()*3600 + point.time.getMinutes()*60 + point.time.getSeconds() 
                        - (lastConsideredTime.getHours()*3600 + lastConsideredTime.getMinutes()*60 + lastConsideredTime.getSeconds() ));
                    
                    origelevs.push(point.elevation);
                    origlats.push(point.latitude);
                    origlons.push(point.longitude);

                    origdists.push(curDist);
                    origtdelta.push(tDelta);

                    let SpeedH = Math.abs(point.elevation - lastConsideredElevation); // /tDelta ? Math.abs(point.elevation - lastConsideredEleStats)/tDelta : 0.0;
                    origSpeedH.push(SpeedH);

                    let Speed3D = curDist3D; // /tDelta ? curDist3D/tDelta : 0.0;
                    origSpeed3D.push(Speed3D);

                    lastConsideredTime = point.time;
                    lastConsideredElevation = point.elevation;
                    lastConsideredPoint = curPoint;
                });
            });
            
            // skip the routes currently; TODO: implement : remove points with zero elevation and calc speed values
            parsedFile.routes.forEach(element => {});

            // filter the originals. show the result of the first simplification
            // statistics 
            let meanSpeedH = 3*mean(origSpeedH); // TODO: number 3 should be a parameter?
            let meanDist3D = 3*mean(origSpeed3D); // TODO: number 3 should be a parameter?
            let newSpdH = [];
            let newDst3D = [];
            let minlat = 180;
            let maxlat = -180;
            let minlon = 180;
            let maxlon = -180;

            // remove the elements in the array that are greater than mean + 3*std
            for (let i = 0; i < origSpeedH.length; i++) {
                if ( (origSpeedH[i] < meanSpeedH) && (origSpeed3D[i] < meanDist3D)) {
                    newSpdH.push(origSpeedH[i]);
                    newDst3D.push(origSpeed3D[i]);
                    // create new arrays with the filtered elements for lats, lons, elevs. These are stored in newFileContent
                    //elevs.push( origelevs[i]);
                    //dists.push( origdists[i]);
                    //lats.push ( origlats[i]);
                    //lons.push ( origlons[i]);
                    // calc the geo bounds of the filtered track
                    if (origlats[i] > maxlat) {
                        maxlat = origlats[i];
                    }
                    if (origlats[i] < minlat) {
                        minlat = origlats[i];
                    }
                    if (origlons[i] > maxlon) {
                        maxlon = origlons[i];
                    }
                    if (origlons[i] < minlon) {
                        minlon = origlons[i];
                    }
                } 
            }
            let bounds = {
                minlat: minlat,
                minlon: minlon,
                maxlat: maxlat,
                maxlon: maxlon
            };

            showCurrentTrackStatistics(newDst3D);
            showGpxStatistics(origdists, newSpdH, newDst3D);

            // apply simplify.js
            // TODO: Implement

            // calc new stats and write result to new file content
            let length = origelevs.length;
            lastConsideredElevation = origelevs[0];
            lastConsideredPoint = [origlats[0], origlons[0]];

            for (let i = 0; i < length; i++) {

                let elevationDelta = origelevs[i] - lastConsideredElevation;
                    if ( Math.abs(elevationDelta) > esm ) {
                        elevationDelta>0 ? cumulativeElevationGain += elevationDelta : '';
                        elevationDelta<0 ? cumulativeElevationLoss -= elevationDelta : '';
                        lastConsideredElevation = origelevs[i];
                    }
                
                let curPoint = [origlats[i], origlons[i]];
                let curDist = 1000 * calcdistance(lastConsideredPoint[0], lastConsideredPoint[1], curPoint[0], curPoint[1]);
                    
                if (Math.abs(curDist) > dsm) {
                    cumulativeDistance += curDist;
                    lastConsideredPoint = curPoint;
                    elevs.push( origelevs[i]);
                    dists.push( origdists[i]);
                    lats.push ( origlats[i]);
                    lons.push ( origlons[i]);
                }
            };

            info = 'Dist: '+ (cumulativeDistance/1000).toFixed(1) +' km, Gain: '+ cumulativeElevationGain.toFixed(0) +' Hm, Loss: '+ cumulativeElevationLoss.toFixed(0) +' Hm';
                
            newFileContent = createGpxHeader() + createGpxMeta( parsedFile.metadata.name, info, parsedFile.metadata.time) + createGpxTrack(parsedFile.metadata.name, lats, lons, elevs) + createGpxFooter();
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
        ignoreZeroElevs = document.getElementById("gpx_ignore_zero_elev").checked;
        
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

    /**
     * Calculates the distance between two coordinates by using the haversine formula (in km) including altitude.
     * @param {number} lat1 - Latitude of the first location.
     * @param {number} lon1 - Longitude of the first location.
     * @param {number} alt1 - Altitude of the first location in Meters.
     * 
     * @param {number} lat2 - Latitude of the second location.
     * @param {number} lon2 - Longitude of the second location.
     * @param {number} alt2 - Altitude of the second location in Meters.
     * 
     * @returns {number} - The distance between the two coordinates in km.
     */
    function calculate3DDistance(lat1, lon1, alt1=0, lat2, lon2, alt2=0) {
        const r = 12742000; // 6371 * 2
        const toRadians = (degrees) => degrees * (Math.PI / 180);

        const dLat = Math.sin((toRadians(lat2) - toRadians(lat1)) / 2);
        const dLon = Math.sin((toRadians(lon2) - toRadians(lon1)) / 2);

        const a = dLat * dLat + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * dLon * dLon;
        const d = r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // m
            
        const distance = Math.sqrt( Math.pow(d, 2) + Math.pow(alt2 - alt1, 2) );
        
        return distance / 1000.0;
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
        if (bounds != null) meta += '<bounds minlat="'+ bounds.minlat +'" maxlat="'+ bounds.maxlat +'" minlon="'+ bounds.minlon +'" maxlon="'+ bounds.maxlon+'"/>';
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
                /*{
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
                },},*/
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

    function showGpxStatistics(dists, stats1, stats2) {
        // generate an array of x values for plotting with incrementing values
        let xval = [];
        for (let i = 0; i < dists.length; i++) {
            xval.push(i);
        }
        /*
        let xval = [];
        let start = dists[0];
        for (let i = 0; i < dists.length; i++) {
            start = dists[i] + xval[i-1] || 0;
            xval.push(start);
        }
        */
        let TESTER = document.getElementById('gpx_canvas4');
    
        plotly.newPlot( TESTER, 
            [{
                x: xval,
                y: stats1,
                type: 'scatter',
            },
            {
                x: xval,
                y: stats2,
                type: 'scatter',
            }],
            {
            xaxis: {title: "some"},
            yaxis: {title: "stats"},
            }
        );
    }

})(window, document);
