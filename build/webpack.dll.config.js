const webpack = require('webpack');
const merge = require('webpack-merge');
const { resolve, getConfig } = require('../utils');

const envWebpackConfig = getConfig().webpack || {};
const library = '[name]_lib';

module.exports = merge({
  entry: {
    vendors: ['axios', 'es6-promise', 'react', 'react-dom', 'typescript'],
  },
  output: {
    path: resolve('server/static/js'),
    filename: '[name].dll.js',
    library,
  },

  plugins: [
    new webpack.DllPlugin({
      path: resolve('[name]-manifest.json'),
      name: library,
    }),
  ],
}, envWebpackConfig);
