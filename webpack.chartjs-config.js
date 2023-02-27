const webpack = require('webpack');
const path = require('path');
let _mode = 'production';

// create bundle for fotorama
module.exports = [
{
  target: ['web','es2017'],
  entry: ['./js/fotorama-multi-reduced.js'],
  output: {
    filename: 'fm_[name].js',
    chunkFilename: 'fm_[name].js',
    path: path.resolve(__dirname, 'build/fm_chartjs'),
  },
  //switch-map: active: L in local var, ele not working completely: aktiviere, um L in der lokalen Variable OHNE leaflet-elevation zu laden.
  // wenn das aktiv ist muss im file 'LeafletMapClass.js' die Zeile 'import "leaflet"' deaktiviert werden!; Achtung: Leaflet Elevation und NUR Karte mit Marker funktioniert dann nicht!
  // wenn das Plugin de-aktiviert ist (mit import leaflet aktiv), dann geht zwar leaflet, aber L ist nicht lokal und es gibt Probleme mit anderen Plugins!
  
  plugins: [new webpack.ProvidePlugin({ 
    L: 'leaflet', 
    'window.L': 'leaflet',
    'root.L' : 'leaflet' }),
  ],
  // ---------- bis hierher -----------------
  mode: _mode, 
  resolve: {
    alias: {
      leaf_images: path.resolve(__dirname, 'js/LeafletChartJs')
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource', // see: https://stackoverflow.com/questions/67186653/webpack-loads-wrong-images-to-dist-directory
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  
}];