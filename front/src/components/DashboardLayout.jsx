import React, { useEffect, useMemo, useState } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const menuItems = [
    {
        key: 'center',
        icon: <ShopOutlined />,
        label: '센터 관리',
        children: [
            { key: 'center-list', label: '센터 리스트', path: '/admin/center/list' }
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
            { key: 'class-list', label: '수업 리스트', path: '/admin/class' },
        ],
    },
    {
        key: 'booking',
        icon: <CalendarOutlined />,
        label: '예약 관리',
        children: [
            { key: 'booking-wait', label: '대기 예약 관리', path: '/admin/booking/wait' },
            { key: 'booking-cancel', label: '예약 취소 관리', path: '/admin/booking/cancel' },
            { key: 'booking-setting', label: '수업 예약 설정', path: '/admin/booking/setting' },
            { key: 'booking-schedule', label: '수업 스케줄 관리', path: '/admin/booking/schedule' },
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

// 메뉴 key <-> path 매핑 (라우팅 / 사이드바 하이라이트에 공용으로 사용)
const keyToPath = {};
const pathToKey = {};
const keyToParentKey = {};
menuItems.forEach((group) => {
    (group.children || []).forEach((item) => {
        keyToParentKey[item.key] = group.key;
        if (item.path) {
            keyToPath[item.key] = item.path;
            pathToKey[item.path] = item.key;
        }
    });
});

const DashboardLayout = ({ title = 'Dashboard', userLabel = '부엉이 관리자님', children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const selectedKey = pathToKey[location.pathname];
    const selectedKeys = useMemo(() => (selectedKey ? [selectedKey] : []), [selectedKey]);

    const [openKeys, setOpenKeys] = useState(() => (selectedKey ? [keyToParentKey[selectedKey]] : []));

    useEffect(() => {
        if (selectedKey) {
            const parentKey = keyToParentKey[selectedKey];
            setOpenKeys((prev) => (prev.includes(parentKey) ? prev : [...prev, parentKey]));
        }
    }, [selectedKey]);

    const handleMenuClick = ({ key }) => {
        const path = keyToPath[key];
        if (path) {
            navigate(path);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/member/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } finally {
            navigate('/login', { replace: true });
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
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
                <Menu
                    mode="inline"
                    selectedKeys={selectedKeys}
                    openKeys={openKeys}
                    onOpenChange={setOpenKeys}
                    onClick={handleMenuClick}
                    items={menuItems}
                />
            </Sider>

            <Layout>
                <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)', zIndex: 9 }}>
                    <Title level={4} style={{ margin: 0 }}>{title}</Title>
                    <Space size="large">
                        <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
                        <Space align="center" style={{ cursor: 'pointer' }}>
                            <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                            <Text strong>{userLabel}</Text>
                        </Space>
                        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                            로그아웃
                        </Button>
                    </Space>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                    {children ?? (
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
                    )}
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;
