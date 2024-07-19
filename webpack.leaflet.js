const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
let _mode = 'production';

// create bundle for fotorama
module.exports = [
{
  entry: ['./js/leafletMapClass.js'],
  output: {
    filename: 'leaflet_[name].js',
    path: path.resolve(__dirname, 'build/js/leaflet'),
    library: {
      name: "fm_leaflet",
      type: "var",
    }
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
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: false,
          keep_fnames: false,
          compress: true,
          mangle: true,
        },
      }),
    ],
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
    },
  },
},
];