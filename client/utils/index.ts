import axios from "axios";
import qs from 'qs';
import { Toast } from 'antd-mobile';

export const iterateObject = (object: { [key: string]: any }, handler: (value?: any, key?: string | number, object?: object) => void) => {
  const keys = Object.keys(object);
  keys.forEach((key) => {
    const value = object[key];
    handler(value, key, object);
  });
};

export const get = (object: any, props: string, defaultValue: any) => {
  if (!object) return defaultValue;
  const temp: string[] = props.split('.');
  const realProps = [...temp];
  temp.forEach((item) => {
    const reg = /^(\w+)\[(\w+)\]$/;
    if (reg.test(item)) {
      const matches = item.match(reg);
      const field1 = matches[1];
      const field2 = matches[2];
      const replaceIndex = realProps.indexOf(item);
      realProps.splice(replaceIndex, 1, field1, field2);
    }
  });

  return realProps.reduce((prevObject, prop) => {
    const curObject = prevObject[prop] === undefined ? defaultValue : prevObject[prop];
    if (curObject instanceof Array) {
      return [...curObject];
    }
    if (curObject instanceof Object) {
      return { ...curObject };
    }
    return curObject;
  }, object);
}

export const request = ({
  method = 'GET', url = '', type = '', params = {}, data = {}, headers = {}
}): string | Object => {
  method = method.toUpperCase();
  const realParams = {};
  if (method === 'GET') {
    Object.assign(realParams, params, data);
  } else {
    Object.assign(realParams, params);
    if (type === 'form') {
      data = qs.stringify(data);
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }
  }
  const options = {
    method,
    url,
    data,
    params: realParams,
    headers
  };
  return new Promise((resolve) => {
    axios(options).then((res) => {
      resolve(res.data);
    }).catch((error) => {
      resolve(error);
    });
  });
};


export const handleRes = (res, message = {}, successCallback?, failCallback?): boolean => {
  if (res.httpstatus === 200) {
    res.result_code = '0'
  }
  const code = parseInt(get(res, "result_code", "-1"))
  if (code === 0) {
    const { success } = message;
    if (success) {
      Toast.success(success, 3, successCallback);
    }
    return true;
  }
  console.error(res);
  const failMessage = message[code];
  if (failMessage) {
    Toast.fail(failMessage, 3, failCallback);
  }
  return false;
}

const add0 = number => (number < 10 ? `0${number}` : number);
export const dateFormat = (date, format = 'yyyy-MM-dd HH:mm:ss') => {
  const [yyyy, MM, dd, HH, mm, ss] = [date.getFullYear(), add0(date.getMonth() + 1), add0(date.getDate()), add0(date.getHours()), add0(date.getMinutes()), add0(date.getSeconds())];
  const dateMap = {
    yyyy,
    MM,
    dd,
    HH,
    mm,
    ss,
  };
  iterateObject(dateMap, (value, key) => {
    format = format.replace(key, value);
  })
  return format;
}

export const getType = (value: any) => Object.prototype.toString.call(value).replace(/\[|\]|object|\s/g, '').toLowerCase()

export const getStorage = (key: string, props?: string, defaultValue?: any) => {
  const data = window.localStorage.getItem(key);
  try {
    if (!data) {
      return data
    }
    const realData = JSON.parse(data);
    if (props) {
      return get(realData, props, defaultValue)
    }
    return realData
  } catch (error) {
    return data
  }
}

export const setStorage = (key: string, value: any, assign: boolean = true) => {
  const previousData = getStorage(key);
  if (getType(value) === "object") {
    if (assign && getType(previousData) === "object") {
      window.localStorage.setItem(key, JSON.stringify(Object.assign(previousData, value)));
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } else if (getType(value) === "array") {
    window.localStorage.setItem(key, JSON.stringify(value));
  } else {
    window.localStorage.setItem(key, value);
  }
}
