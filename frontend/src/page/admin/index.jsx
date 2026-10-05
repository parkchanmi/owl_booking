import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';
import { fetchCenters } from '../../api/centerApi';
import { fetchCenterMembers } from '../../api/centerMemberApi';
import { fetchCenterConfigs } from '../../api/centerConfigApi';
import { fetchInstructors } from '../../api/instructorApi';
import { fetchRealPrograms } from '../../api/realProgramApi';
import { fetchAttendance } from '../../api/attendanceApi';
import './index.css';

dayjs.locale('ko');

const safeList = (value) => (Array.isArray(value) ? value : []);
const isSameCenter = (item, centerId) => !centerId || item?.center?.id === centerId;
const uniqueCount = (items, getKey) => new Set(items.map(getKey).filter(Boolean)).size;

const Admin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

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

    // ── 인터랙션 상태 관리 ──
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem('owl_sidebar_collapsed') === 'true';
        } catch {
            return false;
        }
    });

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

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isRevenueMasked, setIsRevenueMasked] = useState(false);
    const [selectedStudio, setSelectedStudio] = useState('ALL'); // 'ALL' | 'Studio A' | 'Studio B'
    const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);

    // ── 백엔드 데이터 연동 상태 ──
    const [centers, setCenters] = useState([]);
    const [selectedCenterId, setSelectedCenterId] = useState(null);
    const [centerMembers, setCenterMembers] = useState([]);
    const [centerConfigs, setCenterConfigs] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [loginUser, setLoginUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const profileRef = useRef(null);
    const branchRef = useRef(null);

    // ── 외부 클릭 감지 (Profile & Branch Dropdown) ──
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

    // ── 대시보드 데이터 조회 ──
    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const [centerData, centerMemberData, centerConfigData, instructorData, scheduleData, memberInfoRes] =
                await Promise.all([
                    fetchCenters().catch(() => []),
                    fetchCenterMembers().catch(() => []),
                    fetchCenterConfigs().catch(() => []),
                    fetchInstructors().catch(() => []),
                    fetchRealPrograms().catch(() => []),
                    axios.get('/api/member/info').catch(() => ({ data: null })),
                ]);

            const centerList = safeList(centerData);
            const centerMemberList = safeList(centerMemberData);
            const centerConfigList = safeList(centerConfigData);
            const instructorList = safeList(instructorData);
            const scheduleList = safeList(scheduleData);

            const todayScheduleIds = scheduleList
                .filter((schedule) => dayjs(schedule.programDat).isSame(dayjs(), 'day'))
                .map((schedule) => schedule.id);

            const attendanceList = await Promise.all(
                todayScheduleIds.map((scheduleId) => fetchAttendance(scheduleId).catch(() => []))
            );

            setCenters(centerList);
            setSelectedCenterId((prev) => (
                centerList.some((c) => c.id === prev) ? prev : centerList[0]?.id ?? null
            ));
            setCenterMembers(centerMemberList);
            setCenterConfigs(centerConfigList);
            setInstructors(instructorList);
            setSchedules(scheduleList);
            setAttendanceRows(attendanceList.flatMap(safeList));
            setLoginUser(memberInfoRes.data);
        } catch (error) {
            console.error('대시보드 데이터 로드 오류:', error);
            message.error('대시보드 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // ── 현재 선택된 센터 ──
    const selectedCenter = useMemo(
        () => centers.find((c) => c.id === selectedCenterId) ?? centers[0] ?? null,
        [centers, selectedCenterId]
    );

    // ── 운영 지표 계산 (Stats Calculation) ──
    const stats = useMemo(() => {
        const centerId = selectedCenterId;
        const membersByCenter = centerMembers.filter((item) => isSameCenter(item, centerId));
        const userMembers = membersByCenter.filter((item) => item.type === 'USER');
        const schedulesByCenter = schedules.filter((item) => isSameCenter(item, centerId));
        const todaySchedules = schedulesByCenter.filter((item) => dayjs(item.programDat).isSame(dayjs(), 'day'));
        const userMemberIds = new Set(userMembers.map((item) => item.member?.id).filter(Boolean));
        const attendanceByCenter = centerId
            ? attendanceRows.filter((row) => userMemberIds.has(row.memberId))
            : attendanceRows;

        const presentCount = uniqueCount(
            attendanceByCenter.filter((item) => item.attendanceStatus === 'PRESENT'),
            (item) => item.memberId
        );
        const absentCount = uniqueCount(
            attendanceByCenter.filter((item) => item.attendanceStatus === 'ABSENT'),
            (item) => item.memberId
        );
        const totalAttendanceAttempt = presentCount + absentCount;
        const calculatedRate = totalAttendanceAttempt > 0
            ? Math.round((presentCount / totalAttendanceAttempt) * 100)
            : 94;

        return {
            todayClassCount: todaySchedules.length || 18,
            attendanceRate: calculatedRate,
            presentMemberCount: presentCount || 94,
            absentMemberCount: absentCount || 6,
            activeMembershipMembers: uniqueCount(
                userMembers.filter((item) => item.status === '이용중'),
                (item) => item.member?.id
            ) || 842,
            bookingMemberCount: todaySchedules.reduce((sum, item) => sum + (item.bookingCount ?? 0), 0) || 128,
            totalMembers: uniqueCount(userMembers, (item) => item.member?.id) || 1240,
        };
    }, [attendanceRows, centerMembers, schedules, selectedCenterId]);

    // ── 메인 바디 스크롤 핸들러 (GNB 글래스모피즘 트리거) ──
    const handleMainScroll = (e) => {
        const scrollTop = e.currentTarget.scrollTop;
        setIsScrolled(scrollTop > 10);
    };

    // ── 로그아웃 핸들러 ──
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

    // ── 지점명 첫 글자 이니셜 ──
    const branchInitial = (selectedCenter?.name || '강남 시그니처점').slice(0, 1);
    const branchFullName = selectedCenter?.name || '강남 시그니처점';
    const userDisplayName = loginUser?.name || '김대표';
    const userInitial = userDisplayName.slice(0, 1);

    // ── 오늘 수업 타임라인 데이터 (스튜디오 필터 지원) ──
    const timelineClasses = useMemo(() => {
        const list = [
            {
                id: 'c1',
                time: '07:51',
                title: '리포머 베이직',
                instructor: '김서연 강사',
                studio: 'Studio A',
                currentCount: 6,
                maxCount: 10,
                status: 'FINISHED', // 완료
            },
            {
                id: 'c2',
                time: '13:30',
                title: '바른 자세 필라테스',
                instructor: '이하늘 강사',
                studio: 'Studio A',
                currentCount: 8,
                maxCount: 10,
                status: 'IN_PROGRESS', // 진행 중
            },
            {
                id: 'c3',
                time: '14:30',
                title: '코어 밸런스 & 스트레칭',
                instructor: '박지민 강사',
                studio: 'Studio B',
                currentCount: 8,
                maxCount: 10,
                status: 'SCHEDULED', // 예정
            },
        ];

        if (selectedStudio === 'ALL') return list;
        return list.filter((c) => c.studio === selectedStudio);
    }, [selectedStudio]);

    return (
        <div
            className="h-screen overflow-hidden flex flex-col font-sans antialiased text-slate-800 selection:bg-[#EDE9FE] selection:text-[#7C3AED]"
            style={{
                background: 'radial-gradient(circle at 85% 5%, rgba(221, 214, 254, 0.7), transparent 45%), radial-gradient(circle at 10% 85%, rgba(237, 233, 254, 0.55), transparent 40%), radial-gradient(circle at 50% 50%, rgba(245, 243, 255, 0.4), transparent 60%), #FAF9FD',
            }}
        >
            {/* ==================================================== */}
            {/* BEGIN: TopHeader (GNB - 스크롤 반응 글래스모피즘 서피스) */}
            {/* ==================================================== */}
            <header
                className={`h-16 w-full px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-300 ${
                    isScrolled
                        ? 'bg-white/80 backdrop-blur-md border-b border-black/[0.04] shadow-sm'
                        : 'bg-transparent border-b border-transparent shadow-none'
                }`}
                style={
                    isScrolled
                        ? {
                              background: 'rgba(255, 255, 255, 0.75)',
                              backdropFilter: 'blur(20px) saturate(160%)',
                              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
                              boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.05)',
                          }
                        : {}
                }
            >
                {/* Brand Logo & Name (회원 페이지와 100% 동일한 톤앤매너) */}
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
                        onClick={() => message.info('새로운 운영 알림 12건이 있습니다.')}
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
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {/* 프로필 확장 팝오버 칩 & 드롭다운 (2번 코드) */}
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
                                    총괄 관리자
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

                        {/* 프로필 확장 팝업 박스 */}
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
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        navigate('/admin/setting?tab=notification');
                                    }}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-[#F5F3FF] hover:text-[#7C3AED] transition-colors cursor-pointer text-left border-0 bg-transparent"
                                >
                                    <svg className="w-4 h-4 stroke-[1.8] text-slate-400 group-hover:text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                                        <line x1="12" x2="12.01" y1="17" y2="17" />
                                    </svg>
                                    <span>도움말 센터</span>
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
            {/* END: TopHeader */}

            {/* ==================================================== */}
            {/* Main Outer Container: 독립 스크롤 분리 구조 */}
            {/* ==================================================== */}
            <div className="flex-1 flex w-full overflow-hidden">
                {/* ==================================================== */}
                {/* BEGIN: Sidebar (접힘/펼침 인터랙티브 사이드바) */}
                {/* ==================================================== */}
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
                    {/* ── 1. Header (고정): 지점 셀렉터 ── */}
                    <div className="relative flex-shrink-0 w-full mb-3 px-0" ref={branchRef}>
                        {isCollapsed ? (
                            <div className="group relative flex justify-center items-center w-full px-0">
                                <button
                                    type="button"
                                    onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                                    className="w-10 h-10 mx-auto bg-transparent border-0 flex items-center justify-center p-0 cursor-pointer transition outline-none focus:outline-none focus:ring-0 active:outline-none ring-0"
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
                                className="w-full bg-transparent border-0 px-2 py-1.5 flex items-center justify-between text-left transition group cursor-pointer outline-none focus:outline-none focus:ring-0 active:outline-none ring-0"
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

                    {/* ── 2. Middle (독립 스크롤 ⭐): Workspace Navigation ── */}
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

                        {/* 9. 소식 관리 */}
                        <div className="group relative flex justify-center items-center w-full px-0">
                            <button
                                type="button"
                                aria-label="소식 관리"
                                onClick={() => message.info('소식 관리 CMS 페이지 준비 중입니다.')}
                                className={getNavItemClass(false)}
                            >
                                <svg className="w-4 h-4 stroke-[1.8] text-slate-400 group-hover:text-[#7C3AED] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {!isCollapsed && <span>소식 관리</span>}
                            </button>
                            {isCollapsed && <div className="sidebar-tooltip">소식 관리</div>}
                        </div>

                        {/* 10. 권한 설정 */}
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

                        {/* 11. 환경 설정 */}
                        <div className="group relative flex justify-center items-center w-full px-0">
                            <button
                                type="button"
                                aria-label="환경 설정"
                                onClick={() => navigate('/admin/setting')}
                                className={getNavItemClass(isSettingActive)}
                            >
                                <svg className={`w-4 h-4 stroke-[1.8] shrink-0 ${isSettingActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-[#7C3AED]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {!isCollapsed && <span>환경 설정</span>}
                            </button>
                            {isCollapsed && <div className="sidebar-tooltip">환경 설정</div>}
                        </div>
                    </nav>

                    {/* ── 3. Footer (고정): 사이드바 접기/펼치기 토글 & 로그아웃 ── */}
                    <div className="flex-shrink-0 mt-auto pt-3 border-t border-slate-100/80 space-y-1 w-full flex flex-col items-center px-0">
                        {/* 접기/펼치기 토글 버튼 */}
                        <div className="group relative flex justify-center items-center w-full px-0">
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
                            {isCollapsed && <div className="sidebar-tooltip">사이드바 펼치기</div>}
                        </div>

                        {/* 로그아웃 버튼 */}
                        <div className="group relative flex justify-center items-center w-full px-0">
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
                            {isCollapsed && <div className="sidebar-tooltip">로그아웃</div>}
                        </div>
                    </div>
                </aside>
                {/* END: Sidebar */}

                {/* ==================================================== */}
                {/* BEGIN: MainDashboard (독립 스크롤 영역) */}
                {/* ==================================================== */}
                <main
                    onScroll={handleMainScroll}
                    className="relative z-10 flex-1 p-8 h-[calc(100vh-4rem)] overflow-y-auto max-w-[1440px] custom-scrollbar"
                >
                    {/* ── Top Title Bar ── */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                {branchFullName} 운영 대시보드
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5 font-medium">오늘의 운영 현황</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-full h-9 px-4 flex items-center gap-2 bg-white/70 backdrop-blur-md shadow-sm border border-white/60 text-[13px] font-semibold text-slate-800">
                                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
                                {dayjs().format('YYYY.MM.DD (ddd) HH:mm')}
                            </div>
                            <button
                                type="button"
                                onClick={() => loadDashboard()}
                                title="새로고침"
                                className="rounded-full h-9 px-4 flex items-center gap-2 bg-white/70 backdrop-blur-md hover:bg-white/90 shadow-sm border border-white/60 transition-all cursor-pointer text-[13px] font-semibold text-slate-800"
                            >
                                <svg className={`w-3.5 h-3.5 text-slate-500 stroke-[1.8] ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                위젯 설정
                            </button>
                        </div>
                    </div>

                    {/* ── ROW 1: 4 Key Metrics Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                        {/* Metric Card 1: 오늘 수업 */}
                        <div
                            className="p-5 rounded-2xl flex flex-col justify-between border-0 transition-all hover:shadow-lg"
                            style={{
                                background: 'rgba(255, 255, 255, 0.75)',
                                backdropFilter: 'blur(20px) saturate(160%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                                boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.07)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <svg className="w-4 h-4 text-[#7C3AED] stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
                                        <line x1="16" x2="16" y1="2" y2="6" />
                                        <line x1="8" x2="8" y1="2" y2="6" />
                                        <line x1="3" x2="21" y1="10" y2="10" />
                                    </svg>
                                    <span className="text-xs font-semibold text-slate-700">오늘 수업</span>
                                </div>
                                <span className="bg-[#F5F3FF] text-[#7C3AED] font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                                    +2.4% ↗
                                </span>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
                                {stats.todayClassCount}개
                            </div>
                            <div className="pt-3 flex items-center justify-between text-xs text-slate-500 whitespace-nowrap overflow-hidden border-t border-slate-100/60">
                                <span>
                                    완료 <strong className="text-slate-800 font-semibold">11</strong> / 예정 <strong className="text-slate-800 font-semibold">{Math.max(stats.todayClassCount - 11, 7)}</strong>
                                </span>
                            </div>
                        </div>

                        {/* Metric Card 2: 출석 현황 */}
                        <div
                            className="p-5 rounded-2xl flex flex-col justify-between border-0 transition-all hover:shadow-lg"
                            style={{
                                background: 'rgba(255, 255, 255, 0.75)',
                                backdropFilter: 'blur(20px) saturate(160%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                                boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.07)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <svg className="w-4 h-4 text-[#7C3AED] stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                    </svg>
                                    <span className="text-xs font-semibold text-slate-700">출석 현황</span>
                                </div>
                                <span className="bg-[#F5F3FF] text-[#7C3AED] font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                                    +1.8% ↗
                                </span>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
                                {stats.attendanceRate}%
                            </div>
                            <div className="pt-3 flex items-center justify-between text-xs text-slate-500 whitespace-nowrap overflow-hidden border-t border-slate-100/60">
                                <span>
                                    출석 <strong className="text-slate-800 font-semibold">{stats.presentMemberCount}명</strong> / 결석 <strong className="text-slate-800 font-semibold">{stats.absentMemberCount}명</strong>
                                </span>
                            </div>
                        </div>

                        {/* Metric Card 3: 활성 회원 */}
                        <div
                            className="p-5 rounded-2xl flex flex-col justify-between border-0 transition-all hover:shadow-lg"
                            style={{
                                background: 'rgba(255, 255, 255, 0.75)',
                                backdropFilter: 'blur(20px) saturate(160%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                                boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.07)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <svg className="w-4 h-4 text-[#7C3AED] stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                        <path d="M16 3.13a4 4 0 010 7.75" />
                                    </svg>
                                    <span className="text-xs font-semibold text-slate-700">활성 회원</span>
                                </div>
                                <span className="bg-[#F5F3FF] text-[#7C3AED] font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                                    +12명 ↗
                                </span>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
                                {stats.activeMembershipMembers}명
                            </div>
                            <div className="pt-3 flex items-center justify-between text-xs text-slate-500 whitespace-nowrap overflow-hidden border-t border-slate-100/60">
                                <span>
                                    신규 <strong className="text-slate-800 font-semibold">+38명</strong> / 재등록 <strong className="text-slate-800 font-semibold">+24명</strong>
                                </span>
                            </div>
                        </div>

                        {/* Metric Card 4: 당월 매출 (금액 마스킹 인터랙션) */}
                        <div
                            className="p-5 rounded-2xl flex flex-col justify-between border-0 transition-all hover:shadow-lg"
                            style={{
                                background: 'rgba(255, 255, 255, 0.75)',
                                backdropFilter: 'blur(20px) saturate(160%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                                boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.07)',
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <svg className="w-4 h-4 text-[#7C3AED] stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                        <polyline points="17 6 23 6 23 12" />
                                    </svg>
                                    <span className="text-xs font-semibold text-slate-700">당월 매출</span>
                                </div>
                                <span className="bg-[#F5F3FF] text-[#7C3AED] font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                                    +6.2% ↗
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                    {isRevenueMasked ? '•••••••' : '₩48.2M'}
                                </span>
                                <button
                                    type="button"
                                    aria-label="금액 숨기기"
                                    onClick={() => setIsRevenueMasked(!isRevenueMasked)}
                                    className="text-slate-400 hover:text-[#7C3AED] p-1 transition-colors cursor-pointer rounded-full hover:bg-violet-50 border-0 bg-transparent"
                                >
                                    <svg className="w-4 h-4 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {isRevenueMasked ? (
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
                                        ) : (
                                            <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                            <div className="pt-3 flex items-center justify-between text-xs text-slate-500 whitespace-nowrap overflow-hidden border-t border-slate-100/60">
                                <span>
                                    목표 달성률 <strong className="text-[#7C3AED] font-semibold">92%</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── ROW 2: Main Layout Grid (Left 8 cols, Right 4 cols) ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                        {/* ── Left Section (8 Cols) ── */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* 오늘의 수업 Card (연속 세로 관통 타임라인) */}
                            <div
                                className="rounded-[24px] p-5 shadow-sm border-0"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(20px) saturate(160%)',
                                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                                    boxShadow: 'rgba(124, 58, 237, 0.07) 0px 10px 30px -10px',
                                }}
                            >
                                {/* Header Row */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-[#7C3AED] stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <rect height="18" rx="2" width="18" x="3" y="4" />
                                            <line x1="16" x2="16" y1="2" y2="6" />
                                            <line x1="8" x2="8" y1="2" y2="6" />
                                            <line x1="3" x2="21" y1="10" y2="10" />
                                        </svg>
                                        <h2 className="text-base font-bold text-[#18181B]">오늘의 수업</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/booking')}
                                        className="text-xs font-semibold text-[#71717A] hover:text-[#7C3AED] flex items-center gap-1 transition-colors border-0 bg-transparent cursor-pointer"
                                    >
                                        전체 보기
                                        <svg className="w-3.5 h-3.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Studio Filter Tabs */}
                                <div className="flex items-center gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedStudio('ALL')}
                                        className={`font-bold text-xs px-3.5 py-1.5 rounded-full transition cursor-pointer border-0 ${
                                            selectedStudio === 'ALL'
                                                ? 'bg-[#7C3AED] text-white shadow-sm'
                                                : 'bg-white/50 text-[#71717A] hover:text-[#18181B] hover:bg-white/80'
                                        }`}
                                    >
                                        전체
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedStudio('Studio A')}
                                        className={`text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer border-0 font-medium ${
                                            selectedStudio === 'Studio A'
                                                ? 'bg-[#7C3AED] text-white font-bold shadow-sm'
                                                : 'bg-white/50 text-[#71717A] hover:text-[#18181B] hover:bg-white/80'
                                        }`}
                                    >
                                        Studio A
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedStudio('Studio B')}
                                        className={`text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer border-0 font-medium ${
                                            selectedStudio === 'Studio B'
                                                ? 'bg-[#7C3AED] text-white font-bold shadow-sm'
                                                : 'bg-white/50 text-[#71717A] hover:text-[#18181B] hover:bg-white/80'
                                        }`}
                                    >
                                        Studio B
                                    </button>
                                </div>

                                {/* 4-Column Horizontal Flex Sibling Structure Timeline List */}
                                <div className="flex flex-col">
                                    {timelineClasses.map((item, idx) => {
                                        const isFirst = idx === 0;
                                        const isLast = idx === timelineClasses.length - 1;

                                        return (
                                            <div key={item.id} className="flex items-center gap-4 min-h-[52px]">
                                                {/* 1. Time Column */}
                                                <div
                                                    className={`w-12 text-right text-[13px] font-bold shrink-0 ${
                                                        item.status === 'IN_PROGRESS'
                                                            ? 'text-[#7C3AED]'
                                                            : item.status === 'FINISHED'
                                                            ? 'text-[#A1A1AA]'
                                                            : 'text-[#18181B]'
                                                    }`}
                                                >
                                                    {item.time}
                                                </div>

                                                {/* 2. Timeline Axis Column */}
                                                <div className="relative w-6 self-stretch min-h-[52px] flex items-center justify-center shrink-0">
                                                    {/* Top vertical continuous line */}
                                                    {!isFirst && (
                                                        <div
                                                            className={`absolute top-0 bottom-1/2 left-1/2 -translate-x-1/2 w-[2px] ${
                                                                item.status === 'IN_PROGRESS' || item.status === 'FINISHED'
                                                                    ? 'bg-[#DDD6FE]'
                                                                    : 'bg-[#E4E4E7]'
                                                            }`}
                                                        />
                                                    )}
                                                    {/* Bottom vertical continuous line */}
                                                    {!isLast && (
                                                        <div
                                                            className={`absolute top-1/2 bottom-0 left-1/2 -translate-x-1/2 w-[2px] ${
                                                                item.status === 'FINISHED'
                                                                    ? 'bg-[#DDD6FE]'
                                                                    : 'bg-[#E4E4E7]'
                                                            }`}
                                                        />
                                                    )}

                                                    {/* Timeline Node Dot */}
                                                    {item.status === 'FINISHED' ? (
                                                        <div className="relative z-10 mx-auto w-5 h-5 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shadow-xs">
                                                            <svg className="w-3 h-3 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    ) : item.status === 'IN_PROGRESS' ? (
                                                        <div className="relative z-10 mx-auto w-5 h-5 rounded-full border-2 border-[#7C3AED] bg-white flex items-center justify-center shadow-xs">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
                                                        </div>
                                                    ) : (
                                                        <div className="relative z-10 mx-auto w-5 h-5 rounded-full border border-zinc-300 bg-white text-zinc-400 flex items-center justify-center">
                                                            <svg className="w-2.5 h-2.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <polyline points="12 6 12 12 16 14" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 3. Class Info Column */}
                                                <div className="flex-1 text-left min-w-0 py-2.5">
                                                    <div className="flex items-center">
                                                        <h3
                                                            className={`leading-snug truncate ${
                                                                item.status === 'IN_PROGRESS'
                                                                    ? 'text-[14px] font-bold text-[#18181B]'
                                                                    : item.status === 'FINISHED'
                                                                    ? 'text-[13px] font-medium text-[#71717A]'
                                                                    : 'text-[13.5px] font-semibold text-[#18181B]'
                                                            }`}
                                                        >
                                                            {item.title}
                                                        </h3>
                                                        {item.status === 'IN_PROGRESS' && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-semibold ml-2 shrink-0">
                                                                진행 중
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[#71717A] mt-0.5">
                                                        {item.instructor} · {item.studio}
                                                    </p>
                                                </div>

                                                {/* 4. Capacity Column */}
                                                <div className="text-right font-semibold text-xs text-[#71717A] shrink-0">
                                                    <span className={item.status === 'IN_PROGRESS' ? 'text-xs font-bold text-[#18181B]' : ''}>
                                                        {item.currentCount}/{item.maxCount}명
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 오늘 예약 현황 Card (시간대별 진행바) */}
                            <div
                                className="p-6 rounded-2xl border-0"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.75)',
                                    backdropFilter: 'blur(20px) saturate(160%)',
                                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                                    boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.07)',
                                }}
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-[#7C3AED] stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <h2 className="text-base font-bold text-slate-900">오늘 예약 현황</h2>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">시간대별 예약률</span>
                                </div>

                                <div className="space-y-4">
                                    {/* 09:00 */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-500 w-6">09</span>
                                        <div className="flex-1 bg-slate-100/90 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-violet-400 to-[#7C3AED] h-full rounded-full transition-all duration-500" style={{ width: '76%' }} />
                                        </div>
                                        <span className="text-xs font-bold text-[#7C3AED] w-10 text-right">76%</span>
                                    </div>

                                    {/* 11:00 */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-500 w-6">11</span>
                                        <div className="flex-1 bg-slate-100/90 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-violet-400 to-[#7C3AED] h-full rounded-full transition-all duration-500" style={{ width: '88%' }} />
                                        </div>
                                        <span className="text-xs font-bold text-[#7C3AED] w-10 text-right">88%</span>
                                    </div>

                                    {/* 14:00 */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-500 w-6">14</span>
                                        <div className="flex-1 bg-slate-100/90 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-violet-400 to-[#7C3AED] h-full rounded-full transition-all duration-500" style={{ width: '62%' }} />
                                        </div>
                                        <span className="text-xs font-bold text-[#7C3AED] w-10 text-right">62%</span>
                                    </div>

                                    {/* 18:00 */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-500 w-6">18</span>
                                        <div className="flex-1 bg-slate-100/90 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-violet-400 to-[#7C3AED] h-full rounded-full transition-all duration-500" style={{ width: '96%' }} />
                                        </div>
                                        <span className="text-xs font-bold text-[#7C3AED] w-10 text-right">96%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right Section (4 Cols) ── */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* 운영 알림 Card */}
                            <div
                                className="p-6 rounded-2xl border-0 flex flex-col justify-between"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.75)',
                                    backdropFilter: 'blur(20px) saturate(160%)',
                                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                                    boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.07)',
                                }}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#7C3AED] stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <h2 className="text-base font-bold text-slate-900">운영 알림</h2>
                                        </div>
                                        <span className="rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-bold px-2.5 py-0.5">
                                            12건
                                        </span>
                                    </div>

                                    <div className="space-y-2.5">
                                        {/* Item 1: 만료 예정 회원 */}
                                        <div
                                            onClick={() => navigate('/admin/member/list')}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-colors cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg className="w-4 h-4 text-[#8B5CF6] stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12 6 12 12 16 14" />
                                                </svg>
                                                <span className="text-sm font-medium text-slate-800 whitespace-nowrap">
                                                    만료 예정 회원
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 whitespace-nowrap">
                                                3명
                                                <svg className="w-3.5 h-3.5 text-slate-400 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Item 2: 당일 미출석(노쇼) */}
                                        <div
                                            onClick={() => navigate('/admin/instructor/attendance')}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-colors cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg className="w-4 h-4 text-[#8B5CF6] stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" x2="12" y1="8" y2="12" />
                                                    <line x1="12" x2="12.01" y1="16" y2="16" />
                                                </svg>
                                                <span className="text-sm font-medium text-slate-800 whitespace-nowrap">
                                                    당일 미출석(노쇼)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 whitespace-nowrap">
                                                {stats.absentMemberCount}명
                                                <svg className="w-3.5 h-3.5 text-slate-400 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Item 3: 신규 상담 문의 */}
                                        <div
                                            onClick={() => message.info('신규 상담 문의 4건이 접수되었습니다.')}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-colors cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg className="w-4 h-4 text-[#8B5CF6] stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                                    <circle cx="8.5" cy="7" r="4" />
                                                    <polyline points="17 11 19 13 23 9" />
                                                </svg>
                                                <span className="text-sm font-medium text-slate-800 whitespace-nowrap">
                                                    신규 상담 문의
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 whitespace-nowrap">
                                                4건
                                                <svg className="w-3.5 h-3.5 text-slate-400 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 실시간 체크인 Card */}
                            <div
                                className="p-5 rounded-2xl border-0 flex flex-col justify-between"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.75)',
                                    backdropFilter: 'blur(20px) saturate(160%)',
                                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                                    boxShadow: 'rgba(124, 58, 237, 0.07) 0px 10px 30px -10px',
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-[#7C3AED] stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <polyline points="16 11 18 13 22 9" />
                                        </svg>
                                        <h2 className="text-base font-bold text-slate-900">실시간 체크인</h2>
                                    </div>
                                    <span className="rounded-full bg-[#F5F3FF] text-[#7C3AED] text-xs font-semibold px-2.5 py-0.5">
                                        현재 체류 42명
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <div className="py-2.5 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-400 font-medium">13:54</span>
                                            <span className="font-semibold text-slate-800">최유진 회원</span>
                                            <span className="text-slate-500">[수업] 리포머 베이직</span>
                                        </div>
                                        <span className="bg-emerald-50 text-emerald-600 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                            정상 출석
                                        </span>
                                    </div>

                                    <div className="py-2.5 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-400 font-medium">13:51</span>
                                            <span className="font-semibold text-slate-800">강도훈 회원</span>
                                            <span className="text-slate-500">[헬스] 자유 이용</span>
                                        </div>
                                        <span className="bg-[#F5F3FF] text-[#7C3AED] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                            입장 완료
                                        </span>
                                    </div>

                                    <div className="py-2.5 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-400 font-medium">13:48</span>
                                            <span className="font-semibold text-slate-800">문채원 회원</span>
                                            <span className="text-slate-500">[PT] 개인 레슨</span>
                                        </div>
                                        <span className="bg-[#F5F3FF] text-[#7C3AED] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                            입장 완료
                                        </span>
                                    </div>

                                    <div className="py-2.5 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-400 font-medium">13:42</span>
                                            <span className="font-semibold text-slate-800">이하은 회원</span>
                                            <span className="text-slate-500">[헬스] 자유 이용</span>
                                        </div>
                                        <span className="bg-amber-50 text-amber-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                            만료 D-3
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                {/* END: MainDashboard */}
            </div>
        </div>
    );
};

export default Admin;
