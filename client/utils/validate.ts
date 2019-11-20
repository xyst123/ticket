const getStrLen = (str) => {
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

export default {
  isType(data, options) {
    const { type } = options;
    const realType = Object.prototype.toString.call(data);
    return { pass: realType.toLowerCase() === (`[object ${type}]`).toLowerCase() };
  },
  compare(data, options) {
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
  isInteger(data) {
    return { pass: Number(data) === parseInt(data, 10) };
  },
  isChinese(data) {
    const rs = /^[\u4E00-\u9FA5]+$/.test(data);
    return { pass: rs };
  },
  stringLength(data, options) {
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
  isPhone(data) {
    const phone = String(data);
    const rs = /^((\+?86)|(\+86))?1[0-9]{10}$/.test(phone) || /^\d{3,4}-?\d{7,8}$/.test(phone);
    return { pass: rs };
  },
  isNotEmpty(data: any) {
    const type = typeof data;
    const testMap = {
      object(data) {
        if (!data) {
          return false;
        } if (Array.isArray(data)) {
          return data.length > 0;
        }
        return Object.keys(data).length > 0;
      },
      string(data) {
        const realData = String(data).trim();
        return realData.length > 0;
      },
      number(data) {
        return Boolean(data);
      },
    };
    return { pass: Boolean(testMap[type] ? testMap[type](data) : false) };
  },
  isEmail(data) {
    const email = String(data);
    const rs = /^[^@]+@[^@]+$/.test(email);
    return { pass: rs };
  },
  isNotNaN(data) {
    return { pass: !Number.isNaN(data) };
  },
  isExist(data) {
    return { pass: Boolean(data) };
  },
  userDefine(data, options) {
    const { fn } = options;
    return { pass: fn && typeof fn === 'function' ? fn(data) : false };
  },
  check(validates = []) {
    const rs = {
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
        if (!fn || typeof fn !== 'function') {
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
