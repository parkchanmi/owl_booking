import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { fetchCenters } from '../api/centerApi';
import Sidebar from './Sidebar';
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

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false);
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
                    {/* ── Sidebar (공통 사이드바 컴포넌트) ── */}
                    <Sidebar
                        centers={centers}
                        selectedCenterId={selectedCenterId}
                        setSelectedCenterId={setSelectedCenterId}
                        isCollapsed={isCollapsed}
                        toggleSidebar={toggleSidebar}
                        handleLogout={handleLogout}
                    />

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
