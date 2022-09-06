// ---- php enqueue scripts im Abschnitt development
// --- Swiper.js
    wp_enqueue_style('swiper_css', "https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css", [], '8.3.2');
    wp_enqueue_script('swiper_js', "https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js", [], '8.3.2');
    wp_enqueue_script('swiperClass_js', $plugin_url . 'js/swiperClass.js', [], '0.11.0', true);
// --- Swiper.js

// --------------- CSS --------------------------------
// am Ende von fotorama_multi.css
.swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-slide {
    text-align: center;
    font-size: 18px;
    background: #fff;
    background-size: cover;
    background-position: center;
    overflow: hidden;

    /* Center slide text vertically */
    display: -webkit-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
  }

  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  body {
    background: #000;
    color: #000;
  }

  .swiper {
    width: 100%;
    height: auto;
    margin-left: auto;
    margin-right: auto;
  }

  .mySwiper2 {
    height: 80%;
    width: 100%;
  }

  .mySwiper {
    height: 20%;
    box-sizing: border-box;
    padding: 10px 0;
  }

  .mySwiper .swiper-slide {
    width: 25%;
    height: 100%;
    opacity: 0.4;
  }

  .mySwiper .swiper-slide-thumb-active {
    opacity: 1;
  }

  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
.swiper-slide .title {
  color: white;
  z-index: 20;
  position: absolute;
  height: auto;
  width: auto;
  bottom: 2%;
  left: 2%;
  -webkit-box-shadow: 1px 3px 14px 0px rgba(0,0,0,0.68); 
  box-shadow: 1px 3px 14px 0px rgba(0,0,0,0.68);
  background: #22222285;
  text-align: left;
}
// ------------- Class --------------------------------
// import Swiper JS
//import Swiper from 'swiper';
// import Swiper styles
//import 'swiper/css';

class SliderSwiper {
    // static attributes (fields)
    static count = 0; // counts the number of instances of this class.
    
    // private attributes (fields)
    #pageVariables = []; // values passed form php via html
    #isMobile = false;

    // public attributes (fields). These can be set / get by dot-notation.
    number = 0;
    #elementOnPage = '';
    #width = 0;
    #newimages = null;
    #olddata = null;
    #sliderData = null;
    #sliderDiv = null;
    #infoel = {};

    // swiper
    swiper = {};
    swiperTransitionDuration = 1000; // number: Transition duration (in ms). Default 300ms.

    /**
     * Constructor Function
     * @param {int} number current number
     * @param {string} elementOnPage id of the div on the page that shall contain the slider
     */
     constructor(number, elementOnPage) {
        SliderFotorama.count++; // update the number of instances on construct.
        this.number = number; 
        this.elementOnPage = elementOnPage; 
        this.#pageVariables = pageVarsForJs[number];
        this.#isMobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
    }

    /**
     * Initialisation of Slider in given elementOnPage
     */
    defSlider() {
        this.#sliderDiv = this.#replaceImageData();

        // generate the swiper slider on the new html 
        this.swiper = new Swiper('.myswiper', {
            // Default parameters
            lazy: true,
            slidesPerView: 1,
            spaceBetween: 10,
            // Responsive breakpoints
            
            centeredSlides: true, // bool : If true, then active slide will be centered, not always on the left side.
            effect: 'coverflow', // Transition effect. Can be 'slide', 'fade', 'cube', 'coverflow', 'flip' or 'creative'
            // TODO: replace string with this.#pageVariables.effect and provide an admin setting for that.
            loop: false,
            rewind: true, // Should not be used together with loop mode : true
            //modules: [], // Array with Swiper modules
            preloadImages: true,
            /*
            pagination: {
                el: ".swiper-pagination",
                clickable: false,
                renderBullet: function (index, className) {
                  return '<span class="' + className + '">' + (index + 1) + "</span>";
                },
            },
            zoom: true,
            
            {
                maxRatio: 2,
                minRatio: 1,
                zoomedSlideClass: 'swiper-zoom-container'
            },
            on: {
                doubleClick: function () {
                  console.log('clicked!')
                  this.zoom.in();
                }
              },
            */
        });
    }

    // --------------- Internal private methods --------------------------------

