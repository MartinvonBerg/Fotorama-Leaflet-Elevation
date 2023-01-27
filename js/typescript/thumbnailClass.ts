/*!
ThumbnailClass V 0.14.1
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
import '../thumbnailClass.css'

type posType = {
  top : number,
  left : number,
  x : number,
  y : number
};

type activeType = '' | 'active' | 'active_border' | 'active_animation';

type optionsType = {
  // classes
  bar_parentElement : string,
  nail_activeClass : activeType, // available params: active, active_animation, active_border
  // thumbnail bar
  bar_margin_top : string, // top margin of thumbnail bar in px
  bar_rel_height : string, // height of thumbnail bar in percent. Use 1% to have a fixed height
  bar_min_height : string, // Minimum height of thumbnail bar in px
  // single thumbnail
  nail_margin_side : string, // left and right margin of thumbnails in px
  // active thumbnail : only for nail_activeClass = 'active_border'
  active_brightness : string, // brightness if activate. other values are: 0.6, 0.95, 1.05 currently unused
  active_border_width : string, // width of bottom border in px
  active_border_color : string, // Colour of bottom borderin CSS-colors

  // This options are set via the js variable from PHP
  f_thumbwidth? : string,
  navposition? : string, // not used
  thumbbartype? : string, // if we are in this Class the value = 'special'

  // Also from PHP but not relevant here
  addPermalink? : string, // addPermalink,
  allImgInWPLibrary? : string, // allImgInWPLibrary,
  sw_effect ? : string, // sw_effect,
  sw_zoom ? : string, // sw_zoom,
  sw_fslightbox ? : string, // sw_fslightbox,
  sw_pagination ? : string, // sw_pagination,
  sw_slides_per_view? : string, // sw_slides_per_view, // unused with martins thumbnails
  sw_transition_duration ? : string, // sw_transition_duration,
  sw_mousewheel ? : string, // sw_mousewheel,
  sw_hashnavigation? : string, // sw_hashnavigation,
  sw_max_zoom_ratio ? : string, // sw_max_zoom_ratio,
  showcaption ? : string, // showcaption,
  shortcaption ? : string, // shortcaption,
  imgpath ? : string, // imgpath,
  slide_fit ? : string, // fit,
  sw_aspect_ratio ? : string, // ratio,
  sw_keyboard? : string, // true',
};

interface thumbnailClassInterface {
  // variables
  ele: HTMLElement;
  // methods
  setActiveThumb (number : number): void;
}

/* This section is unused ----
type mutable<Type> = {
  [Property in keyof Type]: Type[Property];
};

type newColl = mutable<HTMLCollection>;
type newElem = mutable<Element>;

type myElement = newElem & {
  aspectRatio : number;
  offsetWidth : number;
  offsetHeight: number;
}

type testColl = {
  [x: number]: myElement;
  namedItem: (name: string) => Element;
  readonly length: number;
  item: (index: number) => Element;
}
*/

class ThumbnailSlider implements thumbnailClassInterface {
  private number : number = 0
  private posXOld : number = 0
  private numberOfThumbnails: number = 0
  private activeClass : activeType = ''
  private thumbOverflow : number = 0
  private parentElement : string = ''
  private currentActive : number = 0
  private isFirefox : boolean = false
  private sumAspectRatios : number = 0
  private pos : posType = { top: 0, left: 0, x: 0, y: 0 }
  private containerObserver : ResizeObserver

  // TODO: the next two are missing or too simple
  public ele : HTMLElement
  private thumbnails : any

  // options to pass to the constructor. not all are required. pass only the ones you wish to change.
  private options : optionsType = {
    // classes
    bar_parentElement: 'thumb_inner',
    nail_activeClass: 'active', // available params: active, active_animation, active_border
    // thumbnail bar
    bar_margin_top: '3px', // top margin of thumbnail bar in px
    bar_rel_height: '15%', // height of thumbnail bar in percent. Use 1% to have a fixed height
    bar_min_height: '80px', // Minimum height of thumbnail bar in px
    // single thumbnail
    nail_margin_side: '1px', // left and right margin of thumbnails in px
    // active thumbnail : only for nail_activeClass = 'active_border'
    active_brightness: '1.05', // brightness if activate. other values are: 0.6, 0.95, 1.05 currently unused
    active_border_width: '2px', // width of bottom border in px
    active_border_color: 'red' // Colour of bottom borderin CSS-colors
  }

