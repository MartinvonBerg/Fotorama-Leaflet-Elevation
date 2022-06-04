// Class for the fotorama Slider
// Fotorama depends on jQuery, so no need to replace jQuery with vanilla js.

class Slider {
    // static attributes (fields)
    static count = 0; // counts the number of instances of this class.
    static pageVariables = null;
    // static numberOfSlidersOnPage = 0; // currently unused
    
    // private attributes (fields)
    #fotoramaState = 'normal'; // for zooming
    #zoomeffect = 'mouseover'; // for: https://www.jacklmoore.com/zoom/
    #isMobile = false;
    #sliderClass = 'fotorama'; // the CSS-class that should be used
    //#prevSlide = 0; // for event testing only

    // public attributes (fields). These can be set / get by dot-notation.
    width = 0;
    newimages = null;
    olddata = null;
    sliderData = null;
    sliderDiv = null;

    /**
     * Constructor Function
     * @param {int} number current number
     * @param {string} elementOnPage id of the div on the page that shall contain the slider
     */
    constructor(number, elementOnPage) {
        Slider.count++; // update the number of instances on construct.
        this.number = number; 
        this.elementOnPage = elementOnPage; 
        if (this.pageVariables == null) {
            this.pageVariables = new Array();
        }
        this.pageVariables[number] = eval('wpfm_phpvars'+ number);
        this.#isMobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
        
        // object to handle event 'showend' and 'load'
        this.el = document.querySelector('#'+elementOnPage);
        
        //this.el.addEventListener('click', this); // calls handleEvent on click, for testing only
        
    }

