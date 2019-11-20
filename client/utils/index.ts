import axios from "axios";
import qs from 'qs';
import { Toast } from 'antd-mobile';

export const iterateObject = (object, handler) => {
  const keys = Object.keys(object);
  keys.forEach((key) => {
    const value = object[key];
    handler(value, key, object);
  });
};

export const get = (object, props: string, defaultValue) => {
  if (!object) return defaultValue;
  const temp = props.split('.');
  const realProps = [].concat(temp);
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
    const curObject = prevObject[prop]===undefined?defaultValue:prevObject[prop];
    if (curObject instanceof Array) {
      return [].concat(curObject);
    }
    if (curObject instanceof Object) {
      return Object.assign({}, curObject);
    }
    return curObject;
  }, object);
}

export const request = ({
  method = 'GET', url = '', type = '', params = {}, data = {}, headers = {}
}) => {
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

interface Message {
  success?: string;
  fail?: string;
}
export const handleRes = (res, message: Message = {}, successCallback, failCallback): boolean => {
  if(res.httpstatus===200){
    res.result_code='0'
  }
  const code=parseInt(get(res, "result_code", "-1"))
  if ( code=== 0) {
    const { success } = message;
    if (success) {
      Toast.success(success, 3, successCallback);
    }
    return true;
  }
  console.error(res);
  const failMessage=message[code];
  if (failMessage) {
    Toast.fail(failMessage, 3, failCallback);
  }
  return false;
}

const add0 = number => (number < 10 ? `0${number}` : number);
export const dateFormat=(date, format = 'yyyy-MM-dd HH:mm:ss')=> {
  const [yyyy, MM, dd, HH, mm, ss] = [date.getFullYear(), add0(date.getMonth() + 1), add0(date.getDate()), add0(date.getHours()), add0(date.getMinutes()), add0(date.getSeconds())];
  const dateMap = {
    yyyy,
    MM,
    dd,
    HH,
    mm,
    ss,
  };
  iterateObject(dateMap,(value,key)=>{
    format = format.replace(key, value);
  })
  return format;
}