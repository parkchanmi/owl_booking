import React, { useEffect, useMemo, useState } from 'react';
import {
    CalendarOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Avatar, Space, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const menuItems = [
    {
        key: 'booking',
        icon: <CalendarOutlined />,
        label: '예약 관리',
        children: [
            { key: 'booking-center', label: '예약할 센터 선택', path: '/user/booking/center' },
        ],
    },
    {
        key: 'mypage',
        icon: <UserOutlined />,
        label: '마이페이지',
        children: [
            { key: 'mypage-history', label: '예약 내역', path: '/user/mypage/history' },
            { key: 'mypage-ticket', label: '이용권 내역', path: '/user/mypage/ticket' },
        ],
    },
];

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

const UserLayout = ({ title = 'Dashboard', userLabel = '회원님', children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const selectedKey = pathToKey[location.pathname];
    const selectedKeys = useMemo(() => (selectedKey ? [selectedKey] : []), [selectedKey]);

    const [openKeys, setOpenKeys] = useState(() =>
        selectedKey ? [keyToParentKey[selectedKey]] : []
    );

    useEffect(() => {
        if (selectedKey) {
            const parentKey = keyToParentKey[selectedKey];
            setOpenKeys((prev) => (prev.includes(parentKey) ? prev : [...prev, parentKey]));
        }
    }, [selectedKey]);

    const handleMenuClick = ({ key }) => {
        const path = keyToPath[key];
        if (path) navigate(path);
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
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: '#1890ff',
                    }}
                >
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
                <Header
                    style={{
                        padding: '0 24px',
                        background: colorBgContainer,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
                        zIndex: 9,
                    }}
                >
                    <Title level={4} style={{ margin: 0 }}>{title}</Title>
                    <Space size="large">
                        <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
                        <Space align="center" style={{ cursor: 'pointer' }}>
                            <Avatar style={{ backgroundColor: '#52c41a' }} icon={<UserOutlined />} />
                            <Text strong>{userLabel}</Text>
                        </Space>
                        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                            로그아웃
                        </Button>
                    </Space>
                </Header>

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default UserLayout;
