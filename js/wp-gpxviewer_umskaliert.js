"use strict";

(function (window, document, undefined) {
    var marker = null, map, makemap, strecke, zoom1;
    var mapdiv = document.getElementById("map0");
    var img = document.querySelector("#Bilder img");
    var figcaption = document.querySelector("#Bilder figcaption");
    var images = [], nr = 0, ct = 0;
    window.JB = window.JB || {};
    window.JB.GPX2GM = window.JB.GPX2GM || {};
    let scale_factors = {
        7  : 50,
        8  : 30,
        9  : 20,
        10 : 10,
        11 : 5,
        12 : 3,
        13 : 1,
        14 : 0.5,
        15 : 0.3,
        16 : 0.2,
        17 : 0.1,
        18 : 0.05
    };
      
    function setImage(nr) {
        if(nr < 0) nr = images.length - 1;
        if(nr >= images.length) nr = 0;
        //console.log(nr);
        img.src = images[images[nr].marker.nr].src;
        figcaption.innerHTML = images[nr].text;
        if(marker) JB.RemoveElement(marker);
        marker = map.Marker({lat:images[nr].coord.lat,lon:images[nr].coord.lon},JB.icons.Kreis)[0];
        //makemap.Rescale(images[nr].coord.lat,images[nr].coord.lon,1); // <-------------------------------------
        fotorama.show(nr);
        return nr;
        }

    function setscale(val1) {
       
        // {"8":30, "9":20,"10":10,"11":5,"12":3,"13":1,"14":0.5,"15":0.3,"16":0.2,"17":0.1}
        
        var scale = parseFloat(val1)/30;
        
        if (scale<1.0) {
            scale = 1.0; // entspricht 500m Strich
        };
        
        for (var key in scale_factors){
            var test = scale_factors[key];
            if (scale > test){
                var keyvorher = parseInt(key)-1;
                var vorher = scale_factors[keyvorher];
                var diffvorher = vorher - scale;
                var diffkey = scale -test;
                if (diffvorher> diffkey) {
                    scale = test;
                } else {
                    scale = vorher;
                }
                break;
            }
        };
       
        return scale;
    }    
        
    JB.GPX2GM.callback = function(pars) {
    //console.log(pars.type);
    if(pars.type == "Map_n") {
        makemap = mapdiv.makeMap;  // <--------------------------------------
        map = makemap.GetMap();    // <--------------------------------------
        }
    if(pars.type == "created_Marker_Bild") {
        images[ct] =  {src: pars.src, text: pars.text, marker: pars.marker, coord: pars.coord};
        pars.marker.nr = ct;
        if(ct==0) {
        setImage(ct);
        }
        ct++;
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
        infofenster.show();
        var infodata = infofenster.fenstercontainer.childNodes[2].data.split(/[\s:]+/); 
        strecke = setscale(infodata[1]);
        return;
    }
    return true;
    }

    // 1. Initialize fotorama manually.
    var $fotoramaDiv = jQuery('#fotorama').fotorama();
    // 2. Get the API object.
    var fotorama = $fotoramaDiv.data('fotorama');
  
    jQuery('.fotorama').on('fotorama:showend ',
        function (e, fotorama, extra) {
            var nr = fotorama.activeIndex;
            if(marker) JB.RemoveElement(marker);
            if (g_numb_gpxfiles>0) {
                marker = map.Marker({lat:images[nr].coord.lat,lon:images[nr].coord.lon},JB.icons.Kreis)[0];
                var zoombefore = map.zoomstatus.level; // 10: 10km, 11: 5 km, 12: 3 km, 13: 1km, 14: 500m, 15: 300m, 16: 200m 
                var streckevorher = scale_factors[zoombefore-1];
                if (streckevorher !== strecke) {
                makemap.Rescale(images[nr].coord.lat,images[nr].coord.lon,streckevorher);
                } else {
                    makemap.Rescale(images[nr].coord.lat,images[nr].coord.lon,strecke);
                }
            }
        });

    jQuery(window).load(function ()
    {
    var i = setInterval(function ()
    {
        clearInterval(i);
        // safe to execute your code here
        jQuery("#map_headmap0 > button").css("background","lightgray");
        jQuery("#map_headmap0 > button").append('Alles anzeigen ');
        /*
        jQuery(".JBinfofenster").css("top",'');
        jQuery(".JBinfofenster").css("left",'');
        jQuery(".JBinfofenster").css("bottom",'20px');
        jQuery(".JBinfofenster").css("right",'10px');
        */
        zoom1 = map.zoomstatus.level;
        }, 100); });	
        
})(window, document);