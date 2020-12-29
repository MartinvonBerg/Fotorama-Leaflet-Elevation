"use strict";

(function (window, document, undefined) {
    var numberOfFotorama = document.querySelectorAll('[id^=fotorama]').length;
    var numberOfMaps = document.querySelectorAll('[id^=boxmap]').length;

    var mapdiv = new Array();
    var images = new Array();
    var marker = new Array();
    var map = new Array();
    var makemap = new Array();
    var nr = new Array();
    var ct = new Array();
    var img = new Array();
    var figcaption = new Array();

  
    for (var i = 0; i < numberOfFotorama; i++) {
        // 1. Initialize fotorama manually.
        var $fotoramaDiv = jQuery('#fotorama' + i ).fotorama();
        // 2. Get the API object.
        var fotorama = eval('fotorama'+i);
        fotorama = $fotoramaDiv.data('fotorama');
    }

    jQuery('.fotorama').on('fotorama:showend',
    function (e, fotorama, extra) {
        var nr = fotorama.activeIndex;
        console.log('change in: ' + e.currentTarget.id + ' index: ' + nr);               
    });
        
})(window, document);