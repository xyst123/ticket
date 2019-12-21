import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
  Routes,
} from '@/router';
import store from '@/redux/store';
import { checkIps } from '@/service/ticket';
import '@/style/reset.less';

(window as any).availableIps = [];
checkIps();

function requestPermission() {
  return new Promise((resolve, reject) => {
    const permissionPromise = Notification.requestPermission((result) => {
      resolve(result);
    });
    if (permissionPromise) {
      permissionPromise.then(resolve, reject);
    }
  }).then((result) => {
    if (result !== 'granted') {
      throw new Error('用户拒绝接收通知');
    }
  });
}

const {
  serviceWorker
} = window.navigator;

if ((window.location.protocol === 'https:' || window.location.hostname === 'localhost') && serviceWorker) {
  serviceWorker.register('/serviceWorker.js')
    .then((registration) => {
      requestPermission();
    }).catch((error) => {
      console.error(error);
    });
}

ReactDOM.render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  document.getElementById('root'));

