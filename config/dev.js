const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const headerConfig = {
  12306: {
    host: 'kyfw.12306.cn',
    referer: 'https://kyfw.12306.cn',
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
      '/otn/cookie/bigIpServerOtn': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/cookie/bigIpServerOtn': '/otn/HttpZF/GetJS',
        },
      },
      '/otn/cookie/route': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/cookie/route': '/otn/index12306/getLoginBanner',
        },
      },
      '/otn/cookie/jSessionId': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/cookie/jSessionId': '/otn/passport?redirect=/otn/login/userLogin',
        },
      },
      '/passport/cookie/getTk': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/passport/cookie/getTk': '/passport/web/auth/uamtk',
        },
        headers: headerConfig['12306'],
      },
      '/passport/cookie/setTk': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/passport/cookie/setTk': '/otn/uamauthclient',
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
      '/otn/api/restTicket/query': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/restTicket/query': '/otn/leftTicket/query',
        },
      },
      '/otn/api/submitOrder': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/submitOrder': '/otn/leftTicket/submitOrderRequest',
        },
      },
      '/otn/api/initOrder': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/initOrder': '/otn/confirmPassenger/initDc',
        },
      },
      '/otn/api/checkOrder': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/checkOrder': '/otn/confirmPassenger/checkOrderInfo',
        },
      },
      '/otn/api/countOrder': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/countOrder': '/otn/confirmPassenger/getQueueCount',
        },
      },
      '/otn/api/confirmOrder': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/confirmOrder': '/otn/confirmPassenger/confirmSingleForQueue',
        },
      },
    },
  },
  build: {
    extract: false,
  },
};
