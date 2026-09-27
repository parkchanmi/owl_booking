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
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
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

                            {/* Social Logins (Member Only) */}
                            {role === 'member' && (
                                <div style={{ marginTop: 20 }}>
                                    <Divider plain style={{ margin: '12px 0 16px', color: '#94A3B8', fontSize: 12 }}>
                                        또는 간편 로그인
                                    </Divider>

                                    <div className="social-login-grid" style={{ display: 'block' }}>
                                        <Button
                                            block
                                            className="kakao-btn w-full"
                                            onClick={handleKakaoLogin}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
                                                <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.706 4.8 4.27 6.054l-.865 3.195c-.078.29.239.52.484.364l3.87-2.564c.404.043.816.066 1.241.066 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
                                            </svg>
                                            카카오로 시작하기
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                )}

                {viewMode === 'member_signup' && (
                    <div className="signup-wrapper">
                        <div
                            className="signup-card"
                            style={{
                                borderRadius: '36px',
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(24px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                                border: '1px solid rgba(255, 255, 255, 0.9)',
                                boxShadow: 'rgba(124, 58, 237, 0.07) 0px 20px 40px -15px, rgba(237, 233, 254, 0.5) 0px 0px 0px 1px inset',
                            }}
                        >
                            {/* Icon Badge */}
                            <div className="signup-badge">
                                <svg className="w-6 h-6 stroke-[1.8] text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>

                            {/* Title & Subtitle */}
                            <div className="signup-header">
                                <h1 className="signup-title">일반 회원가입</h1>
                                <p className="signup-subtitle">OwlFit과 함께 건강한 피트니스 루틴을 만들어보세요.</p>
                            </div>

                            {/* Form */}
                            <form className="signup-form" onSubmit={handleSignupSubmit}>
                                {/* 1) 아이디 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        아이디 <span className="signup-required">*</span>
                                    </label>
                                    <div className="signup-input-row">
                                        <input
                                            type="text"
                                            placeholder="영문 소문자, 숫자 조합 4~16자"
                                            className="signup-input"
                                            value={signupForm.loginId}
                                            onChange={(e) => {
                                                setSignupForm((prev) => ({ ...prev, loginId: e.target.value.trim() }));
                                                if (isIdChecked || idCheckMsg.text) {
                                                    setIsIdChecked(false);
                                                    setIdCheckMsg({ text: '', isError: false });
                                                }
                                            }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={`signup-side-btn ${isIdChecked ? 'is-completed' : ''}`}
                                            onClick={handleCheckUsername}
                                        >
                                            {isIdChecked ? '확인완료' : '중복확인'}
                                        </button>
                                    </div>
                                    {idCheckMsg.text && (
                                        <div className={`signup-msg ${idCheckMsg.isError ? 'signup-msg--error' : 'signup-msg--success'}`}>
                                            {idCheckMsg.text}
                                        </div>
                                    )}
                                </div>

                                {/* 2) 비밀번호 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        비밀번호 <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                                        className="signup-input"
                                        value={signupForm.password}
                                        onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                                        required
                                    />
                                    {signupForm.password && signupForm.password.length < 8 && (
                                        <div className="signup-msg signup-msg--error">
                                            비밀번호를 8자 이상 입력해주세요.
                                        </div>
                                    )}
                                </div>

                                {/* 3) 비밀번호 확인 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        비밀번호 확인 <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="비밀번호를 다시 입력해주세요"
                                        className="signup-input"
                                        value={signupForm.passwordConfirm}
                                        onChange={(e) => setSignupForm((prev) => ({ ...prev, passwordConfirm: e.target.value }))}
                                        required
                                    />
                                    {isPasswordMismatch && (
                                        <div className="signup-msg signup-msg--error">
                                            비밀번호가 일치하지 않습니다.
                                        </div>
                                    )}
                                    {!isPasswordMismatch && signupForm.passwordConfirm && isPasswordMatch && (
                                        <div className="signup-msg signup-msg--success">
                                            비밀번호가 일치합니다.
                                        </div>
                                    )}
                                </div>

                                {/* 4) 이름 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        이름 <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="이름을 입력해주세요"
                                        className="signup-input"
                                        value={signupForm.name}
                                        onChange={(e) => setSignupForm((prev) => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>

                                {/* 5) 이메일 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        이메일 <span className="signup-required">*</span>
                                    </label>
                                    <div className="signup-input-row">
                                        <input
                                            type="email"
                                            placeholder="example@owlfit.com"
                                            className="signup-input"
                                            value={signupForm.email}
                                            onChange={(e) => {
                                                setSignupForm((prev) => ({ ...prev, email: e.target.value.trim() }));
                                                if (isEmailVerified || emailVerifyMsg.text) {
                                                    setIsEmailVerified(false);
                                                    setEmailVerifyMsg({ text: '', isError: false });
                                                }
                                            }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={`signup-side-btn ${isEmailVerified ? 'is-completed' : ''}`}
                                            onClick={handleSendEmailCode}
                                        >
                                            {isEmailVerified ? '인증완료' : '인증요청'}
                                        </button>
                                    </div>
                                    {emailVerifyMsg.text && (
                                        <div className={`signup-msg ${emailVerifyMsg.isError ? 'signup-msg--error' : 'signup-msg--success'}`}>
                                            {emailVerifyMsg.text}
                                        </div>
                                    )}
                                </div>

                                {/* 6) 전화번호 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        전화번호 <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="010-0000-0000"
                                        className="signup-input"
                                        value={signupForm.phone}
                                        onChange={handlePhoneChange}
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="signup-submit-btn"
                                    disabled={!isFormValid}
                                >
                                    가입 완료하기
                                </button>
                            </form>

                            {/* Bottom Switch Link */}
                            <div className="signup-bottom-switch">
                                <p>
                                    이미 계정이 있으신가요?
                                    <span
                                        className="signup-bottom-switch-link"
                                        onClick={() => setViewMode('login')}
                                    >
                                        로그인
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'member_signup_completed' && (
                    <div className="signup-completed-wrapper">
                        <div
                            className="signup-completed-card"
                            style={{
                                borderRadius: '36px',
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(28px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                                boxShadow: 'rgba(124, 58, 237, 0.1) 0px 24px 50px -12px, rgba(255, 255, 255, 0.9) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.04) 0px 8px 24px -4px',
                            }}
                        >
                            {/* Top Hero Illustration */}
                            <div className="signup-completed-hero">
                                <img
                                    alt="요가 스트레칭 캐릭터 일러스트"
                                    className="signup-completed-img"
                                    src="https://lh3.googleusercontent.com/aida/AEtjO1V-85Fri_3UWsAD04qoROCY9m_BMFhbCNyTGXb73C19Be6aPk_MSCvHfGJKDH7omqmQpJKnXsglLdoANApkjCCqg9XS24_nojPiMRL6FVRvm2UqrAsJCWizs8PnHi2EF2T-SZWu--NiGCaRXthu1FTml5eQK_VN64incGkvUIYoPkiC0LxtPRP0YTihGPh1myTtSOfe7y8n_3dedJnvpPNh9yVpFCgTrv0Yz3_eIoT_4AwVaFEpeGaH12Q"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fb = document.getElementById('yoga-hero-svg-fallback');
                                        if (fb) fb.style.display = 'block';
                                    }}
                                />
                                <svg
                                    id="yoga-hero-svg-fallback"
                                    style={{ display: 'none', width: '110px', height: '110px' }}
                                    viewBox="0 0 120 120"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle cx="60" cy="60" r="50" fill="#EDE9FE" opacity="0.6" />
                                    <circle cx="60" cy="38" r="14" fill="#7C3AED" />
                                    <circle cx="60" cy="36" r="11" fill="#DDD6FE" />
                                    <path d="M48 64C48 54 72 54 72 64V80H48V64Z" fill="#7C3AED" />
                                    <path d="M48 58L32 44M72 58L88 44" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" />
                                    <path d="M36 86C36 78 48 76 60 76C72 76 84 78 84 86C84 90 74 94 60 94C46 94 36 90 36 86Z" fill="#6D28D9" />
                                    <path d="M26 28L28 34L34 36L28 38L26 44L24 38L18 36L24 34L26 28Z" fill="#F59E0B" />
                                    <path d="M96 24L97.5 29L102 30.5L97.5 32L96 37L94.5 32L90 30.5L94.5 29L96 24Z" fill="#8B5CF6" />
                                </svg>
                            </div>

                            {/* Greeting Headline */}
                            <h1 className="signup-completed-title">
                                {registeredUser.name || '회원'} 님, 반가워요!
                            </h1>

                            {/* Account Identity Capsule */}
                            <div className="signup-completed-capsule">
                                <span className="signup-completed-userid">@{registeredUser.userId || 'owlfit_user'}</span>
                                <span className="signup-completed-dot" />
                                <span className="signup-completed-role">일반 회원</span>
                            </div>

                            {/* Primary CTA Button */}
                            <button
                                type="button"
                                className="signup-completed-btn"
                                onClick={handleGoToLoginFromCompleted}
                            >
                                <span>지금 첫 수업 예약하러 가기</span>
                                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 16 16" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.33334 8H12.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                    <path d="M8 3.33334L12.6667 8L8 12.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* View 4: Center Admin Sign-Up Form (Phase 2) */}
                {viewMode === 'admin_signup' && (
                    <div className="admin-signup-wrapper">
                        <div className="admin-signup-card">
                            {/* Icon Badge & Top Header */}
                            <div className="signup-header">
                                <div className="signup-badge">
                                    <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h1 className="signup-title text-2xl font-extrabold text-[#18181B] tracking-tight text-center mb-1.5">
                                    센터 관리자 회원가입
                                </h1>
                                <p className="signup-subtitle text-xs text-[#71717A] text-center mb-6">
                                    OwlFit 파트너 센터로 등록하고 스마트한 스튜디오 운영을 시작하세요.
                                </p>
                            </div>

                            {/* Top Q&A Banner (센터 등록 안내 박스) */}
                            <div className="admin-guide-banner">
                                <div className="admin-guide-banner-header">
                                    <div className="admin-guide-icon">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div className="admin-guide-texts">
                                        <h4>센터 등록이 처음이신가요?</h4>
                                        <p>사업자 등록 · 승인 · 운영 방법 안내</p>
                                    </div>
                                </div>
                                <div className="admin-guide-actions">
                                    <button
                                        type="button"
                                        className="admin-guide-btn-guide"
                                        onClick={() => message.info('센터 등록 가이드 문서 준비 중입니다.')}
                                    >
                                        가입 가이드
                                    </button>
                                    <button
                                        type="button"
                                        className="admin-guide-btn-chat"
                                        onClick={() => message.info('실시간 1:1 상담 채널로 연결됩니다.')}
                                    >
                                        1:1 상담
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleAdminSignupSubmit} className="signup-form">
                                {/* SECTION 1: 관리자 기본 정보 */}
                                <div className="admin-section-divider">
                                    <div className="admin-section-title-wrap">
                                        <span className="admin-section-num">01</span>
                                        <span className="admin-section-title">관리자 기본 정보</span>
                                    </div>
                                    <span className="admin-section-req-hint">* 필수 입력 항목</span>
                                </div>

                                {/* 1) 아이디 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        아이디 <span className="signup-required">*</span>
                                    </label>
                                    <div className="signup-input-row">
                                        <input
                                            type="text"
                                            placeholder="영문 소문자, 숫자 조합 4~16자"
                                            className="signup-input"
                                            value={adminSignupForm.loginId}
                                            onChange={(e) => {
                                                setAdminSignupForm((prev) => ({ ...prev, loginId: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }));
                                                setIsAdminIdChecked(false);
                                                setAdminIdCheckMsg({ text: '', isError: false });
                                            }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={`signup-side-btn ${isAdminIdChecked ? 'is-completed' : ''}`}
                                            onClick={handleAdminCheckUsername}
                                        >
                                            {isAdminIdChecked ? '확인완료' : '중복확인'}
                                        </button>
                                    </div>
                                    {adminIdCheckMsg.text && (
                                        <div className={`signup-msg ${adminIdCheckMsg.isError ? 'signup-msg--error' : 'signup-msg--success'}`}>
                                            {adminIdCheckMsg.text}
                                        </div>
                                    )}
                                </div>

                                {/* 2) 비밀번호 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        비밀번호 <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                                        className="signup-input"
                                        value={adminSignupForm.password}
                                        onChange={(e) => setAdminSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                                        required
                                    />
                                    {adminSignupForm.password && adminSignupForm.password.length < 8 && (
                                        <div className="signup-msg signup-msg--error">
                                            비밀번호는 최소 8자 이상이어야 합니다.
                                        </div>
                                    )}
                                </div>

                                {/* 3) 비밀번호 확인 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        비밀번호 확인 <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="비밀번호를 다시 입력해주세요"
                                        className="signup-input"
                                        value={adminSignupForm.passwordConfirm}
                                        onChange={(e) => setAdminSignupForm((prev) => ({ ...prev, passwordConfirm: e.target.value }))}
                                        required
                                    />
                                    {isAdminPasswordMatch && (
                                        <div className="signup-msg signup-msg--success">
                                            비밀번호가 일치합니다.
                                        </div>
                                    )}
                                    {isAdminPasswordMismatch && (
                                        <div className="signup-msg signup-msg--error">
                                            비밀번호가 일치하지 않습니다.
                                        </div>
                                    )}
                                </div>

                                {/* 4) 관리자 이름 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        관리자 이름 <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="관리자 실명을 입력해주세요"
                                        className="signup-input"
                                        value={adminSignupForm.adminName}
                                        onChange={(e) => setAdminSignupForm((prev) => ({ ...prev, adminName: e.target.value }))}
                                        required
                                    />
                                </div>

                                {/* 5) 이메일 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        이메일 <span className="signup-required">*</span>
                                    </label>
                                    <div className="signup-input-row">
                                        <input
                                            type="email"
                                            placeholder="admin@studio.com"
                                            className="signup-input"
                                            value={adminSignupForm.email}
                                            onChange={(e) => {
                                                setAdminSignupForm((prev) => ({ ...prev, email: e.target.value }));
                                                setIsAdminEmailVerified(false);
                                                setAdminEmailVerifyMsg({ text: '', isError: false });
                                            }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={`signup-side-btn ${isAdminEmailVerified ? 'is-completed' : ''}`}
                                            onClick={handleAdminSendEmailCode}
                                        >
                                            {isAdminEmailVerified ? '인증완료' : '인증요청'}
                                        </button>
                                    </div>
                                    {adminEmailVerifyMsg.text && (
                                        <div className={`signup-msg ${adminEmailVerifyMsg.isError ? 'signup-msg--error' : 'signup-msg--success'}`}>
                                            {adminEmailVerifyMsg.text}
                                        </div>
                                    )}
                                </div>

                                {/* 6) 전화번호 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        전화번호 <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="010-0000-0000"
                                        className="signup-input"
                                        value={adminSignupForm.phone}
                                        onChange={handleAdminPhoneChange}
                                        required
                                    />
                                </div>

                                {/* SECTION 2: 센터(사업자) 정보 */}
                                <div className="admin-section-divider" style={{ marginTop: 28 }}>
                                    <div className="admin-section-title-wrap">
                                        <span className="admin-section-num">02</span>
                                        <span className="admin-section-title">센터(사업자) 정보</span>
                                    </div>
                                </div>

                                {/* 7) 상호 (센터명) */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        상호 (센터명) <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="예: 아울핏 필라테스 강남점"
                                        className="signup-input"
                                        value={adminSignupForm.centerName}
                                        onChange={(e) => setAdminSignupForm((prev) => ({ ...prev, centerName: e.target.value }))}
                                        required
                                    />
                                </div>

                                {/* 8) 대표자명 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        대표자명 <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="사업자등록증 상의 대표자명"
                                        className="signup-input"
                                        value={adminSignupForm.ceoName}
                                        onChange={(e) => setAdminSignupForm((prev) => ({ ...prev, ceoName: e.target.value }))}
                                        required
                                    />
                                </div>

                                {/* 9) 사업자등록번호 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        사업자등록번호 <span className="signup-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="'-' 제외 10자리 숫자 입력"
                                        className="signup-input"
                                        value={adminSignupForm.bizNumber}
                                        onChange={handleAdminBizNumberChange}
                                        maxLength={12}
                                        required
                                    />
                                </div>

                                {/* 10) 센터 주소 */}
                                <div className="signup-field">
                                    <label className="signup-label">
                                        센터 주소 <span className="signup-required">*</span>
                                    </label>
                                    {/* Row 1: 우편번호 & 버튼 */}
                                    <div className="admin-zip-row">
                                        <input
                                            type="text"
                                            placeholder="우편번호"
                                            className="signup-input admin-zip-input"
                                            value={adminSignupForm.zonecode}
                                            onChange={(e) => setAdminSignupForm((prev) => ({ ...prev, zonecode: e.target.value }))}
                                            readOnly
                                            style={{ width: 120, flexShrink: 0 }}
                                        />
                                        <button
                                            type="button"
                                            className="h-12 px-4 rounded-xl text-xs font-bold text-[#7C3AED] bg-[#F5F3FF] border border-[#DDD6FE] hover:bg-[#EDE9FE] transition-colors cursor-pointer whitespace-nowrap signup-side-btn admin-zip-btn"
                                            onClick={handleOpenPostcode}
                                        >
                                            우편번호 찾기
                                        </button>
                                    </div>
                                    {/* Row 2: 기본주소 */}
                                    <input
                                        type="text"
                                        placeholder="기본주소"
                                        className="signup-input"
                                        style={{ marginBottom: 8 }}
                                        value={adminSignupForm.address}
                                        onChange={(e) => setAdminSignupForm((prev) => ({ ...prev, address: e.target.value }))}
                                        required
                                    />
                                    {/* Row 3: 상세주소 */}
                                    <input
                                        type="text"
                                        placeholder="상세주소 (동·호수 입력)"
                                        className="signup-input"
                                        value={adminSignupForm.detailAddress}
                                        onChange={(e) => setAdminSignupForm((prev) => ({ ...prev, detailAddress: e.target.value }))}
                                    />
                                </div>

                                {/* Bottom Info & Submit Button */}
                                <div style={{ paddingTop: 8 }}>
                                    <div className="admin-submit-notice">
                                        <svg className="w-3.5 h-3.5 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>사업자 정보 확인 후 영업일 기준 1~2일 내 승인됩니다.</span>
                                    </div>

                                    <button
                                        type="submit"
                                        className="signup-submit-btn"
                                        disabled={!isAdminFormValid}
                                    >
                                        <span>센터 관리자 가입 신청하기</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 16 16" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.33334 8H12.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                            <path d="M8 3.33334L12.6667 8L8 12.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Bottom Switch Link */}
                                <div className="text-center mt-5 signup-bottom-switch">
                                    <p className="text-xs text-[#71717A] inline-flex items-center justify-center gap-1.5" style={{ fontSize: 12, color: '#71717A' }}>
                                        이미 파트너 센터 계정이 있으신가요?
                                        <button
                                            type="button"
                                            onClick={handleGoToAdminLogin}
                                            className="text-[#7C3AED] font-bold underline underline-offset-2 hover:text-[#6D28D9] transition-colors cursor-pointer bg-transparent border-none p-0 inline ml-1.5"
                                            style={{ fontSize: 12, color: '#7C3AED', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', marginLeft: 6 }}
                                        >
                                            관리자 로그인
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View 5: Center Admin Sign-Up Completed Screen (Phase 2) */}
                {viewMode === 'admin_signup_completed' && (
                    <div className="admin-completed-wrapper">
                        <div className="admin-completed-card">
                            {/* Success Emblem */}
                            <div className="admin-completed-badge-wrap">
                                <div className="admin-completed-badge-icon">
                                    <svg className="w-8 h-8 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
                                    </svg>
                                </div>
                                <div className="admin-completed-check-sub">
                                    <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Headline & Subtitle */}
                            <h1 className="admin-completed-title">
                                센터 관리자 가입 신청이 완료되었습니다
                            </h1>
                            <p className="admin-completed-desc">
                                파트너 센터 입점을 환영합니다.<br />
                                원활한 서비스 제공을 위해 사업자 인증 심사가 진행됩니다.
                            </p>

                            {/* Application Summary Box */}
                            <div className="admin-summary-box">
                                <div className="admin-summary-header">
                                    <div className="admin-summary-header-left">
                                        <svg className="w-3.5 h-3.5 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                        </svg>
                                        <span>신청 접수 정보</span>
                                    </div>
                                    <span className="admin-summary-pill">
                                        <svg className="w-3 h-3 text-[#7C3AED] stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="12" height="12">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        심사 대기중
                                    </span>
                                </div>
                                <div className="admin-summary-body">
                                    <div className="admin-summary-row">
                                        <span className="admin-summary-label">센터(상호명)</span>
                                        <span className="admin-summary-value admin-summary-value--bold">{registeredAdmin.centerName || '아울핏 스튜디오'}</span>
                                    </div>
                                    <div className="admin-summary-row">
                                        <span className="admin-summary-label">신청 관리자</span>
                                        <span className="admin-summary-value">{registeredAdmin.adminName || '관리자'} ({registeredAdmin.adminEmail || 'admin@studio.com'})</span>
                                    </div>
                                    <div className="admin-summary-row">
                                        <span className="admin-summary-label">사업자등록번호</span>
                                        <span className="admin-summary-value">{registeredAdmin.bizNumber || '000-00-00000'}</span>
                                    </div>
                                    <div className="admin-summary-row">
                                        <span className="admin-summary-label">접수 일시</span>
                                        <span className="admin-summary-value">{registeredAdmin.submittedAt || formatDateTime(new Date())}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Review Process & Next Steps Notice Box */}
                            <div className="admin-notice-box">
                                <div className="admin-notice-header">
                                    <div className="admin-notice-header-left">
                                        <svg className="w-3.5 h-3.5 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                        </svg>
                                        <span>이후 진행 절차 안내</span>
                                    </div>
                                    <span className="admin-notice-badge-time">영업일 1~2일 소요</span>
                                </div>
                                <div className="admin-notice-steps">
                                    <div className="admin-notice-step-item">
                                        <span className="admin-step-num">1</span>
                                        <div className="admin-step-content">
                                            <span className="admin-step-title">서류 검토 및 승인 심사</span>
                                            <p className="admin-step-desc">담당자 확인 및 제출하신 사업자등록증 검토가 진행됩니다.</p>
                                        </div>
                                    </div>
                                    <div className="admin-notice-step-item">
                                        <span className="admin-step-num">2</span>
                                        <div className="admin-step-content">
                                            <span className="admin-step-title">결과 안내 및 로그인 활성화</span>
                                            <p className="admin-step-desc">승인 완료 시 등록 관리자 이메일과 알림톡으로 접속 정보가 발송됩니다.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Action Button */}
                            <button
                                type="button"
                                className="admin-completed-btn"
                                onClick={handleGoToLoginFromAdminCompleted}
                            >
                                <span>관리자 로그인 화면으로 이동</span>
                                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 16 16" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.33334 8H12.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                    <path d="M8 3.33334L12.6667 8L8 12.6667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                                </svg>
                            </button>

                            {/* Secondary Support Link */}
                            <p className="admin-completed-footer-text">
                                급한 문의나 서류 보완이 필요하신가요? <span style={{ color: '#71717A', fontWeight: 600 }}>고객센터 1588-0000</span>
                            </p>
                        </div>
                    </div>
                )}
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