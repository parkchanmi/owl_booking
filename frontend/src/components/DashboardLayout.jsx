import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { fetchCenters } from '../api/centerApi';
import '../page/admin/index.css';

const DashboardLayoutContext = createContext(null);

export const useDashboardLayout = () => useContext(DashboardLayoutContext);

const DashboardLayoutFrame = ({ title, userLabel = '-', children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem('owl_sidebar_collapsed') === 'true';
        } catch {
            return false;
        }
    });
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
    const [layoutTitle, setLayoutTitle] = useState(title ?? 'Dashboard');

    // 사이드바 접힘 상태 동기화
    useEffect(() => {
        const handleSidebarSync = () => {
            try {
                const saved = localStorage.getItem('owl_sidebar_collapsed') === 'true';
                setIsCollapsed((curr) => (curr === saved ? curr : saved));
            } catch {}
        };
        window.addEventListener('owl_sidebar_toggle', handleSidebarSync);
        window.addEventListener('storage', handleSidebarSync);
        return () => {
            window.removeEventListener('owl_sidebar_toggle', handleSidebarSync);
            window.removeEventListener('storage', handleSidebarSync);
        };
    }, []);

    const toggleSidebar = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        try {
            localStorage.setItem('owl_sidebar_collapsed', next ? 'true' : 'false');
            setTimeout(() => {
                window.dispatchEvent(new Event('owl_sidebar_toggle'));
            }, 0);
        } catch {}
    };

    // 역할 분기 (RBAC: 'OWNER' | 'MANAGER' | 'INSTRUCTOR')
    const [currentRole, setCurrentRole] = useState('OWNER');

    const [centers, setCenters] = useState([]);
    const [selectedCenterId, setSelectedCenterId] = useState(null);
    const [loginUser, setLoginUser] = useState(null);

    const profileRef = useRef(null);
    const branchRef = useRef(null);

    // 활성 메뉴 감지
    const isDashboardActive = currentPath === '/admin';
    const isCenterActive = currentPath.startsWith('/admin/center');
    const isMemberActive = currentPath.startsWith('/admin/member');
    const isInstructorActive = currentPath === '/admin/instructor/list' || (currentPath.startsWith('/admin/instructor') && !currentPath.includes('/attendance'));
    const isBookingActive = currentPath === '/admin/booking' || currentPath.startsWith('/admin/class');
    const isAttendanceActive = currentPath === '/admin/attendance' || currentPath.startsWith('/admin/attendance') || currentPath.startsWith('/admin/instructor/attendance');
    const isTicketActive = currentPath.startsWith('/admin/ticket');
    const isSalesActive = currentPath.startsWith('/admin/sales');
    const isPermissionActive = currentPath.startsWith('/admin/permission');
    const isSettingActive = currentPath.startsWith('/admin/setting');

    // 사이드바 버튼 클래스 (접힘 상태 중앙 고정 규격 적용)
    const getNavItemClass = (isActive) => {
        if (isCollapsed) {
            return `w-10 h-10 mx-auto flex items-center justify-center rounded-2xl transition-all duration-200 border-0 outline-none cursor-pointer ${
                isActive
                    ? 'bg-[#EDE9FE] text-[#7C3AED] font-bold shadow-sm'
                    : 'text-slate-500 hover:bg-white/60 hover:text-[#7C3AED] bg-transparent'
            }`;
        }
        return `w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border-0 outline-none cursor-pointer ${
            isActive
                ? 'bg-[#EDE9FE] text-[#7C3AED] shadow-sm'
                : 'text-slate-600 hover:bg-white/40 hover:text-[#7C3AED] bg-transparent'
        }`;
    };

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
            if (branchRef.current && !branchRef.current.contains(e.target)) {
                setIsBranchMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 초기 센터 및 유저 로드
    useEffect(() => {
        fetchCenters()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setCenters(list);
                if (list.length > 0) setSelectedCenterId(list[0].id);
            })
            .catch(() => {});

        axios
            .get('/api/member/info')
            .then((res) => {
                setLoginUser(res.data);
            })
            .catch(() => {});
    }, []);

    const setTitleSafely = useCallback((newTitle) => {
        if (newTitle !== undefined) {
            setLayoutTitle((prev) => (prev === newTitle ? prev : newTitle));
        }
    }, []);

    useEffect(() => {
        if (title !== undefined) {
            setLayoutTitle((prev) => (prev === title ? prev : title));
        }
    }, [title]);

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

    const selectedCenter = useMemo(
        () => centers.find((c) => c.id === selectedCenterId) ?? centers[0] ?? null,
        [centers, selectedCenterId]
    );

    const branchInitial = (selectedCenter?.name || '강남 시그니처점').slice(0, 1);
    const branchFullName = selectedCenter?.name || '강남 시그니처점';
    const userDisplayName = loginUser?.name || '김대표';
    const userInitial = userDisplayName.slice(0, 1);

    const contextValue = useMemo(
        () => ({
            setTitle: setTitleSafely,
            currentRole,
            setCurrentRole,
            selectedCenterId,
            setSelectedCenterId,
            centers,
            loginUser,
        }),
        [setTitleSafely, currentRole, selectedCenterId, centers, loginUser]
    );

    const handleMainScroll = (e) => {
        const scrollTop = e.currentTarget.scrollTop;
        setIsScrolled(scrollTop > 10);
    };

    // /admin 경로일 때도 하위 컴포넌트에게 context를 제공하기 위함
    if (location.pathname === '/admin') {
        return (
            <DashboardLayoutContext.Provider value={contextValue}>
                {children ?? <Outlet />}
            </DashboardLayoutContext.Provider>
        );
    }

    return (
        <DashboardLayoutContext.Provider value={contextValue}>
            <div
                className="h-screen overflow-hidden flex flex-col font-sans antialiased text-slate-800 selection:bg-[#EDE9FE] selection:text-[#7C3AED]"
                style={{
                    background:
                        'radial-gradient(circle at 85% 5%, rgba(221, 214, 254, 0.7), transparent 45%), radial-gradient(circle at 10% 85%, rgba(237, 233, 254, 0.55), transparent 40%), radial-gradient(circle at 50% 50%, rgba(245, 243, 255, 0.4), transparent 60%), #FAF9FD',
                }}
            >
                {/* ==================================================== */}
                {/* 1. TopHeader (GNB - 스크롤 반응 글래스모피즘 서피스) */}
                {/* ==================================================== */}
                <header
                    className={`h-16 w-full px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-300 ${
                        isScrolled
                            ? 'bg-white/80 backdrop-blur-md border-b border-black/[0.04] shadow-sm'
                            : 'bg-transparent border-b border-transparent shadow-none'
                    }`}
                >
                    {/* Brand Logo & Name */}
                    <div
                        className="flex items-center gap-3 cursor-pointer select-none"
                        onClick={() => navigate('/admin')}
                        title="OwlFit 어드민 홈"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B3BA8] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-violet-200">
                            <svg fill="none" height="18" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="18">
                                <path d="M5 4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V4" />
                                <line x1="5" y1="11" x2="19" y2="11" />
                                <circle cx="9" cy="7.5" fill="white" r="1.5" />
                                <circle cx="15" cy="7.5" fill="white" r="1.5" />
                                <path d="M12 9.5v2" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-[19px] font-extrabold tracking-tight text-[#18181B] flex items-baseline gap-1">
                                OwlFit
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] inline-block mb-0.5" />
                            </span>
                            <span className="bg-[#F5F3FF] text-[#7C3AED] px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ml-1">
                                관리자 센터
                            </span>
                        </div>
                    </div>

                    {/* Header Utilities: 알림, 설정, 프로필 */}
                    <div className="flex items-center gap-3">

                        {/* 알림 버튼 */}
                        <button
                            type="button"
                            aria-label="알림"
                            onClick={() => message.info('새로운 운영 알림이 없습니다.')}
                            className="relative w-9 h-9 rounded-full bg-white/50 backdrop-blur-md hover:bg-white/90 flex items-center justify-center text-slate-600 hover:text-[#7C3AED] transition-all cursor-pointer border-0 shadow-none outline-none"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#7C3AED]" />
                        </button>

                        {/* 환경설정 버튼 */}
                        <button
                            type="button"
                            aria-label="설정"
                            onClick={() => navigate('/admin/setting')}
                            className="w-9 h-9 rounded-full bg-white/50 backdrop-blur-md hover:bg-white/90 flex items-center justify-center text-slate-600 hover:text-[#7C3AED] transition-all cursor-pointer border-0 shadow-none outline-none"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {/* 프로필 확장 팝업 */}
                        <div className="relative" ref={profileRef}>
                            <div
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white/90 transition-all cursor-pointer border-0 shadow-sm group select-none"
                            >
                                <div className="w-7 h-7 rounded-full bg-[#7C3AED] text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                                    {userInitial}
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[13px] font-bold text-slate-900 leading-tight">
                                        {userDisplayName}
                                    </span>
                                    <span className="text-[10px] font-semibold text-[#7C3AED] leading-none">
                                        {currentRole === 'OWNER' ? '총괄 관리자' : currentRole === 'MANAGER' ? '매니저' : '강사'}
                                    </span>
                                </div>
                                <svg
                                    className={`w-3.5 h-3.5 text-[#7C3AED] transition-transform duration-200 stroke-2 shrink-0 ${
                                        isProfileOpen ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            {isProfileOpen && (
                                <div className="absolute top-[calc(100%+8px)] right-0 z-50 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_12px_36px_rgba(124,58,237,0.14)] p-2 min-w-[170px] space-y-1 animate-in fade-in zoom-in-95 duration-150">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            navigate('/admin/member/list');
                                        }}
                                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] transition-colors cursor-pointer text-left border-0 bg-transparent"
                                    >
                                        <svg className="w-4 h-4 stroke-[1.8] text-slate-400 group-hover:text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>내 프로필</span>
                                    </button>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left border-0 bg-transparent"
                                    >
                                        <svg className="w-4 h-4 stroke-[1.8] text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>로그아웃</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ==================================================== */}
                {/* 2. Main Outer Container: 사이드바 + 메인 본문 독립 스크롤 */}
                {/* ==================================================== */}
                <div className="flex-1 flex w-full overflow-hidden">
                    {/* ── Sidebar ── */}
                    <aside
                        className={`relative m-4 rounded-2xl border-0 flex flex-col shrink-0 h-[calc(100vh-6rem)] z-40 transition-all duration-300 ${
                            isCollapsed ? 'w-[76px] py-4 px-2 items-center overflow-visible' : 'w-[240px] p-4 overflow-hidden'
                        }`}
                        style={{
                            background: 'rgba(255, 255, 255, 0.75)',
                            backdropFilter: 'blur(24px) saturate(160%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                            boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.07)',
                        }}
                    >
                        {/* 1. Header (고정): 지점 셀렉터 */}
                        <div className="relative flex-shrink-0 w-full mb-3 px-0" ref={branchRef}>
                            {isCollapsed ? (
                                <div className="group relative flex justify-center items-center w-full px-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                                        className="w-10 h-10 mx-auto bg-transparent border-0 flex items-center justify-center p-0 cursor-pointer transition outline-none"
                                    >
                                        <span className="w-9 h-9 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-bold text-xs flex items-center justify-center shadow-sm">
                                            {branchInitial}
                                        </span>
                                    </button>
                                    <div className="sidebar-tooltip">{branchFullName}</div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                                    className="w-full bg-transparent border-0 px-2 py-1.5 flex items-center justify-between text-left transition group cursor-pointer outline-none"
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        <span className="w-7 h-7 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-bold text-xs flex items-center justify-center shrink-0">
                                            {branchInitial}
                                        </span>
                                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors truncate">
                                            {branchFullName}
                                        </span>
                                    </div>
                                    <svg
                                        className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#7C3AED] transition-transform duration-200 shrink-0 ${
                                            isBranchMenuOpen ? 'rotate-180 text-[#7C3AED]' : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            )}

                            {/* 지점 선택 팝오버 드롭다운 */}
                            {isBranchMenuOpen && (
                                <div
                                    className={`absolute z-50 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_12px_36px_rgba(124,58,237,0.18)] p-2 min-w-[200px] space-y-1 ${
                                        isCollapsed ? 'left-[calc(100%+14px)] top-0' : 'left-0 top-[calc(100%+6px)]'
                                    }`}
                                >
                                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 tracking-wider">
                                        센터 선택
                                    </div>
                                    {centers.map((c) => {
                                        const isSelected = c.id === selectedCenterId;
                                        return (
                                            <button
                                                key={`branch-opt-${c.id}`}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCenterId(c.id);
                                                    setIsBranchMenuOpen(false);
                                                    message.success(`[${c.name}] 센터가 선택되었습니다.`);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left border-0 ${
                                                    isSelected
                                                        ? 'bg-[#EDE9FE] text-[#7C3AED]'
                                                        : 'text-slate-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED]'
                                                }`}
                                            >
                                                <span>{c.name}</span>
                                                {isSelected && (
                                                    <svg className="w-3.5 h-3.5 text-[#7C3AED] stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 2. Middle (독립 스크롤): Workspace Navigation */}
                        <nav
                            className={`w-full ${
                                isCollapsed
                                    ? 'flex-1 min-h-0 flex flex-col items-center space-y-1.5 overflow-visible px-0'
                                    : 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scroll space-y-1 pr-1'
                            }`}
                        >
                            {!isCollapsed && (
                                <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-2 px-3">
                                    WORKSPACE
                                </div>
                            )}

                            {/* 1. 대시보드 */}
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="대시보드"
                                    onClick={() => navigate('/admin')}
                                    className={getNavItemClass(isDashboardActive)}
                                >
                                    <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isDashboardActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect height="7" rx="2" width="7" x="3" y="3" />
                                        <rect height="7" rx="2" width="7" x="14" y="3" />
                                        <rect height="7" rx="2" width="7" x="14" y="14" />
                                        <rect height="7" rx="2" width="7" x="3" y="14" />
                                    </svg>
                                    {!isCollapsed && <span>대시보드</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">대시보드</div>}
                            </div>

                            {/* 2. 센터 관리 */}
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="센터 관리"
                                    onClick={() => navigate('/admin/center/list')}
                                    className={getNavItemClass(isCenterActive)}
                                >
                                    <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isCenterActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 21h18M3 7v14M21 7v14M6 21V10a2 2 0 012-2h8a2 2 0 012 2v11M9 11h2m-2 4h2m4-4h2m-2 4h2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {!isCollapsed && <span>센터 관리</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">센터 관리</div>}
                            </div>

                            {/* 3. 회원 관리 */}
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="회원 관리"
                                    onClick={() => navigate('/admin/member/list')}
                                    className={getNavItemClass(isMemberActive)}
                                >
                                    <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isMemberActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {!isCollapsed && <span>회원 관리</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">회원 관리</div>}
                            </div>

                            {/* 4. 강사 관리 */}
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="강사 관리"
                                    onClick={() => navigate('/admin/instructor/list')}
                                    className={getNavItemClass(isInstructorActive)}
                                >
                                    <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isInstructorActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {!isCollapsed && <span>강사 관리</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">강사 관리</div>}
                            </div>

                            {/* 5. 수업 스케줄 (1depth 독립 메뉴) */}
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="수업 스케줄"
                                    onClick={() => navigate('/admin/booking')}
                                    className={getNavItemClass(isBookingActive)}
                                >
                                    <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isBookingActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect height="18" rx="2" width="18" x="3" y="4" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="16" x2="16" y1="2" y2="6" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="8" x2="8" y1="2" y2="6" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="3" x2="21" y1="10" y2="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {!isCollapsed && <span>수업 스케줄</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">수업 스케줄</div>}
                            </div>

                            {/* 6. 출결 관리 (1depth 독립 메뉴) */}
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="출결 관리"
                                    onClick={() => navigate('/admin/attendance')}
                                    className={getNavItemClass(isAttendanceActive)}
                                >
                                    <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isAttendanceActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                                        <polyline points="16 11 18 13 22 9" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {!isCollapsed && <span>출결 관리</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">출결 관리</div>}
                            </div>

                            {/* 7. 이용권 관리 */}
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="이용권 관리"
                                    onClick={() => navigate('/admin/ticket/list')}
                                    className={getNavItemClass(isTicketActive)}
                                >
                                    <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isTicketActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {!isCollapsed && <span>이용권 관리</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">이용권 관리</div>}
                            </div>

                            {/* 8. 매출 관리 */}
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="매출 관리"
                                    onClick={() => navigate('/admin/sales')}
                                    className={getNavItemClass(isSalesActive)}
                                >
                                    <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isSalesActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {!isCollapsed && <span>매출 관리</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">매출 관리</div>}
                            </div>

                            {/* 9. 권한 설정 */}
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="권한 설정"
                                    onClick={() => navigate('/admin/permission')}
                                    className={getNavItemClass(isPermissionActive)}
                                >
                                    <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isPermissionActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {!isCollapsed && <span>권한 설정</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">권한 설정</div>}
                            </div>

                            {/* 10. 환경 설정 */}
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="환경 설정"
                                    onClick={() => navigate('/admin/setting')}
                                    className={getNavItemClass(isSettingActive)}
                                >
                                    <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isSettingActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {!isCollapsed && <span>환경 설정</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">환경 설정</div>}
                            </div>
                        </nav>

                        {/* 3. Footer (고정): 사이드바 접기/펼치기 토글 & 로그아웃 */}
                        <div className="flex-shrink-0 mt-auto pt-3 border-t border-slate-100/80 space-y-1 w-full flex flex-col items-center px-0">
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
                                    onClick={toggleSidebar}
                                    className={`text-slate-500 hover:text-slate-800 transition cursor-pointer border-0 bg-transparent flex items-center outline-none ${
                                        isCollapsed
                                            ? 'w-10 h-10 mx-auto rounded-2xl hover:bg-white/60 justify-center'
                                            : 'w-full text-xs font-semibold py-2 px-3 rounded-full hover:bg-white/40 gap-2.5'
                                    }`}
                                >
                                    <svg className="w-4 h-4 stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {isCollapsed ? (
                                            <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                        ) : (
                                            <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                                        )}
                                    </svg>
                                    {!isCollapsed && <span>사이드바 접기</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">사이드바 펼치기</div>}
                            </div>

                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    aria-label="로그아웃"
                                    onClick={handleLogout}
                                    className={`text-slate-500 hover:text-rose-600 transition cursor-pointer border-0 bg-transparent flex items-center outline-none ${
                                        isCollapsed
                                            ? 'w-10 h-10 mx-auto rounded-2xl hover:bg-rose-50 justify-center'
                                            : 'w-full text-xs font-semibold py-2 px-3 rounded-full hover:bg-rose-50 gap-2.5'
                                    }`}
                                >
                                    <svg className="w-4 h-4 stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {!isCollapsed && <span>로그아웃</span>}
                                </button>
                                {isCollapsed && <div className="sidebar-tooltip">로그아웃</div>}
                            </div>
                        </div>
                    </aside>

                    {/* ── Main Content Area (독립 스크롤) ── */}
                    <main
                        onScroll={handleMainScroll}
                        className="relative z-10 flex-1 p-6 md:p-8 h-[calc(100vh-4rem)] overflow-y-auto max-w-[1440px] custom-scrollbar"
                    >
                        {children ?? <Outlet />}
                    </main>
                </div>
            </div>
        </DashboardLayoutContext.Provider>
    );
};

export const DashboardLayout = ({ title, userLabel = '-', children }) => {
    const parentLayout = useContext(DashboardLayoutContext);

    useEffect(() => {
        if (parentLayout && title !== undefined) {
            parentLayout.setTitle(title);
        }
    }, [parentLayout, title]);

    if (parentLayout) {
        return children ?? <Outlet />;
    }

    return <DashboardLayoutFrame title={title} userLabel={userLabel}>{children}</DashboardLayoutFrame>;
};

export default DashboardLayout;