    /**
     * Update the caption in fotorama to convert '||' to html linebreaks <br>. What is required because
     * WordPress doesn't allow to write <br> in the string and Fotorama doesn't allow html in the caption.
     * @param {int} sliderNumber 
     * @param {int} newslide 
     */
    updateCaption(sliderNumber, newslide) {
        if ( this.#pageVariables.imgdata[newslide].jscaption !== '') {
            let text = this.#pageVariables.imgdata[newslide].jscaption ;
            text = text.replaceAll('||', '<br>');
            return text;
        }
        return '';
    }

    /**
     * replace Image Data to srcset Data provided on page or in JS-variables.
     * @returns {object} the new generated div as object.
     */
     #replaceImageData() {
        
        // get the old data from html and pageVarsForJs
        let el = document.getElementById('mfotorama'+ this.number); //.getElementsByTagName('img');
        let parent = document.getElementById('multifotobox'+ this.number);
                
        // remove fotorama data
        let elements = document.getElementsByClassName("fotorama_multi_images");
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
        elements = null;
        let element = document.getElementById('mfotorama'+ this.number);
        element.parentNode.removeChild(element);
        element = null;
        
        this.newimages = this.#pageVariables.imgdata;

        // transform and prepare data
        for (let m = 0; m <  el.children.length; m++) {
            console.log(el.children[m].src);
            console.log(el.children[m].alt);
            this.newimages[m]['src'] = el.children[m].src;
        }

        // write the new html
        let newData = document.createElement("div");
        newData.classList.add('swiper');
        newData.classList.add('myswiper');
        let newChild1 =  document.createElement("div");
        newChild1.classList.add('swiper-wrapper')

        // append the slides here
        for (let m = 0; m <  el.children.length; m++) {
            let slide =  document.createElement("div");
            slide.classList.add('swiper-slide');

            let zoom = document.createElement("div");
            zoom.classList.add('swiper-zoom-container');
            
                let img =  document.createElement("img");
                img.classList.add('swiper-lazy')
                img.setAttribute('data-src', el.children[m].src)
                img.setAttribute('alt', el.children[m].alt)
                img.setAttribute('data-fslightbox', '1');
                img.setAttribute('data-type', 'image');
                img.setAttribute('data-caption', el.children[m].alt)
                zoom.appendChild(img)

                img =  document.createElement("div");
                img.classList.add('title')
                img.setAttribute('alt', el.children[m].alt);
                img.innerHTML = this.updateCaption(this.number, m)
                slide.appendChild(img)

                // set attributes for fslightbox which are: data-fslightbox="1" data-type="image" data-caption="<Title>"
                /*
                let fsl = document.createElement("a");
                fsl.setAttribute('data-fslightbox', '1');
                fsl.setAttribute('data-type', 'image');
                fsl.setAttribute('data-caption', el.children[m].alt)
                fsl.setAttribute('href', el.children[m].src)
                slide.appendChild(fsl)
                */
                slide.appendChild(zoom);
                newChild1.appendChild(slide)
        }

        newData.appendChild(newChild1);
        
        let newChild2 =  document.createElement("div");
        newChild2.classList.add('swiper-button-prev');
        newData.appendChild(newChild2);
        
        let newChild3 =  document.createElement("div");
        newChild3.classList.add('swiper-button-next');
        newData.appendChild(newChild3);
        /*
        let newChild4 =  document.createElement("div");
        newChild4.classList.add('swiper-pagination');
        newData.appendChild(newChild4);
        */
        parent.prepend(newData);
        return newData;
     }


    // --------------- Class API method definitions -------------------------
    /**
     * Set Slider to index
     * @param {int} index 
     */
    setSliderIndex(index) {
        // mind swiper starts with index = 0
        this.swiper.slideTo(index, this.swiperTransitionDuration, true);
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
        this.swiper.on('slideChange', function (event) {
            console.log('slide changed');
            // mind swiper starts with index = 0
        });
     };

     /**
     * Trigger Event that first Image was finally loaded. Do this only once. Pass image index Number and Slider ID to event handler.
     * Call other functions that have to be run with that event.
     * Mind: the slider number counts from one, where counting from '0' would be correct.
     */
    #listenEventSliderLoaded() {
        // create Event on fotorama load, only once 
        let classThis = this;
        this.swiper.on('init', function (event) {
            console.log('swiper loaded');
            // mind swiper starts with index = 0
        });
    }

}