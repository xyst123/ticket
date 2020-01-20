const fs = require('fs');
const path=require('path');
const https = require('https');
const http = require('http');
const Koa = require('koa');
const sslify = require('koa-sslify').default;
const views = require('koa-views');
const serve = require('koa-static');
const helmet = require('koa-helmet');
const bodyParser = require('koa-bodyparser');
const proxy = require('koa-server-http-proxy');
const router = require('koa-router')();
const koaWebpack=require('koa-webpack');
const webpack = require('webpack');
const webpackMainConfig = require('../build/webpack.main.config');
const composeRoutes = require('./middlewares/composeRouter');
const clientRoute = require('./middlewares/clientRoute');
const { resolve, iterateObject, getConfig } = require('../utils');
require('./helpers/logger');

const env = process.env.NODE_ENV || 'dev';
const app = new Koa();
const serverConfig = getConfig().server || {};
const { port, protocol } = serverConfig;

if (protocol === 'https') {
  app.use(sslify());
}

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
  const useKoaWebpack=async()=>{
    const middleware=await koaWebpack({ compiler })
    app.use(middleware);
    app.use(async (ctx) => {
      const filename = path.resolve(webpackMainConfig.output.path, 'index.html')
      ctx.response.type = 'html'
      ctx.response.body = middleware.devMiddleware.fileSystem.createReadStream(filename)
    });
  }
  useKoaWebpack(0)
}

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
