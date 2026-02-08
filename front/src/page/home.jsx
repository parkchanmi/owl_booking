import React from 'react';
import { Button } from 'antd';

const join = () => {
  
}

const login = () => {

}

function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Home Page</h1>
      <Button type="primary" onClick={join}>회원가입</Button>
      <Button type="primary" onClick={login}>로그인</Button>
    </div>
  );
}

export default Home;