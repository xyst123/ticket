const router = require('koa-router')();

router.get('/timestamp', (ctx) => {
  ctx.set('Content-Type', 'application/json');
  ctx.body = JSON.stringify({
    code: 0,
    data: {
      timestamp: Date.now(),
    },
    message: 'success',
  });
});

module.exports = router;
