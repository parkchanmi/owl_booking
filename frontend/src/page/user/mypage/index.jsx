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
import Header, { INITIAL_NOTIFICATIONS } from '../../../components/common/Header';
import '../userMypage.css';

// 센터 목록
const CENTERS = [
    { id: 1, name: '강남 시그니처점', addr: '서울 강남구 테헤란로 123', phone: '02-1234-5678', hours: '평일 06:00 - 23:00 / 주말 09:00 - 18:00', facility: '샤워실 완비 · 무료 주차 2시간 · 개별 락커' },
    { id: 2, name: '서초역점', addr: '서울 서초구 서초대로 250', phone: '02-581-2244', hours: '평일 06:00 - 23:00 / 주말 09:00 - 18:00', facility: '샤워실 완비 · 무료 주차 1시간 30분 · 기구 필라테스 특화' },
    { id: 3, name: '역삼 테헤란점', addr: '서울 강남구 테헤란로 208', phone: '02-555-8890', hours: '평일 06:30 - 22:30 / 주말 10:00 - 18:00', facility: '샤워실 완비 · 발렛 주차 지원 · 1:1 PT 전용 프라이빗 룸' },
];

// 다가오는 일정 캐러셀 데이터
const UPCOMING_CLASSES = [
    {
        id: 'up-1',
        title: '고강도 서킷 트레이닝',
        badge: '오늘',
        dateStr: '26.9.11 (금)',
        timeStr: '19:30 - 20:20',
        centerName: '강남 시그니처점',
        instructor: '강민호 트레이너',
        studio: 'Studio A',
    },
    {
        id: 'up-2',
        title: '하타 딥 스트레칭',
        badge: 'D-2',
        dateStr: '26.9.13 (일)',
        timeStr: '10:00 - 11:00',
        centerName: '강남 시그니처점',
        instructor: '이지은 강사',
        studio: 'Studio C',
    },
    {
        id: 'up-3',
        title: '코어 리포머 필라테스',
        badge: 'D-5',
        dateStr: '26.9.16 (수)',
        timeStr: '11:00 - 12:00',
        centerName: '강남 시그니처점',
        instructor: '박소연 강사',
        studio: 'Studio B',
    },
];

