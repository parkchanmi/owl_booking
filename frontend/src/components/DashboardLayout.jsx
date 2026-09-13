import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
    AuditOutlined,
    BellOutlined,
    CalendarOutlined,
    IdcardOutlined,
    LogoutOutlined,
    SafetyCertificateOutlined,
    ScheduleOutlined,
    ShopOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, Layout, Menu, Row, Space, theme, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchCenterConfig, fetchCenterConfigs } from '../api/centerConfigApi';
import { fetchCenters } from '../api/centerApi';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const DashboardLayoutContext = createContext(null);

const menuItems = [
    {
        key: 'center-list',
        icon: <ShopOutlined />,
        label: '센터 관리',
        path: '/admin/center/list',
    },
    {
        key: 'instructor-list',
        icon: <TeamOutlined />,
        label: '강사 관리',
        path: '/admin/instructor/list',
    },
    {
        key: 'instructor-attendance',
        icon: <AuditOutlined />,
        label: '강사용 출결',
        path: '/admin/instructor/attendance',
    },
    {
        key: 'class-list',
        icon: <ScheduleOutlined />,
        label: '수업 관리',
        path: '/admin/class',
    },
    {
        key: 'booking',
        icon: <CalendarOutlined />,
        label: '예약 관리',
        children: [
            { key: 'booking-index', label: '예약 설정', path: '/admin/booking' },
            { key: 'booking-schedule', label: '수업 스케줄 관리', path: '/admin/booking/schedule' },
        ],
    },
    {
        key: 'ticket-list',
        icon: <IdcardOutlined />,
        label: '이용권 관리',
        path: '/admin/ticket/list',
    },
    {
        key: 'member-list',
        icon: <UserOutlined />,
        label: '센터 회원 관리',
        path: '/admin/member/list',
    },
    {
        key: 'permission-list',
        icon: <SafetyCertificateOutlined />,
        label: '권한 설정',
        path: '/admin/permission',
    },
];

const parseJson = (value, fallback) => {
    if (!value) return fallback;
    try {
        return { ...fallback, ...JSON.parse(value) };
    } catch {
        return fallback;
    }
};

const loadCenterConfigs = async () => {
    const configs = await fetchCenterConfigs();
    const list = Array.isArray(configs) ? configs : [];
    if (list.some((config) => config.roleMemberMappingsJson || config.roleMenuPermissionsJson)) {
        return list;
    }

    const centers = await fetchCenters();
    return Promise.all(
        (Array.isArray(centers) ? centers : []).map((center) => fetchCenterConfig(center.id))
    );
};

const filterMenuItems = (items, allowedKeys) => {
    if (allowedKeys === null) return items;
    if (!allowedKeys) return [];

    return items
        .map((item) => {
            if (item.children) {
                const children = item.children.filter((child) => allowedKeys.has(child.key));
                return children.length > 0 ? { ...item, children } : null;
            }
            return allowedKeys.has(item.key) ? item : null;
        })
        .filter(Boolean);
};

const getFirstMenuPath = (items) => {
    for (const item of items) {
        if (item.path) return item.path;
        if (item.children?.length > 0) return item.children[0].path;
    }
    return null;
};

const DashboardDefaultContent = () => (
    <Row gutter={16}>
        <Col span={8}>
            <Card title="오늘 예약" bordered={false} style={{ background: '#e6f4ff' }}>
                <Title level={2} style={{ color: '#1890ff', margin: 0 }}>142건</Title>
            </Card>
        </Col>
        <Col span={8}>
            <Card title="진행중인 수업" bordered={false} style={{ background: '#f6ffed' }}>
                <Title level={2} style={{ color: '#52c41a', margin: 0 }}>8개</Title>
            </Card>
        </Col>
        <Col span={8}>
            <Card title="신규 대기자" bordered={false} style={{ background: '#fff2e8' }}>
                <Title level={2} style={{ color: '#fa541c', margin: 0 }}>12명</Title>
            </Card>
        </Col>
    </Row>
);

const keyToPath = {};
const pathToKey = {};
const keyToParentKey = {};

menuItems.forEach((item) => {
    if (item.children) {
        item.children.forEach((child) => {
            keyToParentKey[child.key] = item.key;
            if (child.path) {
                keyToPath[child.key] = child.path;
                pathToKey[child.path] = child.key;
            }
        });
    } else if (item.path) {
        keyToPath[item.key] = item.path;
        pathToKey[item.path] = item.key;
    }
});

