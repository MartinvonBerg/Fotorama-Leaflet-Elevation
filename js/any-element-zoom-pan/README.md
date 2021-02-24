

# jQuery ZOOM plugin

![jQuery plugin](https://jquery.com/jquery-wp-content/themes/jquery/images/logo-jquery@2x.png)

Coded by Robert Koteles, Senior Frontend Developer, 2015. This plugin was coded by me while worked as **senior web developer/web manager** at Black Sun Plc., London.

## Demo

 - [Simple demo](http://domainforssl.hu/portfolio/robertkoteles/solutions/zoom.jquery/)
 - [Fully working live page](https://www.vesuvius.com/en/about-us/where-we-operate.html)
 - [Fully working page on Internet Archive](https://web.archive.org/web/20171001151331/https://www.vesuvius.com/en/about-us/where-we-operate.html)
 - [Plugin](https://www.vesuvius.com/etc/designs/vesuvius/corporate/scripts/plugins/jquery.zoom.bs.js)
 - [Plugin on Internet Archive](https://web.archive.org/web/20161126011430/https://www.vesuvius.com/etc/designs/vesuvius/corporate/scripts/plugins/jquery.zoom.bs.js)

## Remarks
1. For proper work of this plugin please use the recommended CSS definitions of parent/children elements


## GIT Hub

Link:
[https://github.com/kotelesroberto/zoom.jquery](https://github.com/kotelesroberto/zoom.jquery)

## Clone

Clone this repo to your local machine using 
```
https://github.com/kotelesroberto/zoom.jquery.git
```

## Installation and usage

1. Simple add the code to header of the HTML page first.
```
<script type="text/javascript" src="zoom.jquery.js"></script>
```

2. Init the plugin on elements
```
let zoomMap = $('.maps-container-inner').ZoomArea({
        zoomLevel: 1,
        minZoomLevel: 1,
        maxZoomLevel: 15,
        parentOverflow: 'auto',
        exceptionsZoom: ['marker-all'],
        hideWhileAnimate: ['map-area', 'marker-all'],
        externalIncrease: '.map-control-zoomin',
        externalDecrease: '.map-control-zoomout',
        virtualScrollbars: false,
        usedAnimateMethod: 'jquery'
    });
```

## Parameters
* **zoomLevel** : 1,    Level of initial zoom. If we wanna start the plugin with double size zoom value, easy add 2 as value. Later here will be stored the actual zoom level.
* **minZoomLevel**: 0.25, limitation of zooming
* **maxZoomLevel**: 3,    limitation of zooming
* **defaultUniqueValue**, unique zoom external option value
* **defaultUniqueClass**, unique zoom external option classname
* **elementClass** : '', If it's empty, the system generates automatically the class name for identification. Important to have when plugin is called multiplicative and at zooming an element the exceptional elements contained it will be effected by the plugin only.
* **enableDrag** : false, TRUE or FALSE. If true, user can drag the zoomed element.
* **enableBringToFront**: false, TRUE or FALSE. If true, after click the element will be appearing on the front of any element (z-index).
* **left** : null,  Left offset value of the zoomed element in the parent container. If it's NULL, will be centered horizontally in the beginning.
* **top** : null,   Top offset value of the zoomed element in the parent container. If it's NULL, will be centered vertically in the beginning.
* **width** : null, Width of the zoomed element. Plugin stores this value in this variable.
* **height** : null,    Height of the zoomed element. Plugin stores this value in this variable.
* **parentOverflow** : visible, Control the overflow for parent element. visible | hidden | scroll | auto | inherit
* **mouseSensibleZoom** : true / false, If it's on, zoom center is the position of the mouse
* **usedAnimateMethod**: jquery / css / none, if it's true, the script uses JQuery animate() function to set the left/top/scale values
* **virtualScrollbars**: true or false. If true, a virtually created scrollbar will be visible to set the position of the object with it (when overfloats the parent container)
* **hideWhileAnimate**: classes to hide while animating, than again showing up
* **animateTime**: duration of the JQuery animation (valid for objects when hideWhileAnimate or usedAnimateMethod are set on)
* **parent_left** : null,   Left offset value of the zoomed element's parent. Plugin stores this value in this variable. Calculated once in INIT(). But resizing the window the plugin runs a re-configuration.
* **parent_top** : null,    Top offset value of the zoomed element's parent. Plugin stores this value in this variable. Calculated once in INIT(). But resizing the window the plugin runs a re-configuration.
* **parent_width** : null,  Width of the zoomed element's parent. Plugin stores this value in this variable. Calculated once in INIT(). But resizing the window the plugin runs a re-configuration.
* **parent_height** : null, Height of the zoomed element's parent. Plugin stores this value in this variable. Calculated once in INIT(). But resizing the window the plugin runs a re-configuration.
* **exceptionsZoom** : [ 'label', 'indicator', 'popup' ], Classes for elements to ignore from zoom in the actual container.
* **externalIncrease** : '#zoom-increase', External control (with id or class name) for increase the zoom level
* **externalDecrease** : '#zoom-decrease', External control (with id or class name) for decrease the zoom level
* **externalZoomLevel** : '#zoom-level',    External control (with id or class name) for change the zoom level with a SELECT html element
* **onBeforeLoad** : null,  Function, runs before the PLUGIN inits.
* **onAfterLoad** : null    Function, runs after the PLUGIN is done.
* **onBeforeZoom** : null   Function, runs before the ZOOM FUNCTION runs
* **onAfterZoom** : null    Function, runs after the ZOOM FUNCTION is done.
* **onBeforeDrag** : null   Function, runs before the element begin DRAGGED
* **onAfterDrag** : null    Function, runs after the drag is done and element is RELEASED (AFTER DRAGGING).


## Licence
*  **[MIT license](http://opensource.org/licenses/mit-license.php)**
*   Copyright 2015 ©  Robert Koteles.