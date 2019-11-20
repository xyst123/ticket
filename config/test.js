const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

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
    proxy: {
      '/wrj': {
        target: 'http://wrj.sohu.com',
        changeOrigin: true,
        pathRewrite: {
          '^/wrj': '',
        },
      },
    },
  },
  build: {
    extract: true,
  },
};
