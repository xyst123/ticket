const path = require('path');
const request = require('request');
const configs = require('../config');

const env = process.env.NODE_ENV || 'dev';

function iterateObject(object, handler) {
  const keys = Object.keys(object);
  keys.forEach((key) => {
    const value = object[key];
    handler(value, key, object);
  });
}

function serverRequest(options) {
  if (options.params) {
    const paramArray = [];
    iterateObject(options.params, (value, key) => {
      paramArray.push(`${key}=${value}`);
    });
    options.url += `?${paramArray.join('&')}`;
  }
  return new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

module.exports = {
  iterateObject,
  serverRequest,

  resolve(file) {
    return path.resolve(__dirname, '../', file);
  },

  getConfig() {
    return configs[env];
  },
};
