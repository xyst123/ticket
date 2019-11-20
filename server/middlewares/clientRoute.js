const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

module.exports = async (ctx, next) => {
  await ctx.render('index', {
    root: renderToStaticMarkup(
      '<h1>Hello, world!</h1>',
    ),
  });
  await next();
};
