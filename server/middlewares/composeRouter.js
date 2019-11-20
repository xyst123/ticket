const fs = require('fs');
const router = require('koa-router')();

function requireRoutes(basePath, filePath) {
  const files = fs.readdirSync(basePath + filePath);
  files.forEach((file) => {
    const fileName = basePath + filePath + file;
    if (fs.statSync(fileName).isFile()) {
      const innerRoute = require(fileName);
      const baseRoute = filePath + file.substring(0, file.length - 3);
      router.use(baseRoute, innerRoute.routes());
    } else {
      requireRoutes(basePath, `${filePath}${file}/`);
    }
  });
}

module.exports = (routePath) => {
  requireRoutes(routePath, '/');
  return router;
};