  /**
   * Constructor Function
   * @param number number current number of the slider on the page
   * @param {optionsType} options options to pass to the constructor. not all are required. pass only the ones you wish to change.
   */
  constructor (number : number, options: optionsType) {
    // merge option objects
    this.options = Object.assign(this.options, options)
    this.number = number

    this.parentElement = this.options.bar_parentElement + '_' + this.number.toString()
    this.ele = document.getElementById(this.parentElement)

    this.thumbnails = this.ele.children // geändert für mehrere Slider auf der Seite.
    this.numberOfThumbnails = this.thumbnails.length
    this.activeClass = this.options.nail_activeClass

    this.ele.addEventListener('mousedown', (event : Event) => this.mouseDownHandler(event), false)

    // detect firefox to prevent wrong height.
    if (navigator.userAgent.match(/firefox|fxios/i)) this.isFirefox = true

    // set-up Observer for resize event
    this.containerObserver = new ResizeObserver((e) => this.resizer(e))
    this.containerObserver.observe(this.ele.parentElement)

    this.updateCSS()

    // add a handler to every thumbnail images and do action if all images were loaded.
    const thumbWidth : number = this.ele.parentElement.offsetWidth
    let allImagesdWidth : number = 0 // (this.numberOfThumbnails+1) * this.options.f_thumbwidth; // add one image width as tolerance range
    let imagesLeft : number = this.numberOfThumbnails

    for (let i = 0; i < imagesLeft; i++) {
      this.thumbnails[i].children[0].addEventListener('load', () => {
        this.thumbnails[i].aspectRatio = this.thumbnails[i].children[0].offsetWidth / this.thumbnails[i].children[0].offsetHeight
        this.sumAspectRatios += this.thumbnails[i].aspectRatio // + 2*parseInt(this.options.nail_margin_side) / this.thumbnails[i].children[0].offsetHeight;
        allImagesdWidth += this.thumbnails[i].children[0].offsetWidth + 2 * parseInt(this.options.nail_margin_side)
        imagesLeft--

        if ((imagesLeft === 0)) { this.setActiveThumb(this.currentActive) }
        if ((imagesLeft === 0) && (allImagesdWidth < thumbWidth)) { this.ele.classList.add('thumb_inner_centered') }
      })
    }
  }

  /**
   * update CSS rules that are used according to the options and client
   */
  private updateCSS () : void {
    if (this.options.nail_activeClass === 'active_border') {
      const style : HTMLStyleElement = document.createElement('style')
      style.innerHTML = `
        #thumb_inner_${this.number} .thumbnail_slide.active_border {
          z-index: 100;
          -webkit-filter: brightness(${this.options.active_brightness});
          filter: brightness(${this.options.active_brightness});
          border-bottom: ${this.options.active_border_width} solid ${this.options.active_border_color};
          
        }`

      document.head.appendChild(style)
    }

    const h : number = 0.8 * parseInt(this.options.bar_min_height)

    if (this.isFirefox) {
      const style : HTMLStyleElement = document.createElement('style')
      style.innerHTML = `
        .thumb_inner div img { 
          height: ${this.options.bar_min_height};
        }
        @media screen and (max-width: 480px) {
          .thumb_inner div img {
              height: ${h}px !important;
        }}`
      document.head.appendChild(style)
    }

    const style : HTMLStyleElement = document.createElement('style')
    style.innerHTML = `
      @media screen and (max-width: 480px) {
        .thumb_wrapper {
            height: ${h}px !important;
      }}`
    document.head.appendChild(style)
  }

  /**
   * Handle mouse interaction
   * @param event e mouse Event
   * @returns
   */
  private mouseDownHandler (e : any) : void {
    if (e.target.parentElement.className !== 'thumbnail_slide') return

    this.pos = {
      // The current scroll
      left: this.ele.scrollLeft,
      top: this.ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY
    }
    this.posXOld = e.clientX
    this.ele.style.cursor = 'ew-resize'
    this.ele.addEventListener('mousemove', (event : Event) => this.mouseMoveHandler(event))
    this.ele.addEventListener('mouseup', (event : Event) => this.mouseUpHandler(event))
  };

  /**
   * Handle mouse interaction
   * @param event e mouse Event
   * @returns
   */
  private mouseMoveHandler (e : any) : void {
    // How far the mouse has been moved
    if (e.buttons === 0) return

    const dx : number = e.clientX - this.pos.x
    // const dy = e.clientY - pos.y;

    // Scroll the element
    /* ele.scrollTop = pos.top - dy; */
    this.ele.scrollLeft = this.pos.left - dx
  };

