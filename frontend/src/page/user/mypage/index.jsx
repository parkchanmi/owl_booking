import React, { useState, useMemo, useEffect } from 'react';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Dropdown,
    Modal,
    Progress,
    Space,
    Switch,
    Tag,
    message,
    Input,
    Form,
    Checkbox,
    Alert,
    Empty,
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    UserOutlined,
    BellOutlined,
    DownOutlined,
    UpOutlined,
    LeftOutlined,
    RightOutlined,
    CloseOutlined,
    SettingOutlined,
    LogoutOutlined,
    FilePdfOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    DollarCircleOutlined,
    SafetyCertificateOutlined,
    NotificationOutlined,
    SwapRightOutlined,
    PauseCircleOutlined,
    LockOutlined,
    WarningOutlined,
    GiftOutlined,
    InfoCircleOutlined,
    ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import Header from '../../../components/common/Header';
import useMyPageData from './useMyPageData';
import MemberSettings from '../../../components/mypage/MemberSettings';
import PassDetailsModal from '../../../components/mypage/PassDetailsModal';
import ReservationHistory from '../../../components/mypage/ReservationHistory';
import { memberRequest } from '../../../api/myPageApi';
import { calendarDots, classStart, memberMetrics, membershipCard } from '../../../utils/myPageData';
import '../userMypage.css';

// 공지 및 이벤트 데이터
const NOTICES_AND_EVENTS = [
    {
        id: 'notice-1',
        type: 'notice',
        badge: '중요 공지',
        title: '스튜디오A 환기 공조 시스템 정기 점검 안내',
        date: '2026.09.10',
        periodText: '2026.09.10 (목) 10:00 ~ 13:00 (총 3시간)',
        status: '진행중',
        intro: '회원 여러분의 쾌적하고 안전한 운동 환경을 위해 스튜디오A의 환기 및 공조 시스템 정기 살균 세척 작업이 진행됩니다. 점검 시간 동안 해당 스튜디오의 모든 수업 및 자유 이용이 일시 제한되오니 예약 시 참고 부탁드립니다.',
        keyPoints: [
            { label: '점검 장소', value: '스튜디오A 전 구역' },
            { label: '점검 일시', value: '2026년 9월 12일(토) 10:00 ~ 13:00 (총 3시간)' },
            { label: '영향 범위', value: '스튜디오A 내 기구 필라테스 및 소도구 수업 전체 일시 중단' },
            { label: '대체 공간', value: '스튜디오B 및 개인 스트레칭 존 정상 이용 가능' },
        ],
        guidelines: [
            '점검 시간 전후 30분 동안 환기팬 작동으로 인한 소음이 발생할 수 있습니다.',
            '기존 예약 회원분들께는 개별 안내 문자 및 대체 클래스 예약 우선권이 부여되었습니다.',
            '안전사고 예방을 위해 점검 요원의 지시에 적극 협조해 주시기 바랍니다.',
        ],
        contact: {
            title: '고객센터',
            phone: '02-1234-5678',
            hours: '평일 09:00 - 21:00 / 주말 09:00 - 18:00',
        },
    },
    {
        id: 'event-1',
        type: 'event',
        badge: '이벤트',
        title: '가을맞이 리프레시 빈야사 & 사운드 배스 오픈',
        dateRange: '2026.09.08 ~ 2026.09.30',
        conditionTag: '선착순 15명 한정',
        showDDay: true,
        dDay: 'D-9',
        status: '진행중',
        benefits: [
            {
                badge: '혜택 1',
                title: '사운드 배스 힐링 싱잉볼 1회 무료 체험',
                desc: '정규 클래스 예약 시 50분 특별 사운드 테라피 세션 전액 지원',
            },
            {
                badge: '혜택 2',
                title: '프리미엄 요가 매트 & 타월 증정',
                desc: '프로그램 완주 시 친환경 TPE 고급 요가 매트 현장 수령',
            },
            {
                badge: '혜택 3',
                title: '동반 1인 50% 할인 쿠폰',
                desc: '지인과 함께 참여 가능한 스페셜 원데이 클래스 반값 쿠폰 발급',
            },
        ],
        steps: [
            '마이페이지 상단 [새 예약하기]에서 "가을맞이 리프레시 빈야사" 클래스를 선택합니다.',
            '원하는 날짜와 시간을 선택 후 참여 신청 버튼을 클릭하여 예약을 확정합니다.',
            '수업 당일 인포데스크에서 모바일 예약 바코드 확인 후 혜택 웰컴 패키지를 수령합니다.',
        ],
        stepNote: '* 한 ID당 각 프로그램 1회 참여 가능',
        notices: [
            '선착순 정원 마감 시 조기 종료될 수 있으며, 취소는 수업 시작 24시간 전까지만 가능합니다.',
            '제공되는 사은품은 현금이나 다른 이용권으로 교환 및 환불이 불가합니다.',
            '상세 문의는 센터 데스크 또는 고객센터 1:1 채팅 문의를 이용해 주세요.',
        ],
    },
    {
        id: 'event-2',
        type: 'event',
        badge: '이벤트',
        title: '친구 초대 리워드 — 2회 추가 횟수 즉시 적립',
        dateRange: '상시 혜택',
        conditionTag: '신규 등록 시 적용',
        showDDay: false,
        status: '진행중',
        isPromotion: true,
        imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80',
        benefits: [
            {
                badge: '혜택 1',
                title: '추천인 2회 무료 세션 즉시 적립',
                desc: '초대받은 친구가 첫 정기 이용권을 등록하면 추천인 계정으로 즉시 충전',
            },
            {
                badge: '혜택 2',
                title: '신규 가입 친구 10% 웰컴 할인 쿠폰',
                desc: '초대 코드로 신규 가입 시 첫 달 정기 결제 10% 즉시 할인 적용',
            },
            {
                badge: '혜택 3',
                title: '스튜디오 카페 음료 교환권 2매',
                desc: '친구와 함께 즐길 수 있는 센터 내 프로틴 바 무료 교환권 제공',
            },
        ],
        steps: [
            '친구에게 마이페이지 내 내 추천 코드 또는 링크를 복사하여 공유합니다.',
            '친구가 해당 링크를 통해 가입 후 첫 이용권을 구매합니다.',
            '구매 완료 즉시 두 분 모두에게 리워드 혜택이 자동으로 지급됩니다.',
        ],
        stepNote: '* 한 ID당 각 프로그램 1회 참여 가능 (최대 5명까지 초대 리워드 중복 적용)',
        notices: [
            '부정한 방법으로 초대한 경우 적립된 세션 및 쿠폰이 회수될 수 있습니다.',
            '지급된 무료 세션의 유효기간은 적립일로부터 60일입니다.',
        ],
    },
];

