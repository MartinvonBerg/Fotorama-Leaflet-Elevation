/*!
	ThumbnailClass V 0.12.0
	license: GPL 2.0
	Martin von Berg
*/

// Class to generate a vertical, responsive Thumbnail bar. Designed to replace the thumbnails of Swiper.js.

/* example usage
let th = new ThumbnailSlider(0, {nail_activeClass : 'active_border'} );
th.setActiveThumb(12) 
let th1 = new ThumbnailSlider(1, {nail_activeClass : 'active_animation'} );

document.querySelector('.thumb_wrapper').addEventListener('thumbnailchange', function waschanged(e) {
  //console.log(e)
});
*/

class ThumbnailSlider {
  number = 0;
  pos = { top: 0, left: 0, x: 0, y: 0 };
  posXOld = 0;
  thumbnails = {};
  numberOfThumbnails = 0;
  activeClass = ''; 
  activeImages = {};
  thumbOverflow = 0;
  parentElement = '';
  currentActive = 0;
  thumbWidthAtBreakpoint = 0;
  ele = {};
  containerObserver = null;
  isFirefox = false;
  sumAspectRatios = 0;
  
  // options to pass to the constructor. not all are required. pass only the ones you wish to change.
  options = {
    // classes
    bar_parentElement   : 'thumb_inner', 
    nail_activeClass    : 'active', // available params: active, active_animation, active_border
    // thumbnail bar
    bar_margin_top      : '3px', // top margin of thumbnail bar in px
    bar_rel_height      : '15%', // height of thumbnail bar in percent. Use 1% to have a fixed height
    bar_min_height      : '80px', // Minimum height of thumbnail bar in px
    // single thumbnail
    nail_margin_side    : '1px', // left and right margin of thumbnails in px
    // active thumbnail : only for nail_activeClass = 'active_border'
    active_brightness   : '1.05', // brightness if activate. other values are: 0.6, 0.95, 1.05 currently unused
    active_border_width : '2px',  // width of bottom border in px
    active_border_color : 'red', // Colour of bottom borderin CSS-colors
  }; 

  /**
   * Constructor Function
   * @param {int} number current number of the slider on the page
   * @param {object} options options to pass to the constructor. not all are required. pass only the ones you wish to change.
   */
  constructor(number, options={} ) {
    // merge option objects
    this.options = Object.assign(this.options, options);
    this.number = number;

    this.parentElement = this.options.bar_parentElement + '_' + this.number.toString();
    this.ele = document.getElementById(this.parentElement);

    this.thumbnails = this.ele.children; // geändert für mehrere Slider auf der Seite.
    this.numberOfThumbnails = this.thumbnails.length;

    this.activeImages = document.getElementsByClassName(this.options.nail_activeClass);
    this.activeClass = this.options.nail_activeClass;

    this.ele.addEventListener('mousedown', (event) => this.mouseDownHandler(event), false);

    // detect firefox to prevent wrong height.
    if (navigator.userAgent.match(/firefox|fxios/i)) this.isFirefox = true;

    // set-up Observer for resize event
    this.containerObserver = new ResizeObserver( (e) =>this.resizer(e) );
    this.containerObserver.observe(this.ele.parentElement);

    this.updateCSS();

    // add a handler to every thumbnail images and do action if all images were loaded.
    let thumbWidth = this.ele.parentElement.offsetWidth;
    let allImagesdWidth = 0; //(this.numberOfThumbnails+1) * this.options.f_thumbwidth; // add one image width as tolerance range

    let imagesLeft = this.numberOfThumbnails;

    for (let i=0; i<imagesLeft; i++) {
      this.thumbnails[i].children[0].addEventListener('load', () => {
        this.thumbnails[i].aspectRatio = this.thumbnails[i].children[0].offsetWidth / this.thumbnails[i].children[0].offsetHeight;
        this.sumAspectRatios += this.thumbnails[i].aspectRatio; // + 2*parseInt(this.options.nail_margin_side) / this.thumbnails[i].children[0].offsetHeight;
        allImagesdWidth += this.thumbnails[i].children[0].offsetWidth + 2*parseInt(this.options.nail_margin_side);
        imagesLeft--;

        if ( (imagesLeft === 0) ) 
          {this.setActiveThumb(this.currentActive);}
        if ( (imagesLeft === 0) && (allImagesdWidth < thumbWidth)) 
          {this.ele.classList.add('thumb_inner_centered');}
      });
    }
  }

