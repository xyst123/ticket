import { request, get, handleRes, getStorage, setStorage, getType } from "@/utils";
import validate from "@/utils/validate";
import pointsRaw from '@/configs/points';

export function getCookie() {
  request({
    url: '/otn/cookie/bigIpServerOtn'
  });
  request({
    url: '/otn/cookie/route'
  });
}

export const getAuthCode = async (): Promise<Common.IRes> => {
  const message = {
    '-1': '登录失败',
    '1': '账号与密码不匹配',
    '50001': '自动登录失败',
  }

  try {
    const authCodeRes = await request<string>({
      url: '/passport/api/authCode',
      data: {
        callback: '',
        rand: 'sjrand',
        login_site: 'E',
        _: Date.now(),
        module: 'login',
      }
    })
    let authCode: string = '';
    authCodeRes.replace(/"image":"(\S+)","result_message"/, (...args) => {
      [, authCode] = args;
      return authCodeRes
    });
    const bytes = window.atob(authCode);
    const arrayBuffer = new ArrayBuffer(bytes.length);
    const arr = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.length; i += 1) {
      arr[i] = bytes.charCodeAt(i);
    }
    const blob = new Blob([arr], { type: "image/jpg" });
    const formData = new FormData();
    formData.append("pic_xxfile", blob, Date.now() + ".jpg");
    const positionRes = await request<string>({
      method: 'POST',
      url: '/passport/api/position',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (getType(positionRes) === 'string') {
      const matches = positionRes.match(/<b>([1-8\s]+)<\/b>/i) || [];
      const chosenIndexes = matches[1] || '';
      const authCodeAnswer = chosenIndexes.split(' ').map(chosenIndex => pointsRaw[String(chosenIndex)]).join(',');
      return {
        ...handleRes({
          result_code: '0'
        }, message),
        data: authCodeAnswer
      }
    } else {
      return {
        ...handleRes({
          result_code: '50001'
        }, message),
        data: authCode
      }
    }
  } catch (error) {
    return handleRes(error, message)
  }
}


export const loginWithAuthCodeAnswer = async (user: User.IUser, authCodeAnswer: string): Promise<Common.IRes> => {
  const message = {
    '-1': '登录失败',
    '1': '账号与密码不匹配',
    '40000': '请填写必要的信息',
  }

  try {
    const passRes = validate.check([
      {
        value: user.username,
        rules: [{
          rule: "isNotEmpty",
          backData: {
            message: "请填写12306账号"
          }
        }],
      },
      {
        value: user.password,
        rules: [{
          rule: "isNotEmpty",
          backData: {
            message: "请填写12306密码"
          }
        }],
      },
    ])

    if (!passRes.pass) {
      message['40000'] = get(passRes, "firstError.backData.message", message['40000'])
      return handleRes({
        result_code: '40000'
      }, message)
    }

    const checkAuthCodeAnswerRes = await request<string>({
      url: '/passport/api/checkAuthCodeAnswer',
      data: {
        callback: '',
        answer: authCodeAnswer,
        rand: 'sjrand',
        login_site: 'E',
        _: Date.now()
      }
    })
    if (!checkAuthCodeAnswerRes.includes('"result_code":"4"')) {
      throw new Error('验证码校验失败')
    }

    const loginRes = await request({
      method: 'POST',
      url: '/passport/api/login',
      type: 'form',
      data: {
        ...user,
        appid: 'otn',
        answer: authCodeAnswer
      }
    })
    const checkLoginRes = handleRes(loginRes, message)
    if (!checkLoginRes.status) {
      return checkLoginRes
    }

    await request({
      url: '/otn/cookie/jSessionId'
    });

    const getTkRes = await request<{ newapptk: string }>({
      method: 'POST',
      url: '/passport/cookie/getTk',
      type: 'form',
      data: {
        appid: 'otn'
      }
    });
    const checkGetTkRes = handleRes(getTkRes, {
      ...message,
      '-1': '获取tk失败'
    });
    if (!checkGetTkRes.status) {
      return checkLoginRes
    }

    const tk = getTkRes.newapptk;
    const setTkRes = await request({
      method: 'POST',
      url: '/passport/cookie/setTk',
      type: 'form',
      data: {
        tk
      }
    });
    const checkSetTkRes = handleRes(setTkRes, message)
    if (checkSetTkRes.status) {
      const users: User.IUser[] = getStorage('users') || [];
      let existIndex = -1;
      users.forEach((userItem, index: number) => {
        if (userItem.username === user.username) {
          existIndex = index
        }
      })
      if (existIndex === -1) {
        users.push(user)
      } else {
        users.splice(existIndex, 1, user)
      }
      setStorage('users', users)
    }
    return checkSetTkRes
  } catch (error) {
    return handleRes(error, message)
  }
}

let loginCount = 0;
export const autoLogin = () => {
  const users: User.IUser[] = getStorage('users') || [];
  const [user] = users;
  if (!user) return false;

  const handleLogin = async (count: number = 3): Promise<boolean> => {
    const getAuthCodeRes = await getAuthCode();
    const loginRes = getAuthCodeRes.status ? await loginWithAuthCodeAnswer(user, getAuthCodeRes.data) : getAuthCodeRes
    if (loginRes.status) {
      loginCount = 0
      return true
    }
    if (loginCount > count - 2 || loginRes.code === 40000) {
      loginCount = 0
      return false
    }
    loginCount += 1;
    return handleLogin()
  }

  return handleLogin()
}