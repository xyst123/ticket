const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const headerConfig = {
  12306: {
    host: 'kyfw.12306.cn',
    referer: 'https://kyfw.12306.cn/otn',
    origin: 'https://kyfw.12306.cn',
  },
};

module.exports = {
  webpack: {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
      new FriendlyErrorsPlugin(),
    ],
  },
  server: {
    protocol: 'https',
    port: 3006,
    enableStaticCache: false,
    enableMock: false,
    // TODO
    autoOpen: true,
    proxy: {
      '/otn/api/cookie/bigIpServerOtn': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/cookie/bigIpServerOtn': '/otn/HttpZF/GetJS',
        },
      },
      '/otn/api/cookie/route': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/cookie/route': '/otn/index12306/getLoginBanner',
        },
      },
      '/otn/api/cookie/jSessionId': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/cookie/jSessionId': '/otn/passport?redirect=/otn/login/userLogin',
        },
      },
      '/passport/api/cookie/getTk': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/passport/api/cookie/getTk': '/passport/web/auth/uamtk',
        },
        headers: headerConfig['12306'],
      },
      '/passport/api/cookie/setTk': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/passport/api/cookie/setTk': '/otn/uamauthclient',
        },
        headers: headerConfig['12306'],
      },
      '/passport/api/position': {
        target: 'http://littlebigluo.qicp.net:47720',
        changeOrigin: true,
        pathRewrite: {
          '^/passport/api/position': '',
        },
      },
      '/passport/api/authCode': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/passport/api/authCode': '/passport/captcha/captcha-image64',
        },
      },
      '/passport/api/checkAuthCodeAnswer': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/passport/api/checkAuthCodeAnswer': '/passport/captcha/captcha-check',
        },
      },
      '/passport/api/login': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/passport/api/login': '/passport/web/login',
        },
      },
      '/otn/api/passenger/query': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/passenger/query': '/otn/passengers/query',
        },
      },
      '/otn/restTicket/query': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/restTicket/query': '/otn/leftTicket/query',
        },
      },
    },
  },
  build: {
    extract: false,
  },
};