  /**
   * update CSS rules that are used according to the options and client
   */
  updateCSS() {
    // CSS thumbnail bar 
    //this.ele.parentElement.style.marginTop = this.options.bar_margin_top;
    //if (! this.isFirefox) this.ele.parentElement.style.height = this.options.bar_rel_height; // not in Firefox
    //this.ele.parentElement.style.height = this.options.bar_min_height; 
    
    // CSS all thumbnails
    /*
    let images = document.querySelectorAll('.th_wrap_'+ this.number +'_img');
    images.forEach(img => {
      img.style.marginRight = this.options.nail_margin_side ;
      img.style.marginLeft = this.options.nail_margin_side 
    });
    */
    // CSS for active class
    if ( this.options.nail_activeClass === 'active_border' ) {
      /* This code works but it is required to get the right stylesheet with correct filename
      // Main reason for NOT doing it this way: local testing not possible due to CORS rule of chrome
      const stylesheet = document.styleSheets[0]; 
      const borderCss = [...stylesheet.cssRules].find((r) => r.selectorText === ".thumbnail_slide.active_border");
      borderCss.style.setProperty('border-width', this.options.active_border_width);
      borderCss.style.setProperty('border-color', this.options.active_border_color);
          border-width: ${this.options.active_border_width}; 
          border-color: ${this.options.active_border_color}; 
          border-style: inset-webkit-box-sizing: border-box;
          box-sizing: border-box;
      */
      const style = document.createElement('style');
      style.innerHTML = `
        .thumbnail_slide.active_border {
          z-index: 100;
          -webkit-filter: brightness(${this.options.active_brightness});
          filter: brightness(${this.options.active_brightness});
          border-bottom: ${this.options.active_border_width} solid ${this.options.active_border_color};
          
        }`;
        
      document.head.appendChild(style);
    }

    let h = 0.8 * parseInt(this.options.bar_min_height);
    
    if ( this.isFirefox ) {
      const style = document.createElement('style');
      style.innerHTML = `
        .thumb_inner div img { 
          height: ${this.options.bar_min_height};
        }
        @media screen and (max-width: 480px) {
          .thumb_inner div img {
              height: ${h}px !important;
        }}`;
      document.head.appendChild(style);
    }

    const style = document.createElement('style');
    style.innerHTML = `
      @media screen and (max-width: 480px) {
	      .thumb_wrapper {
		        height: ${h}px !important;
	    }}`;
    document.head.appendChild(style);
  }

  /**
   * Handle mouse interaction
   * @param {event} e mouse Event 
   * @returns 
   */
  mouseDownHandler(e) {
    if ( e.target.parentElement.className !== 'thumbnail_slide') return; 
    
    this.pos = {
        // The current scroll
        left: this.ele.scrollLeft,
        top: this.ele.scrollTop,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
    };
    this.posXOld = e.clientX;
    this.ele.style.cursor = 'ew-resize'; 
    this.ele.addEventListener('mousemove', (event) => this.mouseMoveHandler(event) );
    this.ele.addEventListener('mouseup', (event) => this.mouseUpHandler(event) );
  };

  /**
   * Handle mouse interaction
   * @param {event} e mouse Event 
   * @returns 
   */
  mouseMoveHandler(e) {
    // How far the mouse has been moved
    if (e.buttons === 0) return;

    const dx = e.clientX - this.pos.x;
    //const dy = e.clientY - pos.y;
    
    // Scroll the element
    /*ele.scrollTop = pos.top - dy;*/
    this.ele.scrollLeft = this.pos.left - dx; 
  };

  /**
   * Handle mouse interaction
   * @param {event} e mouse Event 
   * @returns 
   */
  mouseUpHandler(e) {
    if ( e.target.parentElement.className !== 'thumbnail_slide') return; 

    let posXDelta = e.clientX - this.posXOld;
    
    if ( (Math.abs(posXDelta) < 5) ) {
      let thnumb = parseInt(e.composedPath()[1].id.replace('thumb','')) 
      this.setActiveThumb(thnumb)
    }

    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);

