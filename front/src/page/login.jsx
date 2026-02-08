import React, { useEffect, useState } from "react";
import { Button, Checkbox, Form, Input, message } from 'antd';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const onFinish = values => {
    console.log('Success:', values);
    login(values);
  };
  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const login = async (userData) => {
    try {
      const response = await fetch('/api/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        message.success('로그인 성공. 메인 페이지로 이동합니다.');
        navigate('/main', { replace: true });
      }else{
        message.error('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error("네트워크 에러:", error);
      message.error('서버와 통신 중 에러가 발생했습니다.');
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', // 가로 중앙
      alignItems: 'center',     // 세로 중앙
      minHeight: '100vh',       // 화면 전체 높이 사용
      backgroundColor: '#f0f2f5' // (선택사항) 배경색을 살짝 주면 폼이 더 돋보입니다.
    }}>
     <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="아이디"
          name="loginId"
          rules={[{ required: true, message: '아이디를 입력해주세요.' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="비밀번호"
          name="pwd"
          rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked" label={null}>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;