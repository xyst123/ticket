// import React from 'react';
// import { renderToStaticMarkup } from 'react-dom/server';
// import { StaticRouter } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import store from '../../client/redux/store.js';
// import { Routes, routes } from '../../client/router/index.jsx';

// export default async (ctx, next) => {
//   for (let item of routes) {
//     if (item.path == ctx.url) {
//         const data = await getData(ctx.url);
//         await ctx.render('index', {
//             root: renderToStaticMarkup(
//                 <div>123</div>
//                 // <Provider store={store}>
//                 //     <StaticRouter location={ctx.url} context={data}>
//                 //         <Routes {...store.getState()} />
//                 //     </StaticRouter>
//                 // </Provider>
//             )
//         });
//         break;
//     }
//   }
//   await next();
// };
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