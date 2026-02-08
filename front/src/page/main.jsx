import React, { useEffect, useState } from "react";
import { LaptopOutlined, NotificationOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'; // Logout 아이콘 추가
import { Breadcrumb, Layout, Menu, theme, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
const { Header, Content, Sider } = Layout;
const items1 = ['1', '2', '3'].map(key => ({
  key,
  label: `nav ${key}`,
}));
const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
  const key = String(index + 1);
  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,
    children: Array.from({ length: 4 }).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});

const Main = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/member/info');
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
          console.log("로그인 유저 정보:", data);
        } else {
          // 세션이 없거나 만료된 경우 로그인 페이지로 이동
          console.error("인증 실패");
        }
      } catch (error) {
        console.error("네트워크 에러", error);
      }
    };

    fetchUserInfo();
  }, []);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      // 1. 서버에 로그아웃 요청 (Spring Security 세션 무효화)
      const response = await fetch('/api/member/logout', { method: 'POST' });

      if (response.ok) {
        message.success('로그아웃 되었습니다.');
        // 2. 성공 시 로그인 페이지로 이동
        navigate('/login', { replace: true });
      } else {
        message.error('로그아웃 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error("Logout Error:", error);
      message.error('서버와 통신할 수 없습니다.');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items1}
          style={{ flex: 1, minWidth: 0 }}
        />
        {/* 로그아웃 버튼 추가 */}
        <Button 
          type="text" 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          style={{ color: 'rgba(255, 255, 255, 0.65)', marginLeft: 16 }}
        >
          Logout
        </Button>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            style={{ height: '100%', borderInlineEnd: 0 }}
            items={items2}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb
            items={[{ title: 'Home' }, { title: 'List' }, { title: 'App' }]}
            style={{ margin: '16px 0' }}
          />
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            Content
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Main;