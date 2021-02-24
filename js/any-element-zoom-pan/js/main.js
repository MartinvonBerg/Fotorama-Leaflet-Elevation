function activateMaps() {

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

    resizeFilterPanel();
}

function resizeFilterPanel() {
    $('.map-filter').removeAttr('style');
    if (parseInt($('.measurement').css('max-width'), 10) > 768) {
        $('.map-filter').css('height', $('.maps-container').outerHeight() + 'px');
    }
}


$(window).on("load", function () {
    activateMaps();
});

$(window).on("resize", function () {
    resizeFilterPanel();
});
