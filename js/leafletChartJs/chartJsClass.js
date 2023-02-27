/*!
  chartJsClass 0.17.0
  license: GPL 2.0
  Martin von Berg
*/
// links: https://developers.arcgis.com/esri-leaflet/samples/dynamic-chart/
//  https://dzone.com/articles/chartjs-line-chart-for-route-elevations-graph
// load gpx tracks and provide data, name and statistics
//import {Chart} from 'chart.js/auto';
import {ChartJS as Chart} from './chartJSwrapper.js';
import './ChartJsClass.css';

export { chartJsClass };

class chartJsClass {

  elevationData = {};
  ctx = {};
  chart = {};
  elementDiv = ''
  elementOnPage = '';
  customCanvasBackgroundColor = '#FFFFFF00'; // white transparent
  CssBackgroundColor = ''; // extern gesetzt durch: pageVariables.sw_options.chart_background_color
  gradient = {};
  tooltipBackgroundColor = 'black';
  tooltipTitleColor = 'white';
  number = 0;
  // for track info
  trackNumber = 0;
  tracklen = '';
  ascent = '';
  descent = '';
  options = {};
  chartData = {};

  /**
   * 
   * @param {*} number 
   * @param {*} divID 
   * @param {*} linedata 
   * @param {*} options 
   */
  constructor(linedata, options) {

    this.options = options;
    this.elementDiv = options.divID;
    this.elementOnPage = document.getElementById(options.divID);
    this.pageVariables = options.pageVariables; 
    this.number = options.number;

    // set parent aspRatio if responsive is set
    // get parent and replace size in style by aspRatio
    this.setAspRatioParentDiv();

    // theme color options
    this.ctx = this.elementOnPage.getContext("2d");
    
    this.CssBackgroundColor = options.CssBackgroundColor;
    this.diagrFillColor = options.chart_fill_color; // this.pageVariables.sw_options.chart_fill_color
    this.setTheme(options.theme);

    // allways show first track on load
    this.elevationData = this.filterGPXTrackdata(linedata);
    this.setChartData();

    this.drawElevationProfile();

  }

  /**
   * show chart number n with new elevation data
   * @param {array} elevdata 
   * @param {int} trackNumber 
   */
  showElevationProfile( elevdata, trackNumber ) {
      // remap new data
      this.elevationData = this.filterGPXTrackdata(elevdata);
      // add data to config
      this.chart.data.labels = [];
      this.chart.data.datasets[0].data = [];
      this.chart.data.labels = this.elevationData.labels;
      this.chart.data.datasets[0].data = this.elevationData.data;
      this.setChartData();
      // set acxes
      let maxHeight = Math.max(...this.chart.data.datasets[0].data);
      this.chart.options.scales.x.min = Math.min(...this.chart.data.labels);
      this.chart.options.scales.x.max = Math.max(...this.chart.data.labels);
      this.chart.options.scales.y.max = Math.ceil(maxHeight/100)*100; //maxHeight + Math.round(maxHeight * 0.2);
      // updata chart and statistics
      this.chart.update();
      this.trackNumber = trackNumber;
      this.setTrackStatistics();
  }
  
  setChartData() {
    this.chartData = {
      labels: this.elevationData.labels,
      datasets: [{
        data: this.elevationData.data,
        fill: true,
        borderColor: this.diagrBorderColor,
        borderWidth: 1,
        backgroundColor: this.diagrFillColor, 
        tension: 0.1,
        pointRadius: 0,
        spanGaps: true
      }]
    };
  }
  
  /**
   * no use of this.
   * @param {array} gpxdata 
   * @returns {object} the sorted data
   */
  filterGPXTrackdata(gpxdata) {
    let labels = [];
    let data = [];

    gpxdata.forEach((point, index) => {
      labels.push(point[0]);
      data.push(point[1]);
    });

    return {
      data: data,
      labels: labels
    }
  }

