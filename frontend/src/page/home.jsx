import React, { useState } from 'react';
import { Button, Checkbox, Divider, Form, Input, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './auth.css';

const { Title, Text, Link } = Typography;

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

const Home = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('member'); // 'member' | 'admin'

    const handleKakaoLogin = () => {
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
        window.location.href = kakaoAuthUrl;
    };

    const handleNaverLogin = () => {
        message.info('네이버 간편 로그인은 서비스 준비 중입니다.');
    };

    const onFinish = async (values) => {
        setLoading(true);

        try {
            const response = await fetch('/api/member/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loginId: values.loginId,
                    pwd: values.pwd,
                }),
                credentials: 'include',
            });

            if (response.ok) {
                const loginResult = await response.json();
                const nextPath = loginResult.typeCode === 1 ? '/admin' : '/user/booking';

                message.success('로그인되었습니다.');
                navigate(nextPath, { replace: true });
                return;
            }

            message.error('아이디 또는 비밀번호가 일치하지 않습니다.');
        } catch (error) {
            console.error('Login error:', error);
            message.error('서버와 통신 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Ambient Background Glows */}
            <div className="ambient-glow-1" />
            <div className="ambient-glow-2" />

            {/* Header */}
            <header className="auth-header">
                <div className="auth-header__inner">
                    <div className="brand-badge" onClick={() => navigate('/')}>
                        <div className="brand-badge__icon">
                            <svg fill="none" height="22" viewBox="0 0 24 24" width="22" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" fill="white" r="2.2" stroke="white" strokeWidth="1.8" />
                                <circle cx="16" cy="8" fill="white" r="2.2" stroke="white" strokeWidth="1.8" />
                                <path d="M5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V6" stroke="white" strokeLinecap="round" strokeWidth="1.8" />
                                <path d="M5 13.5H19" stroke="white" strokeLinecap="round" strokeWidth="1.8" />
                                <path d="M10 11L12 13.5L14 11H10Z" fill="white" stroke="white" strokeWidth="0.5" />
                            </svg>
                        </div>
                        <span className="brand-badge__text">OwlFit</span>
                    </div>

                    <a
                        className="support-link"
                        href="#support"
                        onClick={(e) => {
                            e.preventDefault();
                            message.info('고객센터 문의: support@boounglab.com');
                        }}
                    >
                        <CustomerServiceOutlined />
                        <span>고객센터</span>
                    </a>
                </div>
            </header>

            {/* Main 5:5 Layout */}
            <main className="auth-main">
                <div className="auth-main__inner">
                    {/* Left Column: Hero & Continuous Floating Orbit Canvas */}
                    <div className="auth-hero-col">
                        <div>
                            <h1 className="auth-hero__title">
                                매일 채워가는 나만의 움직임,<br />
                                <span className="auth-hero__title-highlight">OwlFit.</span>
                            </h1>
                            <p className="auth-hero__subtitle">
                                오늘의 땀방울이 만드는 가장 확실한 변화
                            </p>
                        </div>

                        {/* Ambient Orbit & Floating Interactive Cards */}
                        <div className="ambient-canvas">
                            {/* Orbit Rings & Glyphs */}
                            <div className="orbit-glow" />
                            <div className="orbit-ring-outer" />
                            <div className="orbit-ring-inner" />

                            {/* Decorative Star & Geometric Glyphs */}
                            <svg style={{ position: 'absolute', top: 20, left: 45, color: 'rgba(139, 92, 246, 0.35)' }} fill="none" height="22" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="22">
                                <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
                            </svg>
                            <svg style={{ position: 'absolute', bottom: 30, right: 35, color: 'rgba(139, 92, 246, 0.35)' }} fill="none" height="18" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="18">
                                <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
                            </svg>
                            <span style={{ position: 'absolute', top: 75, left: 15, fontSize: 13, fontWeight: 700, color: 'rgba(113, 113, 122, 0.25)' }}>+</span>
                            <span style={{ position: 'absolute', bottom: 75, right: 20, fontSize: 13, fontWeight: 700, color: 'rgba(113, 113, 122, 0.25)' }}>+</span>

                            {/* [1] Top Left: Yoga Squircle Card */}
                            <div className="float-item-1" style={{ position: 'absolute', top: 12, left: 30 }}>
                                <div
                                    className="floating-card"
                                    style={{
                                        width: 74,
                                        height: 74,
                                        borderRadius: 20,
                                        background: '#FFFFFF',
                                        boxShadow: '0 10px 25px -5px rgba(112, 110, 180, 0.12)',
                                        border: '1px solid rgba(237, 233, 254, 0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg fill="none" height="36" stroke="#FF6B35" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24" width="36">
                                        <circle cx="12" cy="4" r="2" />
                                        <path d="M4 17l4-2 4 2 4-2 4 2" />
                                        <path d="M12 6v6" />
                                        <path d="M8 12h8" />
                                        <path d="M9 20l3-2 3 2" />
                                    </svg>
                                </div>
                            </div>

                            {/* [2] Top Center: #건강 Pill Chip */}
                            <div className="float-item-2" style={{ position: 'absolute', top: 10, left: 195 }}>
                                <div
                                    className="floating-card"
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        backgroundColor: '#8B5CF6',
                                        color: '#FFFFFF',
                                        borderRadius: 9999,
                                        boxShadow: '0 8px 20px rgba(139, 92, 246, 0.28)',
                                    }}
                                >
                                    <span style={{ opacity: 0.8, marginRight: 4 }}>#</span>건강
                                </div>
                            </div>

                            {/* [3] Top Right: Workout Dumbbell Card */}
                            <div className="float-item-3" style={{ position: 'absolute', top: 18, right: 30 }}>
                                <div
                                    className="floating-card"
                                    style={{
                                        width: 74,
                                        height: 74,
                                        borderRadius: 20,
                                        background: '#FFFFFF',
                                        boxShadow: '0 10px 25px -5px rgba(112, 110, 180, 0.12)',
                                        border: '1px solid rgba(237, 233, 254, 0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg fill="none" height="34" stroke="#5B3BA8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="34">
                                        <path d="M6.5 6.5h11" />
                                        <path d="M6.5 17.5h11" />
                                        <path d="M6.5 4v16" />
                                        <path d="M17.5 4v16" />
                                        <path d="M3 8v8" />
                                        <path d="M21 8v8" />
                                    </svg>
                                </div>
                            </div>

                            {/* [4] Mid Left: #루틴 Pill Chip */}
                            <div className="float-item-4" style={{ position: 'absolute', top: 160, left: 16 }}>
                                <div
                                    className="floating-card"
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        backgroundColor: '#FFFFFF',
                                        color: '#5B3BA8',
                                        borderRadius: 9999,
                                        border: '1px solid #EDE9FE',
                                        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.1)',
                                    }}
                                >
                                    <span style={{ color: '#8B5CF6', marginRight: 4 }}>#</span>루틴
                                </div>
                            </div>

                            {/* [5] Center Core: Energy Flame Card */}
                            <div className="float-item-core" style={{ position: 'absolute', top: 148, left: 196 }}>
                                <div
                                    className="floating-card"
                                    style={{
                                        width: 86,
                                        height: 86,
                                        borderRadius: 24,
                                        background: '#FFFFFF',
                                        boxShadow: '0 16px 36px rgba(91, 59, 168, 0.14)',
                                        border: '1px solid #FFEDD5',
                                        outline: '4px solid rgba(255, 237, 213, 0.6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg fill="none" height="42" stroke="#FF6B35" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="42">
                                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                                    </svg>
                                </div>
                            </div>

                            {/* [6] Mid Right: #오운완 Pill Chip */}
                            <div className="float-item-5" style={{ position: 'absolute', top: 160, right: 16 }}>
                                <div
                                    className="floating-card"
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        backgroundColor: '#EDE9FE',
                                        color: '#6D28D9',
                                        borderRadius: 9999,
                                        border: '1px solid rgba(221, 214, 254, 0.5)',
                                        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.1)',
                                    }}
                                >
                                    <span style={{ color: '#8B5CF6', marginRight: 4 }}>#</span>오운완
                                </div>
                            </div>

                            {/* [7] Bottom Left: Lightning Card */}
                            <div className="float-item-6" style={{ position: 'absolute', bottom: 18, left: 105 }}>
                                <div
                                    className="floating-card"
                                    style={{
                                        width: 74,
                                        height: 74,
                                        borderRadius: 20,
                                        background: '#FFFFFF',
                                        boxShadow: '0 10px 25px -5px rgba(112, 110, 180, 0.12)',
                                        border: '1px solid rgba(254, 243, 199, 0.8)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <svg fill="none" height="34" stroke="#F59E0B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="34">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                </div>
                            </div>

                            {/* [8] Bottom Right: #열정 Pill Chip */}
                            <div className="float-item-7" style={{ position: 'absolute', bottom: 28, right: 105 }}>
                                <div
                                    className="floating-card"
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        backgroundColor: '#FEF3C7',
                                        color: '#D97706',
                                        borderRadius: 9999,
                                        border: '1px solid rgba(253, 230, 138, 0.8)',
                                        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.12)',
                                    }}
                                >
                                    <span style={{ color: '#D97706', marginRight: 4 }}>#</span>열정
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Unified Auth Card */}
                    <div className="auth-card-col">
                        <div className="auth-card">
                            <div>
                                {/* Card Title */}
                                <div className="auth-card__header">
                                    <h2>입장하기</h2>
                                    <p>OwlFit(올핏)에 로그인하세요</p>
                                </div>

                                {/* Role Switcher Capsule Track */}
                                <div className="role-segmented-track">
                                    <button
                                        type="button"
                                        className={`role-tab-btn ${role === 'member' ? 'is-active' : ''}`}
                                        onClick={() => setRole('member')}
                                    >
                                        일반 회원
                                    </button>
                                    <button
                                        type="button"
                                        className={`role-tab-btn ${role === 'admin' ? 'is-active' : ''}`}
                                        onClick={() => setRole('admin')}
                                    >
                                        센터 관리자
                                    </button>
                                </div>

                                {/* Admin Status Badge */}
                                {role === 'admin' && (
                                    <div className="admin-info-badge">
                                        <SafetyCertificateOutlined style={{ fontSize: 16 }} />
                                        <span>센터 운영자 및 강사 전용 로그인입니다</span>
                                    </div>
                                )}

                                {/* Main Login Form */}
                                <Form
                                    form={form}
                                    name="login"
                                    layout="vertical"
                                    initialValues={{ remember: true }}
                                    onFinish={onFinish}
                                    size="large"
                                >
                                    <Form.Item
                                        label={<span style={{ fontSize: 13, fontWeight: 600, color: '#3F3F46' }}>{role === 'admin' ? '관리자 아이디 / 이메일' : '아이디 또는 이메일'}</span>}
                                        name="loginId"
                                        className="inset-input-item"
                                        rules={[{ required: true, message: role === 'admin' ? '관리자 아이디를 입력해주세요.' : '아이디를 입력해주세요.' }]}
                                        style={{ marginBottom: 16 }}
                                    >
                                        <Input
                                            prefix={<UserOutlined style={{ color: '#94A3B8', marginRight: 8 }} />}
                                            placeholder={role === 'admin' ? '관리자 아이디를 입력하세요' : '아이디 또는 이메일 주소를 입력하세요'}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ fontSize: 13, fontWeight: 600, color: '#3F3F46' }}>비밀번호</span>}
                                        name="pwd"
                                        className="inset-input-item"
                                        rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
                                        style={{ marginBottom: 16 }}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined style={{ color: '#94A3B8', marginRight: 8 }} />}
                                            placeholder="비밀번호를 입력하세요"
                                        />
                                    </Form.Item>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <Form.Item name="remember" valuePropName="checked" noStyle>
                                            <Checkbox style={{ fontSize: 13, color: '#52525B' }}>로그인 유지</Checkbox>
                                        </Form.Item>
                                        <Link
                                            style={{ fontSize: 13, color: '#71717A' }}
                                            onClick={() => message.info('아이디/비밀번호 찾기 페이지 준비 중입니다.')}
                                        >
                                            아이디/비밀번호 찾기
                                        </Link>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            loading={loading}
                                            className="auth-submit-btn"
                                        >
                                            {role === 'admin' ? '관리자 콘솔 로그인 →' : '로그인 →'}
                                        </Button>

                                        <Button
                                            block
                                            className="auth-secondary-btn"
                                            onClick={() => navigate('/join')}
                                        >
                                            {role === 'admin' ? '센터 신규 등록 및 가입 문의' : '회원가입'}
                                        </Button>
                                    </div>
                                </Form>
                            </div>

                            {/* Social Logins (Member Only) */}
                            {role === 'member' && (
                                <div style={{ marginTop: 20 }}>
                                    <Divider plain style={{ margin: '12px 0 16px', color: '#94A3B8', fontSize: 12 }}>
                                        또는 간편 로그인
                                    </Divider>

                                    <div className="social-login-grid">
                                        <Button
                                            block
                                            className="kakao-btn"
                                            onClick={handleKakaoLogin}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
                                                <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.706 4.8 4.27 6.054l-.865 3.195c-.078.29.239.52.484.364l3.87-2.564c.404.043.816.066 1.241.066 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
                                            </svg>
                                            카카오 로그인
                                        </Button>

                                        <Button
                                            block
                                            className="naver-btn"
                                            onClick={handleNaverLogin}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF">
                                                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
                                            </svg>
                                            네이버 로그인
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="auth-footer">
                <div className="auth-footer__inner">
                    <div className="auth-footer__copyright">
                        © 2026 booung Lab. All rights reserved.
                    </div>
                    <div className="auth-footer__links">
                        <a href="#terms" onClick={(e) => { e.preventDefault(); message.info('이용약관 페이지 준비 중입니다.'); }}>이용약관</a>
                        <span className="auth-footer__dot">·</span>
                        <a href="#privacy" onClick={(e) => { e.preventDefault(); message.info('개인정보처리방침 페이지 준비 중입니다.'); }}>개인정보처리방침</a>
                        <span className="auth-footer__dot">·</span>
                        <a href="#about" onClick={(e) => { e.preventDefault(); message.info('회사소개 페이지 준비 중입니다.'); }}>회사소개</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;