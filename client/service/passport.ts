import { request, get, handleRes } from "../utils";
import validate from "../utils/validate";

export async function login(username: string, password: string) {
  const message = {
    '-1': '登录失败',
    '1':'账号与密码不匹配'
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
          await request({
            url: '/otn/api/cookie/bigIpServerOtn'
          });
          await request({
            url: '/otn/api/cookie/route'
          });
          const authCodeRes = await request({
            url: '/passport/api/authCode',
            data: {
              callback: '',
              rand: 'sjrand',
              login_site: 'E',
              _: Date.now(),
              module:'login'
            }
          })
          let authCode ;
          authCodeRes.replace(/"image":"(\S+)","result_message"/,(...args)=>{
            authCode=args[1]
          });
          const bytes = window.atob(authCode);
          const arrayBuffer = new ArrayBuffer(bytes.length);
          const arr = new Uint8Array(arrayBuffer);
          for (let i = 0; i < bytes.length; i++) {
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
          if(handleRes(loginRes,message)){
            await request({
              url: '/otn/api/cookie/jSessionId'
            });
            const getTkRes= await request({
              method: 'POST',
              url: '/passport/api/cookie/getTk',
              type: 'form',
              data: {
                appid: 'otn'
              }
            });
            if(handleRes(getTkRes,message)){
              const tk=getTkRes.newapptk;
              const setTkRes= await request({
                method: 'POST',
                url: '/passport/api/cookie/setTk',
                type: 'form',
                data: {
                  tk
                }
              }); 
              return handleRes(setTkRes,message)
            }else {
              return false
            }  
          }else {
            return false
          }  
      } catch (error) {
        return handleRes(error,message)
      }
  } else {
    return handleRes(false, {
      '-1': get(passRes, "firstError.backData.message", message['-1'])
    })
  }
}