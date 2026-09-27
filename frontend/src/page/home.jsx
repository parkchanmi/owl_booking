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
    const [viewMode, setViewMode] = useState('login'); // 'login' | 'member_signup' | 'member_signup_completed' | 'admin_signup' | 'admin_signup_completed'

    // Registered user for completed screen
    const [registeredUser, setRegisteredUser] = useState({ name: '', userId: '' });
    // Registered admin for completed screen
    const [registeredAdmin, setRegisteredAdmin] = useState({
        centerName: '',
        adminName: '',
        adminEmail: '',
        bizNumber: '',
        adminId: '',
        submittedAt: '',
    });

    // Member Sign-Up Form State & Status Flags
    const [signupForm, setSignupForm] = useState({
        loginId: '',
        password: '',
        passwordConfirm: '',
        name: '',
        email: '',
        phone: '',
    });
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [idCheckMsg, setIdCheckMsg] = useState({ text: '', isError: false });
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailVerifyMsg, setEmailVerifyMsg] = useState({ text: '', isError: false });

    // Center Admin Sign-Up Form State & Status Flags
    const [adminSignupForm, setAdminSignupForm] = useState({
        loginId: '',
        password: '',
        passwordConfirm: '',
        adminName: '',
        email: '',
        phone: '',
        centerName: '',
        ceoName: '',
        bizNumber: '',
        zonecode: '',
        address: '',
        addressDetail: '',
    });
    const [isAdminIdChecked, setIsAdminIdChecked] = useState(false);
    const [adminIdCheckMsg, setAdminIdCheckMsg] = useState({ text: '', isError: false });
    const [isAdminEmailVerified, setIsAdminEmailVerified] = useState(false);
    const [adminEmailVerifyMsg, setAdminEmailVerifyMsg] = useState({ text: '', isError: false });

    // Business Number & Date Formatting Helpers
    const formatBizNumber = (value) => {
        if (!value) return '';
        const clean = value.replace(/[^0-9]/g, '').slice(0, 10);
        if (clean.length <= 3) return clean;
        if (clean.length <= 5) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
        return `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5, 10)}`;
    };

    const formatDateTime = (date = new Date()) => {
        const pad = (n) => String(n).padStart(2, '0');
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        const h = pad(date.getHours());
        const min = pad(date.getMinutes());
        return `${y}.${m}.${d} ${h}:${min}`;
    };

    // TODO: [Backend] 아이디 중복확인 API 연동 (POST /api/auth/check-username)
    const handleCheckUsername = () => {
        const usernameRegex = /^[a-z0-9]{4,16}$/;
        if (!signupForm.loginId.trim()) {
            message.warning('아이디를 입력해주세요.');
            return;
        }
        if (!usernameRegex.test(signupForm.loginId.trim())) {
            setIsIdChecked(false);
            setIdCheckMsg({ text: '영문 소문자, 숫자 조합 4~16자로 입력해주세요.', isError: true });
            message.error('아이디는 영문 소문자와 숫자 조합 4~16자여야 합니다.');
            return;
        }
        setIsIdChecked(true);
        setIdCheckMsg({ text: '사용 가능한 아이디입니다.', isError: false });
        message.success('사용 가능한 아이디입니다.');
    };

    // TODO: [Backend] 이메일 인증번호 발송 API 연동 (POST /api/auth/email/send-code)
    const handleSendEmailCode = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!signupForm.email.trim()) {
            message.warning('이메일을 입력해주세요.');
            return;
        }
        if (!emailRegex.test(signupForm.email.trim())) {
            setIsEmailVerified(false);
            setEmailVerifyMsg({ text: '올바른 이메일 형식을 입력해주세요.', isError: true });
            message.error('올바른 이메일 형식을 입력해주세요.');
            return;
        }
        setIsEmailVerified(true);
        setEmailVerifyMsg({ text: '인증 요청이 완료되었습니다 (모의 처리).', isError: false });
        message.success('인증 요청이 완료되었습니다 (모의 처리).');
    };

    // 전화번호 010-0000-0000 자동 하이픈 포맷팅
    const handlePhoneChange = (e) => {
        const rawVal = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
        let formatted = rawVal;
        if (rawVal.length > 3 && rawVal.length <= 7) {
            formatted = `${rawVal.slice(0, 3)}-${rawVal.slice(3)}`;
        } else if (rawVal.length > 7) {
            formatted = `${rawVal.slice(0, 3)}-${rawVal.slice(3, 7)}-${rawVal.slice(7)}`;
        }
        setSignupForm((prev) => ({ ...prev, phone: formatted }));
    };

    const isPasswordMatch = Boolean(
        signupForm.password &&
        signupForm.passwordConfirm &&
        signupForm.password === signupForm.passwordConfirm
    );
    const isPasswordMismatch = Boolean(
        signupForm.passwordConfirm &&
        signupForm.password !== signupForm.passwordConfirm
    );

    const isFormValid = Boolean(
        signupForm.loginId.trim() &&
        isIdChecked &&
        !idCheckMsg.isError &&
        signupForm.password &&
        signupForm.password.length >= 8 &&
        isPasswordMatch &&
        signupForm.name.trim() &&
        signupForm.email.trim() &&
        isEmailVerified &&
        !emailVerifyMsg.isError &&
        signupForm.phone.replace(/[^0-9]/g, '').length >= 10
    );

    // TODO: [Backend] 일반 회원가입 요청 API 연동 (POST /api/auth/register)
    const handleSignupSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) {
            message.warning('모든 필수 항목을 올바르게 입력하고 인증을 완료해주세요.');
            return;
        }
        setRegisteredUser({
            name: signupForm.name.trim(),
            userId: signupForm.loginId.trim(),
        });
        message.success('회원가입이 완료되었습니다!');
        setViewMode('member_signup_completed');
    };

    // 회원가입 완료 후 로그인 화면으로 이동 & 아이디 자동 입력
    const handleGoToLoginFromCompleted = () => {
        setRole('member');
        if (registeredUser.userId) {
            form.setFieldsValue({ loginId: registeredUser.userId });
        }
        setViewMode('login');
    };

    // Center Admin Sign-Up Handlers
    // TODO: [Backend] 아이디 중복확인 API 연동 (POST /api/auth/check-username)
    const handleAdminCheckUsername = () => {
        const usernameRegex = /^[a-z0-9]{4,16}$/;
        if (!adminSignupForm.loginId.trim()) {
            message.warning('아이디를 입력해주세요.');
            return;
        }
        if (!usernameRegex.test(adminSignupForm.loginId.trim())) {
            setIsAdminIdChecked(false);
            setAdminIdCheckMsg({ text: '영문 소문자, 숫자 조합 4~16자로 입력해주세요.', isError: true });
            message.error('아이디는 영문 소문자와 숫자 조합 4~16자여야 합니다.');
            return;
        }
        setIsAdminIdChecked(true);
        setAdminIdCheckMsg({ text: '사용 가능한 아이디입니다.', isError: false });
        message.success('사용 가능한 아이디입니다.');
    };

    // TODO: [Backend] 이메일 인증번호 발송 API 연동 (POST /api/auth/email/send-code)
    const handleAdminSendEmailCode = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!adminSignupForm.email.trim()) {
            message.warning('이메일을 입력해주세요.');
            return;
        }
        if (!emailRegex.test(adminSignupForm.email.trim())) {
            setIsAdminEmailVerified(false);
            setAdminEmailVerifyMsg({ text: '올바른 이메일 형식을 입력해주세요.', isError: true });
            message.error('올바른 이메일 형식을 입력해주세요.');
            return;
        }
        setIsAdminEmailVerified(true);
        setAdminEmailVerifyMsg({ text: '인증 요청이 완료되었습니다 (모의 처리).', isError: false });
        message.success('인증 요청이 완료되었습니다 (모의 처리).');
    };

    const handleAdminPhoneChange = (e) => {
        const rawVal = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
        let formatted = rawVal;
        if (rawVal.length > 3 && rawVal.length <= 7) {
            formatted = `${rawVal.slice(0, 3)}-${rawVal.slice(3)}`;
        } else if (rawVal.length > 7) {
            formatted = `${rawVal.slice(0, 3)}-${rawVal.slice(3, 7)}-${rawVal.slice(7)}`;
        }
        setAdminSignupForm((prev) => ({ ...prev, phone: formatted }));
    };

    // TODO: [Backend] 사업자등록번호 유효성 검증 API (POST /api/auth/validate-biz-no)
    const handleAdminBizNumberChange = (e) => {
        const formatted = formatBizNumber(e.target.value);
        setAdminSignupForm((prev) => ({ ...prev, bizNumber: formatted }));
    };

    const handleOpenPostcode = () => {
        if (window.daum && window.daum.Postcode) {
            new window.daum.Postcode({
                oncomplete: function (data) {
                    setAdminSignupForm((prev) => ({
                        ...prev,
                        zonecode: data.zonecode || '',
                        address: data.address || '',
                    }));
                },
            }).open();
        } else {
            message.info('우편번호 검색을 위해 주소창에 직접 입력하시거나 서비스 준비 중입니다.');
        }
    };

    const isAdminPasswordMatch = Boolean(
        adminSignupForm.password &&
        adminSignupForm.passwordConfirm &&
        adminSignupForm.password === adminSignupForm.passwordConfirm
    );
    const isAdminPasswordMismatch = Boolean(
        adminSignupForm.passwordConfirm &&
        adminSignupForm.password !== adminSignupForm.passwordConfirm
    );

    const isAdminFormValid = Boolean(
        adminSignupForm.loginId.trim() &&
        isAdminIdChecked &&
        !adminIdCheckMsg.isError &&
        adminSignupForm.password &&
        adminSignupForm.password.length >= 8 &&
        isAdminPasswordMatch &&
        adminSignupForm.adminName.trim() &&
        adminSignupForm.email.trim() &&
        isAdminEmailVerified &&
        !adminEmailVerifyMsg.isError &&
        adminSignupForm.phone.replace(/[^0-9]/g, '').length >= 10 &&
        adminSignupForm.centerName.trim() &&
        adminSignupForm.ceoName.trim() &&
        adminSignupForm.bizNumber.replace(/[^0-9]/g, '').length === 10 &&
        adminSignupForm.address.trim()
    );

    // TODO: [Backend] 센터 관리자 가입 신청 API (POST /api/auth/admin/register)
    const handleAdminSignupSubmit = (e) => {
        e.preventDefault();
        if (!isAdminFormValid) {
            message.warning('모든 필수 항목을 올바르게 입력하고 인증을 완료해주세요.');
            return;
        }
        setRegisteredAdmin({
            centerName: adminSignupForm.centerName.trim(),
            adminName: adminSignupForm.adminName.trim(),
            adminEmail: adminSignupForm.email.trim(),
            bizNumber: formatBizNumber(adminSignupForm.bizNumber.trim()),
            adminId: adminSignupForm.loginId.trim(),
            submittedAt: formatDateTime(new Date()),
        });
        message.success('센터 관리자 가입 신청이 완료되었습니다.');
        setViewMode('admin_signup_completed');
    };

    const handleGoToLoginFromAdminCompleted = () => {
        setRole('admin');
        if (registeredAdmin.adminId) {
            form.setFieldsValue({ loginId: registeredAdmin.adminId });
        }
        setViewMode('login');
    };

    const handleGoToAdminLogin = () => {
        setRole('admin');
        setViewMode('login');
    };

    const handleKakaoLogin = () => {
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code&scope=profile_nickname`;
        window.location.href = kakaoAuthUrl;
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
                    <div className="brand-badge" onClick={() => { setViewMode('login'); navigate('/'); }}>
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

            {/* Main Content Area */}
            <main className="auth-main">
                {viewMode === 'login' && (
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
                                            onClick={() => {
                                                if (role === 'member') {
                                                    setViewMode('member_signup');
                                                } else {
                                                    setViewMode('admin_signup');
                                                }
                                            }}
                                        >
                                            {role === 'admin' ? '센터 신규 등록 및 가입 문의' : '회원가입'}
                                        </Button>
                                    </div>
                                </Form>
                            </div>

                            {/* Social Logins */}
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