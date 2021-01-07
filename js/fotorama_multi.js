"use strict";

(function (window, document, undefined) {
    var numberOfFotorama = document.querySelectorAll('[id^=mfotorama]').length;
    var numberOfMaps = document.querySelectorAll('[id^=boxmap]').length;
    let mobile = (/iphone|ipod|android|webos|ipad|iemobile|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

    var mapdiv = new Array();
    
    for (var i = 0; i < numberOfFotorama; i++) {
        // 1. Initialize fotorama manually.
        var $fotoramaDiv = jQuery('#mfotorama' + i ).fotorama();
        // 2. Get the API object.
        var fotorama = eval('mfotorama'+i);
        fotorama = $fotoramaDiv.data('fotorama');
        // get the mapdiv
        var mapdiv = document.getElementById("map" + i);
        var phpvars = eval('wpfm_phpvars'+i);

        if (mapdiv) {
            if (phpvars) {
                //let g_numb_gpxfiles = parseInt( phpvars.ngpxfiles );
                //let g_maprescale = parseInt(phpvars.maprescale);
            }
        }

        if (fotorama) {
            let newimages = phpvars.imgdata; 
            let olddata = fotorama.data;
            let newdata = [];
            var width = $fotoramaDiv[0].parentElement.clientWidth;
    
            if (newimages) {
                if (olddata.length == newimages.length) {
                    // Assumption: array newimages has the same sorting as olddata and the srcset is the same for all images
                    var srcarray = newimages[0].srcset
                    let srcindex = 0;
    
                    for (const [key, value] of Object.entries(srcarray)) {
                        //console.log(`${key}: ${value}`);
                        if (key > width) {
                            srcindex = key;
                            break;
                        }
                    }
                    
                    olddata.forEach(replaceimg);
                    
                    function replaceimg(item, index){
                        if (mobile) {
                            newdata[index] = {img: newimages[index].srcset[ srcindex ], thumb: item.thumb, caption: item.caption};
                        }
                        else {
                            newdata[index] = {img: newimages[index].srcset[ srcindex ], thumb: item.thumb, full: newimages[index].srcset['2560'], caption: item.caption};
                        }
                    }
                }
            }
    
        // nur ausführen wenn images vorhanden! ansonsten das ursprüngliche belassen! php liefert reduzierte bilder nur mit wpid also wenn in wp medialib
            fotorama.load(newdata);
        }
    }

    jQuery('.fotorama').on('fotorama:showend',
    function (e, fotorama, extra) {
        var nr = fotorama.activeIndex;
        console.log('change in: ' + e.currentTarget.id + ' index: ' + nr);               
    });

    
    jQuery('.fotorama').on('fotorama:fullscreenenter fotorama:fullscreenexit', function (e, fotorama) {
        if (e.type === 'fotorama:fullscreenenter') {
            // Options for the fullscreen
            fotorama.setOptions({
                fit: 'contain'
            });
        } else {
            // Back to normal settings
            fotorama.setOptions({
                fit: 'cover'
            });
        }
    });

    jQuery(document).contextmenu(function() {
       return false;
    });   

        
})(window, document);