// 보유 이용권 데이터
const ACTIVE_PASSES = [
    {
        id: 'pass-1',
        category: 'PT 회원권',
        branch: '강남 시그니처점',
        title: '1:1 개인 PT 30회권',
        remainingCount: 12,
        totalCount: 30,
        rate: 40,
        startDate: '2026.07.01',
        endDate: '2026.12.31',
        dDay: 'D-111',
        paymentDate: '2026.06.25 14:22',
        paymentMethod: '신한카드 (일시불)',
        paymentAmount: '1,980,000원',
    },
    {
        id: 'pass-2',
        category: '필라테스 회원권',
        branch: '강남 시그니처점',
        title: '필라테스 & 리포머 20회권',
        remainingCount: 8,
        totalCount: 20,
        rate: 40,
        startDate: '2026.05.01',
        endDate: '2026.11.30',
        dDay: 'D-80',
        paymentDate: '2026.04.28 11:15',
        paymentMethod: '국민카드 (일시불)',
        paymentAmount: '1,450,000원',
    },
];

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

    // 지점 선택 상태
    const [selectedCenterId, setSelectedCenterId] = useState(1);
    const selectedCenter = useMemo(
        () => CENTERS.find((c) => c.id === selectedCenterId) ?? CENTERS[0],
        [selectedCenterId]
    );

    // 알림 목록 상태
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    // 캐러셀 인덱스 상태
    const [carouselIdx, setCarouselIdx] = useState(0);

    // 출석 미니 캘린더 날짜 상태
    const [calendarMonth, setCalendarMonth] = useState(dayjs('2026-09-01'));
    const [selectedCalDay, setSelectedCalDay] = useState(11); // 오늘 11일

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
            const monthKey = calendarMonth.format('YYYY-MM');
            let dots = [];
            if (monthKey === '2026-09') {
                if (d === 4 || d === 11 || d === 16) dots.push('#6D28D9');
                if (d === 5 || d === 13) dots.push('#EA580C');
                if (d === 28) dots.push('#D4D4D8');
            } else {
                // 다른 월도 상태 도트가 동적으로 제공되도록 현실적인 패턴 부여 (예약/출석, 대기, 취소)
                if ([2, 9, 16, 23].includes(d)) dots.push('#6D28D9');
                else if ([6, 20].includes(d)) dots.push('#EA580C');
                else if (d === 27) dots.push('#D4D4D8');
            }

            const isToday = calendarMonth.isSame(dayjs('2026-09-01'), 'month') && d === 11;
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
    }, [calendarMonth, selectedCalDay]);

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

    // 설정 알림 토글 상태
    const [settingNotifications, setSettingNotifications] = useState({
        remind: false,
        waitlist: true,
        expire: true,
        marketing: false,
    });

    // 모달 제어 상태
    const [actionModal, setActionModal] = useState({
        open: false,
        type: 'confirm', // 'confirm' | 'cancel'
        item: null,
    });

    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [refundAgreed, setRefundAgreed] = useState(false);
    const [metricModalOpen, setMetricModalOpen] = useState(false);
    const [pauseModalOpen, setPauseModalOpen] = useState(false);

    // 내 예약 내역 (실제 백엔드 조회)
    const [myBookings, setMyBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    const fetchMyBookings = async () => {
        setBookingsLoading(true);
        try {
            const response = await fetch('/api/bookings/mine', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setMyBookings(data);
            }
        } catch (e) {
            console.error('예약 내역 조회 실패:', e);
        } finally {
            setBookingsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBookings();
    }, []);

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

    // 액션 확인 실행 (백엔드 예약 확정 / 취소 API 호출)
    const handleExecuteAction = async () => {
        const { type, item } = actionModal;
        try {
            if (type === 'confirm') {
                // 대기 승격 확정 API 호출
                await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bookingId: item?.id,
                        realProgramId: item?.programId,
                        centerId: selectedCenter.id,
                        action: 'CONFIRM_PROMOTED',
                    }),
                    credentials: 'include',
                });
                message.success(`${item?.title || '수업'} 예약이 정상적으로 확정되었습니다!`);
            } else {
                // 예약 취소 / 대기 취소 API 호출
                const endpoint = item?.isWaitlist ? `/api/waitlists/${item?.id}` : `/api/bookings/${item?.id}`;
                const response = await fetch(endpoint, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (response.ok) {
                    message.info(`${item?.title || '수업'} 신청이 안전하게 취소되었습니다.`);
                    fetchMyBookings();
                } else {
                    message.error('취소 처리 중 오류가 발생했습니다.');
                }
            }
        } catch (err) {
            console.error('예약 처리 실패:', err);
            message.error('취소 처리 중 오류가 발생했습니다.');
        } finally {
            setActionModal({ open: false, type: 'confirm', item: null });
        }
    };

    // 환불 신청 실행 (PRD REQ-06)
    const handleExecuteRefund = async () => {
        if (!refundAgreed) {
            message.warning('환불 정책 확인 및 동의에 체크해주세요.');
            return;
        }
        try {
            await fetch('/api/member/refunds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: 'ticket-gn-30',
                    refundAmount: 522000,
                    penaltyAmount: 198000,
                    usedAmount: 1260000,
                }),
                credentials: 'include',
            });
        } catch {
            // 통신 실패해도 사용자에게 접수 완료 안내
        }
        message.success('이용권 중도 해지 및 환불 신청이 완료되었습니다. 영업일 기준 2~3일 내 승인 취소됩니다.');
        setRefundModalOpen(false);
    };

    return (
        <div className="mypage-workspace-page">
            {/* Ambient Background Glows */}
            <div className="ambient-glow-tl" />
            <div className="ambient-glow-br" />

            {/* Floating Pill-Style Header */}
            <Header
                selectedCenterId={selectedCenterId}
                onSelectCenterId={(id) => setSelectedCenterId(id)}
                notifications={notifications}
                onClearNotifications={() => setNotifications([])}
                onDeleteNotification={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
                onLogout={handleLogout}
                onNavigateSettings={() => setActiveTab('settings')}
                userName={memberInfo?.name}
                userGrade={memberInfo?.hasAdminCenter ? '센터 관리자' : '일반 회원'}
                userInitials={memberInfo?.name ? memberInfo.name.slice(0, 1) : undefined}
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
                                            setCalendarMonth(dayjs('2026-09-01'));
                                            setSelectedCalDay(11);
                                        }}
                                    >
                                        오늘
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <button
                                        type="button"
                                        style={{ padding: 4, color: '#71717A', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                        onClick={() => setCalendarMonth(calendarMonth.subtract(1, 'month'))}
                                        title="이전 달"
                                    >
                                        <LeftOutlined style={{ fontSize: 12 }} />
                                    </button>
                                    <button
                                        type="button"
                                        style={{ padding: 4, color: '#71717A', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                        onClick={() => setCalendarMonth(calendarMonth.add(1, 'month'))}
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
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#D4D4D8' }} /> 취소/결석
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
                                    onClick={() => setCarouselIdx((prev) => (prev === 0 ? UPCOMING_CLASSES.length - 1 : prev - 1))}
                                >
                                    <LeftOutlined style={{ fontSize: 12, color: '#6D28D9' }} />
                                </button>
                                <button
                                    type="button"
                                    className="carousel-nav-btn"
                                    style={{ right: -10 }}
                                    title="다음"
                                    onClick={() => setCarouselIdx((prev) => (prev === UPCOMING_CLASSES.length - 1 ? 0 : prev + 1))}
                                >
                                    <RightOutlined style={{ fontSize: 12, color: '#6D28D9' }} />
                                </button>

                                {/* Active Upcoming Card */}
                                {(() => {
                                    const currentClass = UPCOMING_CLASSES[carouselIdx];
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
                                                <span>{currentClass.studio}</span>
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
                                        좋은 오후입니다, {memberInfo?.name || '회원'}님
                                    </h1>
                                    <p style={{ fontSize: 12, color: '#71717A', margin: '4px 0 0' }}>
                                        이번 주 목표 달성까지 2개의 수업이 남았어요.
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
                                        <span style={{ fontSize: 22, fontWeight: 800, color: '#18181B', lineHeight: 1 }} className="font-num">18</span>
                                        <span style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>회 완료</span>
                                    </div>
                                </div>

                                {/* Metric 2: 전체 출석률 */}
                                <div className="bg-transparent border-none p-0" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                                    <div className="flex items-center gap-2 mb-1.5" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <CheckCircleOutlined style={{ fontSize: 16, color: '#6D28D9' }} />
                                        <span style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>전체 출석률</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                        <span style={{ fontSize: 22, fontWeight: 800, color: '#18181B', lineHeight: 1 }} className="font-num">94%</span>
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
                                        <span style={{ fontSize: 22, fontWeight: 800, color: '#EA580C', lineHeight: 1 }} className="font-num">1건</span>
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
                                    예약 내역 ({myBookings.length})
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
                            {activeTab === 'reservations' && (
                                <div>
                                    {/* Section Header Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <h3 style={{ fontWeight: 700, fontSize: 18, color: '#18181B', margin: 0, letterSpacing: '-0.02em' }}>
                                                전체 예약 내역
                                            </h3>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#6D28D9', backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE', padding: '2px 9px', borderRadius: 9999 }} className="font-num">
                                                총 {myBookings.length}건
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#A1A1AA', fontWeight: 500 }}>최신 일정 순으로 정렬됨</span>
                                    </div>

                                    {/* Chronological Timeline Schedule List (실제 예약 데이터) */}
                                    {bookingsLoading ? (
                                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#A1A1AA', fontSize: 13 }}>
                                            예약 내역을 불러오는 중입니다...
                                        </div>
                                    ) : myBookings.length === 0 ? (
                                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#A1A1AA', fontSize: 13 }}>
                                            예약된 수업이 없습니다.
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative', paddingBottom: 8 }}>
                                            {myBookings.map((booking, idx) => {
                                                const programMoment = booking.programDat ? dayjs(booking.programDat) : null;
                                                const dayName = programMoment ? ['일', '월', '화', '수', '목', '금', '토'][programMoment.day()] : '';
                                                const diffDays = programMoment ? programMoment.startOf('day').diff(dayjs().startOf('day'), 'day') : null;
                                                const isLast = idx === myBookings.length - 1;

                                                let badge = null;
                                                if (diffDays === 0) badge = { label: 'TODAY', bg: '#EDE9FE', color: '#6D28D9' };
                                                else if (diffDays > 0) badge = { label: `D-${diffDays}`, bg: '#F4F4F5', color: '#71717A' };

                                                return (
                                                    <div key={booking.id} style={{ position: 'relative', paddingLeft: 36, marginBottom: isLast ? 0 : 40 }}>
                                                        {!isLast && (
                                                            <div style={{ position: 'absolute', left: 7.5, top: 19, bottom: -40, borderLeft: '1px solid #DDD6FE', pointerEvents: 'none' }} />
                                                        )}
                                                        <div style={{ position: 'absolute', left: 0, top: 3, width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF', border: '2px solid #6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
                                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6D28D9' }} />
                                                        </div>

                                                        <div
                                                            className="timeline-item-content transition-transform duration-200 ease-out cursor-pointer hover:-translate-y-[2px]"
                                                            style={{ background: 'transparent', border: 'none', padding: 0 }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                                {badge && (
                                                                    <span style={{ background: badge.bg, color: badge.color, fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 6 }} className="font-num">
                                                                        {badge.label}
                                                                    </span>
                                                                )}
                                                                <span style={{ fontWeight: 700, fontSize: 15, color: '#18181B' }} className="font-num">
                                                                    {programMoment ? `${programMoment.format('YYYY.MM.DD')} (${dayName})` : '-'} &nbsp;{booking.startTime} — {booking.endTime}
                                                                </span>
                                                            </div>

                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                                                                <h4 style={{ fontSize: 17, fontWeight: 700, color: '#18181B', margin: 0, letterSpacing: '-0.01em' }}>
                                                                    {booking.programName}
                                                                </h4>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                                                    <button
                                                                        type="button"
                                                                        className="action-cancel-link"
                                                                        style={{ fontSize: 12 }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleOpenActionModal('cancel', {
                                                                                id: booking.id,
                                                                                title: booking.programName,
                                                                                dateStr: `${programMoment ? programMoment.format('YYYY.MM.DD') : ''} ${booking.startTime} — ${booking.endTime}`,
                                                                                instructor: booking.instructorName,
                                                                            });
                                                                        }}
                                                                    >
                                                                        예약 취소
                                                                    </button>
                                                                    <span style={{ background: '#F5F3FF', color: '#6D28D9', fontWeight: 600, fontSize: 12, padding: '4px 12px', borderRadius: 9999 }}>
                                                                        예약 완료
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div style={{ fontSize: 12, color: '#71717A', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <span>{booking.centerName}</span>
                                                                {booking.instructorName && (
                                                                    <>
                                                                        <span>·</span>
                                                                        <span>{booking.instructorName}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

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
                                                2개
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
                                            onClick={() => message.info('새 이용권 구매 페이지로 이동합니다.')}
                                        >
                                            <span>+</span>
                                            <span>새 이용권 구매</span>
                                        </button>
                                    </div>

                                    {/* Active Passes Accordion Cards */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                                                                    잔여 횟수: <strong className="font-bold text-[#7C3AED] font-num" style={{ color: '#7C3AED', fontWeight: 800 }}>{pass.remainingCount}회</strong> / {pass.totalCount}회 ({pass.rate}%)
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
                                                                        <span style={{ fontSize: 11, color: '#A1A1AA', display: 'block', marginBottom: 2 }}>결제 일시</span>
                                                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#18181B' }} className="font-num">{pass.paymentDate}</div>
                                                                    </div>
                                                                    <div>
                                                                        <span style={{ fontSize: 11, color: '#A1A1AA', display: 'block', marginBottom: 2 }}>결제 수단</span>
                                                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#18181B' }}>{pass.paymentMethod}</div>
                                                                    </div>
                                                                    <div>
                                                                        <span style={{ fontSize: 11, color: '#A1A1AA', display: 'block', marginBottom: 2 }}>승인 금액</span>
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
                                                                    onClick={() => message.success('영수증 PDF가 다운로드되었습니다.')}
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
                                                                    onClick={() => message.info(`${pass.title}에 대한 차감 이력을 조회합니다.`)}
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
                                                                        onClick={() => setPauseModalOpen(true)}
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
                                                                        onClick={() => {
                                                                            setRefundAgreed(false);
                                                                            setRefundModalOpen(true);
                                                                        }}
                                                                    >
                                                                        중도 해지 / 환불 신청
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Dedicated Section: 만료된 이용권 */}
                                    <div style={{ marginTop: 36 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <h3 className="text-lg font-bold text-[#18181B] tracking-tight" style={{ fontWeight: 700, fontSize: 18, color: '#18181B', margin: 0, letterSpacing: '-0.02em' }}>
                                                    만료된 이용권
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
                                                    전체 3건
                                                </span>
                                            </div>
                                            <span style={{ fontSize: 12, color: '#A1A1AA', fontWeight: 500 }}>
                                                최근 1년 이내 만료 기준
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                background: '#FAFAFC',
                                                border: '1px solid #F1F0F7',
                                                borderRadius: 18,
                                                padding: '16px 20px',
                                                marginBottom: 12,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                opacity: 0.85,
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ background: '#E4E4E7', color: '#71717A', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                                        전 지점 공용
                                                    </span>
                                                    <span style={{ fontWeight: 700, fontSize: 15, color: '#71717A' }}>전지점 VIP 프리패스</span>
                                                </div>
                                                <div style={{ fontSize: 12, color: '#A1A1AA', marginTop: 4 }}>
                                                    무제한 시설 이용권 · 유효기간: 2025.01.01 ~ 2025.12.31
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ background: '#E4E4E7', color: '#71717A', fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 9999 }}>
                                                    기간 만료
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                                            <button
                                                type="button"
                                                className="load-more-text-btn"
                                                onClick={() => message.info('지난 이용권 2건을 추가로 불러왔습니다.')}
                                            >
                                                + 지난 이용권 2건 더보기
                                            </button>
                                        </div>
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

                            {/* TAB PANE 4: 설정 (Settings) */}
                            {activeTab === 'settings' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    {/* Card 1: 대시보드 요약 지표 설정 */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px 20px',
                                            border: '1px solid #F1F0F7',
                                            borderRadius: 16,
                                            background: '#FFFFFF',
                                        }}
                                    >
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: '#18181B' }}>대시보드 요약 지표</span>
                                            <span style={{ fontSize: 12, color: '#71717A', marginLeft: 12 }}>
                                                상단 배너에 고정할 핵심 운동 지표를 설정합니다.
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '0 16px',
                                                height: 34,
                                                borderRadius: 9999,
                                                background: '#F5F3FF',
                                                border: 'none',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: '#6D28D9',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setMetricModalOpen(true)}
                                        >
                                            <span>지표 편집</span>
                                            <SettingOutlined />
                                        </button>
                                    </div>

                                    {/* Card 2: 알림 수신 설정 */}
                                    <div
                                        style={{
                                            background: '#FFFFFF',
                                            border: '1px solid #F1F0F7',
                                            borderRadius: 18,
                                            padding: '22px 26px',
                                        }}
                                    >
                                        <h3 style={{ fontWeight: 700, fontSize: 15, color: '#18181B', margin: '0 0 16px' }}>
                                            알림 수신 설정
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {/* Item 1 */}
                                            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F1FC' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: '#18181B' }}>수업 예약 리마인드 알림</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>수업 시작 3시간 및 1시간 전 카카오 알림톡/앱 푸시 발송</div>
                                                </div>
                                                <Switch
                                                    checked={settingNotifications.remind}
                                                    onChange={(checked) => {
                                                        setSettingNotifications({ ...settingNotifications, remind: checked });
                                                        message.success(`수업 예약 리마인드 알림이 ${checked ? '켜졌습니다' : '꺼졌습니다'}.`);
                                                    }}
                                                />
                                            </div>

                                            {/* Item 2 */}
                                            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F1FC' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: '#18181B' }}>대기 승격 긴급 알림</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>대기 중이던 수업에 공석 발생 시 즉시 카카오 알림톡 및 긴급 알림</div>
                                                </div>
                                                <Switch
                                                    checked={settingNotifications.waitlist}
                                                    onChange={(checked) => {
                                                        setSettingNotifications({ ...settingNotifications, waitlist: checked });
                                                        message.success(`대기 승격 알림이 ${checked ? '켜졌습니다' : '꺼졌습니다'}.`);
                                                    }}
                                                />
                                            </div>

                                            {/* Item 3 */}
                                            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F1FC' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: '#18181B' }}>이용권 만료 임박 안내</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>잔여 이용권 만료 14일, 7일 전 리마인드 전송</div>
                                                </div>
                                                <Switch
                                                    checked={settingNotifications.expire}
                                                    onChange={(checked) => {
                                                        setSettingNotifications({ ...settingNotifications, expire: checked });
                                                        message.success(`이용권 만료 임박 안내가 ${checked ? '켜졌습니다' : '꺼졌습니다'}.`);
                                                    }}
                                                />
                                            </div>

                                            {/* Item 4 */}
                                            <div style={{ padding: '12px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: '#18181B' }}>마케팅 및 혜택 소식 수신</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>신규 클래스 오픈 및 첫 등록/재등록 특별 할인 안내 (선택)</div>
                                                </div>
                                                <Switch
                                                    checked={settingNotifications.marketing}
                                                    onChange={(checked) => {
                                                        setSettingNotifications({ ...settingNotifications, marketing: checked });
                                                        message.success(`마케팅 수신 동의가 ${checked ? '설정되었습니다' : '해제되었습니다'}.`);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 3: 계정 및 보안 관리 */}
                                    <div
                                        style={{
                                            background: '#FFFFFF',
                                            border: '1px solid #F1F0F7',
                                            borderRadius: 18,
                                            padding: '22px 26px',
                                        }}
                                    >
                                        <h3 style={{ fontWeight: 700, fontSize: 15, color: '#18181B', margin: '0 0 12px' }}>
                                            계정 및 보안 관리
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {/* ID */}
                                            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F4F5' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: '#18181B' }}>기본 로그인 아이디</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>jiwoo@owlfit.com</div>
                                                </div>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 84, height: 34, borderRadius: 9999, background: '#F4F4F5', fontSize: 12, fontWeight: 500, color: '#71717A' }}>
                                                    기본 계정
                                                </span>
                                            </div>

                                            {/* Kakao */}
                                            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F4F5' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 22, height: 22, background: '#FEE500', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: '#18181B' }}>
                                                        K
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 14, color: '#18181B' }}>카카오 로그인</div>
                                                        <span style={{ fontSize: 12, color: '#71717A', marginTop: 2, display: 'block' }} className="font-num">jiwoo@kakao.com (연동 완료)</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    style={{ width: 84, height: 34, borderRadius: 9999, background: '#F4F4F5', border: 'none', fontSize: 12, fontWeight: 500, color: '#52525B', cursor: 'pointer' }}
                                                    onClick={() => message.info('카카오 계정 연동 해제 기능입니다.')}
                                                >
                                                    연동 해제
                                                </button>
                                            </div>


                                            {/* Password */}
                                            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F4F5' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: '#18181B' }}>로그인 비밀번호</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>주기적인 변경으로 계정을 안전하게 보호하세요.</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    style={{ width: 84, height: 34, borderRadius: 9999, background: '#F4F4F5', border: 'none', fontSize: 12, fontWeight: 500, color: '#52525B', cursor: 'pointer' }}
                                                    onClick={() => message.info('비밀번호 변경 모달이 호출됩니다.')}
                                                >
                                                    변경
                                                </button>
                                            </div>

                                            {/* Withdraw */}
                                            <div style={{ padding: '14px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: '#DC2626' }}>회원 탈퇴</div>
                                                    <div style={{ fontSize: 12, color: '#DC2626', opacity: 0.8, marginTop: 2 }}>탈퇴 시 모든 이용권 및 예약 이력이 즉시 파기됩니다.</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    style={{ width: 84, height: 34, borderRadius: 9999, background: '#FEF2F2', border: 'none', fontSize: 12, fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        Modal.confirm({
                                                            title: '정말 회원 탈퇴를 신청하시겠습니까?',
                                                            content: '탈퇴 시 보유 중인 잔여 이용권과 예약 내역이 영구 소멸되며 복구할 수 없습니다.',
                                                            okText: '탈퇴 신청',
                                                            okType: 'danger',
                                                            cancelText: '취소',
                                                            onOk: () => handleLogout(),
                                                        });
                                                    }}
                                                >
                                                    탈퇴 신청
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                            : '취소 규정에 따라 이용권이 즉시 반환되며 다음 대기자에게 순번이 양도됩니다.'}
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
                        onClick={() => setActionModal({ open: false, type: 'confirm', item: null })}
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
                    >
                        {actionModal.type === 'confirm' ? '예약 확정' : '취소 접수'}
                    </button>
                </div>
            </Modal>

            {/* Modal 2: PRD REQ-06 이용권 중도 해지 및 환불 신청 모달 */}
            <Modal
                open={refundModalOpen}
                onCancel={() => setRefundModalOpen(false)}
                footer={null}
                centered
                width={480}
                styles={{
                    content: {
                        borderRadius: 24,
                        padding: '28px 32px',
                    },
                }}
            >
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#18181B', margin: '0 0 6px' }}>
                        이용권 중도 해지 및 환불 신청
                    </h3>
                    <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>
                        소비자분쟁해결기준 및 센터 이용약관 규정에 따라 산정된 정산 금액을 안내해 드립니다.
                    </p>
                </div>

                <div style={{ background: '#FAF9FD', border: '1px solid #EDE9FE', borderRadius: 16, padding: '16px 20px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                        <span style={{ color: '#71717A' }}>원 결제 금액</span>
                        <strong className="font-num" style={{ color: '#18181B' }}>1,980,000원</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                        <span style={{ color: '#DC2626' }}>위약금 (총액의 10%)</span>
                        <strong className="font-num" style={{ color: '#DC2626' }}>- 198,000원</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                        <span style={{ color: '#DC2626' }}>기이용 회차 차감 (18회 × 70,000원)</span>
                        <strong className="font-num" style={{ color: '#DC2626' }}>- 1,260,000원</strong>
                    </div>
                    <div style={{ borderTop: '1.5px dashed #DDD6FE', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: '#18181B' }}>예상 최종 환불액</span>
                        <span style={{ fontWeight: 900, fontSize: 19, color: '#6D28D9' }} className="font-num">
                            522,000원
                        </span>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <Checkbox
                        checked={refundAgreed}
                        onChange={(e) => setRefundAgreed(e.target.checked)}
                        style={{ fontSize: 12, color: '#374151' }}
                    >
                        환불 규정 및 이용권 즉시 회수 처리에 동의합니다.
                    </Checkbox>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                        type="button"
                        style={{ padding: '10px 18px', borderRadius: 12, border: '1px solid #E4E4E7', background: '#FFFFFF', fontSize: 12, fontWeight: 600, color: '#52525B', cursor: 'pointer' }}
                        onClick={() => setRefundModalOpen(false)}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        style={{
                            padding: '10px 22px',
                            borderRadius: 12,
                            border: 'none',
                            background: refundAgreed ? '#DC2626' : '#D4D4D8',
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: refundAgreed ? 'pointer' : 'not-allowed',
                        }}
                        onClick={handleExecuteRefund}
                    >
                        환불 신청하기
                    </button>
                </div>
            </Modal>

            {/* Modal 3: Metric Config Modal */}
            <Modal
                open={metricModalOpen}
                onCancel={() => setMetricModalOpen(false)}
                footer={null}
                centered
                width={420}
                styles={{ content: { borderRadius: 24, padding: '24px 28px' } }}
            >
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#18181B', margin: '0 0 6px' }}>
                    대시보드 메트릭 카드 설정
                </h3>
                <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 16px' }}>
                    상단 배너에 우선 표시할 통계 지표를 선택해주세요. (최대 3개)
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAF9FD', borderRadius: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#18181B' }}>이번 달 예약 현황</span>
                        <Checkbox defaultChecked disabled />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAF9FD', borderRadius: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#18181B' }}>전체 출석률</span>
                        <Checkbox defaultChecked />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAF9FD', borderRadius: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#18181B' }}>대기 접수 현황</span>
                        <Checkbox defaultChecked />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAF9FD', borderRadius: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#18181B' }}>잔여 이용권 D-Day</span>
                        <Checkbox />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button onClick={() => setMetricModalOpen(false)}>취소</Button>
                    <Button type="primary" style={{ background: '#5B3BA8' }} onClick={() => { message.success('메트릭 설정이 저장되었습니다.'); setMetricModalOpen(false); }}>
                        적용하기
                    </Button>
                </div>
            </Modal>

            {/* Modal 4: Pass Pause Modal (일시정지 신청) */}
            <Modal
                open={pauseModalOpen}
                onCancel={() => setPauseModalOpen(false)}
                footer={null}
                centered
                width={420}
                styles={{ content: { borderRadius: 24, padding: '24px 28px' } }}
            >
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#18181B', margin: '0 0 6px' }}>
                    이용권 일시정지(홀딩) 신청
                </h3>
                <p style={{ fontSize: 12, color: '#71717A', margin: '0 0 16px' }}>
                    1회 신청 시 최대 30일까지 일시정지가 가능하며, 정지 기간만큼 만료일이 자동 연장됩니다.
                </p>
                <div style={{ background: '#FAF9FD', borderRadius: 12, padding: '14px', border: '1px solid #EDE9FE', marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: '#52525B', marginBottom: 6 }}>· 대상 이용권: <strong>1:1 개인 PT 30회권</strong></div>
                    <div style={{ fontSize: 12, color: '#52525B', marginBottom: 6 }}>· 희망 정지 일수: <strong>14일간</strong></div>
                    <div style={{ fontSize: 12, color: '#52525B' }}>· 연장 후 만료일: <strong style={{ color: '#6D28D9' }}>2027년 01월 14일</strong></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button onClick={() => setPauseModalOpen(false)}>취소</Button>
                    <Button
                        type="primary"
                        style={{ background: '#5B3BA8' }}
                        onClick={() => {
                            message.success('이용권 일시정지 신청이 완료되었습니다.');
                            setPauseModalOpen(false);
                        }}
                    >
                        신청 완료
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default MyPageWorkspace;
