const log4js = require('koa-log4');

log4js.configure({
  appenders: {
    access: {
      type: 'dateFile',
      filename: './server/logs/access',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
    },
    console: { type: 'console' },
  },
  categories: { default: { appenders: ['access', 'console'], level: 'debug' } },
});

global.logger = log4js.getLogger('access');
module.exports = (app) => {
  app.use(log4js.connectLogger(global.logger, { level: 'info', format: ':method :url' }));
};
