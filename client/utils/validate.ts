import { getType } from './index';

const getStrLen = (str: string) => {
  let length = 0;
  let strCode;
  for (let i = 0; i < str.length; i += 1) {
    strCode = str.charCodeAt(i);
    if (strCode > 65248 || strCode === 12288) { // 全角字符
      length += 1;
    } else if ([8216, 8217, 8220, 8221].indexOf(strCode) !== -1) { // 中文单引号和中文双引号
      length += 1;
    } else if (str[i].match(/[\u4e00-\u9fa5]/g)) { // 中文
      length += 1;
    } else {
      length += 0.5;
    }
  }
  return length;
};

interface IRule {
  rule: string,
  backData?: Object,
  options?: Object
}
interface IValidate {
  id?: string,
  value: any,
  rules: IRule[]
}

interface ITypeOptions {
  type: string
}
interface ICompareOptions {
  target: number,
  type: string
}
interface IDefineOptions {
  fn: any
}
interface IStringLengthOptions {
  min?: number,
  max?: number
}

interface ICheck {
  pass: boolean,
  errors: {
    [key: string]: {
      value: any,
      backData: any,
    }[]
  },
  firstError: Object
}

export default <{ [key: string]: Function }>{
  isType(data: any, options: ITypeOptions) {
    const { type } = options;
    const realType = getType(data);
    return { pass: type.toLowerCase() === realType.toLowerCase() };
  },
  compare(data: any, options: ICompareOptions) {
    const { target, type } = options;
    const rs = {
      pass: true,
    };
    const number = Number(data);
    if (type === 'more') {
      rs.pass = number > target;
    } else if (type === 'less') {
      rs.pass = number < target;
    } else {
      rs.pass = number === target;
    }
    return rs;
  },
  isInteger(data: any) {
    return { pass: Number(data) === parseInt(data, 10) };
  },
  isChinese(data: any) {
    return { pass: /^[\u4E00-\u9FA5]+$/.test(String(data)) };
  },
  stringLength(data: any, options: IStringLengthOptions) {
    const string = String(data).trim();
    const length = getStrLen(string);
    if (options.min !== undefined) {
      return {
        pass: length >= options.min,
      };
    }
    if (options.max !== undefined) {
      return {
        pass: length <= options.max,
      };
    }
    return { pass: true };
  },
  isPhone(data: any) {
    const phone = String(data);
    const rs = /^((\+?86)|(\+86))?1[0-9]{10}$/.test(phone) || /^\d{3,4}-?\d{7,8}$/.test(phone);
    return { pass: rs };
  },
  isNotEmpty(data: any) {
    const type = getType(data);
    const testMap: { [key: string]: Function } = {
      object(data: Object) {
        return Object.keys(data).length > 0;
      },
      array(data: any[]) {
        return data.length > 0;
      },
      string(data: string) {
        const realData = String(data).trim();
        return realData.length > 0;
      },
      number(data: number) {
        return Boolean(data);
      },
    };
    return { pass: Boolean(testMap[type] ? testMap[type](data) : false) };
  },
  isEmail(data: any) {
    const email = String(data);
    const rs = /^[^@]+@[^@]+$/.test(email);
    return { pass: rs };
  },
  isNotNaN(data: any) {
    return { pass: !Number.isNaN(data) };
  },
  isExist(data: any) {
    return { pass: Boolean(data) };
  },
  userDefine(data: any, options: IDefineOptions) {
    const { fn } = options;
    return { pass: fn && typeof fn === 'function' ? fn(data) : false };
  },
  check(validates: IValidate[] = []): ICheck {
    const rs: ICheck = {
      pass: true,
      errors: {},
      firstError: {},
    };
    validates.forEach((validate, index) => {
      const { value } = validate;
      validate.rules.forEach((rule) => {
        const realRule = (rule.rule || '').replace(/\s/g, '');
        let hasValidFn = false;
        const fn = this[realRule];
        if (!fn || getType(fn) !== 'function') {
          console.error('校验数据——校验函数无效');
          return;
        }
        hasValidFn = true;
        const testResult = fn(value, rule.options || {});
        const testPass = testResult && testResult.pass;

        if (!testPass && hasValidFn) {
          const errorInfo = {
            value: validate.value,
            backData: rule.backData || {},
          };
          if (rs.pass) {
            rs.firstError = errorInfo;
          }
          rs.pass = false;
          const key = validate.id || index;
          const { errors } = rs;
          if (Array.isArray(errors[key])) {
            errors[key].push(errorInfo);
          } else {
            errors[key] = [errorInfo];
          }
        }
      });
    });
    return rs;
  },
};
