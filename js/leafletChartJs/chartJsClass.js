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

  constructor(divID, linedata = [], options = {}) {
    //const ctx = document.getElementById(divID);
    this.elementDiv = divID;
    this.elementOnPage = document.getElementById(divID);

    this.elevationData = this.filterGPXTrackdata(linedata);

    this.drawElevationProfile2(divID);

    //this.triggerTooltip(this.chart, 100);

    //this.triggerTooltip(this.chart, 300);

    /*
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                data:this.elevationData.data
        }],
            labels: this.elevationData.labels
          },
        options: {
            scales: {
                y: {
                beginAtZero: false
                }
            },
            elements: {
                point: {
                    radius: 1,
                    hoverRadius: 1,
                }},
            plugins: {
                legend: {
                    display: false,
                    position: 'bottom',
                    title: {
                        text: 'Höhe',
                        display: false,
                    }
                }
            }
        }
    });
    */
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

  drawElevationProfile2() {
    const ctx = this.elementOnPage.getContext("2d");

    const chartData = {
      labels: this.elevationData.labels,
      datasets: [{
        data: this.elevationData.data,
        fill: true,
        borderColor: '#000000',
        borderWidth: 1,
        backgroundColor: '#d4640e33',
        tension: 0.1,
        pointRadius: 0,
        spanGaps: true
      }]
    };

    // funktioniert ist aber einfacher mit CSS3 zu setzen
    const plugin = {
      id: 'customCanvasBackgroundColor',
      beforeDraw: (chart, args, options) => {
        const {ctx} = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#000000';
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
          chart.options.scales.y.max = maxHeight + Math.round(maxHeight * 0.2);
          chart.options.scales.y1.max = maxHeight + Math.round(maxHeight * 0.2);
        }},
        plugin
      ],
      options: {
        //onHover: function (e, item) { // add hover here!!! },
        onHover: this.handleChartHover,
        animation: false,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        tooltip: {
          position: 'nearest'
        },
        scales: {
          x: {
            type: 'linear'
          },
          y: {
            type: 'linear',
            beginAtZero: true
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            // grid line settings
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
          },
        },
        plugins: {
          title: {
            align: "end",
            display: true,
            text: "Distance, m / Elevation, km"
          },
          legend: {
            display: false
          },
          customCanvasBackgroundColor: {
            color: 'white',
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: (tooltipItems) => {
                //return "Distance: " + tooltipItems[0].label + ' km'
                return "Distance: " + tooltipItems[0].parsed.x.toFixed(2) + ' km'
              },
              label: (tooltipItem) => {
                return "Elevation: " + tooltipItem.raw + ' m'
              },
            }
          }
        }
      }
    };

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
