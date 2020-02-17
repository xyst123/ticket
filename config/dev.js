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
    protocol: 'http',
    port: 3007,
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
      '/otn/api/order/submit': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/order/submit': '/otn/leftTicket/submitOrderRequest',
        },
      },
      '/otn/api/order/init': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/order/init': '/otn/confirmPassenger/initDc',
        },
      },
      '/otn/api/order/check': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/order/check': '/otn/confirmPassenger/checkOrderInfo',
        },
      },
      '/otn/api/order/count': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/order/count': '/otn/confirmPassenger/getQueueCount',
        },
      },
      '/otn/api/order/confirm': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/order/confirm': '/otn/confirmPassenger/confirmSingleForQueue',
        },
      },
      '/otn/api/order/waitTime': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/order/waitTime': '/otn/confirmPassenger/queryOrderWaitTime',
        },
      },
      '/otn/api/user/info': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/user/info': '/otn/index/initMy12306Api',
        },
      },
      '/otn/api/alternate/confirm': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/alternate/confirm': '/otn/afterNate/confirmHB',
        }
      },
      '/otn/api/alternate/status': {
        target: 'https://kyfw.12306.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/otn/api/alternate/status': '/otn/afterNate/queryQueue',
        },
      },
    },
  },
  build: {
    extract: false,
  },
};