    /**
     * Initialisation of Slider in given elementOnPage
     */
    defSlider() {
        //let $fotoramaDiv = $('#mfotorama' + m).fotorama();
        this.sliderDiv = jQuery('#'+this.elementOnPage).fotorama();

        // Get the API object.
        //fotorama[m] = $fotoramaDiv.data('fotorama');
        this.sliderData = this.sliderDiv.data(this.#sliderClass)

        // define the image data array for image replacement
        //let newimages = phpvars[m].imgdata;
        this.newimages = this.pageVariables[this.number].imgdata;

        //let olddata = fotorama[m].data;
        this.olddata = this.sliderData.data;

        // Define width for responsive devices
        //let width = $fotoramaDiv[0].parentElement.clientWidth;
        this.width = this.sliderDiv[0].parentElement.clientWidth;
        //if (mobile) {
        if (this.#isMobile) {
            let h = window.screen.height;
            let w = window.screen.width;
            //h > w ? width = h : width = w;
            h > w ? this.width = h : this.width = w;
        }
        //return { width, olddata, newimages };
        this.disableRightClick();
        this.listenEventShowend();
        this.listenEventSliderLoaded();
        this.handleZoomInFullscreen();
      
    }
   
    // Class API definitions
    /**
     * Set Slider to index
     * @param {int} index 
     */
    setSliderIndex(index) {
        this.sliderData.show(index);
    }

    /**
     * disable right click for this Slider. Meant to be needed for the zoom function, what is not correct.
     * @param {boolean} status infact it is to enable or disable. True means disable.
     */
    
    disableRightClick(status = true) {
        status = ! status
        jQuery('#'+this.elementOnPage).contextmenu( function() {return status;} );
    }

    /**
     * Update the caption in fotorama to convert '||' to html linebreaks <br>. What is required because
     * WordPress doesn't allow to write <br> in the string and Fotorama doesn't allow html in the caption.
     * @param {int} sliderNumber 
     * @param {int} newslide 
     */
    updateCaption(sliderNumber, newslide) {
        if ( this.pageVariables[sliderNumber].imgdata[newslide].jscaption != '') 
        {
            let text = this.pageVariables[sliderNumber].imgdata[newslide].jscaption ;
            text = text.replaceAll('||', '<br>');
            jQuery('#mfotorama' + sliderNumber +' .fotorama__caption__wrap').html(text);
        }
    }

    /**
     * set the link to the attachment in the info button. 
     * Currently no event is triggered that the info button was clicked as it is not required.
     * @param {int} sliderNumber 
     * @param {int} newslide 
     */
    setLinkForInfoButton(sliderNumber, newslide) {
        if ( this.pageVariables[sliderNumber].imgdata[newslide].permalink != '') {
            jQuery('#multifotobox' + sliderNumber + ' .fm-attach-link a').attr("href", this.pageVariables[sliderNumber].imgdata[newslide].permalink);
        }
    }

    // replace Image Data to srcset Data provided on page or in JS-variables

    /**
     * handle the zoom function in fullscreen mode. zoom current image. on fullscreen only.
     * Trigger fullscreen Event entry and exit is currently not implemented as it is not required.
     */
    handleZoomInFullscreen() {
        let classThis = this;
        jQuery('.fotorama').on('fotorama:fullscreenenter fotorama:fullscreenexit', 
        function (e) 
        {
            let nr = classThis.sliderData.activeFrame.i-1;
            let source = e.currentTarget.id;
            source = source.replace('mfotorama','');
            let m = parseInt(source);

            if (e.type === 'fotorama:fullscreenenter') {
                classThis.#fotoramaState = 'full';
                // Options for the fullscreen
                classThis.sliderData.setOptions({
                    fit: 'contain' 
                });
                // handle the zoom, see: https://www.jacklmoore.com/zoom/
                jQuery('#sf' + m + '-' + nr).zoom(
                    {//url: classThis.sliderData.data[nr].full,
                     on: classThis.#zoomeffect, //  Choose from mouseover, grab, click, or toggle. But only works with 'mouseover'.
                     touch: false
                     // magnify: 1 // This value is multiplied against the full size of the zoomed image. The default value is 1, meaning the zoomed image should be at 100% of its natural width and height
                     // duration: 120, // The fadeIn/fadeOut speed of the large image. Only fade-out is working.
                     // target: false, // A selector or DOM element that should be used as the parent container for the zoomed image.
                     // callback: false, // A function to be called when the image has loaded. Inside the function, `this` references the image element.
                     // onZoomIn: false, // A function to be called when the image has zoomed in. 'this' as above.
                     // onZoomOut: false // A function to be called when the image has zoomed out. 'this' as above.
                    }
                );

            } else {
                // Back to normal settings
                classThis.sliderData.setOptions({
                    fit: classThis.pageVariables[m].fit
                }); 
                classThis.#fotoramaState = 'normal';
                jQuery(window).trigger('resize');
              
                for (var fi = 0; fi < classThis.sliderData.data.length; fi++) {
                    jQuery('#sf' + m + '-' + fi).trigger('zoom.destroy');
                }
            }
        });
    }

    // --------------- Class Events ------------------------------------
    
    /**
     * Trigger Event that a new Image was finally loaded. Pass image index Number and Slider ID to event handler.
     * Call other functions that have to be run with that event.
     */
    listenEventShowend() {
        // create Event on fotorama showend
        let classThis = this;
        
        jQuery('#'+this.elementOnPage).on('fotorama:showend',
            function (e) 
            {   
                let nr = classThis.sliderData.activeFrame.i-1;
                let source = e.currentTarget.id;
                source = source.replace('mfotorama','');
                let m = parseInt(source);

                const changed = new CustomEvent('sliderchange', {
                    detail: {
                    name: 'sliderChange',
                    newslide: classThis.sliderData.activeFrame.i,
                    slider: m
                    }
                });
                if (e.type === 'fotorama:showend' && classThis.number == m) {
                    // set id in current active stage Frame
                    classThis.sliderData.activeFrame.$stageFrame[0].id = 's' + classThis.sliderData.activeFrame.$navThumbFrame[0].id;
                    //console.log('showend: ',m, ' to:', classThis.activeIndex)
                    classThis.el.dispatchEvent(changed);
                    classThis.updateCaption(m, classThis.sliderData.activeFrame.i-1);
                    classThis.setLinkForInfoButton(m, classThis.sliderData.activeFrame.i-1);
                    // handle the zoom if (fotoramaState == 'full' && ! mobile) {
                    // activate the zoom in fullscreen
                    if (classThis.#fotoramaState === 'full' && ! classThis.#isMobile) {
                        jQuery('#sf' + m + '-' + nr).zoom(
                            {//url: classThis.sliderData.data[nr].full,
                            on: classThis.#zoomeffect,
                            touch: false,
                        });
                    } else {
                        // destroy / deactivate zoom in normal-mode
                        jQuery('#sf' + m + '-' + nr).trigger('zoom.destroy');
                    }  
                
                    
                }
            }
        );
    }  

    /**
     * Trigger Event that first Image was finally loaded. Do this only once. Pass image index Number and Slider ID to event handler.
     * Call other functions that have to be run with that event.
     */
    listenEventSliderLoaded() {
        // create Event on fotorama load, only one
        let classThis = this;

        let ts =0; // define a timestamp to detect wether event was already triggered.
        jQuery('#'+this.elementOnPage).on('fotorama:load',
            function (e) 
            {   
                let nr = classThis.sliderData.activeFrame.i-1;
                let source = e.currentTarget.id;
                source = source.replace('mfotorama','');
                let m = parseInt(source);

                const loaded = new CustomEvent('sliderload', {
                    detail: {
                    name: 'sliderLoad',
                    newslide: classThis.sliderData.activeFrame.i,
                    slider: m
                    }
                });

                if (e.type === 'fotorama:load' && classThis.number == m) {
                    //console.log('showend: ',m, ' to:', classThis.activeIndex)
                    // trigger the event only once, so if ts was not set before.
                    if (ts == 0) {
                        classThis.el.dispatchEvent(loaded);
                        classThis.updateCaption(m, classThis.sliderData.activeFrame.i-1);
                        classThis.setLinkForInfoButton(m, classThis.sliderData.activeFrame.i-1);
                        // set the id for the fullscreen-zoom 
                        for (var fi = 0; fi < classThis.sliderData.data.length; fi++) {
                            classThis.sliderData.data[fi].$navThumbFrame[0].id = 'f' + m + '-' + fi;
                            if (classThis.sliderData.data[fi].$stageFrame != undefined) {
                                classThis.sliderData.data[fi].$stageFrame[0].id = 'sf' + m + '-' + fi
                            }
                        }
                    }
                    ts = e.timeStamp;
                }
            }
        );
    }
}