  /**
   * Handle mouse interaction
   * @param event e mouse Event
   * @returns
   */
  private mouseUpHandler (e : any) : void {
    if (e.target.parentElement.className !== 'thumbnail_slide') return

    const posXDelta : number = e.clientX - this.posXOld

    if ((Math.abs(posXDelta) < 5)) {
      const thnumb : number = parseInt(e.composedPath()[1].id.replace('thumb', ''))
      this.setActiveThumb(thnumb)
    }

    document.removeEventListener('mousemove', this.mouseMoveHandler)
    document.removeEventListener('mouseup', this.mouseUpHandler)

    this.ele.style.cursor = 'pointer'
    this.ele.style.removeProperty('user-select')
  };

  /**
   *
   * @param number
   * @returns
   */
  private getAspectRatio (number : number) : number {
    let aspR : any = this.thumbnails[number].aspectRatio
    if (typeof (aspR) === 'undefined') {
      aspR = parseInt(this.options.f_thumbwidth) / parseInt(this.options.bar_min_height)
    }
    return aspR
  }

  /**
   * set the active thumbnail of the bar and trigger an event that this happened.
   * @param number number active thumbnail number
   */
  public setActiveThumb (number : number, caller = '') : void {
    // remove active class
    // @ts-ignore // TODO
    this.ele.childNodes[this.currentActive].classList.remove(this.activeClass)
    // set active class and number
    this.thumbnails[number].classList.add(this.activeClass)

    // scroll into viewport of parent div.
    const parentWidth : number = this.ele.offsetWidth
    const xOffset : number = this.ele.getBoundingClientRect().left

    if (this.thumbnails[number].getBoundingClientRect().x - xOffset < 10) { // to left
      const toLeft : number = this.thumbnails[number].getBoundingClientRect().x - xOffset
      let widthOfImageLeft : number = 0

      if (number !== 0) {
        widthOfImageLeft = this.getAspectRatio(number - 1) * this.thumbnails[number].offsetHeight
      }
      this.ele.scrollBy({ top: 0, left: (toLeft - widthOfImageLeft - this.thumbOverflow), behavior: 'smooth' })
    } else if (this.thumbnails[number].getBoundingClientRect().x + this.thumbnails[number].getBoundingClientRect().width > parentWidth) { // to right
      let toLeft : number = this.thumbnails[number].getBoundingClientRect().x + this.thumbnails[number].getBoundingClientRect().width - parentWidth
      toLeft = toLeft - xOffset
      let widthOfImageRight : number = 0
      if (number !== this.numberOfThumbnails - 1) {
        widthOfImageRight = this.getAspectRatio(number + 1) * this.thumbnails[number].offsetHeight
      }
      this.ele.scrollBy({ top: 0, left: (toLeft + widthOfImageRight + this.thumbOverflow), behavior: 'smooth' })
    }

    // trigger event for map and swiper-slider.
    const changed : CustomEvent = new CustomEvent('thumbnailchange', {
      detail: {
        name: 'thumbnailchange',
        newslide: number,
        slider: this.number
      }
    })

    if (this.currentActive !== number && caller !== 'slideChange') {
      this.ele.parentElement.dispatchEvent(changed)
    }
    this.currentActive = number
  }

  /**
   * resize the thumbnail bar
   * @param event e resize event of the parent div
   */
  private resizer = (e : any) : void => {
    // scroll into vieewport of parent div.
    const number : number = this.currentActive
    const wrapperWidth : number = this.ele.parentElement.offsetWidth // thumb_wrapper
    const allImagesdWidth : number = this.sumAspectRatios * this.thumbnails[number].offsetHeight
    if (allImagesdWidth < 2) return

    const parentWidth : number = this.ele.offsetWidth // thumb_inner
    const eleWidth : number = this.thumbnails[number].offsetWidth
    const offsetLeft : number = (parentWidth - eleWidth) / 2 // das ist das Ziel für den Offset.
    const distLeft : number = this.thumbnails[number].getBoundingClientRect().x
    let toScroll : number = 0

    // remove and add class to center thumbnails with some tolerance.
    if ((wrapperWidth - allImagesdWidth) > 2) {
      this.ele.classList.add('thumb_inner_centered')
    } else if ((wrapperWidth - allImagesdWidth) < -2) {
      this.ele.classList.remove('thumb_inner_centered')
    }

    // scroll only here
    if (distLeft > (offsetLeft)) { // rechts von der Mitte: scrolle nach Links
      toScroll = distLeft - offsetLeft
      this.ele.scrollBy({ top: 0, left: toScroll, behavior: 'smooth' })
    } else { // links von der Mitte scrolle nach rechts
      toScroll = (offsetLeft - distLeft)
      if (toScroll > 10) {
        this.ele.scrollBy({ top: 0, left: -toScroll, behavior: 'smooth' })
      }
    }
  }
}

export { ThumbnailSlider }
