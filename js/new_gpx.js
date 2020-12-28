var marker = null, map, makemap;
var mapdiv = document.getElementById("map");
var img = document.querySelector("#Bilder img");
var figcaption = document.querySelector("#Bilder figcaption");
var buttons = document.querySelectorAll("#Bilder button");
var images = [], nr = 0, ct = 0;
window.JB = window.JB || {};
window.JB.GPX2GM = window.JB.GPX2GM || {};

function setImage(nr) {
if(nr < 0) nr = images.length - 1;
if(nr >= images.length) nr = 0;
console.log(nr);
img.src = images[images[nr].marker.nr].src;
figcaption.innerHTML = images[nr].text;
if(marker) JB.RemoveElement(marker);
marker = map.Marker({lat:images[nr].coord.lat,lon:images[nr].coord.lon},JB.icons.Kreis)[0];
makemap.Rescale(images[nr].coord.lat,images[nr].coord.lon,.5); // <--------------------------------------
return nr;
}

buttons[0].onclick = function(){ nr = setImage(nr-1); };
buttons[1].onclick = function(){ nr = setImage(nr+1); };

JB.GPX2GM.callback = function(pars) {
console.log(pars.type);
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
    return;
}
return true;
}