/*!
  chartJsClass 0.17.0
  license: GPL 2.0
  Martin von Berg
*/
// links: https://developers.arcgis.com/esri-leaflet/samples/dynamic-chart/
//  https://dzone.com/articles/chartjs-line-chart-for-route-elevations-graph
// load gpx tracks and provide data, name and statistics
//import {Chart} from 'chart.js/auto';
import {ChartJS as Chart} from './chartJSwrapper.js'; // this is 15.6 kB or 31.8% smaller (compressed download size)
import './ChartJsClass.css';

export { chartJsClass };

class chartJsClass {
  "use strict";
  elevationData = {};
  ctx = {};
  chart = {};
  elementDiv = ''
  elementOnPage = {};
  CssBackgroundColor = ''; 
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
   * init the class with first track in linedata and the options
   * @param {object} linedata linedata from gpxTrackClass
   * @param {object} options the options as array
   *  @param {int} options.number the number of the chart on the page
   *  @param {string} options.divID the ID of the DIV or canvas to draw the chart in
   *  @param {string} options.theme
   *  @param {string}options.CssBackgroundColor
   *  @param {string} options.chart_fill_color
   *  @param {int} options.chartHeight
   *  @param {array} options.pageVariables the array of pageVariables passed by php
   *  @param {boolean} options.responsive
   *  @param {number} options.aspRatio
   *  @param {boolean} options.chartAnimation animate the elevation chart, or not.
   *  @param {boolean} options.showChartHeader
   * @return {void|undefined} return undefined if init fails.
   */
  constructor(linedata, options) {

    this.options = options;
    this.number = options.number || 0;
    this.elementDiv = options.divID || '';
    this.elementOnPage = document.getElementById(options.divID) || {};
    this.pageVariables = options.pageVariables || [];
    
    // stop the constructor and return undefined if options is not set sufficiently.
    if ( (this.elementDiv ==='') || (this.elementOnPage === {}) || (this.pageVariables === [])) return undefined;
    
    // set parent aspRatio if responsive is set. get parent and replace size in style by aspRatio.
    this.setAspRatioParentDiv();

    // set theme color options and other theme options.
    this.ctx = this.elementOnPage.getContext("2d");
    this.CssBackgroundColor = options.CssBackgroundColor || '#ffffff';
    this.diagrFillColor = options.chart_fill_color || '#96cced';
    this.setTheme(options.theme || 'none');
    this.chartAnimation = options.chartAnimation === true;
    this.options.showChartHeader = options.showChartHeader === true;

    // always show first track on load
    this.elevationData = this.prepareChartData(linedata);
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
      this.elevationData = this.prepareChartData(elevdata);
      // add data to config
      this.chart.data.labels = [];
      this.chart.data.datasets[0].data = [];
      this.chart.data.labels = this.elevationData.labels;
      this.chart.data.datasets[0].data = this.elevationData.data;
      this.setChartData();
      // set axes
      this.setAxesMinMax(this.chart);
      // updata chart and statistics
      this.chart.update();
      this.trackNumber = trackNumber;
      this.setTrackStatistics();
  }
  
  /**
   * set the chart data to show in elevation profile
   */
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
   * set the min max values for the chart axes
   * @param {object} chart 
   */
  setAxesMinMax(chart) {
    let maxHeight = Math.max(...chart.data.datasets[0].data);
    let minHeight = Math.min(...chart.data.datasets[0].data);
    chart.options.scales.x.min = Math.min(...chart.data.labels);
    chart.options.scales.x.max = Math.max(...chart.data.labels);
    chart.options.scales.y.max = Math.ceil(maxHeight/100)*100; 
    chart.options.scales.y.min = Math.floor(minHeight/100)*100;
  }
  
