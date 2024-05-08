//const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./bootstrap.js",
  output: {
    filename: "fm_admin.js",
    chunkFilename: 'fm_admin_[name].js',
    path: path.resolve(__dirname, '../../build/fm_admin'),
    
  },
  mode: "development",
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
};
