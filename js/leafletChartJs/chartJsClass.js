/*!
  chartJsClass 0.17.0
  license: GPL 2.0
  Martin von Berg
*/
// links: https://developers.arcgis.com/esri-leaflet/samples/dynamic-chart/
//  https://dzone.com/articles/chartjs-line-chart-for-route-elevations-graph
// load gpx tracks and provide data, name and statistics
import Chart from 'chart.js/auto';

export { chartJsClass };

class chartJsClass {

  elevationData = {};
  chart = {};
  elementDiv = ''
  elementOnPage = '';
  this

  constructor(number, divID, linedata = [], options = {}) {
    //const ctx = document.getElementById(divID);
    this.elementDiv = divID;
    this.elementOnPage = document.getElementById(divID);
    this.pageVariables = pageVarsForJs[number];

    this.elevationData = this.filterGPXTrackdata(linedata);

    // update CSS before init of Chart
    this.updateCSS();

    this.drawElevationProfile2(divID);

  }

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
    * update CSS rules that are used according to the options and client
    */
  updateCSS() {
    const style = document.createElement('style');
     // background-color: ${ this.pageVariables.sw_options.chart_background_color };
    style.innerHTML = `
        #${this.elementDiv} {
            
           background: linear-gradient(0deg, rgba(58, 120, 255, 0.15) 40%, rgba(58, 120, 255, 0.87) 100%);
        }`;
    document.head.appendChild(style);
}

  drawElevationProfile2() {
    const ctx = this.elementOnPage.getContext("2d");

    /*** Gradient http://jsfiddle.net/4vobe59a/***/ 
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(212,100,14,1)');   
    gradient.addColorStop(1, 'rgba(212,100,14,0.50)');
    // https://blog.vanila.io/chart-js-tutorial-how-to-make-gradient-line-chart-af145e5c92f9
    const gradientFill = ctx.createLinearGradient(500, 0, 100, 0);
    gradientFill.addColorStop(0, "rgba(128, 182, 244, 0.6)");
    gradientFill.addColorStop(1, "rgba(244, 144, 128, 0.6)");
    /***************/

    const chartData = {
      labels: this.elevationData.labels,
      datasets: [{
        data: this.elevationData.data,
        fill: true,
        borderColor: '#000000', // theme
        borderWidth: 1,
        backgroundColor: '#d4640eE0', //this.pageVariables.sw_options.chart_fill_color + 'E0', // todo define opacity // theme
        //backgroundColor: gradientFill, // theme
        tension: 0.1,
        pointRadius: 0,
        spanGaps: true
      }]
    };

    const plugin = {
      id: 'customCanvasBackgroundColor',
      beforeDraw: (chart, args, options) => {
        const {ctx} = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#FFFFFF00'; // theme
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      }
    };

    const config = {
      type: 'line',
      data: chartData,
      plugins: [{
        beforeInit: (chart, args, options) => {
          const maxHeight = Math.max(...chart.data.datasets[0].data);

          chart.options.scales.x.min = Math.min(...chart.data.labels);
          chart.options.scales.x.max = Math.max(...chart.data.labels);
          chart.options.scales.y.max = Math.ceil(maxHeight/100)*100; //maxHeight + Math.round(maxHeight * 0.2);
          //chart.options.scales.y1.max = Math.ceil(maxHeight/100)*100; //maxHeight + Math.round(maxHeight * 0.2);
        }},
        plugin
      ],
      options: {
        //onHover: function (e, item) { // add hover here!!! },
        onHover: this.handleChartHover,
        animation: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        tooltip: {
          position: 'nearest'
        },
        responsive : true,
        scales: {
          x: {
            type: 'linear',
            grid: {
              color: 'black' // theme
            },
          },
       
          /*
          y: {
            type: 'linear',
            beginAtZero: false
          },
          */
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: false,
            // grid line settings
            grid: {
            //  drawOnChartArea: false, // only want the grid lines for one axis to show up
                color: 'black' // theme
            },
          },
        },
        plugins: {
          title: {
            align: "left",
            display: true,
            text: "Distance, km / Elevation, m"
          },
          legend: {
            display: false
          },
          customCanvasBackgroundColor: {
            //color: this.pageVariables.sw_options.chart_background_color , // TODO nur für Custom theme
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              label: (tooltipItems) => {
                //return "Distance: " + tooltipItems[0].label + ' km'
                return "Distance: " + tooltipItems[0].parsed.x.toFixed(2) + ' km'
              },
              title: (tooltipItem) => {
                return "Elevation: " + tooltipItem.raw + ' m'
              },
            }
          }
        }
      }
    };
    Chart.defaults.color = '#000000'; // theme
    this.chart = new Chart(ctx, config);
  }

  // https://developers.arcgis.com/esri-leaflet/samples/dynamic-chart/
  handleChartHover(event, elements, chart) {
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

  triggerTooltip(pos) {
    let chart = this.chart;

    const tooltip = chart.tooltip;

    if (tooltip.getActiveElements().length > 0) {
      tooltip.setActiveElements([], {x: 0, y: 0});
    }

    const chartArea = chart.chartArea;
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

}
