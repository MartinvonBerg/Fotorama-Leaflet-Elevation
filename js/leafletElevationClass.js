// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// start this class without leaflet elevation and inherit with leaflet from this class!
// only work with markers and controls in the first step.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

class LeafletElevation {
    // static attributes (fields)
    static count = 0; // counts the number of instances of this class.
    static pageVariables = null;
        
    // private attributes (fields)
    #isMobile = false;

    // public attributes (fields). These can be set / get by dot-notation.
    width = 0;

    /**
     * Constructor Function
     * @param {int} number current number
     * @param {string} elementOnPage id of the div on the page that shall contain the map
     */
    constructor(number, elementOnPage) {
        LeafletElevation.count++; // update the number of instances on construct.
        this.number = number; 
        this.elementOnPage = elementOnPage; 
        if (this.pageVariables == null) {
            this.pageVariables = new Array();
        }
        this.pageVariables = eval('wpfm_phpvars'+ number);
        this.#isMobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
       
        // object to handle event 'showend' and 'load'
        this.el = document.querySelector('#'+elementOnPage);

        // get js-variables from php-output
        // static set the language strings. same for all instances.

    }

    // // initiate and show the leaflet map in div
    

    // show the selected map

    // set map controls

    // create tracks and elecation chart

    // update track and elecation chart

    // change elevation chart on change of gpx-track

    // create markers

    // update marker

    // set bounds

    // update bounds

    // function for map resizing for responsive devices

    // --------------------------- Class API method definitions
    // TODO: what is the interface? Marker number or geo-data?
    // map.flyto is with coordinates. zoom is unchanged
    // set map to marker

    // trigger click on marker: marker.on('click', ....)

}