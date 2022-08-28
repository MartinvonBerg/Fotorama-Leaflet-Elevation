const path = require('path');
let _mode = 'production';

// create bundle for fotorama
module.exports = [
{
  entry: './js/fotoramaClass.js',
  output: {
    filename: 'fotorama_bundle.js',
    path: path.resolve(__dirname, 'release/js/fotorama'),
  },
  mode: _mode, 
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
},
// create bundle for Leaflet
{
  entry: './js/leafletMapClass.js',
  output: {
    filename: 'leaflet_map_bundle.js',
    path: path.resolve(__dirname, 'release/js/leaflet'),
  },
  mode: _mode, 
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
},
// create bundle for Leaflet-Elevation
{
  entry: './js/elevationClass.js',
  output: {
    filename: 'leaflet_elevation_bundle.js',
    path: path.resolve(__dirname, 'release/js/leaflet_elevation'),
  },
  mode: _mode, 
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
},
// main js script
{
  entry: './js/fotorama-multi-reduced.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'release/js'),
  },
  mode: _mode, 
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
},
];