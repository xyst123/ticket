const merge = require('webpack-merge');
const mainConfig = require('./webpack.main.config');
const { resolve } = require('../utils');

module.exports = merge(mainConfig, {
  devServer: {
    contentBase: resolve('dist'),
    compress: true,
    stats: 'none',
    port: 5000,
    historyApiFallback: true,
  },
});
