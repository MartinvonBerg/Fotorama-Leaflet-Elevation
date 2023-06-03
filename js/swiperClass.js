// import Swiper JS
//import Swiper from 'swiper/bundle'; // imports the complete bundle.
// The following module loading reduces bundle size from 47.8 kB to 38.0 kBytes.
import Swiper, {Navigation, Mousewheel, Zoom, A11y, HashNavigation, EffectFlip, EffectCoverflow, EffectFade, EffectCube, Thumbs, Keyboard} from 'swiper';
// import Swiper styles (Selection of CSS saves 0,6 kB only)
import 'swiper/css/bundle';
//import "./swiperClass.css";
import {ThumbnailSlider} from "./thumbnailClass";
//import {ThumbnailSlider} from './typescript/thumbnailClass.ts'

export {SliderSwiper};

class SliderSwiper {
        
    // private attributes (fields)
    #pageVariables = []; // values passed form php via html

    // public attributes (fields). These can be set / get by dot-notation.
    number = 0;
    activeIndex = 0;
   
    // swiper
    swiper = {};
    thumbs = {};
    sw_options = {};
    zoom = true;
    space = 2;

    /**
     * Constructor Function
     * @param {int} number current number of slider on page
     * @param {string} elementOnPage id of the div on the page that shall contain the slider
     */
     constructor(number, elementOnPage) {
        this.number = number; 
        this.elementOnPage = elementOnPage; 
        this.#pageVariables = pageVarsForJs[number];
        this.zoom = this.#pageVariables.sw_options.sw_zoom === 'true';

        // change swiper settings for certain cases 
        if (this.#pageVariables.sw_options.sw_effect === 'cube') {
            this.zoom = false;
            this.#pageVariables.sw_options.sw_fslightbox = 'false';
        }
    }

