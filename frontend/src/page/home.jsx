import React from 'react';
import { Button, Typography, Space, Card } from 'antd';
import { LoginOutlined, UserAddOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            // 배경에 아주 은은한 사선 그라데이션을 주어 밋밋함을 없앴습니다.
            backgroundImage: 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)' 
        }}>
            <Card
                style={{
                    textAlign: 'center',
                    padding: '60px 40px',
                    borderRadius: 16,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    maxWidth: 600,
                    width: '90%'
                }}
                bordered={false}
            >
                {/* 상단 포인트 아이콘 */}
                <RocketOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 20 }} />
                
                <Title level={1} style={{ color: '#1f2937', marginBottom: 16 }}>
                    OWL BOOKING
                </Title>
                
                <Text type="secondary" style={{ fontSize: 18, display: 'block', marginBottom: 40 }}>
                    스마트한 센터 관리 및 예약 시스템
                    <br />
                    지금 바로 시작해보세요.
                </Text>

                <Space size="large">
                    {/* 메인 액션인 '로그인'에 Primary 색상을 주어 시선을 유도합니다. */}
                    <Button
                        type="primary"
                        size="large"
                        icon={<LoginOutlined />}
                        onClick={() => navigate('/login')}
                        style={{ width: 140, height: 48, fontSize: 16, borderRadius: 8 }}
                    >
                        로그인
                    </Button>
                    
                    <Button
                        size="large"
                        icon={<UserAddOutlined />}
                        onClick={() => navigate('/join')}
                        style={{ width: 140, height: 48, fontSize: 16, borderRadius: 8 }}
                    >
                        회원가입
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default Home;