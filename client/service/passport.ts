import { request, get, handleRes, getStorage, setStorage } from "@/utils";
import validate from "@/utils/validate";

export function getCookie() {
  request({
    url: '/otn/cookie/bigIpServerOtn'
  });
  request({
    url: '/otn/cookie/route'
  });
}

export const login = async (username: string, password: string): Promise<Common.IRes> => {
  const message = {
    '-1': '登录失败',
    '1': '账号与密码不匹配'
  }
  const passRes = validate.check([
    {
      value: username,
      rules: [{
        rule: "isNotEmpty",
        backData: {
          message: "请填写12306账号"
        }
      }],
    },
    {
      value: password,
      rules: [{
        rule: "isNotEmpty",
        backData: {
          message: "请填写12306密码"
        }
      }],
    },
  ])
  if (passRes.pass) {
    const points = {
      '1': '37,46',
      '2': '110,46',
      '3': '181,46',
      '4': '253,46',
      '5': '37,116',
      '6': '110,116',
      '7': '181,116',
      '8': '253,116',
    }
    try {
      const authCodeRes = await request({
        url: '/passport/api/authCode',
        data: {
          callback: '',
          rand: 'sjrand',
          login_site: 'E',
          _: Date.now(),
          module: 'login',
        }
      })
      let authCode: string = "";
      authCodeRes.replace(/"image":"(\S+)","result_message"/, (...args: any[]) => {
        [, authCode] = args
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
      const positionRes = await request({
        method: 'POST',
        url: '/passport/api/position',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const chosenIndexes = positionRes.match(/<b>([1-8\s]+)<\/b>/i)[1];
      const authCodeAnswer = chosenIndexes.split(" ").map(chosenIndex => points[chosenIndex]).join(',');
      const checkAuthCodeAnswerRes = await request({
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
          username, password, appid: 'otn', answer: authCodeAnswer
        }
      })
      const checkLoginRes = handleRes(loginRes, message)
      if (!checkLoginRes.status) {
        return checkLoginRes
      }

      await request({
        url: '/otn/cookie/jSessionId'
      });

      const getTkRes = await request({
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
        users.forEach((user, index: number) => {
          if (user.username === username) {
            existIndex = index
          }
        })
        if (existIndex === -1) {
          users.push({
            username,
            password
          })
        } else {
          users.splice(existIndex, 1, {
            username,
            password
          })
        }
        setStorage('users', users)
      }
      return checkSetTkRes
    } catch (error) {
      return handleRes(error, message)
    }
  } else {
    return handleRes(false, {
      ...message,
      '-1': get(passRes, "firstError.backData.message", message['-1'])
    })
  }
}

let loginCount = 0;
export const autoLogin = async () => {
  const users: User.IUser[] = getStorage('users') || [];
  const [user] = users;
  if (!user) return false;

  const handleLogin = async (): Promise<boolean> => {
    const loginRes = await login(user.username, user.password);
    if (loginRes.status) {
      loginCount = 0
      return true
    }
    if (loginCount > 1) {
      loginCount = 0
      return false
    }
    loginCount += 1;
    return handleLogin()
  }

  return handleLogin()
}