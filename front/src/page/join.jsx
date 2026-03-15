import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

import { Button, Form, Input, message, Flex } from 'antd';

const Join = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [code, setCode] = useState(null);
  const [isSent, setIsSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [isValid, setIsValid] = useState(false);
  const [value, setValue] = useState('horizontal');
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

  const sendMail = async () => {
    const email = form.getFieldValue(['user', 'email']);
    if (!email) {
      message.error("이메일을 입력해주세요.");
      return;
    }
    const response = await fetch('/api/mail/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({         
          email : email
        }),
        credentials: 'include'
    });
    setIsSent(true);
    setTimeLeft(180);
  }

  const verifyCode = async () => {
    const userCode = form.getFieldValue(['user', 'email_check']);
    const response = await fetch('/api/mail/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userCode : userCode }),
      credentials: 'include' // 세션 쿠키 유지를 위해 필수!
    });
    
    const result = await response.text();
    if (response.ok) {
      message.success(result);
      setIsValid(true);
      form.validateFields(['user', 'email_check']);
    }else{
      message.error(result);
      setIsValid(false);
      form.validateFields(['user', 'email_check']);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer); // 언마운트 시 정리
    }
  }, [isSent, timeLeft]);
  useEffect(() => {
    if (isValid) {
      // 인증 성공 시 에러 메시지를 지우고 'success' 상태로 만듦
      form.validateFields(['user', 'email_check']);
    }
  }, [isValid, form]);
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
        form={form}
        name="nest-messages"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
        validateMessages={validateMessages}
      >
        <Form.Item name={['user', 'loginId']} label="아이디" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['user', 'pwd']} label="비밀번호" rules={[{ required: true }]}>
          <Input.Password/>
        </Form.Item>
        <Form.Item name={['user', 'pwd_check']} label="비밀번호 확인" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name={['user', 'name']} label="회원명" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Flex vertical={value === 'vertical'}>
          <Form.Item name={['user', 'email']} label="이메일" rules={[{ type: 'email', required: true }]}>
            <Input disabled={isValid}/>
          </Form.Item>
          {!isSent ? (
            <Form.Item label={null}>
              <Button type="primary" onClick={sendMail}>
                인증요청
              </Button>
            </Form.Item>
          ): <></>}
        </Flex>
        {isSent ? (
          <Flex vertical={value === 'vertical'}>
            <Form.Item name={['user', 'email_check']} label="인증코드" rules={[
                { required: true, message: '인증코드를 입력하세요.' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve(); // 값이 없으면 required에서 처리
                    if (isValid) {
                      return Promise.resolve(); // 인증 성공 상태면 통과
                    }
                    return Promise.reject(new Error('인증확인 버튼을 눌러주세요.'));
                  },
                },
              ]}
              // validateStatus를 직접 제어하는 것이 더 확실합니다.
              validateStatus={
                timeLeft <= 0 ? "error" : (isValid ? "success" : "")
              }
            >
              <Input 
                placeholder="인증코드 입력"
                suffix={<span style={{ color: timeLeft < 30 ? 'red' : '#999' }}>{formatTime(timeLeft)}</span>}
                disabled={timeLeft <= 0} // 시간 만료 시 입력 차단
              />
            </Form.Item>
            <Form.Item label={null}>
              <Button 
                type="primary" 
                onClick={verifyCode} 
                disabled={timeLeft <= 0} // 시간 만료 시 버튼 비활성화
              >
                인증 확인
              </Button>
              {timeLeft <= 0 && (
                <Button type="link" onClick={sendMail} style={{ marginLeft: 8 }}>
                  재전송
                </Button>
              )}
            </Form.Item>
          </Flex>
        ):<></>}
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