// import MiniMasonry JS
import MiniMasonry from "./minimasonry.js";

import "./miniMasonryClass.css";

export {MiniMasonryWrap};

class MiniMasonryWrap {
        
    // private attributes (fields)
    #pageVariables = []; // values passed form php via html

    // public attributes (fields). These can be set / get by dot-notation.
    number = 0;
    elementOnPage = {};

    /**
     * Constructor Function which instanciates and calls all methods.
     * @param {int} number current number of slider on page
     * @param {string} elementOnPage id of the div on the page that shall contain the slider
     */
     constructor(number, elementOnPage) {
        this.number = number; 
        this.elementOnPage = elementOnPage; 
        this.#pageVariables = pageVarsForJs[number];
        this.fslightboxDownloadButton = false; //for future extension. Currently unused and set to false constantly.
        this.fslightboxInfo = true && (this.#pageVariables.sw_options.showcaption === 'true'); //for future extension. Currently combined with showcaption.

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

        this.handleDialogBoxes();

        this.handleFslightbox();

    }

    /**
     * show download and info button in bar of fsLightbox.
     */
    handleFslightbox() {

        let dlopt = {
            viewBox: "0 0 16 16",
            d:"M0 14h16v2h-16v-2z M8 13l5-5h-3v-8h-4v8h-3z",
            width: "16px",
            height: "16px",
            title: "Download",
            onClick: function(instance) {
                var URL = instance.props.sources[instance.stageIndexes.current];
                var a = document.createElement("a");
                a.href = URL;
                a.setAttribute("download", "");
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        };
       
        let fslbopt = {
            viewBox: "0 0 24 24",
            d:"M12,10a1,1,0,0,0-1,1v6a1,1,0,0,0,2,0V11A1,1,0,0,0,12,10Zm0-4a1.25,1.25,0,1,0,1.25,1.25A1.25,1.25,0,0,0,12,6Z",
            width: "24px",
            height: "24px",
            title: "Info",
            onClick: function(instance) {
                let nr = instance.stageIndexes.current;
                const modals = document.getElementsByClassName("modal-dialog");
                modals[nr].showModal();
            }
        };

        // Download Button
        if ( typeof(fsLightbox ) === 'object' && this.fslightboxDownloadButton && ! this.fslightboxInfo) {
            fsLightbox.props.customToolbarButtons = [dlopt];
        }

        // Info Button to open modal
        if ( typeof(fsLightbox ) === 'object' && this.fslightboxInfo && ! this.fslightboxDownloadButton) {
            fsLightbox.props.customToolbarButtons = [fslbopt];
        }

        // Download Button and Info Button to open modal
        if ( typeof(fsLightbox ) === 'object' && this.fslightboxDownloadButton && this.fslightboxInfo) {
            fsLightbox.props.customToolbarButtons = [fslbopt, dlopt];
        }

        // Close modal an slide change
        if ( typeof(fsLightbox ) === 'object' ) {
            fsLightbox.props.onSlideChange = function (instance) {
                //console.log(instance);
                const modals = document.getElementsByClassName("modal-dialog");
                for (let item of modals) {
                    if (item.attributes.open !== undefined) {
                        item.close();
                    }
                }
            }
        }
    }

    /**
     * Define the handling (open, close) for the informative html dialogs or modals
     */
    handleDialogBoxes() {
        const triggers = document.getElementsByClassName("masonry-dialog-open");
        const triggerArray = Array.from(triggers).entries();
        const modals = document.getElementsByClassName("modal-dialog");
        const closeButtons = document.getElementsByClassName("masonry-dialog-close");

        // Then use `for...of`-loop with the index of each item in `triggerArray` for listening to a click event which toggles each modal to open and close
        for (let [index, trigger] of triggerArray) {
            const toggleModal = () => {
                if (modals[index].attributes.open == undefined) {
                    modals[index].showModal();
                } else {
                    modals[index].close();
                }
            };
            trigger.addEventListener("click", toggleModal );
            closeButtons[index].addEventListener("click", toggleModal);
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target.className !== 'masonry-dialog-open' && event.target.className.baseVal !== '') {
                const modals = document.getElementsByClassName("modal-dialog");
                for (let item of modals) {
                    if (item.attributes.open !== undefined) {
                        item.close();
                    }
                }
            }
        }
    }

    /**
    * update CSS rules for the background colour of the caption.
    */
    updateCSS() {
        const style = document.createElement('style');
        style.innerHTML = `
            #minimasonry${this.number} .item { background: ${ this.#pageVariables.sw_options.background }; }`;
        document.head.appendChild(style);
    }
}