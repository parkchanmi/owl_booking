import React, { useMemo, useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

// 기본 센터 목록
export const DEFAULT_CENTERS = [
    {
        id: 1,
        name: '강남 시그니처점',
        addr: '서울 강남구 테헤란로 123',
        phone: '02-1234-5678',
        hours: '평일 06:00 - 23:00 / 주말 09:00 - 18:00',
        facility: '샤워실 완비 · 무료 주차 2시간 · 개별 락커',
    },
    {
        id: 2,
        name: '서초역점',
        addr: '서울 서초구 서초대로 250',
        phone: '02-581-2244',
        hours: '평일 06:00 - 23:00 / 주말 09:00 - 18:00',
        facility: '샤워실 완비 · 무료 주차 1시간 30분 · 기구 필라테스 특화',
    },
    {
        id: 3,
        name: '역삼 테헤란점',
        addr: '서울 강남구 테헤란로 208',
        phone: '02-555-8890',
        hours: '평일 06:30 - 22:30 / 주말 10:00 - 18:00',
        facility: '샤워실 완비 · 발렛 주차 지원 · 1:1 PT 전용 프라이빗 룸',
    },
];

// 알림 항목 인터페이스
export interface NotificationItem {
    id: string | number;
    type?: 'urgent' | 'confirm' | 'event' | string;
    title: string;
    desc?: string;
    content?: string;
    time: string;
}

// 단일 공통 알림 목업 데이터
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 1,
        type: 'urgent',
        title: '[긴급] 금일 스튜디오A 시설 점검 안내',
        desc: '오늘 14:00~15:00 스튜디오A 냉난방 장치 긴급 점검이 진행됩니다.',
        time: '15분 전',
    },
    {
        id: 2,
        type: 'confirm',
        title: '수업 예약 확정 안내',
        desc: '오늘 09:00 [Power Vinyasa Yoga] 수업 예약이 정상적으로 확정되었습니다.',
        time: '1시간 전',
    },
    {
        id: 3,
        type: 'event',
        title: '[이벤트] 친구 초대 리워드 안내',
        desc: '친구 추천 시 2회 무료 추가 증정 혜택이 적용됩니다.',
        time: '어제',
    },
];

export interface HeaderProps {
    selectedCenterId?: number;
    onSelectCenterId?: (id: number) => void;
    notifications?: NotificationItem[];
    onClearNotifications?: () => void;
    onDeleteNotification?: (id: string | number) => void;
    onLogout?: () => void;
    onNavigateSettings?: () => void;
    userName?: string;
    userGrade?: string;
    userInitials?: string;
}

