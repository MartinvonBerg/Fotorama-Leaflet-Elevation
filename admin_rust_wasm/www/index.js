import { parseGPX } from "@we-gold/gpxjs";
import simplify from "simplify-js";
import { createGpxHeader, createGpxMeta, createGpxTrack, createGpxFooter} from "./createGpxFileAsString";
import { calcdistance, calc3DDistance } from "./distance";
import { fromHTML} from "./fromHTML";


(function (window, document, undefined) {
    "use strict";

    const activeTab = document.querySelector(".nav-tab-active")?.innerHTML.includes("GPX") ?? false;
    if (!activeTab) {
        return;
    }

    let esm = 4.5;
    let esmStore = 4.5;
    let dsm = 0.025;
    let dsmStore = 0.025;
    let filter = 0.5;
    let filterStore = 0.5;
    let simplTol = 0.001;
    let simplTolStore = 0.001;
    let gpx_reduce = true;
    let fileLength = 0;
    let ignoreZeroElevs = true;
    let checksum = 0;
    let newFile = "";
    let fileSize = 0;
  
    let selectedRow = null;
    let allMaps = [];
    let bounds = null;
    let chart = 'chartjs'; //pageVarsForJs[0].charttype; statistics is not correct with elevation

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

    const simplsel = document.querySelector("#simplify_tolerance");
    const simplval = document.querySelector("#simplify_tolerance_val");
    const simplenable = document.querySelector("#simplify_tolerance_enable");

    const gpxReduceEnable = document.getElementById("gpx_reduce");
    const ignoreZeroElevsEnable = document.getElementById("gpx_ignore_zero_elev");

    const stats = {};
    
    /**
     * A description of the entire function.
     *
     * @param {string} str - the string to be hashed
     * @return {string} the hash value of the string
     */
    function hashCode(str) {
        // replaces: const hashCode = (str) => [...str].reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0)
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    let uploadPath = document.getElementById('wp-upload-path').innerText + '/';

    // form Data Event handler. This writes the filtered file to the server on click
    document.querySelector("form").addEventListener('formdata', (e) => {

        const formData = e.formData; 
        if ( newFile !== "" ) {
            formData.append('filteredFileContent', newFile);
        } else {
            formData.append('filteredFileContent', "");
        }
    });

    // define all Event listeners --------------------

    // show the clicked gpx-file from server. Use the complete path on server.
    if ( filesTable !== null ) {

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
            stats.fileName = clickedFile;
            clickedFile = uploadPath + clickedFile;
            
            // load the file to string stats.file_content. This is similar in all Event handlers.
            loadFileToString(clickedFile, 'filelist').then( () => {
                // do not filter the file. Show as saved on server 
                if ( stats.file_content !== null && checksum != 0) {
                    let gjson = stats.parsedFile.toGeoJSON();
                    //gjson = addInfoToGeoJSON(gjson, stats.parsedFile);
                    showGpxFileOnLeaflet(gjson);

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
            stats.fileName = clickedFile;
            clickedFile = uploadPath + clickedFile;

            // load the file to string stats.file_content. This is similar in all Event handlers. Do not filter
            loadFileToString(clickedFile, 'filelist').then( () => {
                // do not filter the file. Show as saved on server 
                if ( stats.file_content !== null && checksum != 0) {
                    let gjson = stats.parsedFile.toGeoJSON();
                    //gjson = addInfoToGeoJSON(gjson, stats.parsedFile);
                    showGpxFileOnLeaflet(gjson);

                    // show statistics as saved in file or calculated, Show hint not filtered. Show hint if no statsitics in file
                    parseGpxString(text1);
                }
            })
            
        })

    }

    // show the last saved gpx-file. Use the complete path on server.
    window.addEventListener('load', () => {

        let lastFileResult = document.getElementById('fm-gpx-file')?.innerText || "";
        
        if (lastFileResult == "" || lastFileResult == null) {
            return;
        } else {
            text1.innerHTML = "File: " + lastFileResult + "<br>Stats<br>N<br>N<br>N";
            stats.fileName = lastFileResult;
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

        if ( chart == 'ele' ) {
            try {
                document.getElementById('chartjs-profile-container0').remove();
            } catch (error) {
                console.log(error);
            }
        };
    }) 

    // show the selected file. Use the preloaded content from the fakepath as xml-string
    input.addEventListener("change", () => { 
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
                    // filter the file and return as xml-string to global variable newFile and show other results like statistics after filtering
                    [newFile, text1.innerHTML] = filterGPXTrack(stats.file_content, input.files[0].name);
                    if( newFile === null ) {
                        alert("Error loading File")
                        return;
                    }

                    // show filtered file
                    showGpxFileOnLeaflet();
                }
            })
        }
        
    })

    // ---------- listeners for filter Value inputs
    /*
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
            filter = 100.0;
        }
        filtval.innerHTML = filter;
        // filter the file and return as xml-string to global variable newFile
        filterEventListener();
    })

    simplsel.addEventListener("input", () => { // update the selected file. Use the preloaded content from the fakepath as xml-string
        simplTol = simplsel.value;
        simplTolStore = parseFloat(simplTol);

        if (simplenable.checked) {
            simplTol = simplTolStore;
        } else {
            simplTol = 0.0;
        }
        simplval.innerHTML = simplTol;
        // filter the file and return as xml-string to global variable newFile
        filterEventListener();
    })
    */
    // Generic function to handle input events
    function handleInputEvent(selector, valueMultiplier, defaultValue, valueElement, enableCheckbox, storeVariable, globalVariableName) {
        selector.addEventListener("input", () => {
            let value = selector.value;
            if (valueMultiplier !== undefined) {
                value = value / valueMultiplier;
            }
            window[storeVariable] = value;

            if (enableCheckbox.checked) {
                window[globalVariableName] = window[storeVariable];
            } else {
                window[globalVariableName] = defaultValue;
            }
            valueElement.innerHTML = (valueMultiplier ? window[globalVariableName] * valueMultiplier : window[globalVariableName]) + " m";

            // filter the file and return as xml-string to global variable newFile
            filterEventListener();
        });
    }

    // Apply the generic function for each element
    handleInputEvent(esmsel, undefined,   0.0, esmval, esmenable, "esmStore", "esm");
    handleInputEvent(dsmsel, 1000,        0.0, dsmval, dsmenable, "dsmStore", "dsm");
    handleInputEvent(filtsel, undefined,  100.0, filtval, filterenable, "filterStore", "filter");
    handleInputEvent(simplsel, undefined, 0.0, simplval, simplenable, "simplTolStore", "simplTol");
    
    // ---------- listeners for esm, dsm, filter, simplTol enable inputs
    function handleEnableClick(storedValue, enableCheckbox, globalValue) {
        enableCheckbox.addEventListener("input", () => {
            globalValue = enableCheckbox.checked ? storedValue : globalValue; // functional change
            filterEventListener();
        });
    }
    handleEnableClick(esmStore, esmenable, esm);
    handleEnableClick(dsmStore, dsmenable, dsm);
    handleEnableClick(filterStore, filterenable, filter);
    handleEnableClick(simplTolStore, simplenable, simplTol);
    
    // ---------- listeners for reduce, ignoreZeroElevs inputs
    gpxReduceEnable.addEventListener("input", () => { // update the selected file. Use the preloaded content from the fakepath as xml-string
        gpx_reduce = gpxReduceEnable.checked;
        // filter the file and return as xml-string to global variable newFile
        filterEventListener();
    })

    ignoreZeroElevsEnable.addEventListener("input", () => { // update the selected file. Use the preloaded content from the fakepath as xml-string
        ignoreZeroElevs = ignoreZeroElevsEnable.checked;
        // filter the file and return as xml-string to global variable newFile
        filterEventListener();
    })

    function filterEventListener() {
        
        if (newFile === "") {
            text1.innerHTML = "No file selected";
            return;
        }
        // filter the file and return as xml-string to global variable newFile and show other results like statistics after filtering
        [newFile, text1.innerHTML] = filterGPXTrack(stats.file_content, stats.fileName);

        if( newFile === null ) {return;}

        // store the old bounds, if any
        if (bounds !== null) {
            bounds = allMaps[0].map.getBounds();
        }

        // show filtered file
        showGpxFileOnLeaflet();
    }
    // End: define all Event listeners --------------------
    
    // add inline CSS to make the page scrollable and to stop scrolling when overlay is visible
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
     * @global {string} stats.file_content - The content of the file as string in an object
     * @global {string} newFile - The content of the file as string equaly to stats.file_content
     * @global {number} fileLength - The length of the file
     * @global {number} checksum - The checksum of the file
     * @global {string} stats.fileName - The name of the file
     * @global {number} bounds - the bounds of the track for the map view
     * @global {number} fileSize - The size of the file
     * @global {object} stats.parsedFile - The parsed file as an object, parsed by parseGPX
     * @global {object} stats.parseError - The parse error as an object, parsed by parseGPX
     * 
     * @return {boolean} Returns true if the file is successfully loaded to a string, else false.
     */
    async function loadFileToString(filePath='', triggerorigin='none') {

        if (filePath === '' || filePath == null || triggerorigin == 'none' || triggerorigin == '') {
            return false;

        } else if ( (checksum == 0 || stats.file_content == null) && (triggerorigin == 'filelist' || triggerorigin == 'onload') ) {
            // load the file to string and set the global variable for the file content
            newFile = await fetch(filePath).then(response => response.text());
            // get filename from the filePath
            stats.fileName = filePath.split('\\').pop().split('/').pop();

        } else if ( (checksum == 0 || stats.file_content == null) && triggerorigin == 'input') {
            // load the file to string and set the global variable for the file content
            const file = input.files[0];
            stats.fileName = input.files[0].name;
            newFile = await file.text();

        } else {
            return false;
        }

        // set the global variables
        bounds = null;
        stats.file_content = newFile;
        fileLength = newFile.length;
        fileSize = new Blob([newFile]).size / 1024;
        checksum = hashCode(newFile);

        // parse the file now
        [stats.parsedFile, stats.parseError] = parseGPX(newFile);

        return true;
    }

    /**
     * Parses the GPX string and returns the parsed file or an error if there was one.
     * 
     * @global {string} newFile - The content of the file as string equaly to stats.file_content or filtered result
     * @global {number} fileSize - The length of the file
     *
     * @return {null | {object}} An object containing the parsed file or null on error.
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
        // do not parse again. This only called after loading a new file.
        let parsedFile, error;
        if (fileSize > 0) {
            // file unchanged;
            parsedFile = stats.parsedFile;
            error = stats.error;
        } else {
            [parsedFile, error] = parseGPX(newFile);
        }
        if (!error) { error = checkParsedFile(parsedFile); }

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

            NWayPts += parsedFile.waypoints.length;
            
            if (NTrkPts + NRtePts == 0) { error = new Error("No points found in GPX file"); }
        }

        if (error) {
            element.innerHTML = "Error parsing loaded GPXFile as XML: " + error;
            return null;
        } else {
            fileName = getFileName(element.innerHTML); 
            if (!parsedFile.metadata.name) {parsedFile.metadata.name = fileName};
            element.innerHTML = generateFileInfoHtml(parsedFile, NTrkPts, NRtePts, NWayPts, fileName, fileSize);
            return parsedFile;
        }
    }

    /**
     * Checks if a parsed GPX file has any points.
     * 
     * @param {object} parsedFile - The parsed GPX file as an object.
     * 
     * @returns {boolean} true if the parsed file has no points, false else.
     */
    function checkParsedFile(parsedFile) {
        if (parsedFile == null) {
            return true;
        } 

        let count = 0;

        parsedFile.tracks.forEach(element => {
            count += element.points.length;
        });

        parsedFile.routes.forEach(element => {
            count += element.points.length;
        });

        return count == 0;
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
     * @global {string} newFile - The content of the file as string equaly to stats.file_content or filtered result
     * @global {string} pageVarsForJs[0]['tracks']['track_0']['url'] : The path to the GPX file to display or the content of file as xml formatted string.
     * @global {object} allMaps[0] : The Leaflet map object.
     * @global {string} chart: The setting which chart to display.
     * @global {object} document : The document object.
     * 
     * @return {void} This function does not return a value.
     */
    function showGpxFileOnLeaflet(file=null) {

        // set the single file
        if (file == null) {
            // store the filtered track as XML-string to the global variable.
            pageVarsForJs[0]['tracks']['track_0']['url'] = newFile;
        } else {
            pageVarsForJs[0]['tracks']['track_0']['url'] = file;
        }

        // reset the leaflet and chart divs in dom
        if ( allMaps[0] != 'undefined' && ( allMaps[0] != null ) ) {
            try {
                allMaps[0].map.remove(); // leaflet map
                allMaps[0].map.off();
                allMaps[0].map.invalidateSize();
                const map0Element = fromHTML('<div id="map0" class="leafmap" style="max-height:400px;aspect-ratio:1.5"></div>');
                let boxmap = document.getElementById('boxmap0');
                boxmap.removeChild(boxmap.children[0]);
                boxmap.insertBefore( map0Element, boxmap.firstChild)
            } catch (error) {
                console.log(error);
            }

            if ( chart == 'ele' ) {
                try {
                    document.getElementById('chartjs-profile-container0').remove();
                } catch (error) {
                    console.log(error);
                }
            }
            
            try {
                if (chart == 'chartjs') {
                    allMaps[0].chart.chart.destroy(); // chartjs
                    // rework for not understood behaviour of destroy funtion on canvas
                    allMaps[0].chart.elementOnPage.width = allMaps[0].chart.elementOnPage.clientWidth;
                } else {
                    allMaps[0].controlElevation.clear()
                    let all = document.querySelectorAll("[id^='elevation-']");
                    all.forEach(element => {
                        element.remove();
                    });
                }
                
            } catch (error) {
                console.log(error);
            }
            
        }

        // load the leaflet map and height chart
        if (chart == 'chartjs') {
            import(/* webpackChunkName: "leaflet_chartjs" */'../../js/leafletChartJs/leafletChartJsClass.js').then( (LeafletChartJs) => {
                allMaps[0] = [];
                LeafletChartJs.LeafletChartJs.count = 0;
                LeafletChartJs.LeafletChartJs.numberOfMaps = null;
                allMaps[0] = new LeafletChartJs.LeafletChartJs(0, 'boxmap' + 0, false);
                if (bounds != null && bounds.isValid()) { allMaps[0].map.fitBounds(bounds); }
                bounds = allMaps[0].map.getBounds();
            })
        } else {
            import(/* webpackChunkName: "elevation-admin" */'../../js/elevationClass.js').then( (LeafletElevation) => {
                allMaps[0] = [];
                LeafletElevation.LeafletElevation.count = 0;
                LeafletElevation.LeafletElevation.numberOfMaps = null;
                allMaps[0] = new LeafletElevation.LeafletElevation(0, 'boxmap' + 0 );  
                if (bounds != null && bounds.isValid()) { allMaps[0].map.fitBounds(bounds); }
                bounds = allMaps[0].map.getBounds();          
            });
        }
    }

    /**
     * Filters a GPX track based on elevation, distance, and speed criteria, and returns a new GPX file content string.
     * If the track reduction option is enabled, it combines tracks and routes into a single track, skips waypoints,
     * and applies speed, distance, and elevation filters. Also applies simplification if tolerance is set.
     * 
     * @param {string} fileContent - The content of the GPX file as a string.
     * @param {string|null} [fileName=null] - The name of the file, used if metadata name is missing.
     * 
     * @returns {[string, string]} The filtered GPX file content as a string, or the original content on error AND the innerHTML to show in text1.
     * 
     * ---------- The following global variables are used but not changed by this function:
     * @global {object} stats - Object to store data and statistics about the GPX file.
     * @global {number} fileSize - The length of the file in kilobytes.
     * 
     * @global {boolean} gpx_reduce - Flag indicating whether to reduce GPX tracks.
     * @global {boolean} ignoreZeroElevs - Flag indicating whether to ignore points with zero elevation.
     * @global {number} filter - The filter value for speed and distance calculation.
     * @global {boolean} filterenable.checked - Flag indicating whether filtering is enabled.
     * @global {number} esm - Elevation smoothing parameter.
     * @global {number} dsm - Distance smoothing parameter.
     * @global {number} simplTol - Tolerance for the simplification algorithm.
     * 
     * ---------- The following global functions are used by this function:
     * @global {function} getCurrentFilterSettings - Function to get current filter settings.
     * @global {function} parseGPX - Function to parse GPX content.
     * @global {function} checkParsedFile - Function to check if the parsed file is valid.
     * @global {function} getPointsFromTrack - Function to get points from a track.
     * @global {function} filterTrack - Function to filter a track based on elevation and speed.
     * @global {function} simplifyTrack - Function to simplify a track.
     * @global {function} calcTrackStats - Function to calculate statistics for a track.
     * @global {function} generateFileInfoHtml - Function to generate HTML for file information.
     * @global {function} createGpxFileAsString - Function to create a GPX file string from components.
     */
    function filterGPXTrack(fileContent, fileName=null) {
        let info = '';
        let newFileContent = '';
        let innerHTML = '';

        // speed
        let sumOrigSpeedH = 0;
        let sumOrigSpeed3D = 0;

        // set all global arrays to empty
        let elevs = [];
        let dists = [];
        let lats = [];
        let lons = [];
        let origelevs = [];
        let origdists = [];
        let origlats = [];
        let origlons = [];
        let origSpeedH = [];
        let origSpeed3D = [];
        
        getCurrentFilterSettings();

        // parse the GPX file as stored in global variable newfile
        let parsedFile, error;
        
        if (fileContent.length === fileLength) {
            // file unchanged;
            parsedFile = stats.parsedFile;
            error = stats.error;
        } else {
            [parsedFile, error] = parseGPX(fileContent);
        }
        if (!error) { error = checkParsedFile(parsedFile); }

        if (error) {
            innerHTML = "Error parsing loaded GPXFile as XML: " + error;
            return [fileContent, innerHTML];

        // parse and combine tracks and routes to one track if gpx_reduce is checked. Skip the Waypoints.
        } else if (gpx_reduce) {
            let sumEleLength = 0;
            let gpxFileString = '';
            let sumDist=0, sumAsc=0, sumDes = 0;
            let sumBounds = [];
            let newBounds = [];

            parsedFile.tracks.forEach(track => {
                
                // remove points with zero elevation and calc speed values
                [origelevs, origdists, origlats, origlons, origSpeedH, origSpeed3D, sumOrigSpeedH, sumOrigSpeed3D ] = getPointsFromTrack(track, ignoreZeroElevs);
                            
                // filter the original data and  write also to elevs, dists, lats, lon
                [elevs, dists, lats, lons, newBounds ] = filterTrack(origSpeedH, origSpeed3D, origelevs, origdists, origlats, origlons, filterenable.checked, filter, sumOrigSpeed3D);
                
                sumBounds = updateBounds(sumBounds, newBounds);

                // apply simplify.js on the track points
                [lats, lons, elevs] = simplifyTrack(lats, lons, elevs, simplTol);
                
                // calc new stats and info and generate the info string with the stats for the file
                [elevs, dists, lats, lons, info] = calcTrackStats(elevs, dists, lats, lons, esm, dsm, true);
                
                let [a,b,c] = parseInfo(info);
                sumDist += a;
                sumAsc += b;
                sumDes += c;
                sumEleLength += elevs.length; 

                // create new file content with the filtered points and info as XML string.
                let type = track.type ? track.type : '';
                gpxFileString += createGpxTrack( track.name, type, lats, lons, elevs, info );
                
            });
                        
            // generate the updated statistics for the Admin Panel. Estimate the size from the number of points in the track, where 509 is the offset for the header and 65 is the size of a point.
            if (!parsedFile.metadata.name && fileName) { parsedFile.metadata.name = fileName; }
            innerHTML = generateFileInfoHtml(parsedFile, sumEleLength, 0, 0, parsedFile.metadata.name, (509 + sumEleLength*65)/1024 );
            info =  `Dist: ${(sumDist).toFixed(1)} km, ` + `Gain: ${sumAsc.toFixed(0)} Hm, ` + `Loss: ${sumDes.toFixed(0)} Hm`;
            newFileContent = createGpxHeader() + createGpxMeta( parsedFile.metadata.name, info, parsedFile.metadata.time, sumBounds, parsedFile.waypoints) + gpxFileString + createGpxFooter();
    
            return [newFileContent, innerHTML]; 

        // else : return the original file with html for file info
        } else {
            // provide correct name for leaflet layers control top right in ._info.name is not solved here because it is wrong in Garmin GPX files. So, not a problem of this function.
            //innerHTML = "<strong>File: " + parsedFile.metadata.name + "</strong>" + " / Size: " + fileSize.toFixed(1) + " kB" + "<br>Stats in File: No Stats generated"; 
            innerHTML = generateFileInfoHtml(parsedFile, 0, 0, 0, parsedFile.metadata.name, fileSize );
            return [fileContent, innerHTML];
        }
    }

    /* ----------------- sub functions for filterGPXTrack ----------------- */
    /**
     * Processes an array of track objects and calculates various metrics for each track.
     *
     * @param {Array} tracks - An array of track objects, each containing an array of points with latitude, longitude, and elevation data.
     *  - Each track object should have the following structure:
     *      - `tracks[i].points`: An array of objects, each representing a point with latitude, longitude, and elevation data.
     *          - `tracks[i].points[i].latitude`: Latitude of the point as number.
     *          - `tracks[i].points[i].longitude`: Longitude of the point as number.
     *          - `tracks[i].points[i].elevation`: Elevation of the point as number.
     *          Unused: - `tracks[i].points[i].time`: Recording Time of the point as JS Date object
     * 
     * @param {boolean} ignoreZeroElevs - A boolean indicating whether to ignore points with zero elevation.
     *
     * @returns {Array} An array containing:
     *  - {Array} origelevs: Original elevations of the points.
     *  - {Array} origlats: Original latitudes of the points.
     *  - {Array} origlons: Original longitudes of the points.
     *  - {Array} origdists: Distances between consecutive points in meters.
     *  - {Array} origSpeedH: Horizontal speed values calculated from elevation changes.
     *  - {Array} origSpeed3D: 3D speed values calculated from distances between points.
     *  - {number} sumOrigSpeedH: Sum of horizontal speed values used for filtering.
     *  - {number} sumOrigSpeed3D: Sum of 3D speed values used for filtering.
     */
    function getPointsFromTrack(element, ignoreZeroElevs) {
        let origelevs = [];
        let origlats = [];
        let origlons = [];
        let origdists = [];
        let origSpeedH = [];
        let origSpeed3D = [];
        let sumOrigSpeedH = 0;
        let sumOrigSpeed3D = 0;
        let lastConsideredElevation = 0;
        let lastConsideredPoint = [0, 0];
        
        lastConsideredElevation = element.points[0].elevation;
        lastConsideredPoint = [element.points[0].latitude, element.points[0].longitude];

        element.points.forEach(point => {
            // ignore / skip points with zero elevation and go to next point
            if (!('elevation' in point) || (ignoreZeroElevs && (Math.abs(point.elevation) < 0.01))) {
                return; // is practically the same as continue
            }

            let curPoint = [point.latitude, point.longitude];
            let curDist = 1000 * calcdistance(lastConsideredPoint[0], lastConsideredPoint[1], curPoint[0], curPoint[1]);
            let curDist3D = 1000 * calc3DDistance(lastConsideredPoint[0], lastConsideredPoint[1], lastConsideredElevation, curPoint[0], curPoint[1], point.elevation);

            // save the original values
            origelevs.push(point.elevation);
            origlats.push(point.latitude);
            origlons.push(point.longitude);
            origdists.push(curDist);
            //origtdelta.push(tDelta);

            let SpeedH = Math.abs(point.elevation - lastConsideredElevation); // /tDelta ? Math.abs(point.elevation - lastConsideredEleStats)/tDelta : 0.0;
            origSpeedH.push(SpeedH);
            sumOrigSpeedH += SpeedH;

            let Speed3D = curDist3D; // /tDelta ? curDist3D/tDelta : 0.0;
            origSpeed3D.push(Speed3D);
            sumOrigSpeed3D += Speed3D;

            lastConsideredElevation = point.elevation;
            lastConsideredPoint = curPoint;
            //lastConsideredTime = point.time;
        });
    
        return [
            origelevs,
            origdists,
            origlats,
            origlons,
            origSpeedH,
            origSpeed3D,
            sumOrigSpeedH,
            sumOrigSpeed3D
        ];
    }

    /**
     * Simplify a track by removing points that are closer than a specified tolerance to the straight line between two adjacent points.
     * 
     * @param {number[]} lats - Array of latitude values of the track points.
     * @param {number[]} lons - Array of longitude values of the track points.
     * @param {number[]} elevs - Array of elevation values of the track points.
     * @param {number} simplTol - The tolerance for simplification. Points closer than this to the line segment between two adjacent points will be removed.
     * 
     * @returns {[number[], number[], number[]]} lats, lons, elevs simplified array containing the simplified latitude, longitude, and elevation values, respectively.
     */
    function simplifyTrack(lats, lons, elevs, simplTol) {
        if ( simplTol <= 0 ) {
            return [lats, lons, elevs];
        }

        if (lats.length !== lons.length || lats.length !== elevs.length) {
            return  [lats, lons, elevs];
        }

        const points = lats.map((lat, i) => ({ x: lat, y: lons[i], z: elevs[i] }));
        const simplifiedPoints = simplify(points, simplTol / 100, true);
        
        return [lats, lons, elevs] = simplifiedPoints.reduce((acc, point) => {
            acc[0].push(point.x);
            acc[1].push(point.y);
            acc[2].push(point.z);
            return acc;
        }, [[], [], []]);
    }

    /**
     * Calculates track statistics, including cumulative distance, elevation gain, and elevation loss.
     *
     * @global
     * @param {Array<number>} elevs - An array of elevation values.
     * @param {Array<number>} dists - An array of distance values.
     * @param {Array<number>} lats - An array of latitude values.
     * @param {Array<number>} lons - An array of longitude values.
     * @param {number} [eleSmoothing=1] - The smoothing factor for elevation values.
     * @param {number} [distSmoothing=1] - The smoothing factor for distance values.
     * @param {boolean} [reduceArrays=false] - Whether to reduce the input arrays by removing points with minimal elevation or distance changes.
     * @returns {Array<string|Array<number>>} An array containing the track statistics as a string, and the filtered elevation, distance, latitude, and longitude arrays.
     * @uses calcdistance - A global function to calculate the distance between two points.
     */
    function calcTrackStats(elevs, dists, lats, lons, eleSmoothing = 1, distSmoothing = 1, reduceArrays = false) {
    
        // Handle empty input
        if (elevs.length === 0 || lats.length === 0 || lons.length === 0 || elevs.length !== lats.length || elevs.length !== lons.length) {
            return '';
        }

        let points = {
            elevs: elevs, // elevs
            dists: dists, // dists
            lats: lats, // lats,
            lons: lons // lons
        }

        // Initialize statistics
        let cumulativeDistance=0;
        let cumulativeElevationGain=0;
        let cumulativeElevationLoss=0;
        let lastElevation=elevs[0];
        let lastPoint = [lats[0], lons[0]];
    
        // Process all points
        const processPoint = (point, idx) => {
            // Get current elevation
            const currentElevation = Array.isArray(points) ?
                (point.meta?.ele ?? point.elevation) :
                point;
    
            // Calculate distance
            const currentPoint = Array.isArray(points) ?
                [point.lat ?? point.latitude, point.lng ?? point.longitude] :
                [points.lats[idx], points.lons[idx]];
    
            const distance = 1000 * calc3DDistance(lastPoint[0], lastPoint[1], lastElevation, currentPoint[0], currentPoint[1], currentElevation);
    
            if (Math.abs(distance) > distSmoothing) {
                cumulativeDistance += distance;
                lastPoint = currentPoint;
            } else if (reduceArrays) {
                // If reducing arrays, remove the current point
                points.elevs.splice(idx, 1);
                points.dists.splice(idx, 1);
                points.lats.splice(idx, 1);
                points.lons.splice(idx, 1);
            }

            // Calculate elevation changes
            if (typeof currentElevation === 'number') {
                const elevationDelta = currentElevation - lastElevation;
                
                if (Math.abs(elevationDelta) > eleSmoothing) {
                    if (elevationDelta > 0) {
                        cumulativeElevationGain += elevationDelta;
                    } else {
                        cumulativeElevationLoss -= elevationDelta;
                    }
                    lastElevation = currentElevation;
                }
            }
        };
    
        // Process points based on input type
        if (Array.isArray(points)) {
            points.forEach(processPoint);
        } else {
            for (let i = 0; i < points.elevs.length; i++) {
                processPoint(points.elevs[i], i);
            }
        }
    
        // Format output string
        let info =  `Dist: ${(cumulativeDistance/1000).toFixed(1)} km, ` +
                    `Gain: ${cumulativeElevationGain.toFixed(0)} Hm, ` +
                    `Loss: ${cumulativeElevationLoss.toFixed(0)} Hm`;
    
        return [points.elevs, points.dists, points.lats, points.lons, info];
    }

    /**
     * Filters track points based on speed and distance criteria and returns the filtered data.
     * If the `statfilter` is enabled, it removes points where both the horizontal speed and 3D speed
     * are below their respective mean values calculated with the provided `filter` factor.
     * 
     * @param {Array<number>} origSpeedH - Array of original horizontal speed values.
     * @param {Array<number>} origSpeed3D - Array of original 3D speed values.
     * @param {Array<number>} origelevs - Array of original elevation values.
     * @param {Array<number>} origdists - Array of original distances between points.
     * @param {Array<number>} origlats - Array of original latitude values.
     * @param {Array<number>} origlons - Array of original longitude values.
     * @param {boolean} statfilter - Flag indicating whether to apply statistical filtering.
     * @param {number} filter - Filter factor used for calculating mean speed values.
     * @param {number} sumOrigSpeed3D - Sum of the original 3D speed values for filtering.
     * 
     * @returns {Array} An array containing:
     *  - {Array<number>} elevs: Filtered elevation values.
     *  - {Array<number>} dists: Filtered distance values.
     *  - {Array<number>} lats: Filtered latitude values.
     *  - {Array<number>} lons: Filtered longitude values.
     *  - {Object} bounds: Geographic bounds of the filtered track with properties `minlat`, `minlon`, `maxlat`, `maxlon`.
     */
    function filterTrack(origSpeedH, origSpeed3D, origelevs, origdists, origlats, origlons, statfilter, filter, sumOrigSpeed3D) {
        // remove the elements in the arrays: newSpdH and newDst3D that are greater than meanSpeedH and meanDist3D if the filter is enabled
        let newSpdH = [];
        let newDst3D = [];
        let elevs = [];
        let dists = [];
        let lats = [];
        let lons = [];
        let removedPoints = [];
        let minlat = 180;
        let maxlat = -180;
        let minlon = 180;
        let maxlon = -180;
        let origLength = origSpeedH.length;
        let meanSpeedH = filter * sumOrigSpeed3D / origSpeedH.length; //*mean(origSpeedH); 
        let meanDist3D = filter * sumOrigSpeed3D / origSpeed3D.length; //*mean(origSpeed3D); // best is 3
    
        outerLoop: for (let i = 0; i < origLength; i++) {
            if (statfilter && (origSpeedH[i] < meanSpeedH) && (origSpeed3D[i] < meanDist3D)) {
                
                let lastRemovedPoint = removedPoints[removedPoints.length - 1];
                if (i - 1 == lastRemovedPoint) {
                    
                    for (let k = i; k < lastRemovedPoint + 10; k++) {
                        if (origSpeedH[k] >= meanSpeedH || origSpeed3D[k] >= meanDist3D) {
                            i = k;
                            continue outerLoop;
                        }
                    }
                }

                newSpdH.push(origSpeedH[i]);
                newDst3D.push(origSpeed3D[i]);
                elevs.push( origelevs[i]);
                dists.push( origdists[i]);
                lats.push ( origlats[i]);
                lons.push ( origlons[i]);
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

            } else if ( !statfilter ) {
                newSpdH.push(origSpeedH[i]);
                newDst3D.push(origSpeed3D[i]);
                elevs.push( origelevs[i]);
                dists.push( origdists[i]);
                lats.push ( origlats[i]);
                lons.push ( origlons[i]);
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
            } else if ( statfilter ) {
                // store the removed points in an array
                removedPoints.push(i);
            }
        }

        let bounds = {
            minlat: minlat,
            minlon: minlon,
            maxlat: maxlat,
            maxlon: maxlon
        };
    
        return [ elevs, dists, lats, lons, bounds ];
    }

    /**
     * Updates the old bounds object with the new bounds information.
     * 
     * This function takes two bounds objects and updates the old bounds object with the new bounds information.
     * If the old bounds object is empty, it is replaced by the new bounds object.
     * 
     * @param {Array} oldBounds - The old bounds object with properties minlat, minlon, maxlat, maxlon.
     * @param {Array} newBounds - The new bounds object with properties minlat, minlon, maxlat, maxlon.
     * 
     * @returns {Array} The updated old bounds object.
     */
    function updateBounds(oldBounds, newBounds) {
        if (!oldBounds || oldBounds.length === 0) {
            return newBounds;
        }

        if (newBounds.minlat < oldBounds.minlat) {
            oldBounds.minlat = newBounds.minlat;
        }
        if (newBounds.minlon < oldBounds.minlon) {
            oldBounds.minlon = newBounds.minlon;
        }
        if (newBounds.maxlat > oldBounds.maxlat) {
            oldBounds.maxlat = newBounds.maxlat;
        }
        if (newBounds.maxlon > oldBounds.maxlon) {
            oldBounds.maxlon = newBounds.maxlon;
        }
        return oldBounds;
    }

    /**
     * Parses a string containing only numbers and returns an array of floats.
     * 
     * @param {string} str - The string to parse.
     * 
     * @returns {Array<number>} An array of floats parsed from the string.
     */
    function parseInfo(str) {
        const numbers = str.match(/\d+\.?\d*/g);
        return numbers.map(num => parseFloat(num));
    }
    
    /**
     * Generate a string with information about the GPX file.
     * 
     * @param {Object} parsedFile - The parsed GPX file object.
     * @param {number} NTrkPts - The number of track points.
     * @param {number} NRtePts - The number of route points.
     * @param {number} NWayPts - The number of waypoint points.
     * @param {string} fileName - The name of the file.
     * @param {number} fileSize - The size of the file in bytes.
     * 
     * @returns {string} The information string.
     */
    function generateFileInfoHtml(parsedFile, NTrkPts, NRtePts, NWayPts, fileName, fileSize) {

        if (NTrkPts == 0) {
            parsedFile.tracks.forEach(element => {
                NTrkPts += element.points.length;
            });
        }

        if (NRtePts == 0) {
            parsedFile.routes.forEach(element => {
                NRtePts += element.points.length;
            });
        }

        if (NWayPts == 0) {
            NWayPts += parsedFile.waypoints.length;
        }

        return "<strong>File: " + fileName + "</strong>" + " / Size: " + fileSize.toFixed(1) + " kB"
            + "<br>Stats in File: " + parsedFile.metadata.description
            + "<br>N Tracks: " + parsedFile.tracks.length + " / with N Points: " + NTrkPts
            + "<br>N Routes: " + parsedFile.routes.length + " / with N Points: " + NRtePts
            + "<br>N Waypoints: " + NWayPts;
    }

    /**
     * Retrieves the current filter settings from the UI and updates the `pageVarsForJs` object.
     * 
     * @global {object} pageVarsForJs[0]['tracks']['track_0']['info'] 
     * @global {object} pageVarsForJs[0]['sw_options']['gpx_distsmooth' / 'gpx_elesmooth']
     * @global {boolean} gpx_reduce
     * @global {boolean} ignoreZeroElevs
     * @global {number} dsm
     * @global {number} esm
     * @global {number} filter
     * @global {number} simplTol
     * @global {object} dsmsel
     * @global {object} dsmenable
     * @global {object} esmsel
     * @global {object} esmenable
     * @global {object} filtsel
     * @global {object} filterenable
     * @global {object} simplsel
     * @global {object} simplenable
     *
     * @return {void}
     */
    function getCurrentFilterSettings() {
        gpx_reduce = gpxReduceEnable.checked;
        ignoreZeroElevs = ignoreZeroElevsEnable.checked;
        
        if (gpx_reduce) {
            // get the filter values
            dsm = parseInt( dsmsel.value );
            if ( ! dsmenable.checked) dsm = 0.0;
            pageVarsForJs[0]['sw_options']['gpx_distsmooth'] = dsm;
            
            esm = parseFloat( esmsel.value );
            if ( ! esmenable.checked) esm = 0.0;
            pageVarsForJs[0]['sw_options']['gpx_elesmooth'] = esm;

            filter = parseFloat( filtsel.value );
            if ( ! filterenable.checked) filter = 100.0;
            //pageVarsForJs[0]['tracks']['track_0']['info']['filter'] = filter;

            simplTol = parseFloat( simplsel.value );
            if ( ! simplenable.checked) simplTol = 0.0;
            //pageVarsForJs[0]['tracks']['track_0']['info']['simplTol'] = simplTol;
        } else {
            // reset the filter values
            pageVarsForJs[0]['sw_options']['gpx_distsmooth'] = 0.0;
            dsm = 0.0;
            pageVarsForJs[0]['sw_options']['gpx_elesmooth'] = 0.0;
            esm = 0.0;
            filter = 100.0;
            simplTol = 0.0;
        }
    }

})(window, document);