    this.ele.style.cursor = 'pointer';
    this.ele.style.removeProperty('user-select');
  };

  getAspectRatio(number) {
    let aspR = this.thumbnails[number].aspectRatio;
    if ( typeof(aspR) === 'undefined') {
      aspR = parseInt(this.options['f_thumbwidth']) / parseInt(this.options['bar_min_height']);
    }
    return aspR;
  }

  /**
   * set the active thumbnail of the bar and trigger an event that this happened.
   * @param {int} number active thumbnail number
   */
  setActiveThumb(number) {
    /* if more than one element has .activeXXX then remove class */
    if (this.activeImages.length > 0) {
      this.activeImages[0].classList.remove(this.activeClass); 
    }

    this.thumbnails[number].classList.add(this.activeClass)
    this.currentActive = number

    // scroll into viewport of parent div.
    let parentWidth = this.ele.offsetWidth; 
    let xOffset = this.ele.getBoundingClientRect().left;

    if (this.thumbnails[number].getBoundingClientRect().x - xOffset < 10) { // to left
      let toLeft = this.thumbnails[number].getBoundingClientRect().x -xOffset;
      let widthOfImageLeft = 0;
    
      if (number !== 0) {
          widthOfImageLeft = this.getAspectRatio(number-1) * this.thumbnails[number].offsetHeight; 
      }
      this.ele.scrollBy({top:0, left: (toLeft - widthOfImageLeft - this.thumbOverflow), behavior:'smooth'}); 
      
    } else if(this.thumbnails[number].getBoundingClientRect().x + this.thumbnails[number].getBoundingClientRect().width > parentWidth) { // to right
      let toLeft = this.thumbnails[number].getBoundingClientRect().x + this.thumbnails[number].getBoundingClientRect().width - parentWidth;
      toLeft = toLeft - xOffset;
      let widthOfImageRight = 0;
      if (number !== this.numberOfThumbnails-1) {
        widthOfImageRight = this.getAspectRatio(number+1) * this.thumbnails[number].offsetHeight; 
      }
      this.ele.scrollBy({top:0, left: (toLeft + widthOfImageRight + this.thumbOverflow), behavior:'smooth'}); 
    }
      
    // trigger event for map and swiper-slider. 
    const changed = new CustomEvent('thumbnailchange', {
      detail: {
          name: 'thumbnailchange',
          newslide: number,
          slider: this.number
      }
    });
    this.ele.parentElement.dispatchEvent(changed);
  }

  /**
   * resize the thumbnail bar 
   * @param {event} e resize event of the parent div
   */
  resizer = () => {
    // scroll into vieewport of parent div.
    let number = this.currentActive;
    let wrapperWidth = this.ele.parentElement.offsetWidth;  // thumb_wrapper
    let allImagesdWidth = this.sumAspectRatios * this.thumbnails[number].offsetHeight;
    if ( allImagesdWidth < 2) return;
    
    let parentWidth = this.ele.offsetWidth; // thumb_inner
    let eleWidth = this.thumbnails[number].offsetWidth;
    let offsetLeft = (parentWidth - eleWidth) / 2 // das ist das Ziel für den Offset.
    let distLeft = this.thumbnails[number].getBoundingClientRect().x;
    let toScroll =0;
    
    // remove and add class to center thumbnails with some tolerance.
    if ( (wrapperWidth-allImagesdWidth) > 2) {
      this.ele.classList.add('thumb_inner_centered');
    } else if ( (wrapperWidth-allImagesdWidth) <  -2) {
      this.ele.classList.remove('thumb_inner_centered');
    }

    // scroll only here
    if ( distLeft > (offsetLeft)) { // rechts von der Mitte: scrolle nach Links
      toScroll = distLeft -offsetLeft
      this.ele.scrollBy({top:0, left: toScroll, behavior:'instant'}); 

    } else { // links von der Mitte scrolle nach rechts
      toScroll = (offsetLeft -distLeft)
      if (toScroll > 10 ) {
        this.ele.scrollBy({top:0, left: -toScroll, behavior:'instant'}); 
      }
    }
    
  }
}