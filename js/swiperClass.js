// import Swiper JS
//import Swiper from 'swiper/bundle'; // imports the complete bundle.
// The following module loading reduces bundle size from 47.8 kB to 38.2 kBytes.
import Swiper, {Navigation, Mousewheel, Zoom, Lazy, A11y, HashNavigation, EffectFlip, EffectCoverflow, EffectCube, EffectFade, Thumbs} from 'swiper';

// import Swiper styles
import 'swiper/css/bundle';
/* The following saves only 0,6 kBytes. Is not worth it.
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
export {SliderSwiper};

class SliderSwiper {
        
    // private attributes (fields)
    #pageVariables = []; // values passed form php via html

    // public attributes (fields). These can be set / get by dot-notation.
    number = 0;
   
    // swiper
    swiper = {};
    thumbs = {};
    sw_options = {};
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
         
        this.thumbs = new Swiper('#thumbsSwiper'+this.number, {
            loop: true,
            spaceBetween: 2,
            //slidesPerView: this.#pageVariables.sw_options.sw_slides_per_view, // value for slides per view
            breakpoints: {
                200: {
                    slidesPerView: 3,
                },
                480: {
                    slidesPerView: 4,
                },
                640: {
                    slidesPerView: 5,
                },
                768: {
                    slidesPerView: 6,
                },
                1024: {
                    slidesPerView: this.#pageVariables.sw_options.sw_slides_per_view,
                }
            },
            freeMode: false,
            watchSlidesProgress: true
        });

        this.sw_options = {
            // Default parameters
            modules: [Navigation, Mousewheel, Zoom, Lazy, A11y, HashNavigation, EffectFlip, EffectCoverflow, EffectCube, EffectFade, Thumbs],
            lazy: {
                enabled:true,
                checkInView:true,
                loadOnTransitionStart:true,
            },
            preloadImages: false,
            slidesPerView: 1,
            spaceBetween: 10,
            centeredSlides: true, // bool : If true, then active slide will be centered, not always on the left side.
            mousewheel: this.#pageVariables.sw_options.sw_mousewheel === 'true', 
            
            keyboard: {
                enabled: this.#pageVariables.sw_options.sw_keyboard === 'true', 
                onlyInViewport: true,
            },
            /*
            autoplay: {
                delay: 2500, // TODO: param? No. Not used.
                disableOnInteraction: true,
              },
            */  
            hashNavigation: {
                watchState: this.#pageVariables.sw_options.sw_hashnavigation === 'true', 
            },  
            grabCursor: true,
            effect: this.#pageVariables.sw_options.sw_effect, // Transition effect. Can be 'slide', 'fade', 'cube', 'coverflow', 'flip' or ('creative')
            zoom:
            {
                enabled: this.zoom, 
                maxRatio: this.#pageVariables.sw_options.sw_max_zoom_ratio, 
                minRatio: 1,
                zoomedSlideClass: 'swiper-zoom-container'
            },
            roundLengths: true,
            loop: true, 
            /*
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            */
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
        ((this.#pageVariables.sw_options.sw_fslightbox === 'true') && (typeof(fsLightboxInstances) !== 'undefined')) ? window.addEventListener('load', this.lightbox(this.number), false ) : null;
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

    lightbox(m) {
        // pass option to the js-script to switch fullscreen of browser off, when lightbox is closed. 
        // This option does not work. because it causes 'Failed to execute 'exitFullscreen' on 'Document': Document not active...'
        //fsLightboxInstances['swiper'+m].props.exitFullscreenOnClose = true; 
        fsLightboxInstances['swiper' + m].props.zoomIncrement = 0.5;
        //fsLightboxInstances['swiper' + m].props.slideshowTime = 1000;
        fsLightboxInstances['swiper' + m].props.UIFadeOutTime = 10000;
        //fsLightboxInstances['swiper' + m].props.slideDistance = 1.0;
        fsLightboxInstances['swiper' + m].props.loadOnlyCurrentSource = true;

        // slide Swiper synchronously to lightbox. This is ignored for the free version. Does not cause error messages.
        fsLightboxInstances['swiper' + m].props.onSlideChange = (fsLightbox) => {
            this.setSliderIndex(fsLightbox.stageIndexes.next-1);
            this.#pageVariables.sw_options.showcaption === 'true' ? this.initCustomCaptions(fsLightbox) : null;
        }

        if ( this.#pageVariables.sw_options.showcaption === 'true') {
            fsLightboxInstances['swiper' + m].props.onOpen = (fsLightbox) => {
                this.initCustomCaptions(fsLightbox);
        
                const thumbBtn = document.querySelector(
                    `div.fslightbox-toolbar-button[title="Thumbnails"]`
                );
                if (thumbBtn && !thumbBtn.classList.contains(`thumb-btn-event-added`)) {
                    const thumbBtn_event = `click`;
                    const thumbBtn_fn = () => {
                        if (fsLightbox.data.isThumbing) {
                            this.createCustCaption(fsLightbox);
                        } else {
                            this.removeCustomCaptions();
                        }
                    };
        
                    thumbBtn.attachEvent
                        ? thumbBtn.attachEvent(`on` + thumbBtn_event, thumbBtn_fn)
                        : thumbBtn.addEventListener(thumbBtn_event, thumbBtn_fn, {
                            capture: false,
                        });
        
                    thumbBtn.classList.add(`thumb-btn-event-added`);
                }
                /*
                let el = document.getElementsByClassName("fslightbox-thumbs") 
                el[0].addEventListener("wheel", function() {
                    if (event.deltaY>0)
                    console.log('pos fs wheel');
                    else if (event.deltaY<0)
                    console.log('neg fs wheel');
                });
                
                document.getElementsByClassName("fslightbox-container").addEventListener("wheel", function() {
                    console.log('fs wheel');
                });
                */
            };
        }
        
        // this option increases the load time with many images. So it is not used.
        //fsLightboxInstances['swiper'+m].props.showThumbsOnMount = true;
    }
    
    // --------------- Class API method definitions -------------------------
    /**
     * Set Slider to index
     * @param {int} index 
     */
    setSliderIndex(index) {
        // mind swiper starts with index = 0
        this.swiper.slideTo(index+1, this.#pageVariables.sw_options.sw_transition_duration, true);
    }

    // --------------- Class method for fslightbox -------------------------
    // source: https://github.com/matthewroysl/fslightbox-thumb-captions
    removeCustomCaptions() {
        document
            .querySelectorAll(`div.cust-caption-removable`)
            .forEach((element) => element.remove());
    }

    createCustCaption(fsLightbox) {
        const currentSlideDOM =
            fsLightbox.elements.sourceMainWrappers[fsLightbox.stageIndexes.current];

        let lastDiv_currentSlide_DOM = currentSlideDOM.lastElementChild;
        while (lastDiv_currentSlide_DOM.hasChildNodes()) {
            lastDiv_currentSlide_DOM = lastDiv_currentSlide_DOM.lastElementChild;
        }

        const newCaption = document.createElement(`div`);
        newCaption.classList.add(
            `cust-caption-removable`,
            `fslightbox-flex-centered`,
            `fslightbox-caption-inner`
        );
        newCaption.style = `max-width:100%!important;`;
        newCaption.textContent =
            fsLightbox.elements.captions[fsLightbox.stageIndexes.current].textContent;
        lastDiv_currentSlide_DOM.parentNode.appendChild(newCaption); //fslightbox-fade-in
    }

    initCustomCaptions(fsLightbox) {
        this.removeCustomCaptions();

        if (typeof(fsLightbox) === 'object' && fsLightbox.data.isThumbing) {
            this.createCustCaption(fsLightbox);
        }
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
            // stop all videos
            // https://stackoverflow.com/questions/72744073/stop-and-start-autoplay-in-swiper-container-based-on-the-video-play-and-pause-ev
            let videos = document.querySelectorAll('video');
            Array.prototype.forEach.call(videos, function(video){
                video.pause();
            });

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