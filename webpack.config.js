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
    path: path.resolve(__dirname, 'build/fm_bundle'),
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
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  
}];