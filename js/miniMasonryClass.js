// import MiniMasonry JS
import MiniMasonry from "./minimasonry.js";

import "./miniMasonryClass.css";

export {MiniMasonryWrap};

class MiniMasonryWrap {
        
    // private attributes (fields)
    #pageVariables = []; // values passed form php via html

    // public attributes (fields). These can be set / get by dot-notation.
    number = 0;
   
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

        // todo provide all masonry settings in admin tab
        
        let masonry = new MiniMasonry({
            container: this.elementOnPage,
            baseWidth: 200, //Target width of elements.
            gutterX: 5, // Width of gutter between elements. Need gutterY to works, fallback to "gutter".
            gutterY: 10, // Width of gutter between elements. Need gutterX to works, fallback to "gutter".
            minify: true, // Whether or not MiniMasonry place elements on shortest column or keep exact order of list.
            surroundingGutter: false, // Set left gutter on first column and right gutter on last.
            ultimateGutter:	5, //Gutter applied when only 1 column can be displayed.
        });
        
        masonry.reset();
        masonry.layout();

        window.setTimeout( function() {
            window.dispatchEvent(new Event('resize'));
            console.log('resized');
        }, 100);
        
       
    }

    // TODO set masonry item background with slide background
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
    }
}