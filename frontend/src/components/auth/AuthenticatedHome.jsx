import React, { useState } from 'react';
import { Button, message } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './AuthenticatedHome.css';

export default function AuthenticatedHome({ member, onLogout }) {
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);
    const logout = async () => {
        setLoggingOut(true);
        try {
            const response = await fetch('/api/member/logout', { method: 'POST', credentials: 'include' });
            if (!response.ok) throw new Error('로그아웃하지 못했습니다. 다시 시도해 주세요.');
            onLogout();
            message.success('로그아웃되었습니다.');
        } catch (error) { message.error(error.message); }
        finally { setLoggingOut(false); }
    };
    return <section className="auth-card authenticated-home-card">
                <div className="authenticated-home-avatar"><UserOutlined /></div>
                <span className="authenticated-home-badge">{member.hasAdminCenter ? '센터 관리자' : '일반 회원'}</span>
                <h2>{member.name || member.loginId}님, 안녕하세요</h2>
                <p className="authenticated-home-description">로그인된 계정 정보입니다.</p>
                <dl>
                    <div><dt>이름</dt><dd>{member.name || '—'}</dd></div>
                    <div><dt>아이디</dt><dd>{member.loginId}</dd></div>
                    <div><dt>이메일</dt><dd>{member.email || '등록 정보 없음'}</dd></div>
                    <div><dt>휴대전화</dt><dd>{member.hp || '등록 정보 없음'}</dd></div>
                </dl>
                <div className="authenticated-home-actions">
                    <Button type="primary" block className="authenticated-home-primary" onClick={() => navigate(member.hasAdminCenter ? '/admin' : '/reservation')}>{member.hasAdminCenter ? '관리자 페이지로 이동' : '수업 예약하기'}</Button>
                    {!member.hasAdminCenter && <Button block className="authenticated-home-secondary" onClick={() => navigate('/mypage')}>마이페이지</Button>}
                    <Button type="text" block icon={<LogoutOutlined />} loading={loggingOut} onClick={logout} className="authenticated-home-logout">로그아웃</Button>
                </div>
            </section>;
}
