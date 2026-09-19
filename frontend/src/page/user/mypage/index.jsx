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
    CheckOutlined,
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

    // 공지 아코디언 상태
    const [noticeNoticeOpen, setNoticeNoticeOpen] = useState(true);
    const [noticeFilter, setNoticeFilter] = useState('all'); // 'all' | 'notice' | 'event'

    // 이용권 상세 카드 접기/펼치기
    const [expandedPass1, setExpandedPass1] = useState(true);

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
                const endpoint = item?.isWaitlist ? `/api/waitlists/${item?.id || 1}` : `/api/bookings/${item?.id || 1}`;
                await fetch(endpoint, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                message.info(`${item?.title || '수업'} 신청이 안전하게 취소되었습니다. 이용권이 복원되었습니다.`);
            }
        } catch (err) {
            // 목업 환경에서도 부드러운 피드백 제공
            if (type === 'confirm') {
                message.success(`${item?.title || '수업'} 예약이 정상적으로 확정되었습니다!`);
            } else {
                message.info(`${item?.title || '수업'} 취소가 완료되었습니다.`);
            }
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
        } catch (e) {
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
                        <div
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                height: 160,
                                borderRadius: 20,
                                boxShadow: '0 12px 32px -8px rgba(76, 29, 149, 0.28)',
                                cursor: 'pointer',
                            }}
                            onClick={() => message.info('친구 추천 링크가 클립보드에 복사되었습니다!')}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80"
                                alt="OwlFit Boutique Studio"
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
                                        친구 추천 시 2회 무료 추가 증정
                                    </h4>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', marginTop: 8 }}>
                                        <span>혜택 확인하기</span>
                                        <span>→</span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                        좋은 오후입니다, Kim Ji-woo 님
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
                                    예약 내역 (4)
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
                                    {/* Waitlist Promoted Alert Card */}
                                    <div
                                        className="waitlist-promoted-card"
                                        style={{
                                            border: '1.5px solid #FED7AA',
                                            background: '#FFFBF7',
                                            borderRadius: 18,
                                            padding: '18px 22px',
                                            marginBottom: 24,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span
                                                    style={{
                                                        background: '#FFF7ED',
                                                        color: '#EA580C',
                                                        border: '1px solid #FFEDD5',
                                                        fontWeight: 700,
                                                        fontSize: 11,
                                                        padding: '3px 10px',
                                                        borderRadius: 9999,
                                                    }}
                                                >
                                                    대기 승격
                                                </span>
                                                <span style={{ fontWeight: 700, fontSize: 14, color: '#18181B' }} className="font-num">
                                                    2026.09.13(일) 07:30 — 08:30
                                                </span>
                                            </div>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#EA580C' }} className="font-num">
                                                <ClockCircleOutlined />
                                                <span>02:38:57 남음</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                            <div>
                                                <h4 style={{ fontWeight: 700, fontSize: 17, color: '#18181B', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                                                    Power Vinyasa Yoga
                                                </h4>
                                                <div style={{ fontSize: 12, color: '#71717A', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span>강남 시그니처점</span>
                                                    <span>·</span>
                                                    <span>Sarah Jenkins 강사</span>
                                                    <span>·</span>
                                                    <span>Studio A</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                                <button
                                                    type="button"
                                                    className="action-cancel-link"
                                                    style={{ fontSize: 12, color: '#71717A' }}
                                                    onClick={() =>
                                                        handleOpenActionModal('cancel', {
                                                            id: 'wait-promo-1',
                                                            title: 'Power Vinyasa Yoga',
                                                            dateStr: '2026.09.13(일) 07:30 — 08:30',
                                                            instructor: 'Sarah Jenkins 강사 · Studio A',
                                                            isWaitlist: true,
                                                        })
                                                    }
                                                >
                                                    대기 취소
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cta-pulse-btn"
                                                    style={{
                                                        background: '#F97316',
                                                        color: '#FFFFFF',
                                                        fontWeight: 700,
                                                        fontSize: 12,
                                                        padding: '10px 20px',
                                                        borderRadius: 12,
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
                                                    }}
                                                    onClick={() =>
                                                        handleOpenActionModal('confirm', {
                                                            id: 'wait-promo-1',
                                                            programId: 'prog-1',
                                                            title: 'Power Vinyasa Yoga',
                                                            dateStr: '2026.09.13(일) 07:30 — 08:30',
                                                            instructor: 'Sarah Jenkins 강사 · Studio A',
                                                        })
                                                    }
                                                >
                                                    <CheckOutlined />
                                                    <span>예약 확정</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Header Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <h3 style={{ fontWeight: 700, fontSize: 18, color: '#18181B', margin: 0, letterSpacing: '-0.02em' }}>
                                                전체 예약 내역
                                            </h3>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#6D28D9', backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE', padding: '2px 9px', borderRadius: 9999 }} className="font-num">
                                                총 4건
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#A1A1AA', fontWeight: 500 }}>최신 일정 순으로 정렬됨</span>
                                    </div>

                                    {/* Chronological Timeline Schedule List */}
                                    <div style={{ position: 'relative', paddingBottom: 8 }}>
                                        {/* Item 1: TODAY - 고강도 서킷 트레이닝 */}
                                        <div style={{ position: 'relative', paddingLeft: 36, marginBottom: 40 }}>
                                            <div style={{ position: 'absolute', left: 7.5, top: 19, bottom: -40, borderLeft: '1px solid #DDD6FE', pointerEvents: 'none' }} />
                                            <div style={{ position: 'absolute', left: 0, top: 3, width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF', border: '2px solid #6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6D28D9' }} />
                                            </div>

                                            <div
                                                className="timeline-item-content transition-transform duration-200 ease-out cursor-pointer hover:-translate-y-[2px]"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    padding: 0,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                    <span style={{ background: '#EDE9FE', color: '#6D28D9', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 6 }} className="font-num">
                                                        TODAY
                                                    </span>
                                                    <span style={{ fontWeight: 700, fontSize: 15, color: '#18181B' }} className="font-num">
                                                        2026.09.11 (금) &nbsp;19:30 — 20:20
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                                                    <h4 style={{ fontSize: 17, fontWeight: 700, color: '#18181B', margin: 0, letterSpacing: '-0.01em' }}>
                                                        고강도 서킷 트레이닝
                                                    </h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                                        <button
                                                            type="button"
                                                            className="action-cancel-link"
                                                            style={{ fontSize: 12 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenActionModal('cancel', {
                                                                    id: 'bk-1',
                                                                    title: '고강도 서킷 트레이닝',
                                                                    dateStr: '2026.09.11 (금) 19:30 — 20:20',
                                                                    instructor: '강민호 트레이너 · Studio A',
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
                                                    <span>강남 시그니처점</span>
                                                    <span>·</span>
                                                    <span>강민호 트레이너</span>
                                                    <span>·</span>
                                                    <span>Studio A</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Item 2: D-2 - 하타 딥 스트레칭 */}
                                        <div style={{ position: 'relative', paddingLeft: 36, marginBottom: 40 }}>
                                            <div style={{ position: 'absolute', left: 7, top: 19, bottom: -40, borderLeft: '1.5px dashed #FB923C', pointerEvents: 'none' }} />
                                            <div style={{ position: 'absolute', left: 0, top: 3, width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF', border: '2px solid #EA580C', pointerEvents: 'none', zIndex: 10 }} />

                                            <div
                                                className="timeline-item-content transition-transform duration-200 ease-out cursor-pointer hover:-translate-y-[2px]"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    padding: 0,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                    <span style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5', fontWeight: 600, fontSize: 11, padding: '2px 8px', borderRadius: 9999 }} className="font-num">
                                                        D-2
                                                    </span>
                                                    <span style={{ fontWeight: 700, fontSize: 15, color: '#18181B' }} className="font-num">
                                                        2026.09.13 (일) &nbsp;10:00 — 11:00
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                                                    <h4 style={{ fontSize: 17, fontWeight: 700, color: '#18181B', margin: 0, letterSpacing: '-0.01em' }}>
                                                        하타 딥 스트레칭
                                                    </h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                                        <button
                                                            type="button"
                                                            className="action-cancel-link"
                                                            style={{ fontSize: 12 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenActionModal('cancel', {
                                                                    id: 'wait-2',
                                                                    title: '하타 딥 스트레칭',
                                                                    dateStr: '2026.09.13 (일) 10:00 — 11:00',
                                                                    instructor: '이지은 강사 · Studio C',
                                                                    isWaitlist: true,
                                                                });
                                                            }}
                                                        >
                                                            대기 취소
                                                        </button>
                                                        <span style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5', fontWeight: 600, fontSize: 12, padding: '4px 12px', borderRadius: 9999 }}>
                                                            대기 예약
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{ fontSize: 12, color: '#71717A', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span>강남 시그니처점</span>
                                                    <span>·</span>
                                                    <span>이지은 강사</span>
                                                    <span>·</span>
                                                    <span>Studio C</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Item 3: D-5 - 코어 리포머 필라테스 */}
                                        <div style={{ position: 'relative', paddingLeft: 36, marginBottom: 40 }}>
                                            <div style={{ position: 'absolute', left: 7.5, top: 19, bottom: -40, borderLeft: '1px solid #DDD6FE', pointerEvents: 'none' }} />
                                            <div style={{ position: 'absolute', left: 0, top: 3, width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF', border: '2px solid #8B5CF6', pointerEvents: 'none', zIndex: 10 }} />

                                            <div
                                                className="timeline-item-content transition-transform duration-200 ease-out cursor-pointer hover:-translate-y-[2px]"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    padding: 0,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                    <span style={{ background: '#F4F4F5', color: '#71717A', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 6 }} className="font-num">
                                                        D-5
                                                    </span>
                                                    <span style={{ fontWeight: 700, fontSize: 15, color: '#18181B' }} className="font-num">
                                                        2026.09.16 (수) &nbsp;11:00 — 12:00
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                                                    <h4 style={{ fontSize: 17, fontWeight: 700, color: '#18181B', margin: 0, letterSpacing: '-0.01em' }}>
                                                        코어 리포머 필라테스
                                                    </h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                                        <button
                                                            type="button"
                                                            className="action-cancel-link"
                                                            style={{ fontSize: 12 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenActionModal('cancel', {
                                                                    id: 'bk-3',
                                                                    title: '코어 리포머 필라테스',
                                                                    dateStr: '2026.09.16 (수) 11:00 — 12:00',
                                                                    instructor: '박소연 강사 · Studio B',
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
                                                    <span>강남 시그니처점</span>
                                                    <span>·</span>
                                                    <span>박소연 강사</span>
                                                    <span>·</span>
                                                    <span>Studio B</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Item 4: Past / Cancelled - Morning Flow */}
                                        <div style={{ position: 'relative', paddingLeft: 36 }}>
                                            <div style={{ position: 'absolute', left: 0, top: 3, width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF', border: '2px solid #D4D4D8', pointerEvents: 'none', zIndex: 10 }} />

                                            <div
                                                className="timeline-item-content transition-transform duration-200 ease-out cursor-pointer hover:-translate-y-[2px]"
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    padding: 0,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                                    <span style={{ fontSize: 12, color: '#71717A' }} className="font-num">
                                                        2026.09.05 (토) 14:00 — 15:00
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                                                    <h4 style={{ fontSize: 17, fontWeight: 700, color: '#71717A', margin: 0, letterSpacing: '-0.01em' }}>
                                                        Morning Flow
                                                    </h4>
                                                    <span style={{ fontSize: 12, color: '#A1A1AA' }} className="font-num">
                                                        취소 완료 (26.09.05 14:20)
                                                    </span>
                                                </div>

                                                <div style={{ fontSize: 12, color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span>강남 시그니처점</span>
                                                    <span>·</span>
                                                    <span>Emily Park 강사</span>
                                                    <span>·</span>
                                                    <span>Studio C</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB PANE 2: 이용권 관리 (Passes) */}
                            {activeTab === 'passes' && (
                                <div>
                                    {/* Top Switcher Bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, fontSize: 16, color: '#18181B' }}>보유 이용권 목록</span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#6D28D9', background: '#F5F3FF', padding: '2px 9px', borderRadius: 9999, marginLeft: 8 }}>
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

                                    {/* Card 1: Expanded Pass Card */}
                                    <div
                                        style={{
                                            background: '#FFFFFF',
                                            border: '1.5px solid #EDE9FE',
                                            borderRadius: 20,
                                            padding: '24px 28px',
                                            marginBottom: 16,
                                            boxShadow: '0 4px 20px -4px rgba(112, 110, 180, 0.05)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ background: '#F5F3FF', color: '#6D28D9', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 6 }}>
                                                    PT 회원권
                                                </span>
                                                <span style={{ background: '#F5F3FF', color: '#6D28D9', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 6 }}>
                                                    강남 시그니처점
                                                </span>
                                            </div>
                                            <div
                                                style={{ cursor: 'pointer', color: '#A1A1AA' }}
                                                onClick={() => setExpandedPass1(!expandedPass1)}
                                            >
                                                {expandedPass1 ? <UpOutlined /> : <DownOutlined />}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 style={{ fontWeight: 800, fontSize: 20, color: '#18181B', margin: '4px 0' }}>
                                                1:1 개인 PT 30회권
                                            </h3>
                                            <div style={{ fontSize: 12, color: '#71717A' }}>
                                                <span>잔여 횟수:</span>
                                                <span style={{ fontWeight: 800, color: '#6D28D9', marginLeft: 4 }} className="font-num">12회</span>
                                                <span className="font-num"> / 30회 (40%)</span>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#71717A', marginTop: 4, display: 'flex', alignItems: 'center' }}>
                                                <span className="font-num">유효기간: 2026.07.01 ~ 2026.12.31</span>
                                                <span style={{ background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 6, marginLeft: 8 }} className="font-num">
                                                    D-111
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={{ width: '100%', height: 6, background: '#F4F1FC', borderRadius: 9999, overflow: 'hidden', margin: '14px 0 22px' }}>
                                            <div style={{ width: '40%', height: '100%', background: '#6D28D9', borderRadius: 9999 }} />
                                        </div>

                                        {expandedPass1 && (
                                            <div style={{ borderTop: '1px solid #F4F1FC', paddingTop: 18 }}>
                                                {/* Payment Info Row */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 36 }}>
                                                        <div>
                                                            <span style={{ fontSize: 11, color: '#A1A1AA', display: 'block', marginBottom: 2 }}>결제 일시</span>
                                                            <div style={{ fontSize: 12, fontWeight: 600, color: '#18181B' }} className="font-num">2026.06.25 14:22</div>
                                                        </div>
                                                        <div>
                                                            <span style={{ fontSize: 11, color: '#A1A1AA', display: 'block', marginBottom: 2 }}>결제 수단</span>
                                                            <div style={{ fontSize: 12, fontWeight: 600, color: '#18181B' }}>신한카드 (일시불)</div>
                                                        </div>
                                                        <div>
                                                            <span style={{ fontSize: 11, color: '#A1A1AA', display: 'block', marginBottom: 2 }}>승인 금액</span>
                                                            <div style={{ fontSize: 14, fontWeight: 800, color: '#18181B' }} className="font-num">1,980,000원</div>
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
                                                            color: '#6D28D9',
                                                            background: '#F5F3FF',
                                                            padding: '8px 16px',
                                                            borderRadius: 10,
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => message.info('1:1 개인 PT 30회권에 대한 18회 차감 완료 내역을 조회합니다.')}
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
                                        )}
                                    </div>

                                    {/* Card 2: Active Collapsed Pass */}
                                    <div
                                        style={{
                                            background: '#FFFFFF',
                                            border: '1px solid #F1F0F7',
                                            borderRadius: 18,
                                            padding: '18px 24px',
                                            marginBottom: 16,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => message.info('필라테스 & 리포머 20회권 상세 정보를 확인합니다.')}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontWeight: 700, fontSize: 15, color: '#18181B' }}>필라테스 & 리포머 20회권</span>
                                                <span style={{ background: '#F5F3FF', color: '#6D28D9', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>
                                                    강남 시그니처점
                                                </span>
                                            </div>
                                            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: '#18181B' }} className="font-num">잔여 횟수: 8회 / 20회 (40%)</span>
                                                <span style={{ fontSize: 12, color: '#71717A' }} className="font-num">· 유효기간: 2026.05.01 ~ 2026.11.30</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ background: '#F5F3FF', color: '#6D28D9', fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 9999 }} className="font-num">
                                                D-80
                                            </span>
                                            <RightOutlined style={{ fontSize: 12, color: '#A1A1AA' }} />
                                        </div>
                                    </div>

                                    {/* Dedicated Section: 만료된 이용권 */}
                                    <div style={{ marginTop: 36 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontWeight: 700, fontSize: 16, color: '#18181B' }}>만료된 이용권</span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#71717A', background: '#F4F4F5', padding: '2px 9px', borderRadius: 9999 }}>
                                                전체 3건
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#A1A1AA', display: 'block', marginBottom: 16 }}>
                                            최근 1년 이내에 만료된 이용권만 표시됩니다.
                                        </span>

                                        <div
                                            style={{
                                                background: '#FAFAFC',
                                                border: '1px solid #F1F0F7',
                                                borderRadius: 18,
                                                padding: '18px 24px',
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
                                                style={{
                                                    width: '100%',
                                                    maxWidth: 240,
                                                    height: 38,
                                                    background: '#FFFFFF',
                                                    border: '1px solid #E4E4E7',
                                                    borderRadius: 12,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: '#71717A',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6,
                                                }}
                                                onClick={() => message.info('지난 이용권 2건을 추가로 불러왔습니다.')}
                                            >
                                                <span>지난 이용권 2건 더보기</span>
                                                <DownOutlined style={{ fontSize: 10 }} />
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
                                                background: noticeFilter === 'all' ? '#6D28D9' : '#F4F4F5',
                                                color: noticeFilter === 'all' ? '#FFFFFF' : '#71717A',
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
                                                background: noticeFilter === 'notice' ? '#6D28D9' : '#F4F4F5',
                                                color: noticeFilter === 'notice' ? '#FFFFFF' : '#71717A',
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
                                                background: noticeFilter === 'event' ? '#6D28D9' : '#F4F4F5',
                                                color: noticeFilter === 'event' ? '#FFFFFF' : '#71717A',
                                            }}
                                            onClick={() => setNoticeFilter('event')}
                                        >
                                            이벤트
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {/* Notice Item 1 (Important Notice Accordion) */}
                                        {(noticeFilter === 'all' || noticeFilter === 'notice') && (
                                            <div
                                                style={{
                                                    background: '#FFFFFF',
                                                    border: '1px solid #DDD6FE',
                                                    borderRadius: 16,
                                                    padding: 20,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                                }}
                                            >
                                                <div
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                                    onClick={() => setNoticeNoticeOpen(!noticeNoticeOpen)}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <span style={{ background: '#FFF1F2', color: '#E11D48', fontWeight: 700, fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid #FFE4E6' }}>
                                                            중요 공지
                                                        </span>
                                                        <h4 style={{ fontWeight: 700, fontSize: 15, color: '#18181B', margin: 0 }}>
                                                            스튜디오A 환기 공조 시스템 정기 점검 안내
                                                        </h4>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ fontSize: 12, color: '#71717A' }} className="font-num">2026.09.10</span>
                                                        {noticeNoticeOpen ? <UpOutlined style={{ fontSize: 12, color: '#71717A' }} /> : <DownOutlined style={{ fontSize: 12, color: '#71717A' }} />}
                                                    </div>
                                                </div>

                                                {noticeNoticeOpen && (
                                                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F4F1FC', fontSize: 12, color: '#52525B', lineHeight: 1.6 }}>
                                                        <p style={{ margin: '0 0 10px' }}>
                                                            회원 여러분의 쾌적하고 안전한 운동 환경을 위해 스튜디오A의 환기 및 공조 시스템 정기 살균 세척 작업이 진행됩니다. 점검 시간 동안 해당 스튜디오의 모든 수업 및 자유 이용이 일시 제한되오니 예약 시 참고 부탁드립니다.
                                                        </p>
                                                        <div style={{ borderRadius: 12, padding: '12px 14px', background: '#FAF9FD', border: '1px solid #EDE9FE' }}>
                                                            <div>· 점검 일시: <strong style={{ color: '#18181B' }}>2026년 9월 12일(토) 10:00 ~ 13:00 (총 3시간)</strong></div>
                                                            <div style={{ marginTop: 4 }}>· 대체 공간: <strong style={{ color: '#18181B' }}>스튜디오B 및 개인 스트레칭 존 정상 이용 가능</strong></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Notice Item 2 (Event) */}
                                        {(noticeFilter === 'all' || noticeFilter === 'event') && (
                                            <div
                                                style={{
                                                    background: '#FFFFFF',
                                                    border: '1px solid #F4F1FC',
                                                    borderRadius: 16,
                                                    padding: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => message.info('가을맞이 리프레시 빈야사 이벤트 상세 페이지로 이동합니다.')}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ background: '#EDE9FE', color: '#6D28D9', fontWeight: 700, fontSize: 11, padding: '3px 8px', borderRadius: 6 }}>
                                                            이벤트
                                                        </span>
                                                        <h4 style={{ fontWeight: 700, fontSize: 15, color: '#18181B', margin: 0 }}>
                                                            가을맞이 리프레시 빈야사 & 사운드 배스 오픈
                                                        </h4>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                                        <span style={{ fontSize: 12, color: '#71717A' }} className="font-num">2026.09.08 ~ 2026.09.30</span>
                                                        <span style={{ background: '#FFF7ED', color: '#EA580C', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, border: '1px solid #FED7AA' }}>
                                                            선착순 15명 한정 (D-9)
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 9999, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                                                        진행중
                                                    </span>
                                                    <RightOutlined style={{ fontSize: 12, color: '#94A3B8' }} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Notice Item 3 (Event) */}
                                        {(noticeFilter === 'all' || noticeFilter === 'event') && (
                                            <div
                                                style={{
                                                    background: '#FFFFFF',
                                                    border: '1px solid #F4F1FC',
                                                    borderRadius: 16,
                                                    padding: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => message.info('친구 초대 리워드 상세 페이지로 이동합니다.')}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ background: '#EDE9FE', color: '#6D28D9', fontWeight: 700, fontSize: 11, padding: '3px 8px', borderRadius: 6 }}>
                                                            이벤트
                                                        </span>
                                                        <h4 style={{ fontWeight: 700, fontSize: 15, color: '#18181B', margin: 0 }}>
                                                            친구 초대 리워드 — 2회 추가 횟수 즉시 적립
                                                        </h4>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                                        <span style={{ fontSize: 12, color: '#71717A' }}>상시 혜택</span>
                                                        <span style={{ background: '#FFF7ED', color: '#EA580C', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, border: '1px solid #FED7AA' }}>
                                                            신규 등록 시 적용
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 9999, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                                                        진행중
                                                    </span>
                                                    <RightOutlined style={{ fontSize: 12, color: '#94A3B8' }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                                        <button
                                            type="button"
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#71717A',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                padding: '10px 20px',
                                                borderRadius: 12,
                                            }}
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

                                            {/* Naver */}
                                            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F4F5' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 22, height: 22, background: '#03C75A', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: '#FFFFFF' }}>
                                                        N
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 14, color: '#18181B' }}>네이버 로그인</div>
                                                        <span style={{ fontSize: 12, color: '#A1A1AA', marginTop: 2, display: 'block' }}>연동된 계정이 없습니다</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    style={{ width: 84, height: 34, borderRadius: 9999, background: '#F5F3FF', border: 'none', fontSize: 12, fontWeight: 600, color: '#6D28D9', cursor: 'pointer' }}
                                                    onClick={() => message.info('네이버 간편 로그인 연동 화면으로 연결됩니다.')}
                                                >
                                                    연동하기
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