  /**
   * uses: this.elementOnPage, this.elevationData
   * neu: this.gradient -> theme, this.ctx, diagrBorderColor, diagrFillColor, chartBackgroundColor, chartDefaultColor
   * customCanvasBackgroundColor,
   * 
   */
  drawElevationProfile() {
        
    const chartData = this.chartData;

    const plugin = {
      id: 'customCanvasBackgroundColor',
      beforeDraw: (chart, args, options) => {
        const {ctx} = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#FFFFFF00'; 
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      }
    };

    const config = {
      type: 'line',
      data: chartData,
      
      plugins: [{
        beforeInit: (chart, args, options) => {
          let maxHeight = Math.max(...chart.data.datasets[0].data);
          chart.options.scales.x.min = Math.min(...chart.data.labels);
          chart.options.scales.x.max = Math.max(...chart.data.labels);
          chart.options.scales.y.max = Math.ceil(maxHeight/100)*100; //maxHeight + Math.round(maxHeight * 0.2);
          //chart.options.scales.y1.max = Math.ceil(maxHeight/100)*100; //maxHeight + Math.round(maxHeight * 0.2);
        }},
        //plugin
      ],
      
      options: {
        onHover: this.handleChartHover,
        animation: true, // option?
        interaction: {
          intersect: false,
          mode: 'index',
        },
        tooltip: {
          position: 'nearest',
        },
        responsive : this.options.responsive,
        maintainAspectRatio: this.options.responsive,
        scales: {
          x: {
            type: 'linear',
            grid: { color: this.scaleColor },
            distribution: 'linear',
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: false,
            // grid line settings
            grid: { color: this.scaleColor },
          },
        },
        plugins: {
          title: {
            align: "left",
            display: true,
            text: this.i18n('Distance')+ ' / km, '+ this.i18n('Altitude')+ ' / m',
          },
          legend: {
            display: false
          },
          customCanvasBackgroundColor: {
            color: this.customCanvasBackgroundColor,
          },
          tooltip: {
            displayColors: false,
            backgroundColor: this.tooltipBackgroundColor,
            titleColor: this.tooltipTitleColor,
            bodyColor: this.tooltipTitleColor,
            callbacks: {
              label: (tooltipItems) => {
                //return "Distance: " + tooltipItems[0].label + ' km'
                return this.i18n('Distance')+': '+ tooltipItems.parsed.x.toFixed(2) + ' km';
              },
              title: (tooltipItem) => {
                return this.i18n('Altitude') +': ' + tooltipItem[0].formattedValue + ' m' ;
              },
            }
          }
        }
      }
    };
    
    //Chart.defaults.color = this.chartDefaultColor; 
    this.chart = new Chart(this.ctx, config);

    // set statistics
    this.setTrackStatistics()
  }

  /** 
     * set the i18n values for the leaflet map.
     * @returns {string|null} the string value for the locale or null, if none available.
     */
  i18n(text) {
    let de = {
        'Distance' : "Strecke",
        "Ascent"   : "Anstieg",
        "Descent"  : "Abstieg",
        "Altitude" : "Höhe", 
        "y: "				: "Höhe: ",
        "x: "				: "Strecke: ",
    };

    let it = {
        'Distance' : "Distanza",
        "Ascent"   : "Salita",
        "Descent"  : "Discesa",
        "Altitude" : "Altitudine", 
        "y: "				: "Altitudine: ",
        "x: "				: "Distanza: ",
    };

    let fr = {
        'Distance' : "Distance",
        "Ascent"   : "Ascente",
        "Descent"  : "Descente",
        "Altitude" : "Altitude", 
        "y: "				: "Altitude: ",
        "x: "				: "Distance: ",
    };

    let es = {
        'Distance' : "Distancia",
        "Ascent"   : "Ascenso",
        "Descent"  : "Descenso",
        "Altitude" : "Altura", 
        "y: "				: "Altura: ",
        "x: "				: "Distancia: ",
    };

    let langs = {'de': de, 'it':it, 'fr':fr, 'es':es};

    let lang = navigator.language;
    lang = lang.split('-')[0];
    
    if ( (lang == 'de') || (lang == 'it') || (lang == 'fr') || (lang == 'es') ) {
        return langs[lang][text];
    } 
    else {
        return text;
    }
  };

  /**
     * Write the track statistics data to the dom element when the elevation data was loaded
     * @param {Event} event the leaflet control elevation event
     */
  setTrackStatistics() {
    // get the trace info from the gpx-file
    // track info in description of gpx track
    let info = this.pageVariables.tracks['track_'+ this.trackNumber.toString() ].info;

    if (info) {info = info.split(' ')} else {info='';};

    if (info[0]=='Dist:' && info[1] && info[4] && info[7]) {
      this.tracklen = info[1];
      this.ascent = info[4];
      this.descent = info[7];
    }
    
    let q = document.querySelector.bind(document);
    let m = this.number;
     
    q('#data-summary'+m+' .totlen .summarylabel').innerHTML = this.i18n('Distance') + ': ';
    q('#data-summary'+m+' .totlen .summaryvalue').innerHTML = parseFloat(this.tracklen.replace(',','.')).toLocaleString(navigator.languages[0], { useGrouping: false, maximumFractionDigits: 1 }) + " km";

    q('#data-summary'+m+' .gain .summarylabel').innerHTML   = this.i18n('Ascent') + ': ' ;
    q('#data-summary'+m+' .gain .summaryvalue').innerHTML   = parseFloat(this.ascent.replace(',','.')).toLocaleString(navigator.languages[0], { useGrouping: false, maximumFractionDigits: 0 }) + " m";

    q('#data-summary'+m+' .loss .summarylabel').innerHTML   = this.i18n('Descent') + ': ';
    q('#data-summary'+m+' .loss .summaryvalue').innerHTML   = parseFloat(this.descent.replace(',','.')).toLocaleString(navigator.languages[0], { useGrouping: false, maximumFractionDigits: 0 }) + " m";
  }

