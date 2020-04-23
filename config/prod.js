const proxy=require('./proxy');

module.exports = {
  webpack: {
    mode: 'production',
    devtool: false,
  },
  server: {
    protocol: 'http',
    port: 3009,
    enableStaticCache: true, // 静态资源是否缓存
    proxy
  },
  build: {
    extract: true,
  },
};
