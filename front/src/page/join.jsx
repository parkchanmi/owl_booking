import React, { useState } from "react";
import { Button, Form, Input, Card, Typography, Radio, Space, message, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Join = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [userType, setUserType] = useState('user'); // 'user' or 'admin'

    const onFinish = (values) => {
        console.log('Success:', values);
        message.success('회원가입이 완료되었습니다.');
        navigate('/login', { replace: true });
    };

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
                                <Input placeholder="이메일 주소" />
                            </Form.Item>
                            <Button type="primary">인증요청</Button>
                        </Space.Compact>
                    </Form.Item>

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