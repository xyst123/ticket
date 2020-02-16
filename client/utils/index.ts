import axios, { AxiosRequestConfig, Method } from "axios";
import qs from 'qs';

export const iterateObject = (object: { [key: string]: any }, handler: (value: any, key: string, object?: { [key: string]: any }) => void) => {
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
    const matches = item.match(reg);
    if (Array.isArray(matches)) {
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

interface IRequestOptions {
  url: string,
  method?: string,
  type?: string,
  params?: { [key: string]: any },
  data?: any,
  headers?: { [key: string]: string }
}
export const request = <T>({
  method = 'GET', url = '', type = '', params = {}, data = {}, headers = {}
}: IRequestOptions): Promise<T> => {
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
  const options: AxiosRequestConfig = {
    method: (<Method>method),
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

interface IHandleResRes {
  status: boolean,
  code: number,
  message: string
}

export const handleRes = (res: any, message: { [key: string]: string } = {}): IHandleResRes => {
  if (res.httpstatus === 200) {
    res.result_code = '0'
  }
  const code = parseInt(get(res, 'result_code', '-1'))
  if (code === 0) {
    const success = message[String(0)];
    return {
      status: true,
      code,
      message: success || ""
    };
  }
  console.error(res);
  const fail = message[String(code)];
  return {
    status: false,
    code,
    message: fail || ""
  };
}

const add0 = (number: number) => (number < 10 ? `0${number}` : number);
export const dateFormat = (date: Date, format = 'yyyy-MM-dd HH:mm:ss') => {
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

export const getType = (value: any): string => Object.prototype.toString.call(value).replace(/\[|\]|object|\s/g, '').toLowerCase();

export const getFirstName = (name: string) => {
  if (name.length > 2) {
    return name.substring(name.length - 2)
  }
  return name.substring(1)
}

export const getStorage = (key: string, props?: string, defaultValue?: any) => {
  const data = window.localStorage.getItem(key);
  try {
    if (!data) {
      return defaultValue === undefined ? data : defaultValue
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

export const getRandom = (from: number, to: number): number => {
  return parseInt(String(from + (to - from) * Math.random()), 10)
}

export const delay=async <T>(callback:Function,time:number):Promise<T>=>{
  await new Promise(resolve => {
    setTimeout(() => { resolve() }, time)
  })
  return callback()
}

const windowWidth = document.compatMode === 'CSS1Compat' ? document.documentElement.clientWidth : document.body.clientWidth;
export const getVw=(px:number)=>Number((100 * Number(px) / windowWidth).toFixed(3))