const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const proxy=require('./proxy');

module.exports = {
  webpack: {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
      new FriendlyErrorsPlugin(),
    ],
  },
  server: {
    protocol: 'http',
    port: 3001,
    enableStaticCache: true,
    proxy
  },
  build: {
    extract: false,
  },
};
