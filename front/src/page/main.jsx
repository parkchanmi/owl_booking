import React, { useState } from 'react';
import { 
    ShopOutlined, 
    TeamOutlined, 
    ScheduleOutlined, 
    CalendarOutlined, 
    IdcardOutlined, 
    UserOutlined, 
    LogoutOutlined,
    BellOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Avatar, Space, Typography, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// 기능 정의서 기반 관리자 메뉴 구조
const menuItems = [
    {
        key: 'center',
        icon: <ShopOutlined />,
        label: '센터 관리',
        children: [
            { key: 'center-list', label: '센터 리스트' }
        ],
    },
    {
        key: 'instructor',
        icon: <TeamOutlined />,
        label: '강사 관리',
        children: [
            { key: 'instructor-list', label: '강사 리스트' }
        ],
    },
    {
        key: 'class',
        icon: <ScheduleOutlined />,
        label: '수업 관리',
        children: [
            { key: 'class-list', label: '수업 리스트' },
            { key: 'class-schedule', label: '수업 스케줄 관리' }
        ],
    },
    {
        key: 'booking',
        icon: <CalendarOutlined />,
        label: '예약 관리',
        children: [
            { key: 'booking-wait', label: '대기 예약 관리' },
            { key: 'booking-cancel', label: '예약 취소 관리' },
            { key: 'booking-setting', label: '수업 예약 설정' }
        ],
    },
    {
        key: 'ticket',
        icon: <IdcardOutlined />,
        label: '이용권 관리',
        children: [
            { key: 'ticket-list', label: '이용권 리스트' }
        ],
    },
    {
        key: 'member',
        icon: <UserOutlined />,
        label: '센터 회원 관리',
        children: [
            { key: 'member-list', label: '센터 회원 리스트' }
        ],
    },
];

const Main = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        // 로그아웃 로직 (API 호출 등)
        navigate('/login', { replace: true });
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* 사이드바 */}
            <Sider 
                collapsible 
                collapsed={collapsed} 
                onCollapse={(value) => setCollapsed(value)}
                theme="light"
                width={240}
                style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)', zIndex: 10 }}
            >
                <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18, color: '#1890ff' }}>
                    {collapsed ? 'OWL' : 'OWL BOOKING'}
                </div>
                <Menu mode="inline" defaultSelectedKeys={['center-list']} defaultOpenKeys={['center']} items={menuItems} />
            </Sider>

            <Layout>
                {/* 상단 헤더 */}
                <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)', zIndex: 9 }}>
                    <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
                    <Space size="large">
                        <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
                        <Space align="center" style={{ cursor: 'pointer' }}>
                            <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                            <Text strong>부엉이 관리자님</Text>
                        </Space>
                        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                            로그아웃
                        </Button>
                    </Space>
                </Header>

                {/* 메인 컨텐츠 영역 */}
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                    {/* 하위 라우트 컴포넌트들이 렌더링될 자리입니다. 임시로 대시보드 위젯을 넣었습니다. */}
                    <Row gutter={16}>
                        <Col span={8}>
                            <Card title="오늘의 예약" bordered={false} style={{ background: '#e6f4ff' }}>
                                <Title level={2} style={{ color: '#1890ff', margin: 0 }}>142 건</Title>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card title="진행중인 수업" bordered={false} style={{ background: '#f6ffed' }}>
                                <Title level={2} style={{ color: '#52c41a', margin: 0 }}>8 개</Title>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card title="신규 대기자" bordered={false} style={{ background: '#fff2e8' }}>
                                <Title level={2} style={{ color: '#fa541c', margin: 0 }}>12 명</Title>
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Main;