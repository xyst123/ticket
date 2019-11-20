const merge = require('webpack-merge');
const mainConfig = require('./webpack.main.config');
const { resolve } = require('../utils');

module.exports = merge(mainConfig, {
  devServer: {
    contentBase: resolve('dist'),
    compress: true,
    stats: 'none',
    port: 4000,
    historyApiFallback: true,
  },
});
