const fs = require('fs');
const https = require('https');
const http = require('http');
const Koa = require('koa');
const sslify = require('koa-sslify').default;
const views = require('koa-views');
const convert = require('koa-convert');
const serve = require('koa-static');
const helmet = require('koa-helmet');
const bodyParser = require('koa-bodyparser');
const proxy = require('koa-server-http-proxy');
const router = require('koa-router')();
const devMiddleware = require('koa-webpack-dev-middleware');
const hotMiddleware = require('koa-webpack-hot-middleware');
const webpack = require('webpack');
const webpackMainConfig = require('../build/webpack.main.config');
const composeRoutes = require('./middlewares/composeRouter');
const clientRoute = require('./middlewares/clientRoute');
const { resolve, iterateObject, getConfig } = require('../utils');
require('./helpers/logger');

const env = process.env.NODE_ENV || 'dev';
const app = new Koa();
const serverConfig = getConfig().server || {};

app.use(sslify());
app.use(helmet());
app.use(views(resolve('dist'), { map: { html: 'ejs' } }));
app.use(serve(resolve('dist')));
app.use(serve(resolve('server/static')));

// 使用代理接口
if (!serverConfig.enableMock) {
  iterateObject(serverConfig.proxy || {}, (options, path) => {
    app.use(proxy(path, options));
  });
}

// 使用自定义接口
app.use(bodyParser());
app.use(composeRoutes(`${__dirname}/controllers`).routes());
app.use(router.allowedMethods());

app.use(clientRoute);

if (env === 'dev') {
  const compiler = webpack(webpackMainConfig);
  compiler.plugin('emit', (compilation, callback) => {
    const { assets } = compilation;
    iterateObject(assets, (value, key) => {
      if (key.match(/\.html$/)) {
        const file = resolve(`dist/${key}`);
        const data = assets[key].source();
        fs.writeFileSync(file, data);
      }
    });
    callback();
  });
  app.use(convert(devMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackMainConfig.output.publicPath,
  })));
  app.use(convert(hotMiddleware(compiler)));
}

const { port, protocol } = serverConfig;

if (protocol === 'https') {
  const httpsOptions = {
    key: fs.readFileSync(resolve('server.key')),
    cert: fs.readFileSync(resolve('server.crt')),
  };
  const httpsServer = https.createServer(httpsOptions, app.callback());

  httpsServer.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
} else {
  const httpServer = http.createServer(app.callback());

  httpServer.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
}
