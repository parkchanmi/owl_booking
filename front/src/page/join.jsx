import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

import { Button, Form, Input, message } from 'antd';

const Join = () => {
  const navigate = useNavigate();
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const validateMessages = {
    required: '필수 입력값 입니다.',
    types: {
      email: '이메일 형식이 아닙니다.',
      number: '숫자로 입력해주세요.',
    },
    number: {
      range: '${min} 과 ${max} 사이 값으로 입력해주세요.',
    },
  };
  const onFinish = values => { //validation 통과되면 실행됨
    console.log('Success:', values);
    
    // 실제 백엔드로 보낼 데이터 추출
    const userData = values.user;
    
    // axios나 fetch를 이용해 Spring Boot로 전송
    insertMember(userData);
  };

  const insertMember = async (userData) => {
    try {
      const response = await fetch('/api/member/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        message.success('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        navigate('/login', { replace: true }); // 뒤로가기 방지
      }else{
        message.error('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error("네트워크 에러:", error);
      message.error('서버와 통신 중 에러가 발생했습니다.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', // 가로 중앙
      alignItems: 'center',     // 세로 중앙
      minHeight: '100vh',       // 화면 전체 높이 사용
      backgroundColor: '#f0f2f5' // (선택사항) 배경색을 살짝 주면 폼이 더 돋보입니다.
    }}>
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
        validateMessages={validateMessages}
      >
        <Form.Item name={['user', 'loginId']} label="아이디" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['user', 'pwd']} label="비밀번호" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['user', 'pwd_check']} label="비밀번호 확인" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['user', 'name']} label="회원명" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['user', 'email']} label="이메일" rules={[{ type: 'email', required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['user', 'email_check']} label="이메일 인증" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['user', 'hp']} label="전화번호" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            회원가입
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Join;