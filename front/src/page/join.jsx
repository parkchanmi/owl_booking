import React, { useState, useEffect } from "react";
import { Button, Form, Input, Card, Typography, Radio, Space, message, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Join = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [userType, setUserType] = useState('user'); // 'user' or 'admin'
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 0' }}>
            <Card 
                style={{ width: '100%', maxWidth: 500, padding: '10px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ marginBottom: 5 }}>회원가입</Title>
                    <Text type="secondary">OWL BOOKING 서비스 가입을 환영합니다.</Text>
                </div>

                <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                    
                    {/* 회원 유형 선택 */}
                    <Form.Item style={{ textAlign: 'center' }}>
                        <Radio.Group 
                            value={userType} 
                            onChange={(e) => setUserType(e.target.value)} 
                            buttonStyle="solid"
                        >
                            <Radio.Button value="user" style={{ width: 120 }}>일반 회원</Radio.Button>
                            <Radio.Button value="admin" style={{ width: 120 }}>센터 관리자</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    {/* 공통 가입 정보 */}
                    <Form.Item name="loginId" label="아이디" rules={[{ required: true, message: '영문/숫자 8~10자 이내' }]}>
                        <Input placeholder="아이디를 입력해주세요" />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="pwd" label="비밀번호" rules={[{ required: true, message: '영문, 숫자, 특수문자 포함 8~20자' }]}>
                                <Input.Password placeholder="비밀번호 입력" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="pwd_check" label="비밀번호 확인" rules={[{ required: true, message: '비밀번호를 다시 입력해주세요' }]}>
                                <Input.Password placeholder="비밀번호 재입력" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="이메일">
                        <Space.Compact style={{ width: '100%' }}>
                            <Form.Item name="email" noStyle rules={[{ required: true, type: 'email' }]}>
                                <Input placeholder="이메일 주소" disabled={isValid}/>
                            </Form.Item>
                            {!isSent ? (
                              <Button type="primary" onClick={sendMail}>
                                  인증요청
                                </Button>
                            ): <></>}
                        </Space.Compact>
                    </Form.Item>

                    {isSent ? (
                    <Form.Item>
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
                  ):<></>}    
                    <Form.Item name="hp" label="전화번호" rules={[{ required: true }]}>
                        <Input placeholder="- 없이 숫자만 입력" />
                    </Form.Item>

                    {/* 관리자 전용 정보 (userType이 'admin'일 때만 렌더링) */}
                    {userType === 'admin' && (
                        <div style={{ padding: '20px', background: '#fafafa', borderRadius: 8, marginBottom: 24, border: '1px solid #f0f0f0' }}>
                            <Text strong style={{ display: 'block', marginBottom: 16 }}>센터(사업자) 정보</Text>
                            
                            <Form.Item name="businessNo" label="사업자등록번호" rules={[{ required: true }]}>
                                <Input placeholder="사업자등록번호 입력" />
                            </Form.Item>
                            <Form.Item name="ceoName" label="대표자명" rules={[{ required: true }]}>
                                <Input placeholder="대표자명 입력" />
                            </Form.Item>
                            <Form.Item name="companyName" label="상호 (센터명)" rules={[{ required: true }]}>
                                <Input placeholder="상호 입력" />
                            </Form.Item>
                            
                            <Form.Item label="센터 주소">
                                <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
                                    <Form.Item name="zipCode" noStyle>
                                        <Input placeholder="우편번호" readOnly />
                                    </Form.Item>
                                    <Button>우편번호 찾기</Button>
                                </Space.Compact>
                                <Form.Item name="address1" style={{ marginBottom: 8 }}>
                                    <Input placeholder="기본 주소" readOnly />
                                </Form.Item>
                                <Form.Item name="address2" noStyle>
                                    <Input placeholder="상세 주소를 입력해주세요" />
                                </Form.Item>
                            </Form.Item>
                        </div>
                    )}

                    <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" block style={{ height: 45, fontSize: 16 }}>
                            {userType === 'admin' ? '관리자로 가입하기' : '회원으로 가입하기'}
                        </Button>
                    </Form.Item>
                    
                </Form>
            </Card>
        </div>
    );
};

export default Join;