  // ------------ start theme functions -------------------
  /**
   * 
   * 
   */
  setAspRatioParentDiv() {
    if ( ! this.options.responsive) {
      return
    } else {
      let parent = this.elementOnPage.parentElement;
      let aspRatio = this.options.aspRatio.toFixed(2);
      parent.removeAttribute('style');
      parent.style.aspectRatio = aspRatio; 
    }
  }

  /**
   * 
   * @param {*} theme 
   */
  setTheme (theme) {
    let textLineColor = '';

    switch (theme) {
      case 'martin-theme':
        this.CssBackgroundColor = 'background: linear-gradient(0deg, rgba(58, 120, 255, 0.15) 40%, rgba(58, 114, 255, 0.87) 100%)';
        this.updateCSS();
        
        this.setGradient();
        this.diagrFillColor = this.gradient;

        textLineColor = 'black';
        this.diagrBorderColor = textLineColor; 
        this.scaleColor = textLineColor;
        this.chartDefaultColor = textLineColor; 
        Chart.defaults.color = this.chartDefaultColor;
        break;

      case 'custom-theme':
        // calc best contrast color for background
        textLineColor = this.getBestContrastTextColor(this.CssBackgroundColor);

        this.CssBackgroundColor = 'background-color:' + this.CssBackgroundColor;
        this.updateCSS();
        
        this.diagrFillColor = this.diagrFillColor + 'E0'; // add transparency to the color. Hex #00 - #FF
                
        this.diagrBorderColor = textLineColor; 
        this.scaleColor = textLineColor;
        this.chartDefaultColor = textLineColor; 
        Chart.defaults.color = this.chartDefaultColor;
        
        // change tooltip colors if background is dark
        if (textLineColor === '#ffffff') {
          this.tooltipBackgroundColor = 'white';
          this.tooltipTitleColor = 'black'
        }
        break;

      default:
        this.diagrFillColor = ''; // unset to default
        break;
    }

  }

  /**
    * uses this.CssBackgroundColor, this.elementDiv
    * update CSS rules that are used according to the options and client
    */
  updateCSS() {
    const style = document.createElement('style');
    style.innerHTML = `#${this.elementDiv} { ${this.CssBackgroundColor}; }`;
    document.head.appendChild(style);
  }

  /**
   * 
   * @param {*} hex 
   * @returns 
   */
  getBestContrastTextColor(hex){
    // source: https://codepen.io/davidhalford/pen/AbKBNr
   
    if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    
    let threshold = 130; /* about half of 256. Lower threshold equals more dark text on dark background  */
    
    let hRed = hexToR(hex);
    let hGreen = hexToG(hex);
    let hBlue = hexToB(hex);
    
    
    function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
    function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
    function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
    function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

    let cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;
      if (cBrightness > threshold){return "#000000";} else { return "#ffffff";}	
  }

  /**
   * uses: this.ctx, this.gradient
   */
  setGradient() {
    /*** Gradient http://jsfiddle.net/4vobe59a/***/ 
    this.gradient = this.ctx.createLinearGradient(0, 0, 0, 200); // top-x, top-y, bottom-x, bottom-y : should be height
    this.gradient.addColorStop(0.0, 'rgba(235,234,235,0.98)'); // top 0 : start of gradient
    this.gradient.addColorStop(0.3, 'rgba(235,234,235,0.98)'); 
    this.gradient.addColorStop(0.4, 'rgba(212,100,14,0.95)'); 
    this.gradient.addColorStop(1, 'rgba(212,100,14,0.95)'); // bottom 1 : end of gradient
  }
  // ------------ end theme functions -------------------


  // ------------ start Event Handlers -------------------
  /**
   * chart is passed by value. No use of this.
   * @param {*} event 
   * @param {*} elements 
   * @param {*} chart 
   * @returns 
   */
  handleChartHover(event, elements, chart) {
    // https://developers.arcgis.com/esri-leaflet/samples/dynamic-chart/

    if (elements.length === 1) {
      let ind = elements[0].index;
      let xval = chart.data.labels[ind];
      //console.log(xval);
      // DispatchEvent mit Blockierung für xx ms.
      const changed = new CustomEvent('hoverchart', {
        detail: {
        name: 'hoverchart',
        xposition: xval,
        index: ind,
        chart: chart.canvas.id
        }
      });

      chart.canvas.dispatchEvent(changed);

    } return;

  }
  
  /**
   * uses this.chart
   * @param {int} pos 
   */
  triggerTooltip(pos) {
    let chart = this.chart;
    const tooltip = chart.tooltip;
    const chartArea = chart.chartArea;

    if (tooltip.getActiveElements().length > 0) {
      tooltip.setActiveElements([], {x: 0, y: 0});
    }
    
    tooltip.setActiveElements([
      {
        datasetIndex: 0,
        index: pos,
      }, 
    ],
    {
      x: (chartArea.left + chartArea.right) / 2,
      y: (chartArea.top + chartArea.bottom) / 2,
    });
    
    chart.update();
  }
  // ------------ end Event Handlers ------------------

}
