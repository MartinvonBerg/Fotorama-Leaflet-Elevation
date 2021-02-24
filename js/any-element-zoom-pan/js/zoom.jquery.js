/******************************************************
*	Zoom JQuery Plugin v4 written by
*	Robert Koteles, Senior Web Developer
*	2015
*
*   Version history
*   ------------------
*   v4
*   added destroy function that is possible to call from external
*   usedAnimateMethod parameter added
*   hideWhileAnimate elements added
*   zoomingToPoint function added
*
*
*   v3.8
*   mouseSensibleZoom parameter added
*   scrollbar-arrow click issue fixed
*
*   v3.7
*   strict mode
*
*   v3.6
*   Mozilla bug fixed: the browser can read out the value of visible option elements.
*
*   v3.5
*   scrollbar arrows work and move the object on canvas with the dragBar together
*
*   v3.4
*   scrollbars are bind to object moving and in reverse
*
*   v3.3
*   scrollbars are max 1/4 of the parent container like in PhotoShop
*
*   v3.2
*   Unique zoom level value is displayed in selectbox
*
*   v3.1
*   Using virtual scrollbars when object is out of the parent container
*   Min and Max zoom level
*   Added class to unique external zoom control option
*   Using virtual scrollbars is set by params
*
*   v3.0
*   Supported touch movements
******************************************************/

/******************************************************
*	PARAMETERS
*	----------
*	zoomLevel : 1,	Level of initial zoom. If we wanna start the plugin with double size zoom value, easy add 2 as value. Later here will be stored the actual zoom level.
*   minZoomLevel: 0.25, limitation of zooming
*   maxZoomLevel: 3,    limitation of zooming
*   defaultUniqueValue, unique zoom external option value
*   defaultUniqueClass, unique zoom external option classname
*	elementClass : '', If it's empty, the system generates automatically the class name for identification. Important to have when plugin is called multiplicative and at zooming an element the exceptional elements contained it will be effected by the plugin only.
*	enableDrag : false, TRUE or FALSE. If true, user can drag the zoomed element.
    enableBringToFront: false, TRUE or FALSE. If true, after click the element will be appearing on the front of any element (z-index).
*	left : null,  Left offset value of the zoomed element in the parent container. If it's NULL, will be centered horizontally in the beginning.
*	top : null,	Top offset value of the zoomed element in the parent container. If it's NULL, will be centered vertically in the beginning.
*	width : null,	Width of the zoomed element. Plugin stores this value in this variable.
*	height : null,	Height of the zoomed element. Plugin stores this value in this variable.
*	parentOverflow : visible, Control the overflow for parent element. visible | hidden | scroll | auto | inherit
*	mouseSensibleZoom : true / false, If it's on, zoom center is the position of the mouse
*	usedAnimateMethod: jquery / css / none, if it's true, the script uses JQuery animate() function to set the left/top/scale values
*   virtualScrollbars: true or false. If true, a virtually created scrollbar will be visible to set the position of the object with it (when overfloats the parent container)
*   hideWhileAnimate: classes to hide while animating, than again showing up
*   animateTime: duration of the JQuery animation (valid for objects when hideWhileAnimate or usedAnimateMethod are set on)
*	parent_left : null,	Left offset value of the zoomed element's parent. Plugin stores this value in this variable. Calculated once in INIT(). But resizing the window the plugin runs a re-configuration.
*	parent_top : null,	Top offset value of the zoomed element's parent. Plugin stores this value in this variable. Calculated once in INIT(). But resizing the window the plugin runs a re-configuration.
*	parent_width : null,	Width of the zoomed element's parent. Plugin stores this value in this variable. Calculated once in INIT(). But resizing the window the plugin runs a re-configuration.
*	parent_height : null,	Height of the zoomed element's parent. Plugin stores this value in this variable. Calculated once in INIT(). But resizing the window the plugin runs a re-configuration.
*	exceptionsZoom : [ 'label', 'indicator', 'popup' ], Classes for elements to ignore from zoom in the actual container.
*	externalIncrease : '#zoom-increase', External control (with id or class name) for increase the zoom level
*	externalDecrease : '#zoom-decrease', External control (with id or class name) for decrease the zoom level
*	externalZoomLevel : '#zoom-level',	External control (with id or class name) for change the zoom level with a SELECT html element
*	onBeforeLoad : null,	Function, runs before the PLUGIN inits.
*	onAfterLoad : null	Function, runs after the PLUGIN is done.
*	onBeforeZoom : null	Function, runs before the ZOOM FUNCTION runs
*	onAfterZoom : null	Function, runs after the ZOOM FUNCTION is done.
*	onBeforeDrag : null	Function, runs before the element begin DRAGGED
*	onAfterDrag : null	Function, runs after the drag is done and element is RELEASED (AFTER DRAGGING).
******************************************************/

(function($) {
    $.fn.hasScrollBar = function() {
        //return this.get(0).scrollHeight > this.height();
        return this.get(0).scrollHeight > this.get(0).clientHeight;
    }
})(jQuery);

