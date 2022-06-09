// Class for the fotorama Slider
// Fotorama and the Zoom-function depend on jQuery, so no need to replace jQuery with vanilla js.
// Note on fotorama options and input-image-data: the fotorama options are defined in the html. And the image data is given by html.
// Notes on REACT: ----------------------------
// TODO: before adopting to react this class should be transferred to Typescript.
// TODO: the minifier does not work with private methods.
// TODO: install and use eslint up to the latest coding standards
// A React Component would receive the fotorama options as props and image-data as a js-array. 
// Here the js-array would be received by a server side render to have a dynamic react component. The SSR would be the PHP 'readImageFolder'.
// The React component would then generate the html including the given options which would be then parsed by fotorama afterwards.
// Sounds easy but the event handling via the Class-API (setslider, trigger Events SliderLoad and sliderChange) should be transferred to react hooks e.g. state.
// finally this Slider-Class should be exported with 'export default Slider' and import Slider from './fotoramaClass.js'

class SliderFotorama {
    // static attributes (fields)
    static count = 0; // counts the number of instances of this class.
    static pageVariables = null;
    // static numberOfSlidersOnPage = 0; // currently unused
    
    // private attributes (fields)
    #fotoramaState = 'normal'; // internal state variable for zooming
    #zoomeffect = 'mouseover'; // for: https://www.jacklmoore.com/zoom/
    #isMobile = false;
    #normalZoom = ''

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
        SliderFotorama.count++; // update the number of instances on construct.
        this.number = number; 
        this.elementOnPage = elementOnPage; 
        if (this.pageVariables === null) {
            this.pageVariables = [];
        }
        this.pageVariables = pageVarsForJs[number];
        this.#isMobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
        this.#normalZoom = this.pageVariables.fit;

