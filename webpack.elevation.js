const path = require('path');
//const webpack = require('webpack');
//const TerserPlugin = require("terser-webpack-plugin");
let _mode = 'development';

// create bundle for fotorama
module.exports = [
{
  entry: ['./js/elevationClass.js'],
  output: {
    filename: 'elevation_[name].js',
    path: path.resolve(__dirname, 'release/build/js/elevation'),
    library: {
      name: "fm_elevation",
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
    /*
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
    */
    //runtimeChunk: 'single',
    //splitChunks: {
      //chunks: 'all',
      /*
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
      */
    //},
  },
},
];