const Header: React.FC<HeaderProps> = ({
    selectedCenterId = 1,
    onSelectCenterId,
    notifications,
    onClearNotifications,
    onDeleteNotification,
    onLogout,
    onNavigateSettings,
    userName = 'Kim Ji-woo',
    userGrade = '일반 회원',
    userInitials = 'JW',
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 드롭다운 열림 상태
    const [branchOpen, setBranchOpen] = useState(false);
    const [notiOpen, setNotiOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // 드롭다운 외부 클릭 감지용 Ref
    const branchRef = useRef<HTMLDivElement>(null);
    const notiRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // 알림 리스트 상태 (INITIAL_NOTIFICATIONS 초기화)
    const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(
        notifications && notifications.length > 0 ? notifications : INITIAL_NOTIFICATIONS
    );

    useEffect(() => {
        if (notifications !== undefined) {
            setNotificationsList(notifications);
        }
    }, [notifications]);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
                setBranchOpen(false);
            }
            if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
                setNotiOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 개별 알림 삭제 핸들러
    const handleDeleteNotification = (id: string | number) => {
        setNotificationsList((prev) => prev.filter((n) => n.id !== id));
        if (onDeleteNotification) {
            onDeleteNotification(id);
        }
    };

    // 전체 삭제 핸들러
    const handleClearAll = () => {
        setNotificationsList([]);
        if (onClearNotifications) {
            onClearNotifications();
        }
    };

    // 현재 활성화된 메인 메뉴 감지
    const isMypage = location.pathname === '/mypage' || location.pathname.startsWith('/user/mypage');
    const isReservation = !isMypage;

    // 선택된 센터 객체
    const selectedCenter = useMemo(
        () => DEFAULT_CENTERS.find((c) => c.id === selectedCenterId) ?? DEFAULT_CENTERS[0],
        [selectedCenterId]
    );

    // 로그아웃 핸들러
    const handleLogout = async () => {
        setProfileOpen(false);
        if (onLogout) {
            onLogout();
            return;
        }
        try {
            await fetch('/api/member/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            message.success('로그아웃되었습니다.');
            navigate('/login', { replace: true });
        }
    };

    return (
        <header className="floating-pill-header-wrapper">
            <nav className="floating-pill-header-bar">
                {/* ==================================================== */}
                {/* Left Group: Brand Logo & Navigation Menu */}
                {/* ==================================================== */}
                <div className="header-left-group">
                    {/* Brand Emblem Button */}
                    <button
                        type="button"
                        className="header-brand-group"
                        onClick={() => navigate('/reservation')}
                        title="OwlFit 메인으로 이동"
                    >
                        <div className="header-brand-emblem">
                            <svg fill="none" height="18" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="18">
                                <path d="M5 4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V4" />
                                <line x1="5" y1="11" x2="19" y2="11" />
                                <circle cx="9" cy="7.5" fill="white" r="1.5" />
                                <circle cx="15" cy="7.5" fill="white" r="1.5" />
                                <path d="M12 9.5v2" />
                            </svg>
                        </div>
                        <div className="header-brand-title">
                            OwlFit
                            <span className="header-brand-dot" />
                        </div>
                    </button>

                    {/* Vertical Divider */}
                    <div className="header-vertical-divider" />

                    {/* Navigation Tabs: "수업 예약" & "마이페이지" */}
                    <div className="header-nav-tabs">
                        <button
                            type="button"
                            className={`header-nav-tab ${isReservation ? 'is-active' : ''}`}
                            onClick={() => navigate('/reservation')}
                        >
                            수업 예약
                        </button>
                        <button
                            type="button"
                            className={`header-nav-tab ${isMypage ? 'is-active' : ''}`}
                            onClick={() => navigate('/mypage')}
                        >
                            마이페이지
                        </button>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* Right Group: Branch, Bell, Profile */}
                {/* ==================================================== */}
                <div className="header-right-group">
                    {/* 1) Branch Selector Pill Button & Dropdown */}
                    <div className="relative" ref={branchRef} style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => setBranchOpen(!branchOpen)}
                            className="header-branch-pill-btn"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{selectedCenter.name}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {/* Branch Dropdown Popover */}
                        {branchOpen && (
                            <div
                                className="branch-dropdown-wrapper"
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 48,
                                    width: 310,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 20,
                                    boxShadow: '0 20px 40px -8px rgba(91, 59, 168, 0.16), 0 0 1px rgba(0,0,0,0.1)',
                                    border: '1px solid #F1F0F7',
                                    padding: 16,
                                    zIndex: 60,
                                }}
                            >
                                <div className="branch-dropdown-title">대표 지점 선택</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {DEFAULT_CENTERS.map((c) => {
                                        const isSelected = c.id === selectedCenterId;
                                        return (
                                            <div
                                                key={`branch-${c.id}`}
                                                onClick={() => {
                                                    if (onSelectCenterId) onSelectCenterId(c.id);
                                                    message.success(`대표 지점이 [${c.name}]으로 변경되었습니다.`);
                                                    setBranchOpen(false);
                                                }}
                                                className={`branch-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                                            >
                                                <span>{c.name}</span>
                                                {isSelected && (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ height: 1, backgroundColor: '#F4F1FC', margin: '12px 0' }} />

                                {/* Selected Center Info Card */}
                                <div className="branch-info-box">
                                    <div className="branch-info-header">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B3BA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="16" x2="12" y2="12" />
                                            <line x1="12" y1="8" x2="12.01" y2="8" />
                                        </svg>
                                        <span>선택된 센터 정보</span>
                                    </div>
                                    <div className="branch-info-row">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="branch-info-icon">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <span>{selectedCenter.addr}</span>
                                    </div>
                                    <div className="branch-info-row">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="branch-info-icon">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span>{selectedCenter.hours}</span>
                                    </div>
                                    <div className="branch-info-row">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="branch-info-icon">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <span>{selectedCenter.phone}</span>
                                    </div>
                                    <div className="branch-info-row">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="branch-info-icon">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        <span>{selectedCenter.facility}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2) Notification Bell Button & Popover */}
                    <div className="relative" ref={notiRef} style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => setNotiOpen(!notiOpen)}
                            className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#71717A] hover:text-[#7C3AED] hover:bg-[#F5F3FF] transition-all cursor-pointer header-bell-btn group"
                            aria-label="알림"
                            style={{
                                position: 'relative',
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#71717A',
                                outline: 'none',
                                padding: 0,
                            }}
                        >
                            {/* Exact Requested Bell SVG */}
                            <svg
                                className="w-5 h-5 stroke-[1.8] text-[#71717A] group-hover:text-[#7C3AED] header-bell-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ width: 18, height: 18, strokeWidth: 1.8, display: 'block' }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                                />
                            </svg>

                            {/* Red Unread Indicator Dot */}
                            {notificationsList.length > 0 && (
                                <span
                                    className="w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white absolute top-1.5 right-1.5"
                                    style={{
                                        position: 'absolute',
                                        top: 6,
                                        right: 6,
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: '#EF4444',
                                        boxShadow: '0 0 0 2px #FFFFFF',
                                    }}
                                />
                            )}
                        </button>

                        {/* Notification Popover Container */}
                        {notiOpen && (
                            <div
                                className="absolute right-0 top-12 w-[340px] bg-white rounded-2xl shadow-xl border border-[#F1F0F7] p-4 z-50 noti-popover-card"
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 48,
                                    width: 340,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 16,
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #F1F0F7',
                                    padding: 16,
                                    zIndex: 60,
                                    boxSizing: 'border-box',
                                }}
                            >
                                {/* Popover Header */}
                                <div className="noti-popover-header">
                                    <div className="noti-popover-title-group">
                                        <span className="noti-popover-title">알림</span>
                                        {notificationsList.length > 0 && (
                                            <span className="noti-popover-pill-badge">
                                                {notificationsList.length}
                                            </span>
                                        )}
                                    </div>
                                    {notificationsList.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearAll}
                                            className="noti-clear-all-btn"
                                        >
                                            전체 삭제
                                        </button>
                                    )}
                                </div>

                                {/* Popover Items List */}
                                <div className="noti-items-list">
                                    {notificationsList.length === 0 ? (
                                        <div className="noti-empty-state">
                                            새로운 알림이 없습니다
                                        </div>
                                    ) : (
                                        notificationsList.map((n) => (
                                            <div
                                                key={`noti-${n.id}`}
                                                className="relative group p-3.5 rounded-xl hover:bg-[#FAF9FE] transition-colors border-b border-[#F4F4F5] last:border-none flex gap-3 text-left noti-item-row"
                                                style={{
                                                    position: 'relative',
                                                    padding: '14px 12px',
                                                    borderRadius: 12,
                                                    borderBottom: '1px solid #F4F4F5',
                                                    display: 'flex',
                                                    gap: 12,
                                                    textAlign: 'left',
                                                    transition: 'background-color 0.15s ease',
                                                }}
                                            >
                                                {/* Category Icon */}
                                                <div
                                                    className={`noti-category-icon-box ${n.type === 'urgent' ? 'is-urgent' : n.type === 'confirm' ? 'is-confirm' : 'is-event'}`}
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        backgroundColor: n.type === 'urgent' ? '#FFEDD5' : '#EDE9FE',
                                                        color: n.type === 'urgent' ? '#EA580C' : '#7C3AED',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {n.type === 'urgent' ? (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <line x1="12" y1="8" x2="12" y2="12" />
                                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                                        </svg>
                                                    ) : n.type === 'confirm' ? (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Text Content */}
                                                <div className="noti-item-content-box" style={{ flex: 1, paddingRight: 24 }}>
                                                    <p
                                                        className="noti-item-title"
                                                        style={{
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            color: n.type === 'urgent' ? '#EA580C' : '#18181B',
                                                            margin: '0 0 3px 0',
                                                            lineHeight: 1.35,
                                                        }}
                                                    >
                                                        {n.title}
                                                    </p>
                                                    <p
                                                        className="noti-item-desc"
                                                        style={{
                                                            fontSize: 12,
                                                            color: '#374151',
                                                            lineHeight: 1.4,
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {n.desc || n.content}
                                                    </p>
                                                    <span
                                                        className="noti-item-time"
                                                        style={{
                                                            fontSize: 10,
                                                            color: '#A1A1AA',
                                                            marginTop: 4,
                                                            display: 'block',
                                                        }}
                                                    >
                                                        {n.time}
                                                    </span>
                                                </div>

                                                {/* Individual 'X' Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteNotification(n.id);
                                                    }}
                                                    aria-label="알림 삭제"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute top-3 right-3 w-5 h-5 rounded-md hover:bg-[#EDE9FE] flex items-center justify-center text-[#9CA3AF] hover:text-[#7C3AED] cursor-pointer noti-item-delete-btn"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        right: 12,
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: 6,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#9CA3AF',
                                                        transition: 'all 0.15s ease',
                                                        outline: 'none',
                                                    }}
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5 stroke-[2]"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        style={{ width: 14, height: 14, strokeWidth: 2 }}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3) User Profile Pill Button & Dropdown */}
                    <div className="relative" ref={profileRef} style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="header-profile-pill-btn"
                        >
                            <div className="header-profile-avatar">{userInitials}</div>
                            <span className="header-profile-name">{userName}</span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {/* Profile Dropdown Popover */}
                        {profileOpen && (
                            <div
                                className="profile-dropdown-wrapper"
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 48,
                                    width: 220,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 16,
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #F1F0F7',
                                    padding: 8,
                                    zIndex: 60,
                                    boxSizing: 'border-box',
                                }}
                            >
                                {/* Profile Info */}
                                <div className="profile-dropdown-header">
                                    <p className="profile-user-name">{userName}</p>
                                    <span className="profile-grade-badge">{userGrade}</span>
                                </div>

                                {/* ONLY 2 Items: "계정 설정" & "로그아웃" (NO divider line) */}
                                <div className="profile-menu-items">
                                    <button
                                        type="button"
                                        className="profile-menu-item-btn is-settings"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            if (onNavigateSettings) {
                                                onNavigateSettings();
                                            } else {
                                                navigate('/mypage?tab=settings');
                                            }
                                        }}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                        <span>계정 설정</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="profile-menu-item-btn is-logout"
                                        onClick={handleLogout}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        <span>로그아웃</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
