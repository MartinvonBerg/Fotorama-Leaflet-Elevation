// import MiniMasonry JS
import MiniMasonry from "./minimasonry.js";

import "./miniMasonryClass.css";

export {MiniMasonryWrap};

class MiniMasonryWrap {
        
    // private attributes (fields)
    #pageVariables = []; // values passed form php via html

    // public attributes (fields). These can be set / get by dot-notation.
    number = 0;

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
        this.updateCSS();
        
        let masonry = new MiniMasonry({
            container: this.elementOnPage,
            baseWidth: parseInt(this.#pageVariables.sw_options.minrowwidth), //Target width of elements. ++
            gutterX: parseInt(this.#pageVariables.sw_options.mm_gutterX), // Width of gutter between elements. Need gutterY to works, fallback to "gutter". ++
            gutterY: parseInt(this.#pageVariables.sw_options.mm_gutterY), // Width of gutter between elements. Need gutterX to works, fallback to "gutter". ++
            minify: this.#pageVariables.sw_options.mm_minify === 'true', // Whether or not MiniMasonry place elements on shortest column or keep exact order of list. ++
            surroundingGutter: this.#pageVariables.sw_options.mm_surrGutter === 'true', // Set left gutter on first column and right gutter on last. ++
            ultimateGutter:	parseInt(this.#pageVariables.sw_options.mm_ultiGutter), //Gutter applied when only 1 column can be displayed. ++
        });
        
        masonry.reset();
        masonry.layout();

        // fire a resize event after the init and layout functions to show correctly
        window.setTimeout( function() {
            window.dispatchEvent(new Event('resize'));
            console.log('resized');
        }, 100);

        debugger;
        // Get the modal
        let modal = document.getElementById("myModal");

        // Get the button that opens the modal
        let btn = document.getElementById("popup1");

        // Get the <span> element that closes the modal
        let span = document.getElementsByClassName("close")[0];
        
        // When the user clicks on the button, open the modal
        btn.onclick = function() {
        modal.style.display = "block";
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
        modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        }
        

    }

    /**
    * update CSS rules that are used according to the options and client
    */
    updateCSS() {
        const style = document.createElement('style');
        style.innerHTML = `
            #minimasonry${this.number} .item { background: ${ this.#pageVariables.sw_options.background }; }`;
        document.head.appendChild(style);
    }
}