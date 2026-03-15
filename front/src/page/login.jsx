import React from "react";
import { Button, Checkbox, Form, Input, Card, Typography, Flex } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;

const Login = () => {
    const navigate = useNavigate();

    const onFinish = (values) => {
        console.log('Success:', values);
        navigate('/main', { replace: true });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card 
                style={{ width: '100%', maxWidth: 400, padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 12 }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Title level={3} style={{ color: '#1890ff', marginBottom: 0 }}>OWL BOOKING</Title>
                    <Text type="secondary">예약 관리 시스템에 오신 것을 환영합니다</Text>
                </div>

                <Form name="login" initialValues={{ remember: true }} onFinish={onFinish} size="large">
                    <Form.Item name="loginId" rules={[{ required: true, message: '아이디를 입력해주세요.' }]}>
                        <Input prefix={<UserOutlined />} placeholder="아이디" />
                    </Form.Item>

                    <Form.Item name="pwd" rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" />
                    </Form.Item>

                    <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>로그인 유지</Checkbox>
                        </Form.Item>
                        <Link onClick={() => console.log('비밀번호 찾기 이동')}>비밀번호 찾기</Link>
                    </Flex>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ height: 40, fontSize: 16 }}>
                            로그인
                        </Button>
                    </Form.Item>
                    
                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary">계정이 없으신가요? </Text>
                        <Link onClick={() => navigate('/join')}>회원가입</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;