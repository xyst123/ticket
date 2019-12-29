const path = require('path');
const axios = require('axios');
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
  return axios(options).then((res) => res.data).catch((error) => {
    logger(error);
  });
}

function getRandom(from, to) {
  return parseInt(String(from + (to - from) * Math.random()), 10)
}

function getIP() {
  return `${getRandom(1, 254)}.${getRandom(1, 254)}.${getRandom(1, 254)},${getRandom(1, 254)}`
}

function resolveFirst(promiseArray) {
  let count = 0;
  let handledNumber = 0;
  return new Promise((resolve) => {
    promiseArray.forEach(promise => {
      Promise.resolve(promise).then(value => {
        count += 1;
        if (!handledNumber) {
          handledNumber++
          resolve(value);
        }
      }).catch(error => {
        count += 1;
        if (count === promiseArray.length && !handledNumber) {
          resolve(error)
        }
      })
    })
  })
}

module.exports = {
  iterateObject,
  serverRequest,
  getRandom,
  getIP,
  resolveFirst,
  resolve(file) {
    return path.resolve(__dirname, '../', file);
  },
  getConfig() {
    return configs[env];
  }
};
