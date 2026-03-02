import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const join = () => {
    navigate('/join');
  }

  const login = () => {
    navigate('/login');
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Home Page</h1>
      <Button type="primary" onClick={join}>회원가입</Button>
      <Button type="primary" onClick={login}>로그인</Button>
    </div>
  );
}

export default Home;