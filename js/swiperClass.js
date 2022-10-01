// import Swiper JS
import Swiper, {Navigation, Mousewheel, Zoom, Lazy, A11y, HashNavigation, EffectFlip, Thumbs} from 'swiper';
// import Swiper styles
import 'swiper/css/bundle';
/* This save only 0,6 kBytes. Is not worth it.
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/a11y';
import 'swiper/css/controller';
import 'swiper/css/effect-flip';
import 'swiper/css/hash-navigation';
import 'swiper/css/lazy';
import 'swiper/css/mousewheel';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
*/
import "./swiperClass.css";

class SliderSwiper {
        
    // private attributes (fields)
    #pageVariables = []; // values passed form php via html

    // public attributes (fields). These can be set / get by dot-notation.
    number = 0;
   
    // swiper
    swiper = {};
    imageCounts = 6; // TODO: param? value for slides per view
    thumbs = {};
    sw_options = {};
    swiperTransitionDuration = 300; // number: Transition duration (in ms). Default 300ms. // TODO: param?
    zoom = true;

    /**
     * Constructor Function
     * @param {int} number current number
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
        }
    }

    /**
     * Initialisation of Slider in given elementOnPage
     */
    defSlider() {
        //if (this.#pageVariables.imgdata.length < this.imageCounts) {
        //    this.imageCounts = this.#pageVariables.imgdata.length;
        //}
         
        this.thumbs = new Swiper('#thumbsSwiper'+this.number, {
            loop: true,
            spaceBetween: 2,
            slidesPerView: this.imageCounts,
            freeMode: false,
            watchSlidesProgress: true
        });

        this.sw_options = {
            // Default parameters
            modules: [Navigation, Mousewheel, Zoom, Lazy, A11y, HashNavigation, EffectFlip, Thumbs],
            lazy: {
                enabled:true,
                checkInView:true,
                loadOnTransitionStart:true,
            },
            preloadImages: false,
            slidesPerView: 1,
            spaceBetween: 10,
            centeredSlides: true, // bool : If true, then active slide will be centered, not always on the left side.
            keyboard: {
                enabled: false, // TODO: param?
                onlyInViewport: true,
            },
            mousewheel: true, // TODO: param?
            /*
            autoplay: {
                delay: 2500, // TODO: param?
                disableOnInteraction: true,
              },
            */  
            hashNavigation: {
                watchState: true, // TODO: param?
            },  
            grabCursor: true,
            effect: this.#pageVariables.sw_options.sw_effect, // Transition effect. Can be 'slide', 'fade', 'cube', 'coverflow', 'flip' or ('creative')
            zoom: //this.zoom,
            {
                enabled: this.zoom, 
                maxRatio: 3, // TODO: param?
                minRatio: 1,
                zoomedSlideClass: 'swiper-zoom-container'
            },
            roundLengths: true,
            loop: true, 
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            // Navigation arrows
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: {
                swiper: this.thumbs,
            },
            on: {
                init: (event) => this.#listenEventSliderLoaded(event)
            },
        };
                
        // generate the swiper slider on the new html 
        this.swiper = new Swiper('#'+this.elementOnPage, this.sw_options);
        this.scrollToHash();
        this.#listenEventSliderShowend();
    }

    // --------------- Internal private methods --------------------------------
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

        window.addEventListener('DOMContentLoaded', function () {

            if (window.location.hash === '') {
                return false;
            }
            let h = window.location.hash.split('/')[0];
            if ( ! h.includes('swiper') ) {
                return false;
            };
            let el = document.querySelector(h);
            if (el !== null) {
                this.setTimeout( function () {
                    el.scrollIntoView({ behavior: 'smooth' })}, 500);
            }

        }, options);
    }
    
    // --------------- Class API method definitions -------------------------
    /**
     * Set Slider to index
     * @param {int} index 
     */
    setSliderIndex(index) {
        // mind swiper starts with index = 0
        this.swiper.slideTo(index+1, this.swiperTransitionDuration, true);
    }

    // --------------- Generate Class Events -----------------------------------
    
    /**
     * Trigger Event that a new Image was finally loaded. Pass image index Number and Slider ID to event handler.
     * Call other functions that have to be run with that event.
     * Mind: the slider number counts from one, where counting from '0' would be correct.
     */
     #listenEventSliderShowend() {
        // create Event on swiper change
        this.swiper.on('slideChange', function (event) {
            // use realIndex and mind swiper starts with index = 0
            let nr = event.realIndex + 1;
            let m = parseInt(event.el.id.replace('swiper',''));

            // define the CustomEvent to be fired
            const changed = new CustomEvent('sliderchange', {
                detail: {
                    name: 'sliderChange',
                    newslide: nr,
                    slider: m
                }
            });
            event.el.dispatchEvent(changed);
        });
     };

     /**
     * Trigger Event that first Image was finally loaded. Do this only once. Pass image index Number and Slider ID to event handler.
     * Call other functions that have to be run with that event.
     * Mind: the slider number counts from one, where counting from '0' would be correct.
     */
    #listenEventSliderLoaded(event) {
        // create Event on swiper init, only once 
        let nr = event.realIndex + 1;
        let m = parseInt(event.el.id.replace('swiper',''));
        
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

export {SliderSwiper};