const MyPageWorkspace = ({ initialTab = 'reservations' }) => {
    const navigate = useNavigate();
    const { centers, reservations, waitlists, memberships, attendance, holds, loading: dataLoading, errors, reload } = useMyPageData();
    const [passDialog, setPassDialog] = useState(null);
    const [actionBusy, setActionBusy] = useState(false);

    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');

    // 활성 서브 탭: 'reservations' | 'passes' | 'notices' | 'settings'
    const [activeTab, setActiveTab] = useState(tabParam || initialTab);

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // 로그인한 실제 회원 정보
    const [memberInfo, setMemberInfo] = useState(null);

    useEffect(() => {
        fetch('/api/member/info', { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setMemberInfo(data))
            .catch((err) => console.error('회원 정보 조회 실패:', err));
    }, []);

    // 서버에서 조회한 센터를 모든 위젯의 공통 필터로 사용한다.
    const [selectedCenterId, setSelectedCenterId] = useState(null);
    const selectedCenter = centers.find((center) => center.id === selectedCenterId) ?? centers[0] ?? null;
    const centerId = selectedCenter?.id;
    const centerReservations = useMemo(() => [...reservations, ...waitlists].filter((row) => row.centerId === centerId), [reservations, waitlists, centerId]);
    const centerAttendance = useMemo(() => attendance.filter((row) => row.centerId === centerId), [attendance, centerId]);
    const passCards = memberships.filter((row) => row.center?.id === centerId).map((row) => membershipCard(row));
    const ACTIVE_PASSES = passCards.filter((pass) => !pass.expired);
    const expiredPasses = passCards.filter((pass) => pass.expired);
    const metrics = memberMetrics(centerReservations, centerAttendance);
    const UPCOMING_CLASSES = centerReservations.filter((row) => !row.waitlist && classStart(row).isAfter(dayjs())).sort((a,b) => classStart(a).valueOf()-classStart(b).valueOf()).map((row) => ({
        ...row, title: row.programName, badge: dayjs(row.programDat).isSame(dayjs(),'day') ? '오늘' : 'D-' + dayjs(row.programDat).startOf('day').diff(dayjs().startOf('day'),'day'),
        dateStr: dayjs(row.programDat).format('YY.MM.DD'), timeStr: row.startTime + ' - ' + row.endTime, instructor: row.instructorName || '강사 미배정',
    }));

    // 알림 목록 상태
    const [notifications, setNotifications] = useState([]);

    // 캐러셀 인덱스 상태
    const [carouselIdx, setCarouselIdx] = useState(0);

    // 출석 미니 캘린더 날짜 상태
    const [calendarMonth, setCalendarMonth] = useState(dayjs().startOf('month'));
    const [selectedCalDay, setSelectedCalDay] = useState(null);

    // 미니 캘린더 날짜 그리드 동적 계산 (월요일 시작)
    const miniCalendarGrid = useMemo(() => {
        const startOfMonth = calendarMonth.startOf('month');
        const daysInCurrentMonth = calendarMonth.daysInMonth();
        // 월요일을 시작 요일(index 0)로 고정: dayjs .day()는 일=0, 월=1, ... 토=6
        const startDayOfWeek = (startOfMonth.day() + 6) % 7;

        const prevMonth = calendarMonth.subtract(1, 'month');
        const daysInPrevMonth = prevMonth.daysInMonth();

        const cells = [];

        // 1. 이전 달 Muted 일자
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            cells.push({
                type: 'prev',
                day: d,
                isMuted: true,
                key: `prev-${d}`,
            });
        }

        // 2. 현재 달 일자
        for (let d = 1; d <= daysInCurrentMonth; d++) {
            const date = calendarMonth.date(d);
            const dots = calendarDots(date, centerReservations, centerAttendance);
            const isToday = date.isSame(dayjs(), 'day');
            const isSelected = selectedCalDay === d;

            cells.push({
                type: 'current',
                day: d,
                isMuted: false,
                isToday,
                isSelected,
                dots,
                key: `curr-${d}`,
            });
        }

        // 3. 다음 달 Muted 일자 (7열 배수 채우기, 기본 35칸 또는 42칸)
        const totalCellsSoFar = cells.length;
        const targetTotal = totalCellsSoFar <= 35 ? 35 : 42;
        const nextDaysNeeded = targetTotal - totalCellsSoFar;
        for (let d = 1; d <= nextDaysNeeded; d++) {
            cells.push({
                type: 'next',
                day: d,
                isMuted: true,
                key: `next-${d}`,
            });
        }

        return cells;
    }, [calendarMonth, selectedCalDay, centerReservations, centerAttendance]);

    // 공지 및 이벤트 필터 및 아코디언 상태
    const [noticeFilter, setNoticeFilter] = useState('all'); // 'all' | 'notice' | 'event'
    const [expandedNoticeIds, setExpandedNoticeIds] = useState({});

    const toggleNotice = (id) => {
        setExpandedNoticeIds(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // 이용권 카드 아코디언 상태 (초기 렌더링 시 모두 닫힌 상태)
    const [expandedPassIds, setExpandedPassIds] = useState({});

    const togglePass = (id) => {
        setExpandedPassIds(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // 좌측 프로모션 카드 클릭 시: 공지 및 이벤트 탭 이동 -> 이벤트 필터 선택 -> 해당 이벤트 아코디언 자동 오픈
    const handlePromotionClick = (promoEvent) => {
        setActiveTab('notices');
        setNoticeFilter('event');
        if (promoEvent?.id) {
            setExpandedNoticeIds(prev => ({
                ...prev,
                [promoEvent.id]: true,
            }));
        }
    };

    // 모달 제어 상태
    const [actionModal, setActionModal] = useState({
        open: false,
        type: 'confirm', // 'confirm' | 'cancel'
        item: null,
    });

    // 로그아웃 핸들러 (기존 세션 해제 보존)
    const handleLogout = async () => {
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

    // 액션 확인 모달 열기 (대기 승격 확정 / 예약 취소)
    const handleOpenActionModal = (type, item) => {
        setActionModal({
            open: true,
            type,
            item,
        });
    };

    // 서버가 성공을 응답했을 때만 완료를 안내하고 모든 위젯을 갱신한다.
    const handleExecuteAction = async () => {
        if (actionBusy || !actionModal.item) return;
        setActionBusy(true);
        const item = actionModal.item;
        try {
            await memberRequest(item.isWaitlist ? '/api/waitlists/' + item.id : '/api/bookings/' + item.id, { method: 'DELETE' });
            message.success(item.isWaitlist ? '대기 신청을 취소했습니다.' : '예약을 취소했습니다.');
            setActionModal({ open: false, type: 'cancel', item: null });
            reload();
        } catch (error) { message.error(error.message); }
        finally { setActionBusy(false); }
    };

    return (
        <div className="mypage-workspace-page">
            {/* Ambient Background Glows */}
            <div className="ambient-glow-tl" />
            <div className="ambient-glow-br" />

            {/* Floating Pill-Style Header */}
            <Header
                centers={centers}
                userName={memberInfo?.name || '회원'}
                userInitials={memberInfo?.name?.slice(0, 1) || ''}
                userGrade={memberInfo?.hasAdminCenter ? '센터 관리자' : '일반 회원'}
                selectedCenterId={selectedCenterId}
                onSelectCenterId={(id) => setSelectedCenterId(id)}
                notifications={notifications}
                onClearNotifications={() => setNotifications([])}
                onDeleteNotification={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
                onLogout={handleLogout}
                onNavigateSettings={() => setActiveTab('settings')}
            />

            {/* Main Content Workspace (Matches reservation page container) */}
            <main
                className="mypage-workspace-main"
                style={{
                    width: '100%',
                    maxWidth: 1440,
                    margin: '0 auto',
                    padding: '0 24px 48px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 32,
                    marginTop: 24,
                    position: 'relative',
                    zIndex: 10,
                }}
            >
                {/* Left Column (320px Anchor Sidebar) */}
                <aside style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Widget 1: Attendance Mini Calendar */}
                        <div
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #F1F0F7',
                                borderRadius: 20,
                                padding: '22px 20px',
                                boxShadow: '0 4px 20px -4px rgba(112, 110, 180, 0.04)',
                            }}
                        >
                            {/* Header Row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: 16, color: '#18181B' }} className="font-num">
                                        {calendarMonth.format('YYYY년 M월')}
                                    </span>
                                    <span
                                        style={{
                                            backgroundColor: '#F5F3FF',
                                            color: '#6D28D9',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            padding: '2px 9px',
                                            borderRadius: 9999,
                                            marginLeft: 8,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => {
                                            setCalendarMonth(dayjs().startOf('month'));
                                            setSelectedCalDay(dayjs().date());
                                        }}
                                    >
                                        오늘
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <button
                                        type="button"
                                        style={{ padding: 4, color: '#71717A', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                        onClick={() => { setCalendarMonth(calendarMonth.subtract(1, 'month')); setSelectedCalDay(null); }}
                                        title="이전 달"
                                    >
                                        <LeftOutlined style={{ fontSize: 12 }} />
                                    </button>
                                    <button
                                        type="button"
                                        style={{ padding: 4, color: '#71717A', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                        onClick={() => { setCalendarMonth(calendarMonth.add(1, 'month')); setSelectedCalDay(null); }}
                                        title="다음 달"
                                    >
                                        <RightOutlined style={{ fontSize: 12 }} />
                                    </button>
                                </div>
                            </div>

                            {/* Weekday Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 8 }}>
                                {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
                                    <span key={d} style={{ fontSize: 11, fontWeight: 600, color: '#A1A1AA' }}>{d}</span>
                                ))}
                            </div>

                            {/* Dynamic Calendar Dates Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, rowGap: 6, textAlign: 'center' }}>
                                {miniCalendarGrid.map((cell) => {
                                    if (cell.isMuted) {
                                        return (
                                            <div
                                                key={cell.key}
                                                className="calendar-date-cell"
                                                style={{ color: '#D4D4D8', fontSize: 12, cursor: 'pointer' }}
                                                onClick={() => {
                                                    if (cell.type === 'prev') {
                                                        setCalendarMonth(calendarMonth.subtract(1, 'month'));
                                                        setSelectedCalDay(cell.day);
                                                    } else {
                                                        setCalendarMonth(calendarMonth.add(1, 'month'));
                                                        setSelectedCalDay(cell.day);
                                                    }
                                                }}
                                            >
                                                {cell.day}
                                            </div>
                                        );
                                    }

                                    let cellClass = 'calendar-date-cell';
                                    if (cell.isToday) {
                                        cellClass += ' today';
                                    } else if (cell.isSelected) {
                                        cellClass += ' selected';
                                    }

                                    return (
                                        <div
                                            key={cell.key}
                                            className={cellClass}
                                            style={{
                                                color: cell.isToday ? '#6D28D9' : '#18181B',
                                                fontSize: 13,
                                                fontWeight: cell.isToday || cell.isSelected ? 700 : 500,
                                            }}
                                            onClick={() => setSelectedCalDay(cell.day)}
                                        >
                                            <span>{cell.day}</span>
                                            {cell.dots && cell.dots.length > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 2, position: 'absolute', bottom: 4 }}>
                                                    {cell.dots.map((dotColor, dotIdx) => (
                                                        <span
                                                            key={dotIdx}
                                                            style={{
                                                                width: 4,
                                                                height: 4,
                                                                backgroundColor: dotColor,
                                                                borderRadius: 9999,
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom Legend */}
                            <div style={{ borderTop: '1px solid #F4F1FC', paddingTop: 12, marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                                <span style={{ fontSize: 11, color: '#71717A', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6D28D9' }} /> 예약/출석
                                </span>
                                <span style={{ fontSize: 11, color: '#71717A', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EA580C' }} /> 대기
                                </span>
                                <span style={{ fontSize: 11, color: '#71717A', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#D4D4D8' }} /> 결석
                                </span>
                            </div>
                        </div>

                        {/* Widget 2: Upcoming Class Card Carousel */}
                        <div>
                            <div style={{ textAlign: 'left', marginBottom: 8 }}>
                                <h4 style={{ fontWeight: 700, fontSize: 15, color: '#18181B', margin: 0 }}>다가오는 일정</h4>
                            </div>
                            <div style={{ position: 'relative', width: '100%' }}>
                                {/* Peeking Card Background */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: -4,
                                        left: 10,
                                        right: 10,
                                        height: '100%',
                                        background: '#DDD6FE',
                                        borderRadius: 18,
                                        zIndex: 1,
                                        transform: 'scale(0.97)',
                                        pointerEvents: 'none',
                                    }}
                                />

                                {/* Carousel Nav Buttons */}
                                <button
                                    type="button"
                                    className="carousel-nav-btn"
                                    style={{ left: -10 }}
                                    title="이전"
                                    onClick={() => setCarouselIdx((prev) => (prev <= 0 ? Math.max(0, UPCOMING_CLASSES.length - 1) : prev - 1))}
                                >
                                    <LeftOutlined style={{ fontSize: 12, color: '#6D28D9' }} />
                                </button>
                                <button
                                    type="button"
                                    className="carousel-nav-btn"
                                    style={{ right: -10 }}
                                    title="다음"
                                    onClick={() => setCarouselIdx((prev) => (UPCOMING_CLASSES.length ? (prev + 1) % UPCOMING_CLASSES.length : 0))}
                                >
                                    <RightOutlined style={{ fontSize: 12, color: '#6D28D9' }} />
                                </button>

                                {/* Active Upcoming Card */}
                                {(() => {
                                    const currentClass = UPCOMING_CLASSES[carouselIdx % UPCOMING_CLASSES.length];
                                    if (!currentClass) return <div style={{ padding: 24, borderRadius: 20, background: '#FFFFFF' }}>{dataLoading ? '일정을 불러오는 중입니다.' : errors.reservations ? '일정을 불러오지 못했습니다.' : '다가오는 예약이 없습니다.'}</div>;
                                    return (
                                        <div
                                            style={{
                                                width: '100%',
                                                position: 'relative',
                                                background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
                                                borderRadius: 20,
                                                padding: '16px 18px',
                                                boxShadow: '0 8px 20px -4px rgba(124, 58, 237, 0.25)',
                                                color: '#FFFFFF',
                                                zIndex: 2,
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                <span
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.22)',
                                                        color: '#FFFFFF',
                                                        fontWeight: 700,
                                                        fontSize: 11,
                                                        padding: '2px 10px',
                                                        borderRadius: 9999,
                                                        backdropFilter: 'blur(4px)',
                                                    }}
                                                >
                                                    {currentClass.badge}
                                                </span>
                                                <span style={{ fontSize: 12, fontWeight: 500, color: '#EDE9FE' }}>
                                                    {currentClass.dateStr}
                                                </span>
                                            </div>

                                            <h4 style={{ fontWeight: 700, fontSize: 16, color: '#FFFFFF', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                                                {currentClass.title}
                                            </h4>

                                            <div style={{ fontSize: 12, fontWeight: 600, color: '#EDE9FE', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <ClockCircleOutlined style={{ fontSize: 12, color: '#DDD6FE' }} />
                                                <span className="font-num">{currentClass.timeStr}</span>
                                            </div>

                                            <div style={{ fontSize: 11, color: '#DDD6FE', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                                <span>{currentClass.centerName}</span>
                                                <span style={{ opacity: 0.4 }}>·</span>
                                                <span>{currentClass.instructor}</span>
                                                <span style={{ opacity: 0.4 }}>·</span>

                                            </div>

                                            {/* Paging Dots */}
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                                                {UPCOMING_CLASSES.map((_, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            width: i === carouselIdx ? 14 : 4,
                                                            height: 4,
                                                            borderRadius: 9999,
                                                            backgroundColor: i === carouselIdx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                                                            transition: 'all 0.3s ease',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => setCarouselIdx(i)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Widget 3: Promotion Banner */}
                        {(() => {
                            // TODO: [Backend / Admin Integration]
                            // 실제 API 연동 시, 관리자 페이지에서 "메인 프로모션 배너 노출(isPromotion)" 체크된
                            // 최신 활성 이벤트 목록을 가져와 바인딩하도록 연결합니다.
                            const promotionEvent = NOTICES_AND_EVENTS.find((item) => item.isPromotion) || NOTICES_AND_EVENTS.find((item) => item.type === 'event');

                            return (
                                <div
                                    style={{
                                        position: 'relative',
                                        overflow: 'hidden',
                                        height: 160,
                                        borderRadius: 20,
                                        boxShadow: '0 12px 32px -8px rgba(76, 29, 149, 0.28)',
                                        cursor: 'pointer',
                                        background: promotionEvent?.imageUrl
                                            ? undefined
                                            : 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
                                    }}
                                    onClick={() => handlePromotionClick(promotionEvent)}
                                >
                                    {promotionEvent?.imageUrl && (
                                        <>
                                            <img
                                                src={promotionEvent.imageUrl}
                                                alt={promotionEvent.title}
                                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.88) 0%, rgba(30, 10, 60, 0.92) 100%)',
                                                    mixBlendMode: 'multiply',
                                                }}
                                            />
                                        </>
                                    )}
                                    <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 22px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(4px)', color: '#FFFFFF', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>
                                                PROMOTION
                                            </span>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 style={{ fontWeight: 800, fontSize: 16, color: '#FFFFFF', margin: 0, lineHeight: 1.3 }}>
                                                {promotionEvent ? promotionEvent.title : '친구 추천 시 2회 무료 추가 증정'}
                                            </h4>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', marginTop: 8 }}>
                                                <span>혜택 확인하기</span>
                                                <span>→</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </aside>

                    {/* Right Column (700px Workspace Content) */}
                    <section style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        {Object.keys(errors).length > 0 && <Alert type="error" showIcon style={{ marginBottom: 16 }} title="일부 데이터를 불러오지 못했습니다." description={Object.keys(errors).map((key) => ({centers:'센터',reservations:'예약',waitlists:'대기',memberships:'이용권',attendance:'출석',holds:'일시정지'})[key]).join(', ') + ' · ' + Object.values(errors)[0]} action={<Button onClick={reload} loading={dataLoading}>다시 조회</Button>} />}

                        {/* Greeting & Top 3 Metrics Bar */}
                        <div
                            style={{
                                background: '#FFFFFF',
                                borderRadius: 20,
                                padding: '24px 32px',
                                marginBottom: 20,
                                boxShadow: '0 4px 20px -4px rgba(112, 110, 180, 0.05)',
                            }}
                        >
                            {/* Top Tier: Profile Identity Block & Greeting */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid #F4F4F5' }}>
                                <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
                                    <div
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            background: '#F3E8FF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#7C3AED',
                                            fontSize: 24,
                                        }}
                                    >
                                        <UserOutlined />
                                    </div>
                                    <button
                                        type="button"
                                        className="w-6 h-6 rounded-full bg-white border border-[#E4E4E7] shadow-xs flex items-center justify-center text-[#71717A] hover:text-[#7C3AED] hover:border-[#DDD6FE] transition-colors cursor-pointer flex-shrink-0"
                                        style={{
                                            position: 'absolute',
                                            right: -2,
                                            bottom: -2,
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            backgroundColor: '#FFFFFF',
                                            border: '1px solid #E4E4E7',
                                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            padding: 0,
                                            cursor: 'pointer',
                                        }}
                                        title="설정 바로가기"
                                        onClick={() => setActiveTab('settings')}
                                    >
                                        <svg
                                            className="w-3.5 h-3.5 shrink-0"
                                            style={{ width: 14, height: 14 }}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82-.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                    </button>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }} className="font-num">
                                        WELCOME :)
                                    </div>
                                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#18181B', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                        안녕하세요, {memberInfo?.name || '회원'}님
                                    </h1>
                                    <p style={{ fontSize: 12, color: '#71717A', margin: '4px 0 0' }}>
                                        {selectedCenter?.name || '센터'}의 예약과 이용 내역을 확인해 보세요.
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Tier: 3 Metrics Distributed Evenly */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, paddingTop: 4 }}>
                                {/* Metric 1: 이번 달 예약 현황 */}
                                <div className="bg-transparent border-none p-0" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                                    <div className="flex items-center gap-2 mb-1.5" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <CalendarOutlined style={{ fontSize: 16, color: '#6D28D9' }} />
                                        <span style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>이번 달 예약 현황</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                        <span style={{ fontSize: 22, fontWeight: 800, color: '#18181B', lineHeight: 1 }} className="font-num">{dataLoading || errors.reservations ? '—' : metrics.monthlyBookings}</span>
                                        <span style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>회 예약</span>
                                    </div>
                                </div>

                                {/* Metric 2: 전체 출석률 */}
                                <div className="bg-transparent border-none p-0" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                                    <div className="flex items-center gap-2 mb-1.5" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <CheckCircleOutlined style={{ fontSize: 16, color: '#6D28D9' }} />
                                        <span style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>전체 출석률</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                        <span style={{ fontSize: 22, fontWeight: 800, color: '#18181B', lineHeight: 1 }} className="font-num">{dataLoading || errors.attendance || metrics.attendanceRate === null ? '—' : metrics.attendanceRate + '%'}</span>
                                        <span style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>달성</span>
                                    </div>
                                </div>

                                {/* Metric 3: 대기 접수 현황 */}
                                <div className="bg-transparent border-none p-0" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                                    <div className="flex items-center gap-2 mb-1.5" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <ClockCircleOutlined style={{ fontSize: 16, color: '#EA580C' }} />
                                        <span style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>대기 접수 현황</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                        <span style={{ fontSize: 22, fontWeight: 800, color: '#EA580C', lineHeight: 1 }} className="font-num">{dataLoading || errors.waitlists ? '—' : metrics.waitlistCount + '건'}</span>
                                        <span style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>대기중</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tab Buttons & Workspace Container Card */}
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.98)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.95)',
                                borderRadius: 28,
                                padding: '32px 36px',
                                boxShadow: '0 12px 36px -8px rgba(112, 110, 180, 0.08)',
                            }}
                        >
                            {/* Sub-Tab Header Navigation */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 28, borderBottom: '1px solid #EDE9FE', marginBottom: 20 }}>
                                <button
                                    type="button"
                                    className={`sub-tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('reservations')}
                                >
                                    예약 내역 ({centerReservations.length})
                                </button>
                                <button
                                    type="button"
                                    className={`sub-tab-btn ${activeTab === 'passes' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('passes')}
                                >
                                    이용권 관리
                                </button>
                                <button
                                    type="button"
                                    className={`sub-tab-btn ${activeTab === 'notices' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('notices')}
                                >
                                    공지 및 이벤트
                                </button>
                                <button
                                    type="button"
                                    className={`sub-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('settings')}
                                >
                                    설정
                                </button>
                            </div>

                            {/* TAB PANE 1: 예약 내역 (Reservations) */}
                            {activeTab === 'reservations' && <ReservationHistory reservations={centerReservations} attendance={centerAttendance} loading={dataLoading} selectedDate={selectedCalDay ? calendarMonth.date(selectedCalDay) : null} onResetDate={() => setSelectedCalDay(null)} onCancel={handleOpenActionModal} busy={actionBusy} />}

                            {/* TAB PANE 2: 이용권 관리 (Passes) */}
                            {activeTab === 'passes' && (
                                <div>
                                    {/* Top Switcher Bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <h3 className="text-lg font-bold text-[#18181B] tracking-tight" style={{ fontWeight: 700, fontSize: 18, color: '#18181B', margin: 0, letterSpacing: '-0.02em' }}>
                                                보유 이용권 목록
                                            </h3>
                                            <span
                                                className="bg-[#F5F3FF] text-[#7C3AED] px-2.5 py-0.5 rounded-full text-xs font-semibold ml-2 inline-flex items-center font-num"
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: '#7C3AED',
                                                    backgroundColor: '#F5F3FF',
                                                    border: '1px solid #DDD6FE',
                                                    padding: '2px 10px',
                                                    borderRadius: 9999,
                                                    marginLeft: 8,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {ACTIVE_PASSES.length}개
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            style={{
                                                border: '1px solid #DDD6FE',
                                                background: '#FFFFFF',
                                                color: '#6D28D9',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                padding: '8px 16px',
                                                borderRadius: 12,
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
                                            }}
                                            disabled title="센터에 이용권 등록을 문의해 주세요."
                                        >
                                            <span>+</span>
                                            <span>이용권 구매 준비 중</span>
                                        </button>
                                    </div>

                                    {/* Active Passes Accordion Cards */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {dataLoading && <p>이용권을 불러오는 중입니다.</p>}
                                        {!dataLoading && !ACTIVE_PASSES.length && <Empty description={errors.memberships ? '이용권을 불러오지 못했습니다.' : '보유 이용권이 없습니다.'} />}
                                        {ACTIVE_PASSES.map((pass) => {
                                            const isExpanded = !!expandedPassIds[pass.id];

                                            return (
                                                <div
                                                    key={pass.id}
                                                    className="ticket-accordion-card"
                                                    style={{
                                                        background: '#FFFFFF',
                                                        border: isExpanded ? '1px solid #DDD6FE' : '1px solid #F1F0F7',
                                                        borderRadius: 24,
                                                        padding: '16px 20px',
                                                        marginBottom: 0,
                                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                                                        cursor: 'pointer',
                                                        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                                                    }}
                                                    onClick={() => togglePass(pass.id)}
                                                >
                                                    {/* Collapsed Header */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        {/* 좌측 컨텐츠 스택 */}
                                                        <div>
                                                            {/* 1) 상단 뱃지 영역 */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <span
                                                                    className="bg-[#F5F3FF] text-[#7C3AED] px-2.5 py-1 rounded-md text-xs font-semibold"
                                                                    style={{
                                                                        backgroundColor: '#F5F3FF',
                                                                        color: '#7C3AED',
                                                                        padding: '4px 10px',
                                                                        borderRadius: 6,
                                                                        fontSize: 12,
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {pass.branch}
                                                                </span>
                                                                <span
                                                                    className="bg-[#F5F3FF] text-[#7C3AED] px-2.5 py-1 rounded-md text-xs font-semibold ml-1.5"
                                                                    style={{
                                                                        backgroundColor: '#F5F3FF',
                                                                        color: '#7C3AED',
                                                                        padding: '4px 10px',
                                                                        borderRadius: 6,
                                                                        fontSize: 12,
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {pass.category}
                                                                </span>
                                                            </div>

                                                            {/* 2) 메인 이용권 타이틀 */}
                                                            <h3
                                                                className="text-base font-bold text-[#18181B] tracking-tight mt-1.5 mb-1"
                                                                style={{
                                                                    fontSize: 16,
                                                                    fontWeight: 700,
                                                                    color: '#18181B',
                                                                    letterSpacing: '-0.02em',
                                                                    margin: '6px 0 4px',
                                                                }}
                                                            >
                                                                {pass.title}
                                                            </h3>

                                                            {/* 3) 하단 서브 정보 (인라인 한 줄) */}
                                                            <div
                                                                className="text-xs text-[#71717A] flex items-center gap-2"
                                                                style={{ fontSize: 12, color: '#71717A', display: 'flex', alignItems: 'center', gap: 8 }}
                                                            >
                                                                <span>
                                                                    잔여 횟수: <strong className="font-bold text-[#7C3AED] font-num" style={{ color: '#7C3AED', fontWeight: 800 }}>{pass.remainingCount == null ? '횟수 제한 없음' : pass.remainingCount + '회'}</strong>{pass.totalCount == null ? '' : ' / ' + pass.totalCount + '회 (' + Math.round(pass.rate) + '%)'}
                                                                </span>
                                                                <span style={{ color: '#D4D4D8' }}>·</span>
                                                                <span className="font-num">유효기간: {pass.startDate} ~ {pass.endDate}</span>
                                                            </div>
                                                        </div>

                                                        {/* 우측 인디케이터 스택 */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <span
                                                                className="bg-[#F5F3FF] text-[#7C3AED] px-3.5 py-1 rounded-full text-xs font-bold mr-3 font-num"
                                                                style={{
                                                                    backgroundColor: '#F5F3FF',
                                                                    color: '#7C3AED',
                                                                    padding: '4px 14px',
                                                                    borderRadius: 9999,
                                                                    fontSize: 12,
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                {pass.dDay}
                                                            </span>
                                                            <DownOutlined
                                                                className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#7C3AED]' : 'rotate-0 text-[#A1A1AA]'}`}
                                                                style={{
                                                                    fontSize: 14,
                                                                    color: isExpanded ? '#7C3AED' : '#A1A1AA',
                                                                    transition: 'transform 0.3s ease, color 0.3s ease',
                                                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* 부드러운 인터랙티브 애니메이션 효과 (Expanded Content) */}
                                                    <div
                                                        className={`grid transition-all duration-300 ease-in-out ${
                                                            isExpanded ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                                                        }`}
                                                        style={{
                                                            display: 'grid',
                                                            gridTemplateRows: isExpanded ? '1fr' : '0fr',
                                                            opacity: isExpanded ? 1 : 0,
                                                            marginTop: isExpanded ? 20 : 0,
                                                            paddingTop: isExpanded ? 20 : 0,
                                                            borderTop: isExpanded ? '1px solid #F4F1FC' : 'none',
                                                            transition: 'all 0.3s ease-in-out',
                                                        }}
                                                    >
                                                        <div style={{ overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                                                            {/* 프로그레스 바 */}
                                                            <div style={{ width: '100%', height: 6, background: '#F4F1FC', borderRadius: 9999, overflow: 'hidden', margin: '4px 0 20px' }}>
                                                                <div style={{ width: `${pass.rate}%`, height: '100%', background: '#7C3AED', borderRadius: 9999 }} />
                                                            </div>

                                                            {/* 결제 정보 Row */}
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 36 }}>
                                                                    <div>
                                                                        <span style={{ fontSize: 11, color: '#A1A1AA', display: 'block', marginBottom: 2 }}>등록 결제일</span>
                                                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#18181B' }} className="font-num">{pass.paymentDate}</div>
                                                                    </div>
                                                                    <div>
                                                                        <span style={{ fontSize: 11, color: '#A1A1AA', display: 'block', marginBottom: 2 }}>결제 수단</span>
                                                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#18181B' }}>{pass.paymentMethod}</div>
                                                                    </div>
                                                                    <div>
                                                                        <span style={{ fontSize: 11, color: '#A1A1AA', display: 'block', marginBottom: 2 }}>등록 금액</span>
                                                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#18181B' }} className="font-num">{pass.paymentAmount}</div>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    style={{
                                                                        border: '1px solid #E4E4E7',
                                                                        background: '#FFFFFF',
                                                                        fontSize: 12,
                                                                        fontWeight: 500,
                                                                        color: '#52525B',
                                                                        padding: '8px 14px',
                                                                        borderRadius: 10,
                                                                        cursor: 'pointer',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: 6,
                                                                    }}
                                                                    disabled title="결제 승인·영수증 정보가 등록되지 않았습니다."
                                                                >
                                                                    <FilePdfOutlined />
                                                                    <span>영수증 발급 (PDF)</span>
                                                                </button>
                                                            </div>

                                                            {/* Secondary Actions Bar */}
                                                            <div style={{ borderTop: '1px solid #F4F1FC', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <button
                                                                    type="button"
                                                                    style={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: 6,
                                                                        fontSize: 12,
                                                                        fontWeight: 600,
                                                                        color: '#7C3AED',
                                                                        background: '#F5F3FF',
                                                                        padding: '8px 16px',
                                                                        borderRadius: 10,
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                    onClick={() => setPassDialog({ mode: 'usage', pass })}
                                                                >
                                                                    <ClockCircleOutlined />
                                                                    <span>차감 이력 조회</span>
                                                                </button>

                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <button
                                                                        type="button"
                                                                        style={{
                                                                            background: '#FFFFFF',
                                                                            border: '1px solid #E4E4E7',
                                                                            fontSize: 12,
                                                                            fontWeight: 500,
                                                                            color: '#52525B',
                                                                            padding: '8px 14px',
                                                                            borderRadius: 10,
                                                                            cursor: 'pointer',
                                                                        }}
                                                                        onClick={() => setPassDialog({ mode: 'hold', pass })}
                                                                    >
                                                                        일시정지 신청
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        style={{
                                                                            background: '#FFFFFF',
                                                                            border: '1px solid #E4E4E7',
                                                                            fontSize: 12,
                                                                            fontWeight: 500,
                                                                            color: '#DC2626',
                                                                            padding: '8px 14px',
                                                                            borderRadius: 10,
                                                                            cursor: 'pointer',
                                                                        }}
                                                                        onClick={() => setPassDialog({ mode: 'refund', pass })}
                                                                    >
                                                                        예상 환불액 확인
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ marginTop: 36 }}>
                                        <h3>만료·소진된 이용권 <Tag>{expiredPasses.length}건</Tag></h3>
                                        {expiredPasses.length ? expiredPasses.map((pass) => <div key={pass.id} style={{ padding: 20, background: '#FAFAFC', borderRadius: 16, marginBottom: 12 }}>
                                            <strong>{pass.title}</strong><p>{pass.branch} · {pass.startDate} ~ {pass.endDate}</p>
                                            <Button size="small" onClick={() => setPassDialog({ mode: 'usage', pass })}>차감 이력 조회</Button>
                                        </div>) : <Empty description={errors.memberships ? '이용권을 불러오지 못했습니다.' : '만료·소진된 이용권이 없습니다.'} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    </div>
                                </div>
                            )}

                            {/* TAB PANE 3: 공지 및 이벤트 (Notices) */}
                            {activeTab === 'notices' && (
                                <div>
                                    {/* Sub-filters at Top */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                        <button
                                            type="button"
                                            style={{
                                                border: 'none',
                                                fontWeight: 700,
                                                fontSize: 12,
                                                padding: '6px 16px',
                                                borderRadius: 9999,
                                                cursor: 'pointer',
                                                background: noticeFilter === 'all' ? '#7C3AED' : '#F4F4F5',
                                                color: noticeFilter === 'all' ? '#FFFFFF' : '#71717A',
                                                transition: 'all 0.2s',
                                            }}
                                            onClick={() => setNoticeFilter('all')}
                                        >
                                            전체
                                        </button>
                                        <button
                                            type="button"
                                            style={{
                                                border: 'none',
                                                fontWeight: 600,
                                                fontSize: 12,
                                                padding: '6px 16px',
                                                borderRadius: 9999,
                                                cursor: 'pointer',
                                                background: noticeFilter === 'notice' ? '#7C3AED' : '#F4F4F5',
                                                color: noticeFilter === 'notice' ? '#FFFFFF' : '#71717A',
                                                transition: 'all 0.2s',
                                            }}
                                            onClick={() => setNoticeFilter('notice')}
                                        >
                                            공지사항
                                        </button>
                                        <button
                                            type="button"
                                            style={{
                                                border: 'none',
                                                fontWeight: 600,
                                                fontSize: 12,
                                                padding: '6px 16px',
                                                borderRadius: 9999,
                                                cursor: 'pointer',
                                                background: noticeFilter === 'event' ? '#7C3AED' : '#F4F4F5',
                                                color: noticeFilter === 'event' ? '#FFFFFF' : '#71717A',
                                                transition: 'all 0.2s',
                                            }}
                                            onClick={() => setNoticeFilter('event')}
                                        >
                                            이벤트
                                        </button>
                                    </div>

                                    {/* Notice & Event Items */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {NOTICES_AND_EVENTS
                                            .filter((item) => {
                                                if (noticeFilter === 'all') return true;
                                                return item.type === noticeFilter;
                                            })
                                            .map((item) => {
                                                const isExpanded = !!expandedNoticeIds[item.id];

                                                if (item.type === 'notice') {
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="notice-accordion-card"
                                                            style={{
                                                                background: '#FFFFFF',
                                                                border: isExpanded ? '1px solid #DDD6FE' : '1px solid #F1F0F7',
                                                                borderRadius: 24,
                                                                padding: 24,
                                                                marginBottom: 0,
                                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                                                                transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => toggleNotice(item.id)}
                                                        >
                                                            {/* Collapsed Header */}
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                    <span
                                                                        style={{
                                                                            background: '#FFF1F2',
                                                                            color: '#E11D48',
                                                                            fontWeight: 700,
                                                                            fontSize: 11,
                                                                            padding: '3px 8px',
                                                                            borderRadius: 6,
                                                                            border: '1px solid #FFE4E6',
                                                                        }}
                                                                    >
                                                                        {item.badge}
                                                                    </span>
                                                                    <h4 style={{ fontWeight: 700, fontSize: 16, color: '#18181B', margin: 0 }}>
                                                                        {item.title}
                                                                    </h4>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                    <span style={{ fontSize: 12, color: '#71717A' }} className="font-num">
                                                                        {item.date}
                                                                    </span>
                                                                    <DownOutlined
                                                                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#7C3AED]' : 'rotate-0 text-[#A1A1AA]'}`}
                                                                        style={{
                                                                            fontSize: 12,
                                                                            color: isExpanded ? '#7C3AED' : '#A1A1AA',
                                                                            transition: 'transform 0.3s ease, color 0.3s ease',
                                                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Smooth Expanded Section */}
                                                            <div
                                                                className={`grid transition-all duration-300 ease-in-out ${
                                                                    isExpanded ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                                                                }`}
                                                                style={{
                                                                    display: 'grid',
                                                                    gridTemplateRows: isExpanded ? '1fr' : '0fr',
                                                                    opacity: isExpanded ? 1 : 0,
                                                                    marginTop: isExpanded ? 20 : 0,
                                                                    paddingTop: isExpanded ? 20 : 0,
                                                                    borderTop: isExpanded ? '1px solid #F4F1FC' : 'none',
                                                                    transition: 'all 0.3s ease-in-out',
                                                                }}
                                                            >
                                                                <div style={{ overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                                                                    {/* 안내 인트로 본문 */}
                                                                    <p className="text-sm text-[#3F3F46] leading-relaxed mb-5" style={{ fontSize: 14, color: '#3F3F46', lineHeight: 1.6, margin: '0 0 20px' }}>
                                                                        {item.intro}
                                                                    </p>

                                                                    {/* [주요 안내] 라운드 박스 */}
                                                                    <div
                                                                        className="bg-[#FAF9FF] border border-[#EDE9FE] rounded-2xl p-5 mb-5"
                                                                        style={{
                                                                            backgroundColor: '#FAF9FF',
                                                                            border: '1px solid #EDE9FE',
                                                                            borderRadius: 16,
                                                                            padding: 20,
                                                                            marginBottom: 20,
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className="text-sm font-bold text-[#7C3AED] flex items-center gap-1.5 mb-3"
                                                                            style={{
                                                                                fontSize: 14,
                                                                                fontWeight: 700,
                                                                                color: '#7C3AED',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 6,
                                                                                marginBottom: 12,
                                                                            }}
                                                                        >
                                                                            <BellOutlined style={{ fontSize: 15 }} />
                                                                            <span>주요 안내</span>
                                                                        </div>
                                                                        <div className="text-xs text-[#52525B] space-y-1.5" style={{ fontSize: 12, color: '#52525B', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                                            {item.keyPoints?.map((point, pIdx) => (
                                                                                <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                                                                    <span style={{ color: '#A1A1AA' }}>·</span>
                                                                                    <div>
                                                                                        <strong style={{ color: '#3F3F46' }}>{point.label}:</strong>{' '}
                                                                                        <span style={{ color: '#18181B', fontWeight: 500 }}>{point.value}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* [이용 안내] 섹션 */}
                                                                    <div style={{ marginBottom: 20 }}>
                                                                        <div className="text-sm font-bold text-[#18181B] mb-2" style={{ fontSize: 14, fontWeight: 700, color: '#18181B', marginBottom: 8 }}>
                                                                            이용 안내
                                                                        </div>
                                                                        <div className="text-xs text-[#71717A] space-y-1" style={{ fontSize: 12, color: '#71717A', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                            {item.guidelines?.map((guide, gIdx) => (
                                                                                <div key={gIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                                                                    <span style={{ color: '#A1A1AA' }}>·</span>
                                                                                    <span>{guide}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* [문의] 섹션 */}
                                                                    <div style={{ marginBottom: 20 }}>
                                                                        <div className="text-sm font-bold text-[#18181B] mb-2" style={{ fontSize: 14, fontWeight: 700, color: '#18181B', marginBottom: 8 }}>
                                                                            문의
                                                                        </div>
                                                                        <div style={{ fontSize: 12, color: '#71717A' }}>
                                                                            궁금하신 사항은 고객센터로 문의해주세요.
                                                                        </div>
                                                                        <div
                                                                            className="bg-white border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-xs text-[#52525B] flex items-center gap-3 mt-2"
                                                                            style={{
                                                                                backgroundColor: '#FFFFFF',
                                                                                border: '1px solid #E4E4E7',
                                                                                borderRadius: 12,
                                                                                padding: '10px 16px',
                                                                                fontSize: 12,
                                                                                color: '#52525B',
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: 12,
                                                                                marginTop: 8,
                                                                            }}
                                                                        >
                                                                            <strong style={{ color: '#18181B' }}>{item.contact?.title}</strong>
                                                                            <span style={{ color: '#D4D4D8' }}>|</span>
                                                                            <span style={{ color: '#7C3AED', fontWeight: 700 }} className="font-num">{item.contact?.phone}</span>
                                                                            <span style={{ color: '#D4D4D8' }}>|</span>
                                                                            <span style={{ color: '#71717A' }}>{item.contact?.hours}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // item.type === 'event'
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="notice-accordion-card"
                                                        style={{
                                                            background: '#FFFFFF',
                                                            border: isExpanded ? '1px solid #DDD6FE' : '1px solid #F1F0F7',
                                                            borderRadius: 24,
                                                            padding: 24,
                                                            marginBottom: 0,
                                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                                                            transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => toggleNotice(item.id)}
                                                    >
                                                        {/* Collapsed Header */}
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <span
                                                                        style={{
                                                                            background: '#EDE9FE',
                                                                            color: '#7C3AED',
                                                                            fontWeight: 700,
                                                                            fontSize: 11,
                                                                            padding: '3px 8px',
                                                                            borderRadius: 6,
                                                                        }}
                                                                    >
                                                                        {item.badge}
                                                                    </span>
                                                                    <h4 style={{ fontWeight: 700, fontSize: 16, color: '#18181B', margin: 0 }}>
                                                                        {item.title}
                                                                    </h4>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 flex-wrap" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                                                                    <span style={{ fontSize: 12, color: '#71717A' }} className="font-num">
                                                                        {item.dateRange}
                                                                    </span>
                                                                    {item.conditionTag && (
                                                                        <span
                                                                            className="border border-[#FED7AA] bg-[#FFF7ED] text-[#EA580C] px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                                            style={{
                                                                                background: '#FFF7ED',
                                                                                color: '#EA580C',
                                                                                fontSize: 11,
                                                                                fontWeight: 600,
                                                                                padding: '2px 8px',
                                                                                borderRadius: 9999,
                                                                                border: '1px solid #FED7AA',
                                                                            }}
                                                                        >
                                                                            {item.conditionTag}
                                                                        </span>
                                                                    )}
                                                                    {item.showDDay && item.dDay && (
                                                                        <span
                                                                            className="bg-[#FEF2F2] text-[#EF4444] px-2.5 py-0.5 rounded-full text-xs font-bold"
                                                                            style={{
                                                                                background: '#FEF2F2',
                                                                                color: '#EF4444',
                                                                                fontSize: 11,
                                                                                fontWeight: 700,
                                                                                padding: '2px 8px',
                                                                                borderRadius: 9999,
                                                                            }}
                                                                        >
                                                                            {item.dDay}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                <span
                                                                    style={{
                                                                        fontSize: 12,
                                                                        fontWeight: 600,
                                                                        padding: '4px 12px',
                                                                        borderRadius: 9999,
                                                                        background: '#ECFDF5',
                                                                        color: '#059669',
                                                                        border: '1px solid #A7F3D0',
                                                                    }}
                                                                >
                                                                    {item.status}
                                                                </span>
                                                                <DownOutlined
                                                                    className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#7C3AED]' : 'rotate-0 text-[#A1A1AA]'}`}
                                                                    style={{
                                                                        fontSize: 12,
                                                                        color: isExpanded ? '#7C3AED' : '#A1A1AA',
                                                                        transition: 'transform 0.3s ease, color 0.3s ease',
                                                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Smooth Expanded Section */}
                                                        <div
                                                            className={`grid transition-all duration-300 ease-in-out ${
                                                                isExpanded ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                                                            }`}
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                                                                opacity: isExpanded ? 1 : 0,
                                                                marginTop: isExpanded ? 20 : 0,
                                                                paddingTop: isExpanded ? 20 : 0,
                                                                borderTop: isExpanded ? '1px solid #F4F1FC' : 'none',
                                                                transition: 'all 0.3s ease-in-out',
                                                            }}
                                                        >
                                                            <div style={{ overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                                                                {/* 1) [이벤트 혜택] 섹션 */}
                                                                <div
                                                                    className="text-sm font-bold text-[#18181B] flex items-center gap-2 mb-3"
                                                                    style={{ fontSize: 14, fontWeight: 700, color: '#18181B', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}
                                                                >
                                                                    <GiftOutlined style={{ color: '#7C3AED', fontSize: 16 }} />
                                                                    <span>이벤트 혜택</span>
                                                                </div>
                                                                <div
                                                                    className="bg-[#FAF9FF] border border-[#EDE9FE] rounded-2xl p-4 divide-y divide-[#EDE9FE]"
                                                                    style={{
                                                                        backgroundColor: '#FAF9FF',
                                                                        border: '1px solid #EDE9FE',
                                                                        borderRadius: 16,
                                                                        padding: 16,
                                                                    }}
                                                                >
                                                                    {item.benefits?.map((benefit, bIdx) => (
                                                                        <div
                                                                            key={bIdx}
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-between',
                                                                                gap: 12,
                                                                                paddingTop: bIdx > 0 ? 14 : 0,
                                                                                marginTop: bIdx > 0 ? 14 : 0,
                                                                                borderTop: bIdx > 0 ? '1px solid #EDE9FE' : 'none',
                                                                            }}
                                                                        >
                                                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                                                                <ShoppingOutlined
                                                                                    style={{
                                                                                        fontSize: 18,
                                                                                        color: '#7C3AED',
                                                                                        marginTop: 2,
                                                                                        flexShrink: 0,
                                                                                    }}
                                                                                />
                                                                                <div>
                                                                                    <div className="text-xs font-bold text-[#18181B]" style={{ fontSize: 13, fontWeight: 700, color: '#18181B' }}>
                                                                                        {benefit.title}
                                                                                    </div>
                                                                                    <div className="text-xs text-[#71717A] mt-0.5" style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>
                                                                                        {benefit.desc}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <span
                                                                                className="bg-[#F5F3FF] text-[#7C3AED] px-3 py-1 rounded-full text-xs font-semibold"
                                                                                style={{
                                                                                    backgroundColor: '#F5F3FF',
                                                                                    color: '#7C3AED',
                                                                                    padding: '4px 12px',
                                                                                    borderRadius: 9999,
                                                                                    fontSize: 12,
                                                                                    fontWeight: 600,
                                                                                    flexShrink: 0,
                                                                                    whiteSpace: 'nowrap',
                                                                                }}
                                                                            >
                                                                                {benefit.badge}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* 2) [참여 방법] 섹션 */}
                                                                <div
                                                                    className="text-sm font-bold text-[#18181B] flex items-center gap-2 mt-5 mb-3"
                                                                    style={{
                                                                        fontSize: 14,
                                                                        fontWeight: 700,
                                                                        color: '#18181B',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 8,
                                                                        marginTop: 20,
                                                                        marginBottom: 12,
                                                                    }}
                                                                >
                                                                    <CalendarOutlined style={{ color: '#7C3AED', fontSize: 15 }} />
                                                                    <span>참여 방법</span>
                                                                </div>
                                                                <div className="text-xs text-[#52525B] space-y-2" style={{ fontSize: 12, color: '#52525B', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                                    {item.steps?.map((step, sIdx) => {
                                                                        const numSymbols = ['①', '②', '③', '④', '⑤'];
                                                                        return (
                                                                            <div key={sIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                                                                <span style={{ fontWeight: 700, color: '#7C3AED', flexShrink: 0 }}>
                                                                                    {numSymbols[sIdx] || `${sIdx + 1}.`}
                                                                                </span>
                                                                                <span style={{ lineHeight: 1.5 }}>{step}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {item.stepNote && (
                                                                    <div className="text-[11px] text-[#A1A1AA] mt-2" style={{ fontSize: 11, color: '#A1A1AA', marginTop: 8 }}>
                                                                        {item.stepNote}
                                                                    </div>
                                                                )}

                                                                {/* 3) [유의사항] 섹션 */}
                                                                <div
                                                                    className="text-sm font-bold text-[#18181B] flex items-center gap-2 mt-5 mb-2"
                                                                    style={{
                                                                        fontSize: 14,
                                                                        fontWeight: 700,
                                                                        color: '#18181B',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 8,
                                                                        marginTop: 20,
                                                                        marginBottom: 8,
                                                                    }}
                                                                >
                                                                    <InfoCircleOutlined style={{ color: '#7C3AED', fontSize: 15 }} />
                                                                    <span>유의사항</span>
                                                                </div>
                                                                <div className="text-xs text-[#71717A] space-y-1" style={{ fontSize: 12, color: '#71717A', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                    {item.notices?.map((notice, nIdx) => (
                                                                        <div key={nIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                                                            <span style={{ color: '#A1A1AA' }}>·</span>
                                                                            <span>{notice}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* 4) 하단 전폭 액션 버튼 */}
                                                                <button
                                                                    type="button"
                                                                    className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer mt-6 flex items-center justify-center"
                                                                    style={{
                                                                        width: '100%',
                                                                        height: 48,
                                                                        backgroundColor: '#7C3AED',
                                                                        color: '#FFFFFF',
                                                                        fontWeight: 700,
                                                                        fontSize: 14,
                                                                        borderRadius: 12,
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        marginTop: 24,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        transition: 'background-color 0.2s ease',
                                                                    }}
                                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6D28D9')}
                                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7C3AED')}
                                                                    onClick={() => message.success('이벤트 참여 신청이 접수되었습니다!')}
                                                                >
                                                                    이벤트 참여하기
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    {/* 하단 더보기 버튼 */}
                                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                                        <button
                                            type="button"
                                            className="load-more-text-btn"
                                            onClick={() => message.info('지난 소식 목록을 불러옵니다.')}
                                        >
                                            + 지난 소식 더보기 (3/8)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && <MemberSettings member={memberInfo} onUpdate={setMemberInfo} />}
                        </div>
                    </section>
                </main>

            {/* Footer */}
            <footer
                style={{
                    width: '100%',
                    maxWidth: 1440,
                    margin: '0 auto',
                    padding: '48px 24px 24px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    borderTop: '1px solid rgba(228, 228, 231, 0.6)',
                    position: 'relative',
                    zIndex: 10,
                }}
            >
                <div style={{ color: '#71717A' }}>© 2026 booung Lab. All rights reserved.</div>
                <div style={{ display: 'flex', gap: 16, color: '#8B5CF6', fontWeight: 500 }}>
                    <span style={{ cursor: 'pointer' }}>이용약관</span>
                    <span style={{ color: '#D4D4D8' }}>·</span>
                    <span style={{ cursor: 'pointer', fontWeight: 700 }}>개인정보처리방침</span>
                    <span style={{ color: '#D4D4D8' }}>·</span>
                    <span style={{ cursor: 'pointer' }}>고객센터</span>
                </div>
            </footer>

            {/* 3. Interactive Modals */}

            {/* Modal 1: Action Confirm Modal (대기 승격 확정 / 예약 취소) */}
            <Modal
                open={actionModal.open}
                onCancel={() => setActionModal({ open: false, type: 'confirm', item: null })}
                footer={null}
                centered
                width={440}
                styles={{
                    content: {
                        borderRadius: 24,
                        padding: '28px 32px',
                        boxShadow: '0 20px 40px -10px rgba(91, 59, 168, 0.2)',
                    },
                }}
            >
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#18181B', margin: '0 0 6px' }}>
                        {actionModal.type === 'confirm' ? '수업 예약을 확정하시겠습니까?' : '예약을 취소하시겠습니까?'}
                    </h3>
                    <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>
                        {actionModal.type === 'confirm'
                            ? '예약 확정 시 보유하신 이용권 1회가 즉시 차감 처리됩니다.'
                            : '선택한 수업의 예약 또는 대기 신청을 취소합니다. 완료 후 최신 이용 내역이 반영됩니다.'}
                    </p>
                </div>

                <div style={{ background: '#FAF9FD', border: '1px solid #EDE9FE', borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #F4F1FC' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#18181B' }}>클래스</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#5B3BA8' }}>{actionModal.item?.title}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: '#71717A' }}>일시</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#18181B' }} className="font-num">{actionModal.item?.dateStr}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#71717A' }}>강사 / 룸</span>
                        <span style={{ fontSize: 12, color: '#18181B' }}>{actionModal.item?.instructor}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                        type="button"
                        style={{
                            padding: '10px 18px',
                            borderRadius: 12,
                            border: '1px solid #E4E4E7',
                            background: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#52525B',
                            cursor: 'pointer',
                        }}
                        disabled={actionBusy} onClick={() => setActionModal({ open: false, type: 'cancel', item: null })}
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        style={{
                            padding: '10px 22px',
                            borderRadius: 12,
                            border: 'none',
                            background: actionModal.type === 'confirm' ? '#5B3BA8' : '#EF4444',
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(91, 59, 168, 0.25)',
                        }}
                        onClick={handleExecuteAction}
                        disabled={actionBusy}
                    >
                        {actionModal.type === 'confirm' ? '예약 확정' : '취소 접수'}
                    </button>
                </div>
            </Modal>

            <PassDetailsModal dialog={passDialog} onClose={() => setPassDialog(null)} onChanged={reload} reservations={reservations} attendance={attendance} holds={holds} />
        </div>
    );
};

export default MyPageWorkspace;