const DashboardLayoutFrame = ({ title = 'Dashboard', userLabel = '-', children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [layoutTitle, setLayoutTitle] = useState(title);
    const [loginUser, setLoginUser] = useState(null);
    const [allowedMenuKeys, setAllowedMenuKeys] = useState(undefined);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const selectedKey = pathToKey[location.pathname];
    const selectedKeys = useMemo(() => (selectedKey ? [selectedKey] : []), [selectedKey]);
    const visibleMenuItems = useMemo(() => filterMenuItems(menuItems, allowedMenuKeys), [allowedMenuKeys]);
    const displayUserLabel = loginUser?.name ? `${loginUser.name}님` : userLabel;
    const contextValue = useMemo(() => ({ setTitle: setLayoutTitle }), []);

    const [openKeys, setOpenKeys] = useState(() => {
        const parentKey = selectedKey ? keyToParentKey[selectedKey] : undefined;
        return parentKey ? [parentKey] : [];
    });

    useEffect(() => {
        setLayoutTitle(title);
    }, [title]);

    useEffect(() => {
        const parentKey = selectedKey ? keyToParentKey[selectedKey] : undefined;
        if (parentKey) {
            setOpenKeys((prev) => (prev.includes(parentKey) ? prev : [...prev, parentKey]));
        }
    }, [selectedKey]);

    useEffect(() => {
        if (!allowedMenuKeys || allowedMenuKeys === null || !selectedKey) return;
        if (allowedMenuKeys.has(selectedKey)) return;

        const firstAllowedPath = getFirstMenuPath(visibleMenuItems);
        if (firstAllowedPath && firstAllowedPath !== location.pathname) {
            navigate(firstAllowedPath, { replace: true });
        }
    }, [allowedMenuKeys, location.pathname, navigate, selectedKey, visibleMenuItems]);

    useEffect(() => {
        const loadUserMenuPermissions = async () => {
            try {
                const [memberRes, configs] = await Promise.all([
                    axios.get('/api/member/info'),
                    loadCenterConfigs(),
                ]);
                const member = memberRes.data;
                setLoginUser(member);

                const allowed = new Set();
                let hasConfiguredMapping = false;

                (Array.isArray(configs) ? configs : []).forEach((config) => {
                    const mappings = parseJson(config.roleMemberMappingsJson, {});
                    const permissions = parseJson(config.roleMenuPermissionsJson, {});

                    Object.entries(mappings).forEach(([roleKey, memberIds]) => {
                        const ids = Array.isArray(memberIds) ? memberIds : [];
                        if (ids.length > 0) hasConfiguredMapping = true;
                        if (ids.includes(member.id)) {
                            (permissions[roleKey] ?? []).forEach((menuKey) => allowed.add(menuKey));
                        }
                    });
                });

                setAllowedMenuKeys(hasConfiguredMapping ? allowed : null);
            } catch {
                setAllowedMenuKeys(new Set());
            }
        };

        loadUserMenuPermissions();
        window.addEventListener('permission-settings-saved', loadUserMenuPermissions);

        return () => {
            window.removeEventListener('permission-settings-saved', loadUserMenuPermissions);
        };
    }, []);

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
        <DashboardLayoutContext.Provider value={contextValue}>
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
                        items={visibleMenuItems}
                    />
                </Sider>

                <Layout>
                    <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)', zIndex: 9 }}>
                        <Title level={4} style={{ margin: 0 }}>{layoutTitle}</Title>
                        <Space size="large">
                            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
                            <Space align="center" style={{ cursor: 'pointer' }}>
                                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                                <Text strong>{displayUserLabel}</Text>
                            </Space>
                            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
                                로그아웃
                            </Button>
                        </Space>
                    </Header>

                    <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                        {children ?? <Outlet />}
                    </Content>
                </Layout>
            </Layout>
        </DashboardLayoutContext.Provider>
    );
};

const DashboardLayout = ({ title = 'Dashboard', userLabel = '-', children }) => {
    const parentLayout = useContext(DashboardLayoutContext);

    useEffect(() => {
        if (parentLayout) {
            parentLayout.setTitle(title);
        }
    }, [parentLayout, title]);

    if (parentLayout) {
        return children ?? <DashboardDefaultContent />;
    }

    return <DashboardLayoutFrame title={title} userLabel={userLabel}>{children}</DashboardLayoutFrame>;
};

export default DashboardLayout;
