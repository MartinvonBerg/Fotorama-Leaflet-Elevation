const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
let _mode = 'production';

// create bundle for fotorama
module.exports = [
{
  entry: ['./js/swiperClass.js'],
  output: {
    filename: 'swiper_bundle.min.js',
    path: path.resolve(__dirname, 'build/js/swiper'),
    library: {
      name: "fm_swiper",
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
        //loader: 'file-loader', // this uncommented copies png correctly!
        //options: {
        //      name: '[path][name].[ext]',
        //      emitFile: true,
        //    },
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
  },
/* create bundle for Leaflet
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
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
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
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
        },
      }),
    ],
  },
},
// main js script
{
  entry: ['./js/fotorama-multi-reduced.js', './js/fotoramaClass.js'],
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
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
        },
      }),
    ],
  },
},
*/
}
];