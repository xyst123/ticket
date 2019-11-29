import React, { useState,useEffect } from 'react';
import {  withRouter } from 'react-router-dom';
import { WingBlank,InputItem, Button } from 'antd-mobile';
import { getCookie,login } from '../service/passport'
import '../style/Login.less';
import '../../server/static/js/cookie.js';

function Login({history}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCookie()
  },[]);

  const handleLogin = async () => {
    setLoading(true);
    const loginRes = await login(username, password);
    if(loginRes){
      history.push('/')
    }
    setLoading(false);
  };

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

        <Button className="login-submit" loading={loading} type="primary" onClick={handleLogin}>登录</Button>
      </WingBlank>
    </div>
  );
}

export default withRouter(Login)