    /**
     * Initialisation of Slider in given elementOnPage
     */
    defSlider() {
        //if (this.#pageVariables.imgdata.length < this.imageCounts) {
        //    this.imageCounts = this.#pageVariables.imgdata.length;
        //}
        if (this.#pageVariables.sw_options.thumbbartype === 'integrated') { 
            this.thumbs = new Swiper('#thumbsSwiper'+this.number, {
                loop: true,
                spaceBetween: this.space,
                //slidesPerView: this.#pageVariables.sw_options.sw_slides_per_view, // value for slides per view
                breakpointsBase: 'container',
                //centerInsufficientSlider: true,
                //centeredSlides: true,
                //centeredSlidesBounds: true,
                breakpoints: this.calcBreakpoints(),
                //freeMode: false,
                watchSlidesProgress: true
            });
        } else if (this.#pageVariables.sw_options.thumbbartype === 'special') {
            // optional dynamic import of ThumbnailClass: Saves 1.3 kB only.  
            this.thumbs = new ThumbnailSlider(this.number, this.#pageVariables.sw_options)
        }

        this.sw_options = {
            // Default parameters
            modules: [Navigation, Mousewheel, Zoom, A11y, HashNavigation, EffectFlip, EffectCoverflow, EffectCube, EffectFade, Thumbs, Keyboard],
            slidesPerView: 1,
            spaceBetween: 10,
            centeredSlides: true, // bool : If true, then active slide will be centered, not always on the left side.
            mousewheel: this.#pageVariables.sw_options.sw_mousewheel === 'true', 
            keyboard: {
                enabled: this.#pageVariables.sw_options.sw_keyboard === 'true', 
                onlyInViewport: false,
                pageUpDown: false
            },
            hashNavigation: {
                watchState: this.#pageVariables.sw_options.sw_hashnavigation === 'true', 
            },  
            grabCursor: true,
            speed: this.#pageVariables.sw_options.sw_transition_duration,
            effect: this.#pageVariables.sw_options.sw_effect, // Transition effect. Can be 'slide', 'fade', 'cube', 'coverflow', 'flip' or ('creative')
            zoom:
            {
                enabled: this.zoom, 
                maxRatio: this.#pageVariables.sw_options.sw_max_zoom_ratio, 
                minRatio: 1,
                zoomedSlideClass: 'swiper-zoom-container'
            },
            roundLengths: true,
            loop: true, // Mind : Change of loop mode will change the index of swiper!
            // Navigation arrows
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: this.#pageVariables.sw_options.thumbbartype === 'integrated' ? { swiper: this.thumbs } : {},
            on: {
                init: (event) => this.#listenEventSliderLoaded(event)
            },
        };

        // change sw_options for firefox to prevent the '#' at the end of the url.
        if (navigator.userAgent.match(/firefox|fxios/i) || this.#pageVariables.sw_options.sw_hashnavigation !== 'true') delete this.sw_options['hashNavigation'];
                
        // generate the swiper slider on the new html 
        this.swiper = new Swiper('#'+this.elementOnPage, this.sw_options);
        this.scrollToHash();
        this.updateCSS();
        this.#listenEventSliderShowend();

        ((this.#pageVariables.sw_options.sw_fslightbox === 'true') && (typeof(fsLightboxInstances) !== 'undefined')) ? window.addEventListener('load', this.lightbox(this.number), false ) : null;
        
        // This does not work here if the ThumbnailClass is conditionally imported
        if (this.#pageVariables.sw_options.thumbbartype === 'special') {
            let classThis = this;
            this.thumbs.ele.parentElement.addEventListener('thumbnailchange', function (event) {
                if (event.detail.slider === classThis.number) classThis.setSliderIndex(event.detail.newslide);
                //console.log('Swi-Class thumbnailchange: ', event.detail.newslide)
            });
        }
    }

    // --------------- Internal private methods --------------------------------
    /**
     * calculate the breakpoints for Swiper thumbnails
     * @returns {Object} the object with breakpoints
     */
    calcBreakpoints() {
        let w = this.#pageVariables.sw_options.f_thumbwidth; // this.space
        let max = this.#pageVariables.sw_options.sw_slides_per_view;
        let bp = {};
        for (let i=1; i<max; i++) {
            let val = parseInt(i * w + (i-1)*this.space);
            bp[val] = {slidesPerView: i+1}
        }
        return bp;
    }

    /**
     * scroll to given hash value (e.g. the id of the swiper div on page load).
     * This function assumes that swiper.js loads the slide given after the '/' in the url.
     * This is currently the filename of the image
     */
    scrollToHash() {
        const options = {
            capture: false,
            once: false,
            passive: true,
        };

        function onReady( ) {
            if (window.location.hash === '') {
                return false;
            }

            let h = window.location.hash.split('/')[0];
            if ( ! h.includes('swiper') ) {
                return false;
            };

            let el = document.querySelector(h);
            if (el !== null) {
                setTimeout( function () {
                    el.scrollIntoView({ behavior: 'smooth' })}, 500);
            }
        }

        if (document.readyState !== "loading") {
            onReady(); // Or setTimeout(onReady, 0); if you want it consistently async
        } else {
            document.addEventListener('DOMContentLoaded', onReady , options);
        };
    }

    /**
    * update CSS rules that are used according to the options and client
    */
    updateCSS() {
        
        const style = document.createElement('style');
        style.innerHTML = `
            #swiper${this.number} .myswiper .swiper-slide {
                background: ${ this.#pageVariables.sw_options.background };
            }
            #swiper${this.number} .myswiper {
                background: ${ this.#pageVariables.sw_options.background };
            }
            #swiper${this.number} .myswiper .swiper-slide img {
                object-fit: ${ this.#pageVariables.sw_options.slide_fit };
            }
            #swiper${this.number} .swiper-wrapper .swiper-zoom-container>img {
                object-fit: ${ this.#pageVariables.sw_options.slide_fit };
            }
            #swiper${this.number} .swiper-button-prev, #swiper${this.number} .swiper-button-next {
                color: ${ this.#pageVariables.sw_options.sw_button_color};
            }`;
        document.head.appendChild(style);

        // add grid style for shortcode = 0 and if minrowwidth is set
        if ( this.number === 0 && this.#pageVariables.sw_options.minrowwidth > 0) {
            const style2 = document.createElement('style');
            style2.innerHTML = `
                @media screen and (min-width: 480px) { .mfoto_grid { 
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(${ this.#pageVariables.sw_options.minrowwidth}px, 1fr)); grid-gap: 5px;}
                }`;
            document.head.appendChild(style2);
        }
    }

    // --------------- Class methods for fslightbox -------------------------
    /**
     * handle the fslightbox on open. show last slide of lightbox in swiper on close.
     * @param {int} m number of swiper slider on page
     */
    lightbox(m) {
        // pass option to the js-script to switch fullscreen of browser off, when lightbox is closed. 
        fsLightboxInstances['swiper'+m].props.exitFullscreenOnClose = true; 
        fsLightboxInstances['swiper' + m].props.zoomIncrement = 0.5;
        //fsLightboxInstances['swiper' + m].props.slideshowTime = 1000;
        fsLightboxInstances['swiper' + m].props.UIFadeOutTime = 10000;
        //fsLightboxInstances['swiper' + m].props.slideDistance = 1.0;
        fsLightboxInstances['swiper' + m].props.loadOnlyCurrentSource = true;
        fsLightboxInstances['swiper' + m].props.showThumbsWithCaptions = true;

        // slide Swiper synchronously to lightbox. This is ignored for the free version. Does not cause error messages.
        fsLightboxInstances['swiper' + m].props.onClose = (fsLightbox) => {
            try {
                if ( !this.sw_options.keyboard.enabled ) {
                    this.setSliderIndex(fsLightbox.stageIndexes.current);
                    //console.log('should slide to: ', fsLightbox.stageIndexes.current)
                }
            } catch(error) {
                console.log('Could not slide on Close of fslightbox', error)
            }
        }
    }
    
   
    // --------------- Class API method definitions -------------------------
    /**
     * Set Slider to index
     * @param {int} index Range is 0 .. N-1. Corrected for swiper in loop mode: Use the dedicated method from Swiper for that.
     */
    setSliderIndex(index) {
        if (this.sw_options.loop) {
            this.swiper.slideToLoop(index, this.#pageVariables.sw_options.sw_transition_duration, true);
        } else {
            this.swiper.slideTo(index, this.#pageVariables.sw_options.sw_transition_duration, true);
        }
        this.activeIndex = index;
    }

    // --------------- Generate Class Events -----------------------------------
    /**
     * Trigger Event that a new Image was finally loaded. Pass image index Number and Slider ID to event handler.
     * Call other functions that have to be run with that event.
     * Mind: the slider number counts from one, where counting from '0' would be correct.
     */
    #listenEventSliderShowend() {
        // create Event on swiper change
        let classThis = this;

        this.swiper.on('slideChange', function (event) {
            // stop all videos. https://stackoverflow.com/questions/72744073/stop-and-start-autoplay-in-swiper-container-based-on-the-video-play-and-pause-ev
            let videos = document.querySelectorAll('video');
            Array.prototype.forEach.call(videos, function(video){
                video.pause();
            });

            // use realIndex and mind swiper starts with index = 0
            //console.log('Swiper Real Index ', event.realIndex, 'Active Index: ', event.activeIndex);
            let m = parseInt(event.el.id.replace('swiper',''));

            // define the CustomEvent to be fired
            const changed = new CustomEvent('sliderchange', {
                detail: {
                    name: 'sliderChange',
                    newslide: event.realIndex,
                    slider: m
                }
            });
            event.el.dispatchEvent(changed);

            // move the thumbnail
            if (classThis.#pageVariables.sw_options.thumbbartype === 'special') {
                classThis.thumbs.setActiveThumb( event.realIndex, 'slideChange')
            }
        });
     };

     /**
     * Trigger Event that first Image was finally loaded. Do this only once. Pass image index Number and Slider ID to event handler.
     * Call other functions that have to be run with that event.
     * Mind: the slider number counts from one, where counting from '0' would be correct.
     */
    #listenEventSliderLoaded(event) {
        // update all images
        for(let index = 0; index < event.slides.length; index++) {
            if ( event.slides[index].children[0].children[0].dataset.src !== undefined) {
                event.slides[index].children[0].children[0].src = event.slides[index].children[0].children[0].dataset.src;
            }
            if ( event.slides[index].children[0].children[0].dataset.srcset !== undefined) {
                event.slides[index].children[0].children[0].srcset = event.slides[index].children[0].children[0].dataset.srcset;
            }
        };

        // create Event on swiper init, only once 
        let nr = event.realIndex + 1;
        let m = parseInt(event.el.id.replace('swiper',''));

        if (this.#pageVariables.sw_options.thumbbartype === 'special' && typeof(this.thumbs.setActiveThumb) === 'function') {
            this.thumbs.setActiveThumb( event.realIndex) // this method is called before all images are loaded, so only the index is set.
        }
        
        // define the CustomEvent to be fired
        const changed = new CustomEvent('sliderload', {
            detail: {
                name: 'sliderload',
                newslide: nr,
                slider: m
            }
        });
        setTimeout( function () {
            event.el.dispatchEvent(changed)},500);
    }
}