  /**
   * reformat the input data to a format that is compatible to chart.js. Which is two arrays with labels and data.
   * @param {array} gpxdata 
   * @returns {object{array,array}} labels and data in two arrays
   */
  prepareChartData(gpxdata) {
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
   * configure, initi and show the elevation profile as line chart using chart.js
   * uses: this.elementOnPage, this.elevationData
   * neu: this.gradient -> theme, this.ctx, diagrBorderColor, diagrFillColor, chartBackgroundColor, chartDefaultColor.
   * 
   */
  drawElevationProfile() {
        
    const chartData = this.chartData;
   
    const config = {
      type: 'line',
      data: chartData,
      
      plugins: [{
        beforeInit: (chart) => this.setAxesMinMax(chart)},
      ],
      
      options: {
        onHover: this.handleChartHover,
        animation: this.chartAnimation,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        layout: {
          padding: {
            left: 0.6*this.options.padding,
            top: this.options.padding,
            right: this.options.padding,
            bottom: 0.6*this.options.padding,
          }
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
            display: this.options.showChartHeader,
            text: this.i18n('Distance')+ ' / km, '+ this.i18n('Altitude')+ ' / m',
          },
          legend: {
            display: false
          },
          tooltip: {
            displayColors: false,
            backgroundColor: this.tooltipBackgroundColor,
            titleColor: this.tooltipTitleColor,
            bodyColor: this.tooltipTitleColor,
            callbacks: {
              label: (tooltipItems) => {
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
    
    this.chart = new Chart(this.ctx, config);

    // set statistics
    this.setTrackStatistics()
  }

  /** 
    * translate text for chart.js.
    * @param {string} text to translate
    * @returns {string} the string value for the locale or the original text if translation not available.
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
   * set the aspect ratio of the chart according to aspect ratio of parent div
   * @returns boolean success of the setting or not
   */
  setAspRatioParentDiv() {
    if ( ! this.options.responsive) {
      return false;
    } else {
      let parent = this.elementOnPage.parentElement;
      let aspRatio = this.options.aspRatio.toFixed(2);
      parent.removeAttribute('style');
      parent.style.aspectRatio = aspRatio;
      return true; 
    }
  }

  /**
   * set the colors and gradient, for the selected theme.
   * @param {string} theme the selected theme
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
        //this.chartDefaultColor = textLineColor; 
        Chart.defaults.color = textLineColor;
        break;

      case 'custom-theme':
        // calc best contrast color for background
        textLineColor = this.getBestContrastTextColor(this.CssBackgroundColor);

        this.CssBackgroundColor = 'background-color:' + this.CssBackgroundColor;
        this.updateCSS();
        
        this.diagrFillColor = this.diagrFillColor + 'E0'; // add transparency to the color. Hex #00 - #FF
                
        this.diagrBorderColor = textLineColor; 
        this.scaleColor = textLineColor;
        //this.chartDefaultColor = textLineColor; 
        Chart.defaults.color = textLineColor;
        
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

    // limit the padding to a useful value
    //if (this.options.padding > 20) this.options.padding = 20; // TODO: required?

  }

  /**
    * update CSS rules that are used according to the options and client
    * uses this.CssBackgroundColor, this.elementDiv
    */
  updateCSS() {
    const style = document.createElement('style');
    style.innerHTML = `#${this.elementDiv} { ${this.CssBackgroundColor}; }`;
    document.head.appendChild(style);
  }

  /**
   * get the color with the best color contrast
   * source: https://codepen.io/davidhalford/pen/AbKBNr
   * @param {string} hex the hex color value
   * @returns 
   */
  getBestContrastTextColor(hex){
   
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
   * set the gradient for the elevation profile
   * uses: this.ctx, this.gradient
   */
  setGradient() {
    /*** Gradient http://jsfiddle.net/4vobe59a/***/ 
    let colorChangePercentage = this.options.showChartHeader ? 0.4 : 0.3;
    let currentHeight = this.elementOnPage.offsetHeight;

    this.gradient = this.ctx.createLinearGradient(0, 0, 0, currentHeight); // top-x, top-y, bottom-x, bottom-y
    this.gradient.addColorStop(0.0, 'rgba(235,234,235,0.98)'); // top 0 : start of gradient
    this.gradient.addColorStop(colorChangePercentage, 'rgba(235,234,235,0.98)'); 
    this.gradient.addColorStop(colorChangePercentage+0.1, 'rgba(212,100,14,0.95)'); 
    this.gradient.addColorStop(1, 'rgba(212,100,14,0.95)'); // bottom 1 : end of gradient
  }
  // ------------ end theme functions -------------------


  // ------------ start Event Handlers -------------------
  /**
   * dispatch event on chart hover. chart is passed by value. No use of this.
   * @param {object} event 
   * @param {object} elements 
   * @param {object} chart 
   * @returns void
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
   * show the tooltip on the chart.js 
   * @param {int} pos the index of the lat-long value in the chart data.
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
