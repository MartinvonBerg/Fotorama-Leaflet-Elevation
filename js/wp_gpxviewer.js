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

    window.JB = window.JB || {};
    window.JB.GPX2GM = window.JB.GPX2GM || {};
    
    
    for (var i = 0; i < numberOfMaps; i++) {
        var id = 'map' + i;
        mapdiv[id] = document.getElementById("map" +i);
        ct[id] = 0;
        nr[id] = 0;
        img[id] = document.querySelector("#box" + i + " #Bilder img");
        figcaption[id] = document.querySelector("#box" + i + " #Bilder figcaption");
        images[id] = [];
        marker[id] = null;
    }
    
    function setImage(nr, id) {
        if(nr < 0) nr = images.length - 1;
        if(nr >= images.length) nr = 0;
        console.log(nr);
        var id = 'map0'
        img[id].src = images[images[nr].marker.nr].src;
        figcaption[id].innerHTML = images[nr].text;
        if(marker) JB.RemoveElement(marker);
        marker = map.Marker({lat:images[nr].coord.lat,lon:images[nr].coord.lon},JB.icons.Kreis)[0];
        //makemap.Rescale(images[nr].coord.lat,images[nr].coord.lon,1); // <-------------------------------------
        fotorama.show(nr);
        return nr;
        }
    
  
    JB.GPX2GM.callback = function(pars) {
        console.log(pars.type);
        if(pars.type == "Map_n") {
            makemap = mapdiv[pars.id].makeMap;  // <--------------------------------------
            map = makemap.GetMap();    // <--------------------------------------
            }
        if(pars.type == "created_Marker_Bild") {
            images[ct[pars.id]] =  {src: pars.src, text: pars.text, marker: pars.marker, coord: pars.coord};
            pars.marker.nr = ct[pars.id];
            if(ct[pars.id]==0) {
            setImage(ct[pars.id], pars.id);
            }
            ct[pars.id]++;
            return;
        }
        if(pars.type == "click_Marker_Bild") {
            nr = pars.marker.nr;
            nr = setImage(nr);
            return false;
        }
        if(pars.type == "Tracks_n") {  // <-------------------------------------- ff
            var infofenster = JB.Infofenster(map.map);
            infofenster.content(pars.gpxdaten.tracks.track[0].info);
            return;
        }
        return true;
    }
    

    for (var i = 0; i < numberOfFotorama; i++) {
        // 1. Initialize fotorama manually.
        var $fotoramaDiv = jQuery('#fotorama' + i ).fotorama();
        // 2. Get the API object.
        var fotorama = eval('fotorama'+i);
        fotorama = $fotoramaDiv.data('fotorama');
    
        jQuery('.fotorama'  + i ).on('fotorama:showend ',
            function (e, fotorama, extra) {
                var nr = fotorama.activeIndex;
                if(marker) JB.RemoveElement(marker);
                if (g_numb_gpxfiles[i]>=0) {
                    marker = map.Marker({lat:images[nr].coord.lat,lon:images[nr].coord.lon},JB.icons.Kreis)[0];
                    makemap.Rescale(images[nr].coord.lat,images[nr].coord.lon,g_maprescale[i]); // <-------------------------------------
                }
            });
        }
        
})(window, document);