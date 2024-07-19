//const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./bootstrap.js",
  output: {
    filename: "fm_admin.js",
    chunkFilename: 'fm_admin_[name].js',
    path: path.resolve(__dirname, '../../build/fm_admin'),
    
  },
  mode: "production",
  //plugins: [
  //  new CopyWebpackPlugin(['index.html'])
  //],
  experiments: {
    asyncWebAssembly: true,
    //buildHttp: true,
    //layers: true,
    //lazyCompilation: true,
    //outputModule: true,
    //syncWebAssembly: true,
    //topLevelAwait: true,
  },
  performance: {
    hints: false,
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
};
