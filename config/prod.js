module.exports = {
  webpack: {
    mode: 'production',
    devtool: false,
  },
  server: {
    protocol: 'http',
    port: 3002,
    enableStaticCache: true, // 静态资源是否缓存
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