(function($) {

    "use strict";

    //$.fn.ZoomArea
    $.fn.ZoomArea = function(options) {

        var settings = $.extend({
            zoomLevel: 1,
            minZoomLevel: 0.25,
            maxZoomLevel: 3,
            defaultUniqueValue: 'unique',
            defaultUniqueClass: 'unique-option',
            elementClass: '',
            enableDrag: true,
            enableBringToFront: false,
            left: null,
            top: null,
            width: null,
            height: null,
            parentOverflow: 'visible',
            mouseSensibleZoom: true,
            usedAnimateMethod: 'css',
            virtualScrollbars:true,
            hideWhileAnimate: ['hideWhileAnimate'], /*classes to hide while animating, than again showing up*/
            animateTime: 300,
            parent_left: null,
            parent_top: null,
            parent_width: null,
            parent_height: null,
            exceptionsZoom: ['noZoom'], /*classes to ignore from zoom*/
            exceptionsWholeZoom: ['overset-text'], /*classes to stop whole zoom*/
            exceptionsDrag: ['noDrag'], /*classes to ignore from drag*/
            externalIncrease: '#zoom-increase',
            externalDecrease: '#zoom-decrease',
            externalZoomLevel: '#zoom-level',
            onBeforeLoad: null,
            onAfterLoad: null,
            onBeforeZoom: null,
            onAfterZoom: null,
            onBeforeDrag: null,
            onAfterDrag: null
        }, options);

        var _this = this;

        var currentMousePos = { x: $(window).width() / 2, y: $(window).height() / 2 };
        var parentPadding = 20;
        var gapBetweenMouseAndElement = { v: 0, h: 0 };
        var gapBetweenMouseAndElementZoomed = { v: 0, h: 0 };
        var pinchStart = [];
        var pinchEnd = [];
        var prevC2 = 0;
        var scrollBarActive = false;

        settings.elementClass = (settings.elementClass != '') ? settings.elementClass : 'zoomedElement' + getRandomArbitrary(1, 1000);

        if( settings.usedAnimateMethod === 'css' ) {
        	_this.addClass('animateCSS');
        }

        _this.addClass('zoomedElement');
        _this.addClass(settings.elementClass);
        _this.css("position", "absolute");
        _this.parent().addClass('unselectable');

        /******************
    	 * EVENT LISTENERS
    	 ******************/
        $(window).on("resize", resizeWindowCalls);

        _this.on("click", onClickCalls);
        _this.on("mousemove", mouseMoveCalls);
        _this.on("mousedown", mouseDownCalls);
        _this.on("mouseleave", disableDragging);
        _this.on("mouseup", disableDragging);
        _this.on("mouseleave", mouseLeaveCalls);



        /***********************************SANDBOX*********************************/

        //touch devices
        _this.on("touchstart", onClickCalls);
        _this.on("touchstart", touchDownCalls);
        _this.on("touchmove", touchMoveCalls);
        _this.on("touchend", disableDragging);
        //pinch
        _this.on("touchend", endPinch);
        _this.on("gesturechange", gestureChange);

        function gestureChange(event) {
            event.preventDefault();
        }

        function touchDownCalls(event) {

            enableDragging();

            if (event.originalEvent.touches.length == 2) { //2 fingers

                disableDragging();

                event = event.originalEvent;

                for (var i = 0; i < event.touches.length; i++) {
                    pinchStart.push({ x: event.touches[i].clientX, y: event.touches[i].clientY });
                }

                _this.on("touchmove", processPinch);

            } else {
                pinchStart = [];

                logTouchPosition(event);

                var beforeDraggingDatas = beforeDragging();
                gapBetweenMouseAndElement.h = beforeDraggingDatas.h_dist_Mouse_Left1_1;
                gapBetweenMouseAndElement.v = beforeDraggingDatas.v_dist_Mouse_Top1_1;
                gapBetweenMouseAndElementZoomed.h = beforeDraggingDatas.h_dist_Mouse_Left2_1;
                gapBetweenMouseAndElementZoomed.v = beforeDraggingDatas.v_dist_Mouse_Top2_1;
            }

        }

        function touchMoveCalls(event) {
            logTouchPosition(event);
            dragWithFinger(event);
        }

        function logTouchPosition(event) {
            event = event || window.event; //For IE
            currentMousePos.x = event.pageX;
            currentMousePos.y = event.pageY;
        }

        function dragWithFinger(event) {
            dragWithMouse(event);
        }


        function processPinch(event) {

            var defaultUniqueOptionValue = $('.' + settings.defaultUniqueClass).val();
            $(settings.externalZoomLevel).val(defaultUniqueOptionValue);

            event = event.originalEvent;

            pinchEnd[0] = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            pinchEnd[1] = { x: event.touches[1].clientX, y: event.touches[1].clientY };

            var a1 = Math.abs(pinchStart[0].x - pinchStart[1].x);
            var b1 = Math.abs(pinchStart[0].y - pinchStart[1].y);
            var c1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));

            var centerX = a1 / 2;
            var centerY = b1 / 2;

            var a2 = Math.abs(pinchEnd[0].x - pinchEnd[1].x);
            var b2 = Math.abs(pinchEnd[0].y - pinchEnd[1].y);
            var c2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));

            prevC2 = !prevC2 ? c2 : prevC2;

            // need to zoom
            if (prevC2 < c2) {
                if (c2 > c1) {
                    settings.zoomLevel += Math.abs((c2 - c1) / c1 / 100) * settings.zoomLevel;
                } else {
                    settings.zoomLevel -= Math.abs((c1 - c2) / c1 / 100) * settings.zoomLevel;
                }
            } else {
                if (c2 > c1) {
                    settings.zoomLevel += Math.abs((c1 - c2) / c2 / 100) * settings.zoomLevel;
                } else {
                    settings.zoomLevel -= Math.abs((c2 - c1) / c2 / 100) * settings.zoomLevel;
                }
            }

            settings.zoomLevel = settings.zoomLevel < 0 ? 0.1 : settings.zoomLevel;


            prevC2 = c2;

            zoomingExternal(_this);

        }

        function endPinch(event) {

            if (!event.originalEvent.touches.length) {
                pinchStart = [];
                pinchEnd = [];
                _this.off("touchmove", processPinch);
                enableDragging();
            }
        }

        /***********************************SANDBOX*********************************/



        /******************
    	 * EXTERNAL CONTROLS
    	 ******************/
        if (settings.externalIncrease) {
            $(settings.externalIncrease).bind("click", function(event) {
            	var previousZoomLevel = settings.zoomLevel;
                settings.zoomLevel = settings.zoomLevel * 1.3;

                if (settings.zoomLevel > settings.maxZoomLevel) {
                    settings.zoomLevel = settings.maxZoomLevel;
                }

                zoomingToCentreOfView(_this,settings.zoomLevel, previousZoomLevel);
            });
        }
        if (settings.externalDecrease) {
            $(settings.externalDecrease).bind("click", function(event) {
            	var previousZoomLevel = settings.zoomLevel;
                settings.zoomLevel = settings.zoomLevel * (1 / 1.3);

                if (settings.zoomLevel < settings.minZoomLevel) {
                    settings.zoomLevel = settings.minZoomLevel;
                }

                zoomingToCentreOfView(_this,settings.zoomLevel, previousZoomLevel);
            });
        }
        if (settings.externalZoomLevel) {
            $(settings.externalZoomLevel).bind("change", function(event) {

                var selectedZoomLevel = $(settings.externalZoomLevel).val();

                //$(settings.externalZoomLevel).children('option.' + settings.defaultUniqueClass).text('Unique');
                //$(settings.externalZoomLevel).children('option.' + settings.defaultUniqueClass).val(''+settings.defaultUniqueValue+'');

                switch (selectedZoomLevel) {
                    case 'besttofit': {
                        zoomingToFit(_this);
                        break;
                    }
                    case 'unique': {
                        break;
                    }
                    default: {
                        settings.zoomLevel = selectedZoomLevel / 100;
                        zoomingExternal(_this);
                        break;
                    }
                }

            });
        }



        /******************
    	 * onBeforeLoad function
    	 ******************/
        //callback when plugin is starting to run
        if ($.isFunction(settings.onBeforeLoad)) {
            settings.onBeforeLoad.call(_this);
        }

        /******************
    	 * call INIT
    	 ******************/

        init(_this);
        setAntiDragElements();
        setElementsToPreventZoom();

        function getRandomArbitrary(min, max) {
            return parseInt(Math.random() * (max - min) + min);
        }

        /******************
    	 * Dragging with mouse
    	 ******************/
        function resizeWindowCalls(event) {
            init(_this);
        }

        function onClickCalls(event) {
            if (settings.enableBringToFront) {
                $('.top-element').removeClass('top-element');
                _this.addClass('top-element');
            }
        }

        function mouseMoveCalls(event) {
            logMousePosition(event);
            dragWithMouse(event);
        }

        function mouseDownCalls() {
            enableDragging();
            var beforeDraggingDatas = beforeDragging();
            gapBetweenMouseAndElement.h = beforeDraggingDatas.h_dist_Mouse_Left1_1;
            gapBetweenMouseAndElement.v = beforeDraggingDatas.v_dist_Mouse_Top1_1;
            gapBetweenMouseAndElementZoomed.h = beforeDraggingDatas.h_dist_Mouse_Left2_1;
            gapBetweenMouseAndElementZoomed.v = beforeDraggingDatas.v_dist_Mouse_Top2_1;
        }

        function mouseLeaveCalls() {
            $('.draggable').removeClass('draggable');
            $('body').removeClass('zoomDrag');
        }

        function beforeDragging() {
            if (!settings.enableDrag) { return true; }

            /*CALCULATING LEFT POSITION*/
            var h_center1_1 = settings.left + (settings.width / 2);
            var h_left2_1 = h_center1_1 - (settings.width * settings.zoomLevel / 2);
            //currentMousePos.x = currentMousePos.x?currentMousePos.x:h_center1_1;
            var h_dist_Mouse_Left2_1 = currentMousePos.x - settings.parent_left - h_left2_1;
            var h_dist_Mouse_Left1_1 = h_dist_Mouse_Left2_1 / settings.zoomLevel;

            /*CALCULATING TOP POSITION*/
            var v_center1_1 = settings.top + (settings.height / 2);
            var v_top2_1 = v_center1_1 - (settings.height * settings.zoomLevel / 2);
            //currentMousePos.y = currentMousePos.y?currentMousePos.y:v_center1_1;
            var v_dist_Mouse_Top2_1 = currentMousePos.y - settings.parent_top - v_top2_1;
            var v_dist_Mouse_Top1_1 = v_dist_Mouse_Top2_1 / settings.zoomLevel;


            return {
                h_center1_1: h_center1_1,
                h_left2_1: h_left2_1,
                h_dist_Mouse_Left2_1: h_dist_Mouse_Left2_1,
                h_dist_Mouse_Left1_1: h_dist_Mouse_Left1_1,

                v_center1_1: v_center1_1,
                v_top2_1: v_top2_1,
                v_dist_Mouse_Top2_1: v_dist_Mouse_Top2_1,
                v_dist_Mouse_Top1_1: v_dist_Mouse_Top1_1
            }

        }

        function dragWithMouse(event) {

            if (!settings.enableDrag || !_this.hasClass('draggable') || _this.hasClass('mouseIsOverNonDraggableElement')) { return true; }

            event.stopPropagation();
            event.preventDefault();

            var newLeftZoomed = currentMousePos.x - settings.parent_left - gapBetweenMouseAndElementZoomed.h;
            var newTopZoomed = currentMousePos.y - settings.parent_top - gapBetweenMouseAndElementZoomed.v;

            var WidthZoomed = settings.width * settings.zoomLevel;
            var h_center2_1 = newLeftZoomed + (WidthZoomed / 2); /* h_center2_1 = h_center1_1, common centre point */

            var HeightZoomed = settings.height * settings.zoomLevel;
            var v_center2_1 = newTopZoomed + (HeightZoomed / 2); /* v_center2_1 = v_center1_1, common centre point */

            var newLeft = h_center2_1 - (settings.width / 2);
            var newTop = v_center2_1 - (settings.height / 2);

            settings.left = newLeft;
            settings.top = newTop;

            _this.css({
                left: settings.left + 'px',
                top: settings.top + 'px'
            });

            changeScrollbar();

        }

        function enableDragging() {

            if (!settings.enableDrag) { return true; }

            if ($.isFunction(settings.onBeforeDrag)) {
                settings.onBeforeDrag.call(this);
            }

            _this.addClass('draggable');
            $('body').addClass('zoomDrag');
        }

        function disableDragging() {

            if (!settings.enableDrag) { return true; }

            _this.removeClass('draggable');
            $('body').removeClass('zoomDrag');
            _this.removeClass('mouseIsOverNonDraggableElement');

            if ($.isFunction(settings.onAfterDrag)) {
                settings.onAfterDrag.call(this);
            }
        }

        /******************
    	 * Mouse events
    	 ******************/
        function logMousePosition(event) {
            event = event || window.event; //For IE
            currentMousePos.x = event.pageX;
            currentMousePos.y = event.pageY;
        }


        _this.mousewheel(function(event, delta) {

            if (!_this.hasClass('stopZoom')) {
                event.stopPropagation();
                event.preventDefault();
                zooming(_this, event, delta);
            }

        });

        function resetSettings() {
            settings.left = null;
            settings.top = null;
            settings.parent_left = null;
            settings.parent_top = null;
            settings.parent_width = null;
            settings.parent_height = null;
            settings.zoomLevel = 1;
        }

        function setParentOverflow() {
            _this.parent().css('overflow', settings.parentOverflow);
        }


        /******************
    	 * Scrollbars
    	 ******************/
        var gapY = 0,
            gapX = 0,
            _thisDragBar;

        function setVirtualScrollbars() {

            if (!settings.virtualScrollbars || scrollBarActive || $('html').hasClass('touch')) { return false; }

            var scrollbarVertical = '<div class="scrollbar vertical-scrollbar" data-objectclass="' + settings.elementClass + '">' +
                                        '	<div class="up scrollbar-arrow"></div>' +
                                        '	<div tabindex="0" class="track">' +
                                        '		<div tabindex="0" class="dragBar vertical"></div>' +
                                        '	</div>' +
                                        '	<div class="down scrollbar-arrow"></div>' +
                                        '</div>';

            var scrollbarHorizontal = '<div class="scrollbar horizontal-scrollbar" data-objectclass="' + settings.elementClass + '">' +
                                        '	<div class="left scrollbar-arrow"></div>' +
                                        '	<div tabindex="0" class="track">' +
                                        '		<div tabindex="0" class="dragBar horizontal"></div>' +
                                        '	</div>' +
                                        '	<div class="right scrollbar-arrow"></div>' +
                                        '</div>';
            _this.parent().append(scrollbarVertical);
            _this.parent().append(scrollbarHorizontal);

            scrollBarActive = true;

            $('.scrollbar-arrow').on("mousedown", function(e) {
                var _thisArrow = $(this);
                var _thisDragBar = _thisArrow.siblings('.track').children('.dragBar');
                var pos_y_init = 0,
	                pos_x_init = 0,
	                pos_y = 0,
	                pos_x = 0;
                var step = 10;

                if (_thisArrow.hasClass('left')) {
                    pos_y = parseInt(_thisDragBar.css('top'));
                    pos_x = parseInt(_thisDragBar.css('left')) - step;
                    pos_x = (pos_x < 0) ? 0 : pos_x;
                }
                if (_thisArrow.hasClass('right')) {
                    pos_y = parseInt(_thisDragBar.css('top'));
                    pos_x = parseInt(_thisDragBar.css('left')) + step;
                    pos_x = (pos_x > (_thisDragBar.parent().width() - _thisDragBar.width())) ? (_thisDragBar.parent().width() - _thisDragBar.width()) : pos_x;
                }
                if (_thisArrow.hasClass('up')) {
                    pos_y = parseInt(_thisDragBar.css('top')) - step;
                    pos_x = parseInt(_thisDragBar.css('left'));
                    pos_y = (pos_y < 0) ? 0 : pos_y;
                }
                if (_thisArrow.hasClass('down')) {
                    pos_y = parseInt(_thisDragBar.css('top')) + step;
                    pos_x = parseInt(_thisDragBar.css('left'));
                    pos_y = (pos_y > (_thisDragBar.parent().height() - _thisDragBar.height())) ? (_thisDragBar.parent().height() - _thisDragBar.height()) : pos_y;
                }

                movingObjectByScrollbar(_thisDragBar, $(this), pos_x, pos_y);

            });

            $('.dragBar').on("mousedown", function(e) {

                _thisDragBar = $(this);

                _thisDragBar.addClass('draggable').closest('.scrollbar').addClass('active-handle');

                $('body').on("mousemove", dragBarMove);

                $('body').on("mouseup", function dragBarBodyMouseUp(event) {
                    $('body').off("mousemove", dragBarMove);
                    $('body').off("mouseup", dragBarBodyMouseUp);

                    $('.scrollbar .draggable').removeClass('draggable');
                    $('.scrollbar .active-handle').removeClass('active-handle');
                    gapY = 0;
                    gapX = 0;
                });
                /*
                _this.parent().on("mouseleave", function dragBarZoomedelementParentMouseLeave(event) {
                    console.log('you left scrollbar');
                    $('body').off("mousemove", dragBarMove);
                    _this.parent().off("mouseleave", dragBarZoomedelementParentMouseLeave);

                    $('.draggable').removeClass('draggable');
                    $('.active-handle').removeClass('active-handle');
                    gapY = 0;
                    gapX = 0;
                });
                */
            });

        }


        function dragBarMove(event) {

            event.stopPropagation();
            event.preventDefault();

            var drg_h = _thisDragBar.outerHeight(),
                drg_w = _thisDragBar.outerWidth(),
                pos_y_init = 0,
                pos_x_init = 0,
                pos_y = 0,
                pos_x = 0,
                direction_x,
                direction_y,
                usedZoomLevel;

            var thisOffset = _thisDragBar.offset();
            var thisParentOffset = _thisDragBar.parent().offset();

            logMousePosition(event);

            gapY = gapY ? gapY : (currentMousePos.y - thisOffset.top);
            gapX = gapX ? gapX : (currentMousePos.x - thisOffset.left);

            pos_x_init = parseInt(_thisDragBar.css('left'));
            pos_y_init = parseInt(_thisDragBar.css('top'));

            pos_y = (currentMousePos.y - thisParentOffset.top) - gapY;
            pos_x = (currentMousePos.x - thisParentOffset.left) - gapX;

            direction_x = ((pos_x_init - pos_x) > 0) ? -1 : 1; //-1 is dragging dragbar from right to left
            direction_y = ((pos_y_init - pos_y) > 0) ? -1 : 1; //-1 is dragging dragbar from bottom to top

            /* movement limitations */
            if ((currentMousePos.y - gapY) < (thisParentOffset.top + 20)) {
                pos_y = 0;
            }

            if ((currentMousePos.y + drg_h - gapY) > (thisParentOffset.top + _thisDragBar.parent().height() - 20)) {
                pos_y = _thisDragBar.parent().height() - drg_h;
            }

            if ((currentMousePos.x - gapX) < (thisParentOffset.left + 20)) {
                pos_x = 0;
            }

            if ((currentMousePos.x + drg_w - gapX) > (thisParentOffset.left + _thisDragBar.parent().width() - 20)) {
                pos_x = _thisDragBar.parent().width() - drg_w;
            }

            movingObjectByScrollbar(_thisDragBar, '', pos_x, pos_y);

        }

        function changeScrollbar() {

            if (!settings.virtualScrollbars) { return false; }

            /* horizontal scrollbar*/
            if (
                    ((settings.left + settings.width / 2) - (settings.width / 2 * settings.zoomLevel) < 0) ||
                    ((settings.left + settings.width / 2) + (settings.width / 2 * settings.zoomLevel) > (settings.parent_width))
                ) {
                $('.horizontal-scrollbar').addClass('visible');
            } else {
                $('.horizontal-scrollbar').removeClass('visible');
            }

            var w1 = (settings.left + settings.width / 2) - (settings.width / 2 * settings.zoomLevel);
            w1 = (w1 < 0) ? w1 : 0;
            var w1Percent = (w1 / (settings.width / 2 * settings.zoomLevel)) * 100;

            var w2 = (settings.left + settings.width / 2) + (settings.width / 2 * settings.zoomLevel);
            w2 = (w2 > settings.parent_width) ? (w2 - settings.parent_width) : 0;
            var w2Percent = (w2 / (settings.width / 2 * settings.zoomLevel)) * 100;

            //calculate centre
            var parentCentreX = settings.parent_width / 2;
            var objectCentreX = settings.left + (settings.width / 2);
            var objectCentreXPercent = ((objectCentreX - parentCentreX) / settings.parent_width) * 100;

            var horScrollBarWidth = ((settings.parent_width / (settings.width * settings.zoomLevel)) / 4) * 100;
            horScrollBarWidth = (horScrollBarWidth > 25) ? 25 : horScrollBarWidth;
            var horScrollBarLeft = 50 - (horScrollBarWidth / 2) + ((((settings.parent_width / 2) - (settings.left + settings.width / 2)) / settings.parent_width) * 100 / 3);

            $('.horizontal-scrollbar .track .dragBar').css('width', (horScrollBarWidth) + '%');
            $('.horizontal-scrollbar .track .dragBar').css('left', horScrollBarLeft + '%');


            /* vertical scrollbar*/
            if (
                    ((settings.top + settings.height / 2) - (settings.height / 2 * settings.zoomLevel) < 0) ||
                    ((settings.top + settings.height / 2) + (settings.height / 2 * settings.zoomLevel) > (settings.parent_height))
                ) {
                $('.vertical-scrollbar').addClass('visible');
            } else {
                $('.vertical-scrollbar').removeClass('visible');
            }

            var h1 = (settings.top + settings.height / 2) - (settings.height / 2 * settings.zoomLevel);
            h1 = (h1 < 0) ? h1 : 0;
            var h1Percent = (h1 / (settings.height / 2 * settings.zoomLevel)) * 100;

            var h2 = (settings.top + settings.height / 2) + (settings.height / 2 * settings.zoomLevel);
            h2 = (h2 > settings.parent_height) ? (h2 - settings.parent_height) : 0;
            var h2Percent = (h2 / (settings.height / 2 * settings.zoomLevel)) * 100;

            //calculate centre
            var parentCentreY = settings.parent_height / 2;
            var objectCentreY = settings.top + (settings.height / 2);

            var verScrollBarHeight = ((settings.parent_height / (settings.height * settings.zoomLevel)) / 4) * 100;
            verScrollBarHeight = (verScrollBarHeight > 25) ? 25 : verScrollBarHeight;
            var verScrollBarTop = 50 - (verScrollBarHeight / 2) + ((((settings.parent_height / 2) - (settings.top + settings.height / 2)) / settings.parent_height) * 100 / 3);

            $('.vertical-scrollbar .track .dragBar').css('height', (verScrollBarHeight) + '%');
            $('.vertical-scrollbar .track .dragBar').css('top', verScrollBarTop + '%');
        }

        function movingObjectByScrollbar(_thisDragBar, _source, pos_x, pos_y) {

            /* moving the object */
            if (_thisDragBar.hasClass('vertical')) {

                var _parentHeight = _thisDragBar.parent().height();

                var _top = parseInt(_thisDragBar.css('top'));

                if (_source) {
                    _top = pos_y;
                }

                var _topPercent = parseInt((_top / _parentHeight) * 100);

                var _height = parseInt(_thisDragBar.height());
                var _heightPercent = parseInt((_height / _parentHeight) * 100);

                var diffCentre = (_parentHeight / 2) - (_top + (_height / 2));
                var diffCentrePercent = (50 - (_topPercent + (_heightPercent / 2))) * 3;

                settings.top = (settings.parent_height / 2) - ((settings.height / 2)) + ((diffCentrePercent / 100) * (settings.parent_height));

                _this.css({
                    top: settings.top + 'px'
                });

            } else {

                var _parentWidth = _thisDragBar.parent().width();

                var _left = parseInt(_thisDragBar.css('left'));

                if (_source) {
                    _left = pos_x;
                }

                var _leftPercent = parseInt((_left / _parentWidth) * 100);

                var _width = parseInt(_thisDragBar.width());
                var _widthPercent = parseInt((_width / _parentWidth) * 100);

                var diffCentre = (_parentWidth / 2) - (_left + (_width / 2));
                var diffCentrePercent = (50 - (_leftPercent + (_widthPercent / 2))) * 3;

                settings.left = (settings.parent_width / 2) - ((settings.width / 2)) + ((diffCentrePercent / 100) * (settings.parent_width));

                _this.css({
                    left: settings.left + 'px'
                });

            }

            _thisDragBar.css({
                top: pos_y,
                left: pos_x
            });


        }
        /******************
    	 * Non draggable elements in the element (musn't drag the parent when mouse is over these elements)
    	 ******************/
        function setAntiDragElements() {
            /*ELEMENTS WILL HAVE NORMAL EVENT AND NOT DRAG THE PARENT*/
            for (var prop = 0; prop < settings.exceptionsDrag.length; prop++) {
                $('.' + settings.elementClass + ' .' + settings.exceptionsDrag[prop]).each(function() {
                    var _thisClickable = $(this);
                    _thisClickable.on("mousedown", function(event) {
                        //console.log('you clicked on a non draggable element');
                        _this.addClass('mouseIsOverNonDraggableElement');
                    });
                    _thisClickable.on("mouseup", function(event) {
                        //_this.removeClass('mouseIsOverNonDraggableElement');
                        disableDragging();
                    });
                    _thisClickable.on("mouseleave", function(event) {
                        //_this.removeClass('mouseIsOverNonDraggableElement');
                        disableDragging();
                    });
                });
            }
        }


        /******************
    	 * Using SVG elements on the zooming object may causes blurry SVG images. This is the solution of prevent it.
    	 ******************/
        function hideElementsBeforeAnimate(){
        	/*ELEMENTS FOR HIDING WHILE ANIMATE*/
            for (var prop = 0; prop < settings.hideWhileAnimate.length; prop++) {
                $('.' + settings.elementClass + ' .' + settings.hideWhileAnimate[prop]).each(function() {
                	$(this).stop().addClass('hideWhileAnimate');
                });
            }
        }

		function showElementsAfterAnimate(){
        	window.setTimeout(function(){
            	$('.hideWhileAnimate').removeClass('hideWhileAnimate');
            }, (settings.animateTime+50));
        }

        /******************
    	 * When mouse is over these elements the zooming won't be working but the default mousescroll
    	 ******************/
        function setElementsToPreventZoom() {
            /*ELEMENTS WILL HAVE NORMAL EVENT AND NOT DRAG THE PARENT*/
            for (var prop = 0; prop < settings.exceptionsWholeZoom.length; prop++) {
                $('.' + settings.elementClass + ' .' + settings.exceptionsWholeZoom[prop]).each(function() {
                    var _thisElement = $(this);

                    _thisElement.on("mouseover", function(event) {
                        if (_thisElement.hasScrollBar()) {
                            _this.addClass('stopZoom');
                        }


                    });
                    _thisElement.on("mouseleave", function(event) {
                        _this.removeClass('stopZoom');
                    });
                });
            }
        }

        /******************
    	 * ZOOM function
    	 ******************/
        function setExternalZoomSelect(_value) {

            var exists = false;

            $(settings.externalZoomLevel + ' option').each(function() {

                if ( (_value * 100 ) == this.value ) {
                    exists = true;
                    $(settings.externalZoomLevel).val(this.value);
                    return false;
                }
            });

            if (!exists) {
                var defaultUniqueOptionValue = $('.' + settings.defaultUniqueClass).val();
                $(settings.externalZoomLevel).val(defaultUniqueOptionValue);

                $(settings.externalZoomLevel).children('option.' + settings.defaultUniqueClass).show(); //Mozilla can read the value of an option if they are visible
                $(settings.externalZoomLevel).children('option.' + settings.defaultUniqueClass).text(Math.ceil(_value * 100) + '%');
                $(settings.externalZoomLevel).children('option.' + settings.defaultUniqueClass).val(Math.ceil(_value * 100));
                $(settings.externalZoomLevel).children('option.' + settings.defaultUniqueClass).hide();
            }

        }

        function zooming(_element, _event, _delta) {

            var center1 = settings.parent_width / 2;
            var center2 = settings.left + (settings.width * settings.zoomLevel) / 2;
            var previousZoomLevel = settings.zoomLevel; //Store the zoom level value

            //callback when function starts
            if ($.isFunction(settings.onBeforeZoom)) {
                settings.onBeforeZoom.call(this);
            }

            // _delta  is +1 or -1
            settings.zoomLevel += (settings.zoomLevel * (_delta * _event.deltaFactor / 1000));

            if (settings.zoomLevel < settings.minZoomLevel) {
                settings.zoomLevel = settings.minZoomLevel;
            }

            if (settings.zoomLevel > settings.maxZoomLevel) {
                settings.zoomLevel = settings.maxZoomLevel;
            }

            if(settings.mouseSensibleZoom){

	            /*CALCULATING LEFT POSITION*/
	            var h_center1_1 = settings.left + (settings.width / 2);
	            var h_left2_1 = h_center1_1 - (settings.width * previousZoomLevel / 2);
	            var h_dist_Mouse_Left2_1 = currentMousePos.x - settings.parent_left - h_left2_1;
	            var h_dist_Mouse_Left1_1 = h_dist_Mouse_Left2_1 / previousZoomLevel;

	            var h_dist_Mouse_Left2_2 = h_dist_Mouse_Left1_1 * settings.zoomLevel;
	            var h_width2_2 = settings.width * settings.zoomLevel;
	            var h_center2_2 = currentMousePos.x - settings.parent_left - h_dist_Mouse_Left2_2 + (h_width2_2 / 2);
	            var h_left1_2 = h_center2_2 - (settings.width / 2);

	            settings.left = h_left1_2;

	            /*CALCULATING TOP POSITION*/
	            var v_center1_1 = settings.top + (settings.height / 2);
	            var v_top2_1 = v_center1_1 - (settings.height * previousZoomLevel / 2);
	            var v_dist_Mouse_Top2_1 = currentMousePos.y - settings.parent_top - v_top2_1;
	            var v_dist_Mouse_Top1_1 = v_dist_Mouse_Top2_1 / previousZoomLevel;

	            var v_dist_Mouse_Top2_2 = v_dist_Mouse_Top1_1 * settings.zoomLevel;
	            var v_height2_2 = settings.height * settings.zoomLevel;
	            var v_center2_2 = currentMousePos.y - settings.parent_top - v_dist_Mouse_Top2_2 + (v_height2_2 / 2);
	            var v_top1_2 = v_center2_2 - (settings.height / 2);

	            settings.top = v_top1_2;
            }

            /*hide elements if needed*/
            hideElementsBeforeAnimate();

            /*SET ELEMENT VALUES*/
            $(_element).css({
                "transform": "scale(" + settings.zoomLevel + ")",
                "-webkit-transform": "scale(" + settings.zoomLevel + ")",
                "-moz-transform": "scale(" + settings.zoomLevel + ")",
                "-ms-transform": "scale(" + settings.zoomLevel + ")",
                "-o-transform": "scale(" + settings.zoomLevel + ")",
                /*
                "filter": "progid:DXImageTransform.Microsoft.Matrix(M11=" + settings.zoomLevel + ", M12=0, M21=0, M22=" + settings.zoomLevel + ", SizingMethod='auto expand')",
                "-ms-filter": "progid:DXImageTransform.Microsoft.Matrix(M11=" + settings.zoomLevel + ", M12=0, M21=0, M22=" + settings.zoomLevel + ", SizingMethod='auto expand')",
                */

                "left": settings.left + 'px',
                "top": settings.top + 'px'
            });

            /*show up elements if needed*/
            showElementsAfterAnimate();

            /*ELEMENTS WITH DEFINED CLASS WON'T BE SCALED*/
            for (var prop = 0; prop < settings.exceptionsZoom.length; prop++) {
                $('.' + settings.elementClass + ' .' + settings.exceptionsZoom[prop]).each(function() {
                    var thisOffsetDatas = {
                        left: $(this).css('left'),
                        top: $(this).css('top'),
                        width: $(this).width(),
                        height: $(this).height(),
                    };


                    $(this).css({
                        "transform": "scale(" + 1 / settings.zoomLevel + ")",
                        "-webkit-transform": "scale(" + 1 / settings.zoomLevel + ")",
                        "-moz-transform": "scale(" + 1 / settings.zoomLevel + ")",
                        "-ms-transform": "scale(" + 1 / settings.zoomLevel + ")",
                        "-o-transform": "scale(" + 1 / settings.zoomLevel + ")"
                        /*
                        "filter": "progid:DXImageTransform.Microsoft.Matrix(M11=" + 1/settings.zoomLevel + ", M12=0, M21=0, M22=" + 1/settings.zoomLevel + ", SizingMethod='auto expand')",
                        "-ms-filter": "progid:DXImageTransform.Microsoft.Matrix(M11=" + 1/settings.zoomLevel + ", M12=0, M21=0, M22=" + 1/settings.zoomLevel + ", SizingMethod='auto expand')"
                        */

                        //"left": (thisOffsetDatas.width),
                        //"top": "",
                    });
                });
            }

            setExternalZoomSelect(settings.zoomLevel);
            changeScrollbar();

            //callback when plugin is done with running
            if ($.isFunction(settings.onAfterZoom)) {
                settings.onAfterZoom.call(this);
            }

        }

        function zoomingToFit(_element) {
            var ratioHorizontal = settings.parent_width / settings.width;
            var ratioVertical = settings.parent_height / settings.height;

            if (ratioHorizontal < ratioVertical) { /*FITTING HORIZONTALLY*/
                settings.zoomLevel = ratioHorizontal;
            } else { /*FITTING VERTICALLY*/
                settings.zoomLevel = ratioVertical;
            }

            settings.left = (settings.parent_width - settings.width) / 2;
            settings.top = (settings.parent_height - settings.height) / 2;

            zoomingExternal(_element);
        }

        function zoomingToPoint(_element,zoomLevel, coordinateXPercent, coordinateYPercent) {
        	var coordinateX = settings.width * (coordinateXPercent/100),
        		coordinateY = settings.height * (coordinateYPercent/100);

        	settings.zoomLevel = zoomLevel;
        	settings.left = ( (settings.parent_width/2) + (((settings.width * settings.zoomLevel) / 2) - (coordinateX * settings.zoomLevel)) ) - (settings.width/2);
        	settings.top = ( (settings.parent_height/2) + (((settings.height * settings.zoomLevel) / 2) - (coordinateY * settings.zoomLevel)) ) - (settings.height/2);
            zoomingExternal(_element);
        }

        function zoomingToCentreOfView(_element,zoomLevel, previousZoomLevel) {

        	var coordinateX =   ( settings.parent_width/2 - (( settings.left + settings.width/2 ) - ((settings.width * previousZoomLevel)/2) )) / previousZoomLevel,
    			coordinateY = ( settings.parent_height/2 - (( settings.top + settings.height/2 ) - ((settings.height * previousZoomLevel)/2) )) / previousZoomLevel;

        	settings.zoomLevel = zoomLevel;
	    	settings.left = ( (settings.parent_width/2) + (((settings.width * settings.zoomLevel) / 2) - (coordinateX * settings.zoomLevel)) ) - (settings.width/2);
	    	settings.top = ( (settings.parent_height/2) + (((settings.height * settings.zoomLevel) / 2) - (coordinateY * settings.zoomLevel)) ) - (settings.height/2);
	        zoomingExternal(_element);
        }

        function zoomingExternal(_element) {

            //callback when function starts
            if ($.isFunction(settings.onBeforeZoom)) {
                settings.onBeforeZoom.call(this);
            }

            /*hide elements if needed*/
            hideElementsBeforeAnimate();

            /*SET ELEMENT VALUES*/
            if( settings.usedAnimateMethod === 'jquery' ) {
            	$(_element).animate({
            		    left: settings.left,
            		    top: settings.top,
            		    zoomLevelValue: settings.zoomLevel
            	}, {
            	    step: function(now,fx) {
            	      $(this).css('transform','scale('+now+')');
            	    },
            	    duration: settings.animateTime
            	});

            } else {
            	$(_element).css({
                    "transform": "scale(" + settings.zoomLevel + ")",
                    "-webkit-transform": "scale(" + settings.zoomLevel + ")",
                    "-moz-transform": "scale(" + settings.zoomLevel + ")",
                    "-ms-transform": "scale(" + settings.zoomLevel + ")",
                    "-o-transform": "scale(" + settings.zoomLevel + ")",
                    /*
                    "filter": "progid:DXImageTransform.Microsoft.Matrix(M11=" + settings.zoomLevel + ", M12=0, M21=0, M22=" + settings.zoomLevel + ", SizingMethod='auto expand')",
                    "-ms-filter": "progid:DXImageTransform.Microsoft.Matrix(M11=" + settings.zoomLevel + ", M12=0, M21=0, M22=" + settings.zoomLevel + ", SizingMethod='auto expand')",
                    */
                    "left": settings.left + 'px',
                    "top": settings.top + 'px'
                });
            }

            /*ELEMENTS WITH DEFINED CLASS WON'T BE SCALED*/
            for (var prop = 0; prop < settings.exceptionsZoom.length; prop++) {
                $('.' + settings.elementClass + ' .' + settings.exceptionsZoom[prop]).each(function() {
                    $(this).css({
                        "transform": "scale(" + 1 / settings.zoomLevel + ")",
                        "-webkit-transform": "scale(" + 1 / settings.zoomLevel + ")",
                        "-moz-transform": "scale(" + 1 / settings.zoomLevel + ")",
                        "-ms-transform": "scale(" + 1 / settings.zoomLevel + ")",
                        "-o-transform": "scale(" + 1 / settings.zoomLevel + ")"
                        /*
                        "filter": "progid:DXImageTransform.Microsoft.Matrix(M11=" + 1/settings.zoomLevel + ", M12=0, M21=0, M22=" + 1/settings.zoomLevel + ", SizingMethod='auto expand')",
                        "-ms-filter": "progid:DXImageTransform.Microsoft.Matrix(M11=" + 1/settings.zoomLevel + ", M12=0, M21=0, M22=" + 1/settings.zoomLevel + ", SizingMethod='auto expand')",
                        */
                    });
                });
            }

            setExternalZoomSelect(settings.zoomLevel);

            /*show up elements if needed*/
            showElementsAfterAnimate();

            //callback when plugin is done with running
            if ($.isFunction(settings.onAfterZoom)) {
                settings.onAfterZoom.call(this);
            }

        }


        /*****************************************************
    	 * INIT function
    	 * After page is loaded need to align the area
    	 * to center INITIALLY
    	*****************************************************/
        function init(_element) {


            //ELEMENT MUST BE IN THE PAGE FLOW, DISPLAY:NONE will be replaced by VISIBILITY: HIDDEN
            changeVisibilityMethod('change');

            /* set element to centre and ZOOM level set to default */
            resetSettings();
            setParentOverflow();
            setVirtualScrollbars();


            var elementOffsets,
				elementParentOffsets;


            elementOffsets = getOffsetAndDimension(_element);
            elementParentOffsets = getOffsetAndDimension(_element.parent());

            settings.left = (settings.left != null) ? settings.left :
    					((elementParentOffsets.width - (elementOffsets.width * settings.zoomLevel)) / 2);

            settings.top = (settings.top != null) ? settings.top :
				((elementParentOffsets.height - (elementOffsets.height * settings.zoomLevel)) / 2);

            settings.width = elementOffsets.width;
            settings.height = elementOffsets.height;

            settings.parent_left = elementParentOffsets.left;
            settings.parent_top = elementParentOffsets.top_scaled;
            settings.parent_width = elementParentOffsets.width;
            settings.parent_height = elementParentOffsets.height;

            $(_element).css({
                "transform": "scale(" + settings.zoomLevel + ")",
                "-webkit-transform": "scale(" + settings.zoomLevel + ")",
                "-moz-transform": "scale(" + settings.zoomLevel + ")",
                "-ms-transform": "scale(" + settings.zoomLevel + ")",
                "-o-transform": "scale(" + settings.zoomLevel + ")",
                /*
                "filter": "progid:DXImageTransform.Microsoft.Matrix(M11=" + settings.zoomLevel + ", M12=0, M21=0, M22=" + settings.zoomLevel + ", SizingMethod='auto expand')",
                "-ms-filter": "progid:DXImageTransform.Microsoft.Matrix(M11=" + settings.zoomLevel + ", M12=0, M21=0, M22=" + settings.zoomLevel + ", SizingMethod='auto expand')",
                */

                "left": settings.left + 'px',
                "top": settings.top + 'px'
            });

            if (settings.width > settings.parent_width || settings.height > settings.parent_height) {
                zoomingToFit(_element);
            }

            // VISIBILITY: HIDDEN will be replaced back to DISPLAY:NONE
            changeVisibilityMethod('changeBack');

        }

        function changeVisibilityMethod(_method) {

            if (_method == 'changeBack') {
                //CHANGE BACK
                if (_this.css('display') == 'block' && _this.css('visibility') == 'hidden') {
                    _this.css({
                        "display": "none",
                        "visibility": "visible"
                    });
                }
                if (_this.parent().css('display') == 'block' && _this.parent().css('visibility') == 'hidden') {
                    _this.parent().css({
                        "display": "none",
                        "visibility": "visible"
                    });
                }
            } else {
                if (_this.css('display') == 'none') {
                    _this.css({
                        "visibility": "inherit",
                        "display": "block !important"
                    });
                }
                if (_this.parent().css('display') == 'none') {
                    _this.parent().css({
                        "visibility": "inherit",
                        "display": "block !important"
                    });
                }
            }

        }


        function destroy(_this) {

        	$('body').removeClass('zoomDrag');
        	resetSettings();

        	_this.removeAttr('style');

        	//mouse
        	_this.off("click");
        	_this.off("mousemove");
        	_this.off("mousedown");
        	_this.off("mouseleave");
        	_this.off("mouseup");
        	_this.off("mouseleave");

        	_this.off("touchstart");
        	_this.off("touchstart");
        	_this.off("touchmove");
        	_this.off("touchend");

        	//pinch
        	_this.off("touchend");
        	_this.off("gesturechange");

        	$('.zoomedElement').removeClass('zoomedElement'); //remove zoomedElementClass
        	$('.zoomedElement').removeClass('zoomedElement'); //remove zoomedElementClass
        	_this.parent().remove('.scrollbar'); //remove scrollbar

        	//external zoom
        	$(settings.externalIncrease).off("click");
        	$(settings.externalDecrease).off("click");
        	$(settings.externalZoomLevel).off("change");


        	_this.removeClass('mouseIsOverNonDraggableElement');
        	_this.removeClass('draggable');

        	 $('.scrollbar-arrow').off("mousedown");
        	 $('.dragBar').off("mousedown");
        	 _this.unbind("mousewheel");

        	//remove events of anti drag elements
        	$('.mouseIsOverNonDraggableElement').removeClass('mouseIsOverNonDraggableElement');
        	for (var prop = 0; prop < settings.exceptionsDrag.length; prop++) {
                $('.' + settings.elementClass + ' .' + settings.exceptionsDrag[prop]).each(function() {
                    $(this).off("mousedown").off("mouseup").off("mouseleave").removeAttr('style');
                });
            }

        	//remove events of anti zoom elements
        	$('.stopZoom').removeClass('stopZoom');
        	for (var prop = 0; prop < settings.exceptionsWholeZoom.length; prop++) {
	            $('.' + settings.elementClass + ' .' + settings.exceptionsWholeZoom[prop]).each(function() {
	                $(this).off("mouseover").off("mouseleave").removeAttr('style');
	            });
	        }
        }


        this.getDatas = function() {

            return {
                zoomLevel: settings.zoomLevel,
                left: settings.left,
                top: settings.top,
                width: settings.width,
                height: settings.height,
                parent_left: settings.parent_left,
                parent_top: settings.parent_top,
                parent_width: settings.parent_width,
                parent_height: settings.parent_height
            }
        }

        /*****************************************************
    	 * GET the current position of an element
    	*****************************************************/
        function getOffsetAndDimension(_element) {

            var _el = _element.get(0),
    			_x = 0,
    			_y = 0,
    			_x_scaled = 0,
    			_y_scaled = 0,
    			_w = 0,
    			_h = 0,
    			_w_scaled = 0,
    			_h_scaled = 0,
    			_centerX = 0,
    			_centerY = 0,
    			_viewportY = 0,
    			rect;

            _w = _el.offsetWidth;
            _h = _el.offsetHeight;

            rect = _el.getBoundingClientRect();
            _w_scaled = rect.width;
            _h_scaled = rect.height;

            _x_scaled = rect.left;
            _y_scaled = rect.top + window.pageYOffset;  //because .top is offset value from the viewport
            _viewportY = window.pageYOffset;


            while (_el && !isNaN(_el.offsetLeft) && !isNaN(_el.offsetTop)) {
                _x += _el.offsetLeft - _el.scrollLeft;
                _y += _el.offsetTop - _el.scrollTop;
                _el = _el.offsetParent;
            }

            _centerX = _x_scaled + (_w_scaled / 2);
            _centerY = _y_scaled + (_h_scaled / 2);

            return {
                top: _y,
                left: _x,
                viewport_top: _viewportY,
                viewport_left: _x,
                top_scaled: _y_scaled,
                left_scaled: _x_scaled,
                width: _w,
                height: _h,
                width_scaled: _w_scaled,
                height_scaled: _h_scaled,
                center_x: _centerX,
                center_y: _centerY
            };
        }


        //callback when plugin is done with running
        if ($.isFunction(settings.onAfterLoad)) {
            settings.onAfterLoad.call(this);
        }



        return {
        	initialized: true,
        	zoomingToFit: function() {
        		zoomingToFit(_this);
            },
            zoomingToPoint: function(zoomLevel, centerX, centerY) {
            	//incoming parameters should be in percentage
            	zoomingToPoint(_this,zoomLevel, centerX, centerY);
            },

        	destroy: function() {
        		destroy(_this);
            }
        };

    }

}(jQuery));