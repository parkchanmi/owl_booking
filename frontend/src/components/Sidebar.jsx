import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { message, Tooltip } from 'antd';

export const ADMIN_NAV_ITEMS = [
    {
        id: 'dashboard',
        label: '대시보드',
        path: '/admin',
        checkActive: (path) => path === '/admin',
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect height="7" rx="2" width="7" x="3" y="3" />
                <rect height="7" rx="2" width="7" x="14" y="3" />
                <rect height="7" rx="2" width="7" x="14" y="14" />
                <rect height="7" rx="2" width="7" x="3" y="14" />
            </svg>
        ),
    },
    {
        id: 'center',
        label: '센터 관리',
        path: '/admin/center/list',
        checkActive: (path) => path.startsWith('/admin/center'),
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 21h18M3 7v14M21 7v14M6 21V10a2 2 0 012-2h8a2 2 0 012 2v11M9 11h2m-2 4h2m4-4h2m-2 4h2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 'member',
        label: '회원 관리',
        path: '/admin/member/list',
        checkActive: (path) => path.startsWith('/admin/member'),
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 'instructor',
        label: '강사 관리',
        path: '/admin/instructor/list',
        checkActive: (path) => path === '/admin/instructor/list' || (path.startsWith('/admin/instructor') && !path.includes('/attendance')),
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 'booking',
        label: '수업 스케줄',
        path: '/admin/booking',
        checkActive: (path) => path === '/admin/booking' || path.startsWith('/admin/class'),
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect height="18" rx="2" width="18" x="3" y="4" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" x2="16" y1="2" y2="6" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="8" x2="8" y1="2" y2="6" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="3" x2="21" y1="10" y2="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 'attendance',
        label: '출결 관리',
        path: '/admin/attendance',
        checkActive: (path) => path === '/admin/attendance' || path.startsWith('/admin/attendance') || path.startsWith('/admin/instructor/attendance'),
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16 11 18 13 22 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 'ticket',
        label: '이용권 관리',
        path: '/admin/ticket/list',
        checkActive: (path) => path.startsWith('/admin/ticket'),
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 'sales',
        label: '매출 관리',
        path: '/admin/sales',
        checkActive: (path) => path.startsWith('/admin/sales'),
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 'news',
        label: '소식 관리',
        path: null,
        onClick: () => message.info('소식 관리 CMS 페이지 준비 중입니다.'),
        checkActive: () => false,
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 'permission',
        label: '권한 설정',
        path: '/admin/permission',
        checkActive: (path) => path.startsWith('/admin/permission'),
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 'setting',
        label: '환경 설정',
        path: '/admin/setting',
        checkActive: (path) => path.startsWith('/admin/setting'),
        icon: (isActive) => (
            <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

const TOOLTIP_OVERLAY_STYLE = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.95)',
    boxShadow: '0 8px 24px -4px rgba(124, 58, 237, 0.18), 0 2px 6px rgba(0, 0, 0, 0.04)',
    borderRadius: '12px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#2D175E',
    whiteSpace: 'nowrap',
};

