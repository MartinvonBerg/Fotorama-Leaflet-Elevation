const path = require('path');
//const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");
let _mode = 'production';

// create bundle for fotorama
module.exports = [
{
  entry: ['./js/fotorama-multi-reduced.js'],
  output: {
    filename: 'fm_[name].js',
    path: path.resolve(__dirname, 'release/build/fm_bundle'),
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
        type: 'asset/resource', // see: https://stackoverflow.com/questions/67186653/webpack-loads-wrong-images-to-dist-directory
      },
    ],
  },
}];