        // object to handle event 'showend' and 'load'
        this.el = document.querySelector('#'+elementOnPage);
    }

    /**
     * Initialisation of Slider in given elementOnPage
     */
    defSlider() {
        this.sliderDiv = jQuery('#'+this.elementOnPage).fotorama();

        // Get the API object.
        this.sliderData = this.sliderDiv.data('fotorama')

        // define the image data array for ima
        this.newimages = this.pageVariables.imgdata;

        //let olddata = fotorama[m].data;
        this.olddata = this.sliderData.data;

        // Define width for responsive devices
        this.width = this.sliderDiv[0].parentElement.clientWidth;
        if (this.#isMobile) {
            let h = window.screen.height;
            let w = window.screen.width;
            h > w ? this.width = h : this.width = w;
        }
        
        // do and define all handles
        let newdata2 = this.#replaceImageData( this.width, this.olddata, this.newimages);
        if (newdata2) {this.sliderData.load(newdata2)} 

        this.disableRightClick(true);
        this.#listenEventSliderShowend();
        this.#listenEventSliderLoaded();
        this.#handleZoomInFullscreen();
      
    }
   
    // --------------- Class API method definitions -------------------------
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
        if ( this.pageVariables.imgdata[newslide].jscaption != '') 
        {
            let text = this.pageVariables.imgdata[newslide].jscaption ;
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
        if ( this.pageVariables.imgdata[newslide].permalink != '') {
            jQuery('#multifotobox' + sliderNumber + ' .fm-attach-link a').attr("href", this.pageVariables.imgdata[newslide].permalink);
        }
    }

    // --------------- Internal private methods --------------------------------

    /**
     * replace Image Data to srcset Data provided on page or in JS-variables.
     * @param {int} viewerwidth 
     * @param {array} oldimages 
     * @param {array} newimages 
     * @returns 
     */
    #replaceImageData(viewerwidth, oldimages, newimages) {
        let newdata = [];
        let newlength = newimages.length;
    
        if (oldimages.length === newlength) {
    
            for (let index = 0; index < newlength; index++) {
                let item = oldimages[index];
                newdata[index] = [];
                newdata[index].alt = newimages[index].title; // das setzt voraus, dass die arrays identisch sortiert sind!
                newdata[index].caption = item.caption;
                newdata[index].thumb = item.thumb;
                newdata[index].img = item.img;
                newdata[index].i   = item.i;
    
                if ('srcset' in newimages[index] && Object.keys(newimages[index].srcset).length > 0) {
                    let srcindex = 0;
                    let srcarray = newimages[index].srcset; 
                    
                    for (const [key, value] of Object.entries(srcarray)) {
                        //console.log(`${key}: ${value}`);
                        if (key > viewerwidth) {
                            srcindex = key;
                            break;
                            }
                    }
                            
                    if ( this.#isMobile) {
                        newdata[index].img = newimages[index].srcset[srcindex];
                    }
                    else {
                        newdata[index].img =  newimages[index].srcset[ srcindex ];
                        newdata[index].full = newimages[index].srcset['2560']; // TODO: replace 2560 with big_image_size !
                    }
                } 
            }
    
        } 
        else 
        {
            return null;
        }
        return newdata; 
    }

    /**
     * handle the zoom function in fullscreen mode. zoom current image. on fullscreen only.
     * Trigger fullscreen Event entry and exit is currently not implemented as it is not required.
     */
    #handleZoomInFullscreen() {
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
                // Options for the fullscreen zoom
                classThis.sliderData.setOptions({
                    fit: 'contain' 
                });
                // handle the zoom, see: https://www.jacklmoore.com/zoom/
                jQuery('#sf' + m + '-' + nr).zoom(
                    {//url: classThis.sliderData.data[nr].full, // if not defined uses the src in img tag. 
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
                    fit: classThis.#normalZoom
                }); 
                classThis.#fotoramaState = 'normal';
                jQuery(window).trigger('resize');
                let sliderDatalength = classThis.sliderData.data.length
              
                for (let fi = 0; fi < sliderDatalength; fi++) {
                    jQuery('#sf' + m + '-' + fi).trigger('zoom.destroy');
                }
            }
        });
    }

    // --------------- Generate Class Events -----------------------------------
    
    /**
     * Trigger Event that a new Image was finally loaded. Pass image index Number and Slider ID to event handler.
     * Call other functions that have to be run with that event.
     * Mind: the slider number counts from one, where counting from '0' would be correct.
     */
    #listenEventSliderShowend() {
        // create Event on fotorama showend
        let classThis = this;
        
        jQuery('#'+this.elementOnPage).on('fotorama:showend',
            function (e) 
            {   
                let nr = classThis.sliderData.activeFrame.i-1;
                let source = e.currentTarget.id;
                source = source.replace('mfotorama','');
                let m = parseInt(source);
                // define the CustomEvent to be fired
                const changed = new CustomEvent('sliderchange', {
                    detail: {
                    name: 'sliderChange',
                    newslide: classThis.sliderData.activeFrame.i,
                    slider: m
                    }
                });
                if (e.type === 'fotorama:showend' && classThis.number === m) {
                    // set id in current active stage Frame
                    classThis.sliderData.activeFrame.$stageFrame[0].id = 's' + classThis.sliderData.activeFrame.$navThumbFrame[0].id;
                    classThis.el.dispatchEvent(changed);
                    classThis.updateCaption(m, classThis.sliderData.activeFrame.i-1);
                    classThis.setLinkForInfoButton(m, classThis.sliderData.activeFrame.i-1);
                    // handle the zoom activate the zoom in fullscreen only
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
     * Mind: the slider number counts from one, where counting from '0' would be correct.
     */
    #listenEventSliderLoaded() {
        // create Event on fotorama load, only one
        let classThis = this;

        let ts =0; // define a timestamp to detect wether event was already triggered.
        jQuery('#'+this.elementOnPage).on('fotorama:load',
            function (e) 
            {   
                let source = e.currentTarget.id;
                source = source.replace('mfotorama','');
                let m = parseInt(source);
                // define the CustomEvent to be fired
                const loaded = new CustomEvent('sliderload', {
                    detail: {
                    name: 'sliderLoad',
                    newslide: classThis.sliderData.activeFrame.i,
                    slider: m
                    }
                });

                if (e.type === 'fotorama:load' && classThis.number === m) {
                    // trigger the event only once, so if ts was not set before.
                    if (ts === 0) {
                        classThis.el.dispatchEvent(loaded);
                        classThis.updateCaption(m, classThis.sliderData.activeFrame.i-1);
                        classThis.setLinkForInfoButton(m, classThis.sliderData.activeFrame.i-1);
                        // set the id for the fullscreen-zoom 
                        let sliderDatalength = classThis.sliderData.data.length

                        for (let fi = 0; fi < sliderDatalength; fi++) {
                            classThis.sliderData.data[fi].$navThumbFrame[0].id = 'f' + m + '-' + fi;
                            if (typeof(classThis.sliderData.data[fi].$stageFrame) !== 'undefined') {
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
