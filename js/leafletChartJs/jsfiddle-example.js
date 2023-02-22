// source: https://jsfiddle.net/Geoapify/2pjhyves/
Chart.register(
  Chart.LineElement,
  Chart.LineController,
  Chart.Legend,
  Chart.Tooltip,
  Chart.LinearScale,
  Chart.PointElement,
  Chart.Filler,
  Chart.Title
);

// The API Key provided is restricted to JSFiddle website
// Get your own API Key on https://myprojects.geoapify.com
const myAPIKey = "6dc7fb95a3b246cfa0f3bcef5ce9ed9a";

const map = new maplibregl.Map({
  container: 'my-map',
  style: `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${myAPIKey}`,
  center: [-110.63886603832373, 44.57344946153063],
  zoom: 8
});
map.addControl(new maplibregl.NavigationControl());

const popup = new maplibregl.Popup();

const waypoints = [{
  latlon: [44.56887641018278, -110.37193509232105],
  address: "Howard Eaton-Fishing Bridge-Canyon, Park County, WY, United States of America"
},
{
  latlon: [44.64991504629589, -110.87685585784652],
  address: "251 Echo Canyon Road, Teton County, WY, United States of America"
},
{
  latlon: [44.46198969253814, -110.83290070191913],
  address: "Lower Hamilton Store, 251 Echo Canyon Road, Teton County, WY, United States of America"
},
{
  latlon: [44.534340496926745, -110.43392313273148],
  address: "Grand Loop Road, Bridge Bay, WY, United States of America"
}
]

// create markers
const markers = [];
waypoints.forEach(waypoint => {
  markers.push(new maplibregl.Marker().setLngLat([waypoint.latlon[1], waypoint.latlon[0]])
    .setPopup(new maplibregl.Popup().setText(waypoint.address)).addTo(map));
});

let routeData;
let elevationData;

fetch(`https://api.geoapify.com/v1/routing?waypoints=${waypoints.map(waypoint => waypoint.latlon.join(',')).join('|')}&mode=mountain_bike&details=elevation&apiKey=${myAPIKey}`).then(res => res.json()).then(routeResult => {
  routeData = routeResult;
  elevationData = calculateElevationProfileData(routeResult);

  map.addSource('route', {
    type: 'geojson',
    data: routeData
  });

  drawRoute();
  drawElevationProfile();
}, err => console.log(err));

function drawRoute() {
  if (!routeData) {
    return;
  }

  if (map.getLayer('route-layer')) {
    map.removeLayer('route-layer')
  }


  map.getSource('route').setData(routeData);
  map.addLayer({
    'id': 'route-layer',
    'type': 'line',
    'source': 'route',
    'layout': {
      'line-cap': "round",
      'line-join': "round"
    },
    'paint': {
      'line-color': "#6084eb",
      'line-width': 8
    },
    'filter': ['==', '$type', 'LineString']
  });
}

function calculateElevationProfileData(routeData) {
  const legElevations = [];

  // elevation_range contains pairs [distance, elevation] for every leg geometry point
  routeData.features[0].properties.legs.forEach(leg => {
    if (leg.elevation_range) {
      legElevations.push(leg.elevation_range);
    } else {
      legElevations.push([]);
    }
  });

  labels = [];
  data = [];

  legElevations.forEach((legElevation, index) => {
    let previousLegsDistance = 0;
    for (let i = 0; i <= index - 1; i++) {
      previousLegsDistance += legElevations[i][legElevations[i].length - 1][0];
    }

    labels.push(...legElevation.map(elevationData => elevationData[0] + previousLegsDistance));
    data.push(...legElevation.map(elevationData => elevationData[1]));
  });

  // optimize array size to avoid performance problems
  const labelsOptimized = [];
  const dataOptimized = [];
  const minDist = 5; // 5m
  const minHeight = 10; // ~10m

  labels.forEach((dist, index) => {
    if (index === 0 || index === labels.length - 1 ||
      (dist - labelsOptimized[labelsOptimized.length - 1]) > minDist ||
      Math.abs(data[index] - dataOptimized[dataOptimized.length - 1]) > minHeight) {
      labelsOptimized.push(dist);
      dataOptimized.push(data[index]);
    }
  });

  return {
    data: dataOptimized,
    labels: labelsOptimized
  }
}

function drawElevationProfile() {
  const ctx = document.getElementById("route-elevation-chart").getContext("2d");
  const chartData = {
    labels: elevationData.labels,
    datasets: [{
      data: elevationData.data,
      fill: true,
      borderColor: '#66ccff',
      backgroundColor: '#66ccff66',
      tension: 0.1,
      pointRadius: 0,
      spanGaps: true
    }]
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
      }
    }],
    options: {
      onHover: function (e, item) {
        // add hover here!!!
      },
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
          text: "Distance, m / Elevation, m"
        },
        legend: {
          display: false
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              return "Distance: " + tooltipItems[0].label + 'm'
            },
            label: (tooltipItem) => {
              return "Elevation: " + tooltipItem.raw + 'm'
            },
          }
        }
      }
    }
  };

  const chart = new Chart(ctx, config);
}

drawElevationProfile2() {
  const ctx = document.getElementById("route-elevation-chart").getContext("2d");
	    const chartData = {
      labels: elevationData.labels,
      datasets: [{
        data: elevationData.data,
        fill: true,
        borderColor: '#66ccff',
        backgroundColor: '#66ccff66',
        tension: 0.1,
        pointRadius: 0,
        spanGaps: true
      }]
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
        }
      }],
      options: {
        onHover: function (e, item) {
          // add hover here!!!
        },
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
            text: "Distance, m / Elevation, m"
          },
          legend: {
            display: false
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: (tooltipItems) => {
                return "Distance: " + tooltipItems[0].label + 'm'
              },
              label: (tooltipItem) => {
                return "Elevation: " + tooltipItem.raw + 'm'
              },
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
}
