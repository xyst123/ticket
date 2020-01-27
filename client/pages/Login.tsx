import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { WingBlank, InputItem, Button, Toast } from 'antd-mobile';
import { getCookie, login } from '@/service/passport';
import '@/style/Login.less';

interface IProp {
  history: any,
  location:any
}

const Login:React.FC<IProp>=({ history,location})=> {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCookie()
  }, []);

  useEffect(() => {
    (async()=>{
      if(loading){
        const loginRes = await login(username, password);
        setLoading(false);
        if (loginRes.status) {
          const {redirect}=location.query || {};
          if(redirect){
            history.push(redirect);
          }else {
            history.push('/main');
          }
        } else {
          Toast.fail(loginRes.message, 3)
        }
      }
    })()
  }, [loading]);

  return (
    <div className="login-wrapper">
      <WingBlank className="login">
        <h3>欢迎登录 ticket</h3>
        <InputItem
          value={username}
          placeholder="请输入12306账号"
          clear
          onChange={(string) => { setUsername(string); }}
        />
        <InputItem
          value={password}
          type="password"
          placeholder="请输入12306密码"
          clear
          onChange={(string) => { setPassword(string); }}
        />

        <Button className="login-submit" loading={loading} type="primary" onClick={setLoading.bind(null,true)}>登录</Button>
      </WingBlank>
    </div>
  );
}

export default withRouter(Login)