export const Sidebar = ({
    centers = [],
    selectedCenterId,
    setSelectedCenterId,
    isCollapsed = false,
    toggleSidebar,
    handleLogout,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
    const branchRef = useRef(null);

    // 지점명 계산
    const selectedCenter = useMemo(
        () => centers.find((c) => c.id === selectedCenterId) ?? centers[0] ?? null,
        [centers, selectedCenterId]
    );
    const branchFullName = selectedCenter?.name || '강남 시그니처점';
    const branchInitial = branchFullName.slice(0, 1);

    // 외부 클릭 시 센터 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (branchRef.current && !branchRef.current.contains(e.target)) {
                setIsBranchMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 네비게이션 아이템 클래스
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

    return (
        <aside
            className={`relative m-4 rounded-2xl border-0 flex flex-col shrink-0 h-[calc(100vh-6rem)] z-40 transition-all duration-300 ${
                isCollapsed ? 'w-20 py-4 px-2 items-center' : 'w-[240px] p-4'
            }`}
            style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.07)',
            }}
        >
            {/* ========================================================= */}
            {/* 1. Header (상단 센터 영역): flex-shrink-0 (높이 고정)     */}
            {/* ========================================================= */}
            <div className="relative flex-shrink-0 w-full mb-3 px-0" ref={branchRef}>
                {isCollapsed ? (
                    <div className="group relative flex justify-center items-center w-full px-0">
                        <Tooltip
                            title={!isBranchMenuOpen ? branchFullName : ''}
                            color="rgba(255, 255, 255, 0.95)"
                            overlayInnerStyle={TOOLTIP_OVERLAY_STYLE}
                            placement="right"
                            mouseEnterDelay={0.1}
                            overlayClassName="sidebar-tooltip-overlay"
                        >
                            <button
                                type="button"
                                aria-label="센터 선택"
                                onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                                className="w-10 h-10 mx-auto bg-transparent border-0 flex items-center justify-center p-0 cursor-pointer transition outline-none focus:outline-none focus:ring-0 active:outline-none ring-0 shadow-none"
                            >
                                <span className="w-9 h-9 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-bold text-xs flex items-center justify-center shadow-sm">
                                    {branchInitial}
                                </span>
                            </button>
                        </Tooltip>
                    </div>
                ) : (
                    <button
                        type="button"
                        aria-label="센터 선택"
                        onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                        className="w-full bg-transparent border-0 px-2 py-1.5 flex items-center justify-between text-left transition group cursor-pointer outline-none focus:outline-none focus:ring-0 active:outline-none ring-0 shadow-none"
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
                                        setSelectedCenterId?.(c.id);
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

            {/* ========================================================= */}
            {/* 2. Middle (중간 메뉴 영역): flex-1 min-h-0 overflow-y-auto */}
            {/* ========================================================= */}
            <nav
                className={`w-full flex-1 min-h-0 overflow-y-auto space-y-1 ${
                    isCollapsed
                        ? 'scrollbar-none flex flex-col items-center px-0'
                        : 'sidebar-scroll pr-1'
                }`}
            >
                {!isCollapsed && (
                    <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-2 px-3">
                        WORKSPACE
                    </div>
                )}

                {ADMIN_NAV_ITEMS.map((item) => {
                    const isActive = item.checkActive ? item.checkActive(currentPath) : false;

                    const handleClick = () => {
                        if (item.onClick) {
                            item.onClick();
                        } else if (item.path) {
                            navigate(item.path);
                        }
                    };

                    return (
                        <div key={item.id} className="group relative flex justify-center items-center w-full px-0">
                            <Tooltip
                                title={isCollapsed ? item.label : ''}
                                color="rgba(255, 255, 255, 0.95)"
                                overlayInnerStyle={TOOLTIP_OVERLAY_STYLE}
                                placement="right"
                                mouseEnterDelay={0.1}
                                overlayClassName="sidebar-tooltip-overlay"
                            >
                                <button
                                    type="button"
                                    aria-label={item.label}
                                    onClick={handleClick}
                                    className={getNavItemClass(isActive)}
                                >
                                    {item.icon(isActive)}
                                    {!isCollapsed && <span>{item.label}</span>}
                                </button>
                            </Tooltip>
                        </div>
                    );
                })}
            </nav>

            {/* ========================================================= */}
            {/* 3. Footer (하단 푸터 영역): flex-shrink-0 mt-auto (바닥 고정) */}
            {/* ========================================================= */}
            <div className="flex-shrink-0 mt-auto pt-3 border-t border-slate-100/80 space-y-1 w-full flex flex-col items-center px-0">
                {/* 사이드바 접기/펼치기 토글 버튼 */}
                <div className="group relative flex justify-center items-center w-full px-0">
                    <Tooltip
                        title={isCollapsed ? '사이드바 펼치기' : ''}
                        color="rgba(255, 255, 255, 0.95)"
                        overlayInnerStyle={TOOLTIP_OVERLAY_STYLE}
                        placement="right"
                        mouseEnterDelay={0.1}
                        overlayClassName="sidebar-tooltip-overlay"
                    >
                        <button
                            type="button"
                            aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
                            onClick={toggleSidebar}
                            className={`text-slate-500 hover:text-slate-800 transition cursor-pointer border-0 bg-transparent flex items-center outline-none focus:outline-none focus:ring-0 active:outline-none ring-0 shadow-none ${
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
                    </Tooltip>
                </div>

                {/* 로그아웃 버튼 */}
                <div className="group relative flex justify-center items-center w-full px-0">
                    <Tooltip
                        title={isCollapsed ? '로그아웃' : ''}
                        color="rgba(255, 255, 255, 0.95)"
                        overlayInnerStyle={TOOLTIP_OVERLAY_STYLE}
                        placement="right"
                        mouseEnterDelay={0.1}
                        overlayClassName="sidebar-tooltip-overlay"
                    >
                        <button
                            type="button"
                            aria-label="로그아웃"
                            onClick={handleLogout}
                            className={`text-slate-500 hover:text-rose-600 transition cursor-pointer border-0 bg-transparent flex items-center outline-none focus:outline-none focus:ring-0 active:outline-none ring-0 shadow-none ${
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
                    </Tooltip>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

