import React, { useState, useMemo, useEffect } from 'react';
import {
    Form,
    Checkbox,
    Button,
    Dropdown,
    Modal,
    message,
    Spin,
    Badge,
    Typography,
} from 'antd';
import {
    BellOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    DownOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    LeftOutlined,
    RightOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Header, { INITIAL_NOTIFICATIONS } from '../../components/common/Header';
import './userBooking.css';

const { Text } = Typography;

// 센터 목록 및 상세 정보 (백엔드 CenterDto 대응)
const CENTERS = [
    {
        id: 1,
        name: '강남 시그니처점',
        addr: '서울 강남구 테헤란로 123',
        hours: '평일 06:00 - 23:00 / 주말 09:00 - 18:00',
        phone: '02-1234-5678',
        facility: '샤워실 완비 · 무료 주차 2시간 · 개별 락커',
    },
    {
        id: 2,
        name: '서초역점',
        addr: '서울 서초구 반포대로 45',
        hours: '평일 06:30 - 22:30 / 주말 09:00 - 18:00',
        phone: '02-2345-6789',
        facility: '개인 샤워부스 · 필라테스 기구 완비 · 타월 무료',
    },
    {
        id: 3,
        name: '역삼 테헤란점',
        addr: '서울 강남구 역삼로 88',
        hours: '평일 06:00 - 23:00 / 주말 09:00 - 18:00',
        phone: '02-3456-7890',
        facility: '발렛 파킹 · 프리미엄 스튜디오 · 인바디 측정',
    },
];

// 수업 데이터 (RealProgramDto 대응)
const CLASS_SCHEDULES = [
    {
        id: 'prog-1',
        title: 'Power Vinyasa Yoga',
        instructor: 'Sarah Jenkins 강사',
        studio: 'Studio A',
        studioDesc: 'Mindful Movement & Light · High-end Luxury Boutique',
        type: 'yoga',
        slots: [
            { id: 'slot-1-1', time: '07:30 - 08:30', startTime: '07:30', endTime: '08:30', remain: 12, total: 15, status: 'open' },
            { id: 'slot-1-2', time: '09:00 - 10:00', startTime: '09:00', endTime: '10:00', remain: 7, total: 15, status: 'open' },
            { id: 'slot-1-3', time: '11:30 - 12:30', startTime: '11:30', endTime: '12:30', remain: 0, total: 15, waitlistCount: 2, status: 'waitlist' },
            { id: 'slot-1-4', time: '14:00 - 15:00', startTime: '14:00', endTime: '15:00', remain: 0, total: 15, status: 'closed' },
        ],
    },
    {
        id: 'prog-2',
        title: 'Advanced Pilates',
        instructor: 'Michael Lee 강사',
        studio: 'Studio B',
        studioDesc: 'Core Balance & Precision · Ergonomic Reformer System',
        type: 'pilates',
        slots: [
            { id: 'slot-2-1', time: '10:00 - 11:00', startTime: '10:00', endTime: '11:00', remain: 0, total: 15, status: 'closed' },
            { id: 'slot-2-2', time: '13:00 - 14:00', startTime: '13:00', endTime: '14:00', remain: 14, total: 15, status: 'open' },
            { id: 'slot-2-3', time: '16:30 - 17:30', startTime: '16:30', endTime: '17:30', remain: 5, total: 15, status: 'open' },
        ],
    },
    {
        id: 'prog-3',
        title: 'Core Spinning',
        instructor: '박서연 강사',
        studio: 'Studio C',
        studioDesc: 'High Intensity Cardio Rhythm · Dynamic Lighting',
        type: 'spinning',
        slots: [
            { id: 'slot-3-1', time: '18:00 - 19:00', startTime: '18:00', endTime: '19:00', remain: 8, total: 20, status: 'open' },
            { id: 'slot-3-2', time: '20:00 - 21:00', startTime: '20:00', endTime: '21:00', remain: 0, total: 20, waitlistCount: 1, status: 'waitlist' },
        ],
    },
];

const KOREAN_DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const User = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // 지점 상태 (centerId)
    const [selectedCenterId, setSelectedCenterId] = useState(1);
    const selectedCenter = useMemo(
        () => CENTERS.find((c) => c.id === selectedCenterId) ?? CENTERS[0],
        [selectedCenterId]
    );

    // 기준 오늘 날짜 (2026년 9월 11일 금요일)
    const BASE_TODAY = useMemo(() => dayjs('2026-09-11'), []);

    // 날짜 상태: 선택된 전체 일자 및 월간 탐색 기준
    const [selectedDate, setSelectedDate] = useState(dayjs('2026-09-11'));
    const [currentMonthDate, setCurrentMonthDate] = useState(dayjs('2026-09-01'));
    const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'

    // 선택된 수업 및 슬롯 상태 (realProgramId, programDate, startTime 등)
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isWaitlist, setIsWaitlist] = useState(false);

    // 예약 프로세스 상태: 'empty' (State 0) | 'form' (State 1/2) | 'confirmed' (State 3)
    const [panelState, setPanelState] = useState('empty');
    const [submitting, setSubmitting] = useState(false);
    const [confirmedData, setConfirmedData] = useState(null);

    // 알림 및 모달 상태
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [policyModalOpen, setPolicyModalOpen] = useState(false);

    // 선택된 전체 일자 (기존 코드 호환)
    const currentSelectedDate = selectedDate;

    const formattedDateString = useMemo(() => {
        const dayKo = KOREAN_DAY_NAMES[selectedDate.day()];
        return `${selectedDate.format('YYYY.MM.DD')} (${dayKo})`;
    }, [selectedDate]);

    // 슬롯 선택 핸들러
    const handleSelectSlot = (program, slot) => {
        if (slot.status === 'closed') return;

        setSelectedProgram(program);
        setSelectedSlot(slot);
        const wait = slot.status === 'waitlist';
        setIsWaitlist(wait);
        setPanelState('form');

        // Form.Item DTO 필드 동기화
        form.setFieldsValue({
            centerId: selectedCenter.id,
            realProgramId: program.id,
            programDate: currentSelectedDate.format('YYYY-MM-DD'),
            startTime: slot.startTime,
            endTime: slot.endTime,
            ticketId: 'ticket-gn-30',
            termsAgree: true,
        });
    };

    // 예약 제출 핸들러 (백엔드 DTO 전송)
    const handleReservationSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            // 백엔드 예약 생성 DTO 페이로드 구성
            const bookingPayload = {
                centerId: values.centerId || selectedCenter.id,
                realProgramId: values.realProgramId || selectedProgram?.id,
                programDate: values.programDate || currentSelectedDate.format('YYYY-MM-DD'),
                startTime: values.startTime || selectedSlot?.startTime,
                endTime: values.endTime || selectedSlot?.endTime,
                ticketId: values.ticketId || 'ticket-gn-30',
                isWaitlist: isWaitlist,
            };

            // 백엔드 통신 시도
            try {
                const endpoint = isWaitlist ? '/api/waitlists' : '/api/bookings';
                await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingPayload),
                    credentials: 'include',
                });
            } catch (networkErr) {
                console.warn('API endpoint handled:', networkErr);
            }

            // 성공 처리
            const successMsg = isWaitlist
                ? '대기 예약 신청이 정상 접수되었습니다.'
                : '수업 예약이 정상적으로 완료되었습니다!';
            message.success(successMsg);

            setConfirmedData({
                programTitle: selectedProgram.title,
                instructor: selectedProgram.instructor,
                dateTime: `${formattedDateString} · ${selectedSlot.time}`,
                location: `${selectedCenter.name} (${selectedProgram.studio})`,
                isWaitlist: isWaitlist,
            });

            setPanelState('confirmed');
        } catch (error) {
            if (error.errorFields) {
                message.error('이용 약관 및 취소 규정에 동의해주세요.');
            } else {
                message.error('예약 처리 중 오류가 발생했습니다.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // 예약 초기화 핸들러
    const resetBookingState = () => {
        setSelectedSlot(null);
        setSelectedProgram(null);
        setPanelState('empty');
        setConfirmedData(null);
        form.resetFields();
    };

    // 로그아웃 핸들러
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

    // 주어진 날짜가 속한 주의 월요일 구하기 (한 주의 시작: 월요일=0일차, 일요일=6일차)
    const getMondayOfWeek = (date) => {
        const diffToMonday = (date.day() + 6) % 7;
        return date.subtract(diffToMonday, 'day').startOf('day');
    };

    // 주간 날짜 리스트 생성 (반드시 월요일 시작, 일요일은 한 주의 마지막 날로 고정)
    const weekDaysList = useMemo(() => {
        const startMonday = getMondayOfWeek(selectedDate);
        return Array.from({ length: 7 }).map((_, i) => {
            const date = startMonday.add(i, 'day');
            return {
                dayName: KOREAN_DAY_NAMES[date.day()],
                dayNum: date.date(),
                dateObj: date,
                isToday: date.isSame(BASE_TODAY, 'day'),
                isSelected: date.isSame(selectedDate, 'day'),
                isSat: date.day() === 6,
                isSun: date.day() === 0,
            };
        });
    }, [selectedDate, BASE_TODAY]);

    // 월간 달력 날짜 그리드 생성
    const monthCalendarGrid = useMemo(() => {
        const startOfMonth = currentMonthDate.startOf('month');
        const daysInMonth = currentMonthDate.daysInMonth();
        const startDayOfWeek = (startOfMonth.day() + 6) % 7; // 월요일 기준 인덱스 (0: 월 ~ 6: 일)

        const cells = [];
        // 이전 달의 패딩 셀
        const prevMonth = currentMonthDate.subtract(1, 'month');
        const prevDaysInMonth = prevMonth.daysInMonth();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = prevDaysInMonth - i;
            cells.push({
                num: d,
                isMuted: true,
                key: `prev-${i}`,
                dateObj: prevMonth.date(d),
            });
        }

        // 이번 달 셀
        for (let d = 1; d <= daysInMonth; d++) {
            const date = currentMonthDate.date(d);
            cells.push({
                num: d,
                isMuted: false,
                isSelected: date.isSame(selectedDate, 'day'),
                isToday: date.isSame(BASE_TODAY, 'day'),
                isSat: date.day() === 6,
                isSun: date.day() === 0,
                key: `cur-${d}`,
                dateObj: date,
            });
        }

        // 다음 달 패딩 셀 (총 35 or 42 셀 채우기)
        const remainder = 7 - (cells.length % 7);
        if (remainder < 7) {
            const nextMonth = currentMonthDate.add(1, 'month');
            for (let n = 1; n <= remainder; n++) {
                cells.push({
                    num: n,
                    isMuted: true,
                    key: `next-${n}`,
                    dateObj: nextMonth.date(n),
                });
            }
        }
        return cells;
    }, [currentMonthDate, selectedDate, BASE_TODAY]);

    // 전주/다음 주 또는 이전 달/다음 달 이동 핸들러
    const handlePrev = () => {
        if (viewMode === 'week') {
            setSelectedDate((prev) => {
                const next = prev.subtract(1, 'week');
                setCurrentMonthDate(next.startOf('month'));
                return next;
            });
        } else {
            setCurrentMonthDate((prev) => prev.subtract(1, 'month'));
        }
    };

    const handleNext = () => {
        if (viewMode === 'week') {
            setSelectedDate((prev) => {
                const next = prev.add(1, 'week');
                setCurrentMonthDate(next.startOf('month'));
                return next;
            });
        } else {
            setCurrentMonthDate((prev) => prev.add(1, 'month'));
        }
    };

    // 오늘 버튼 클릭 시 기준일(2026.09.11)로 복귀
    const handleGoToToday = () => {
        setSelectedDate(BASE_TODAY);
        setCurrentMonthDate(BASE_TODAY.startOf('month'));
    };

    // 주간/월간 뷰 모드 전환
    const handleSwitchViewMode = (mode) => {
        setViewMode(mode);
        if (mode === 'month') {
            setCurrentMonthDate(selectedDate.startOf('month'));
        }
    };

    // 상단 캘린더 타이틀
    const calendarTitle = useMemo(() => {
        if (viewMode === 'week') {
            return selectedDate.format('YYYY년 M월');
        }
        return currentMonthDate.format('YYYY년 M월');
    }, [viewMode, selectedDate, currentMonthDate]);

    return (
        <div className="booking-workspace-page">
            {/* Ambient Background Blobs */}
            <div className="ambient-blob-1" />
            <div className="ambient-blob-2" />

            {/* Floating Pill-Style Header */}
            <Header
                selectedCenterId={selectedCenterId}
                onSelectCenterId={(id) => {
                    setSelectedCenterId(id);
                    resetBookingState();
                    form.setFieldsValue({ centerId: id });
                }}
                notifications={notifications}
                onClearNotifications={() => setNotifications([])}
                onDeleteNotification={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
                onLogout={handleLogout}
                onNavigateSettings={() => navigate('/mypage?tab=settings')}
            />

            {/* Main Content Workspace (65% : 35% Split Grid) */}
            <main className="booking-workspace-main">
                <div className="booking-workspace-grid">
                    {/* ============================================== */}
                    {/* LEFT COLUMN (65% Width) : Class Booking Workspace */}
                    {/* ============================================== */}
                    <section className="booking-left-col">
                        {/* Hero Header */}
                        <div className="booking-hero-header">
                            <h1>수업 예약하기</h1>
                            <p>에너지 넘치는 클래스로 당신의 성장을 응원합니다.</p>
                        </div>

                        {/* Date Selector Glass Card */}
                        <div className="date-selector-card">
                            <div className="date-selector-card__top">
                                <div className="calendar-month-nav">
                                    <button
                                        type="button"
                                        className="calendar-nav-arrow"
                                        onClick={handlePrev}
                                        aria-label="이전"
                                    >
                                        <LeftOutlined />
                                    </button>
                                    <h2 className="calendar-month-title">
                                        {calendarTitle}
                                    </h2>
                                    <button
                                        type="button"
                                        className="calendar-nav-arrow"
                                        onClick={handleNext}
                                        aria-label="다음"
                                    >
                                        <RightOutlined />
                                    </button>
                                </div>

                                <div className="calendar-action-group">
                                    <button
                                        type="button"
                                        className="btn-today-pill"
                                        onClick={handleGoToToday}
                                    >
                                        <span className="today-dot" />
                                        오늘
                                    </button>

                                    <div className="view-segmented-track">
                                        <button
                                            type="button"
                                            className={`view-segment-btn ${viewMode === 'week' ? 'is-active' : ''}`}
                                            onClick={() => handleSwitchViewMode('week')}
                                        >
                                            주간
                                        </button>
                                        <button
                                            type="button"
                                            className={`view-segment-btn ${viewMode === 'month' ? 'is-active' : ''}`}
                                            onClick={() => handleSwitchViewMode('month')}
                                        >
                                            월간
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* View 1: Weekly Strip */}
                            {viewMode === 'week' ? (
                                <div className="weekly-strip-grid">
                                    {weekDaysList.map((day) => (
                                        <button
                                            key={`week-${day.dateObj.format('YYYY-MM-DD')}`}
                                            type="button"
                                            className={`week-day-pill ${day.isSelected ? 'is-selected' : ''} ${day.isToday ? 'is-today' : ''} ${day.isSat ? 'is-sat' : ''} ${day.isSun ? 'is-sun' : ''}`}
                                            onClick={() => setSelectedDate(day.dateObj)}
                                        >
                                            <span className="week-day-name">{day.dayName}</span>
                                            <div className="week-day-num">{day.dayNum}</div>
                                            <div className="today-indicator-slot">
                                                {day.isToday ? (
                                                    <span className="today-indicator-dot" />
                                                ) : (
                                                    <span className="today-indicator-dot" style={{ opacity: 0 }} />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                /* View 2: Monthly Grid */
                                <div className="monthly-calendar-container">
                                    <div className="month-weekday-row">
                                        <span>월</span>
                                        <span>화</span>
                                        <span>수</span>
                                        <span>목</span>
                                        <span>금</span>
                                        <span style={{ color: '#0284C7' }}>토</span>
                                        <span style={{ color: '#E11D48' }}>일</span>
                                    </div>
                                    <div className="month-days-grid">
                                        {monthCalendarGrid.map((cell) => (
                                            <button
                                                key={cell.key}
                                                type="button"
                                                disabled={cell.isMuted}
                                                className={`month-day-cell ${cell.isMuted ? 'is-muted' : ''} ${cell.isSelected ? 'is-selected' : ''} ${cell.isSat ? 'is-sat' : ''} ${cell.isSun ? 'is-sun' : ''}`}
                                                onClick={() => !cell.isMuted && setSelectedDate(cell.dateObj)}
                                            >
                                                {cell.num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected Day Classes Section */}
                        <div className="class-schedule-section">
                            <div className="class-section-header">
                                <span className="class-section-header__bar">|</span>
                                <span>{selectedDate.format('M월 D일')} ({KOREAN_DAY_NAMES[selectedDate.day()]}) 클래스</span>
                            </div>

                            <div className="class-cards-list">
                                {CLASS_SCHEDULES.map((prog) => (
                                    <article key={prog.id} className="class-schedule-card">
                                        <div className="class-card-meta">
                                            <div className="class-card-icon-badge">
                                                {prog.type === 'yoga' && (
                                                    <svg fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="22">
                                                        <circle cx="12" cy="4" r="2" />
                                                        <path d="m4 17 5-2 3-5 3 5 5 2" />
                                                        <path d="M12 9v5l-3 6" />
                                                        <path d="M15 20l-3-6" />
                                                    </svg>
                                                )}
                                                {prog.type === 'pilates' && (
                                                    <svg fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="22">
                                                        <path d="m6.5 6.5 11 11" />
                                                        <path d="m21 21-1-1a2 2 0 0 0-2.83 0l-.88.88a2 2 0 0 1-2.83 0l-1.41-1.41a2 2 0 0 1 0-2.83l.88-.88a2 2 0 0 0 0-2.83l-1-1" />
                                                        <path d="m3 3 1 1a2 2 0 0 0 2.83 0l.88-.88a2 2 0 0 1 2.83 0l1.41 1.41a2 2 0 0 1 0 2.83l-.88.88a2 2 0 0 0 0 2.83l1 1" />
                                                    </svg>
                                                )}
                                                {prog.type === 'spinning' && (
                                                    <svg fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="22">
                                                        <circle cx="12" cy="12" r="8" />
                                                        <path d="M12 2v4" />
                                                        <path d="M12 18v4" />
                                                        <path d="m4.93 4.93 2.83 2.83" />
                                                        <path d="m16.24 16.24 2.83 2.83" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="class-card-text">
                                                <h3>{prog.title}</h3>
                                                <p>{prog.instructor} · {prog.studio}</p>
                                            </div>
                                        </div>

                                        {/* Slot Buttons */}
                                        <div className="class-card-slots">
                                            {prog.slots.map((slot) => {
                                                const isSlotActive = selectedSlot?.id === slot.id;
                                                const isWait = slot.status === 'waitlist';
                                                const isClosed = slot.status === 'closed';

                                                return (
                                                    <button
                                                        key={slot.id}
                                                        type="button"
                                                        disabled={isClosed}
                                                        className={`fixed-slot-btn min-w-[84px] w-[84px] h-[44px] flex flex-col items-center justify-center ${
                                                            isClosed
                                                                ? 'is-disabled'
                                                                : isWait
                                                                ? `is-waitlist ${isSlotActive ? 'is-active-waitlist' : ''}`
                                                                : isSlotActive
                                                                ? 'is-active-regular'
                                                                : ''
                                                        }`}
                                                        onClick={() => handleSelectSlot(prog, slot)}
                                                    >
                                                        <span className="slot-time">{slot.startTime}</span>
                                                        <span className="slot-count text-[10px] whitespace-nowrap tracking-tight leading-none mt-0.5">
                                                            {isClosed
                                                                ? '마감'
                                                                : isWait
                                                                ? `${slot.total}/${slot.total} (대기)`
                                                                : `${slot.remain}/${slot.total}`}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ============================================== */}
                    {/* RIGHT COLUMN (35% Width) : Sticky Confirmation Card */}
                    {/* ============================================== */}
                    <aside className="booking-right-col">
                        <div className="booking-confirm-panel">
                            {/* [STATE 0: DEFAULT EMPTY STATE] */}
                            {panelState === 'empty' && (
                                <div className="panel-empty-view">
                                    <div className="empty-clock-icon-wrapper">
                                        <ClockCircleOutlined />
                                    </div>
                                    <h3>원하는 일정을 선택해 주세요</h3>
                                    <p>좌측 목록에서 수업 시간을 선택하시면<br />상세 정보 확인 및 예약 진행이 가능합니다.</p>
                                </div>
                            )}

                            {/* [STATE 1 & 2: RESERVATION DETAIL / FORM VIEW] */}
                            {panelState === 'form' && selectedProgram && selectedSlot && (
                                <div className="panel-details-view">
                                    <div>
                                        {/* Top Studio Preview Banner */}
                                        <div className="studio-banner-card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span className="studio-banner-tag">{selectedProgram.studio}</span>
                                                <span className="studio-banner-preview-badge">PREVIEW</span>
                                            </div>
                                            <div className="studio-banner-bottom">
                                                <p className="studio-title">{selectedProgram.studioDesc.split('·')[0]}</p>
                                                <p className="studio-desc">{selectedProgram.studioDesc.split('·')[1] || 'High-end Luxury Boutique'}</p>
                                            </div>
                                        </div>

                                        <h2 className="panel-details-header-title">
                                            {isWaitlist ? '대기 예약 세부 정보' : '예약 세부 정보'}
                                        </h2>

                                        {/* Selected Class Details Form & Info */}
                                        <Form form={form} layout="vertical" onFinish={handleReservationSubmit}>
                                            {/* Hidden form items mapping directly to backend DTO fields */}
                                            <Form.Item name="centerId" hidden><input /></Form.Item>
                                            <Form.Item name="realProgramId" hidden><input /></Form.Item>
                                            <Form.Item name="programDate" hidden><input /></Form.Item>
                                            <Form.Item name="startTime" hidden><input /></Form.Item>
                                            <Form.Item name="endTime" hidden><input /></Form.Item>
                                            <Form.Item name="ticketId" hidden><input /></Form.Item>

                                            <div className="info-rows-container">
                                                <div>
                                                    <span className="info-label">선택된 클래스</span>
                                                    <div className="info-class-name">
                                                        <span className="info-class-check">✓</span>
                                                        <span>{selectedProgram.title}</span>
                                                    </div>
                                                </div>

                                                <div className="info-grid-2col">
                                                    <div className="info-grid-cell">
                                                        <span className="info-label">지점</span>
                                                        <span className="info-value-text">{selectedCenter.name}</span>
                                                    </div>
                                                    <div className="info-grid-cell">
                                                        <span className="info-label">스튜디오</span>
                                                        <span className="info-value-text">{selectedProgram.studio}</span>
                                                    </div>
                                                </div>

                                                <div className="info-grid-2col">
                                                    <div className="info-grid-cell">
                                                        <span className="info-label">날짜</span>
                                                        <span className="info-value-text">{formattedDateString}</span>
                                                    </div>
                                                    <div className="info-grid-cell">
                                                        <span className="info-label">시간</span>
                                                        <span className="info-value-highlight">{selectedSlot.time}</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="info-label">강사</span>
                                                    <span className="info-value-text">{selectedProgram.instructor}</span>
                                                </div>
                                            </div>

                                            {/* Pass / Ticket Information Card */}
                                            <div className="ticket-pass-card">
                                                <div className="ticket-pass-card__top">
                                                    <div className="ticket-pass-title-group">
                                                        <div className="ticket-pass-icon">
                                                            <CalendarOutlined style={{ fontSize: 14 }} />
                                                        </div>
                                                        <span className="ticket-pass-name">{selectedCenter.name} 전용 30회권</span>
                                                    </div>
                                                    <span className="ticket-remain-badge">8회 남음</span>
                                                </div>
                                                <div className="ticket-pass-card__bottom">
                                                    <span className="ticket-expire-date">유효기간: 2026.12.31 만료</span>
                                                    <button
                                                        type="button"
                                                        className="ticket-change-btn"
                                                        onClick={() => message.info('보유 중인 다른 이용권 목록이 없습니다.')}
                                                    >
                                                        다른 이용권 사용 ›
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Waitlist Flow Notice Box */}
                                            {isWaitlist && (
                                                <div className="waitlist-notice-box bg-transparent border-none p-0 shadow-none">
                                                    <div className="waitlist-notice-title font-bold text-[13px] text-[#D97706] flex items-center gap-1 mb-1.5">
                                                        <span>ⓘ 대기 예약 유의사항</span>
                                                    </div>
                                                    <div className="waitlist-notice-desc text-[11px] text-[#71717A] leading-[1.4] tracking-normal space-y-1">
                                                        <p className="m-0">• 공석 발생 시 카카오 알림톡 발송</p>
                                                        <p className="m-0">• 알림 수신 후 1시간 이내 확정 시 이용권 1회 차감</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Policy & Terms Checkbox */}
                                            <div className="policy-box">
                                                <div className="policy-header">
                                                    <SafetyCertificateOutlined className="policy-header-icon" />
                                                    <span>취소 및 환불 규정</span>
                                                </div>
                                                <p className="policy-desc">
                                                    수업 시작 3시간 전까지 무료 취소 가능하며, 무단 결석 시 이용권이 차감됩니다.
                                                </p>

                                                <Form.Item
                                                    name="termsAgree"
                                                    valuePropName="checked"
                                                    rules={[
                                                        {
                                                            validator: (_, value) =>
                                                                value
                                                                    ? Promise.resolve()
                                                                    : Promise.reject(new Error('취소 규정에 동의해주세요.')),
                                                        },
                                                    ]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox>
                                                        <span className="policy-checkbox-label">
                                                            이용 약관 및 취소 규정에 동의합니다.{' '}
                                                            <span className="policy-required-tag">(필수)</span>
                                                        </span>
                                                    </Checkbox>
                                                </Form.Item>
                                                <Button
                                                    type="link"
                                                    size="small"
                                                    style={{ padding: 0, fontSize: 11, color: '#8B5CF6' }}
                                                    onClick={() => setPolicyModalOpen(true)}
                                                >
                                                    전문 확인하기 ›
                                                </Button>
                                            </div>

                                            {/* Bottom Action CTA Button */}
                                            <div style={{ marginTop: 16 }}>
                                                {isWaitlist ? (
                                                    <Button
                                                        type="primary"
                                                        htmlType="submit"
                                                        loading={submitting}
                                                        className="btn-waitlist-submit"
                                                    >
                                                        대기 예약 하기
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="primary"
                                                        htmlType="submit"
                                                        loading={submitting}
                                                        className="btn-reserve-submit"
                                                    >
                                                        예약 완료하기 →
                                                    </Button>
                                                )}
                                                <p className="cta-sub-note">
                                                    예약 관련 문의는 각 센터 고객센터를 이용해주세요.
                                                </p>
                                            </div>
                                        </Form>
                                    </div>
                                </div>
                            )}

                            {/* [STATE 3: CONFIRMATION VIEW] */}
                            {panelState === 'confirmed' && confirmedData && (
                                <div className="panel-success-view">
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div className="success-badge-icon">
                                            <CheckOutlined />
                                        </div>
                                        <h3>
                                            {confirmedData.isWaitlist ? '대기 접수가 완료되었습니다!' : '예약이 완료되었습니다!'}
                                        </h3>
                                        <p className="success-subtext">
                                            {confirmedData.isWaitlist
                                                ? '공석 발생 시 우선순위에 따라 카카오톡으로 안내해 드립니다.'
                                                : '성공적으로 수업이 예약되었습니다.\n스튜디오에서 뵙겠습니다.'}
                                        </p>

                                        {/* Confirmation Summary Card */}
                                        <div className="success-summary-card">
                                            <div>
                                                <span className="summary-item-label">수업명</span>
                                                <span className="summary-item-value">{confirmedData.programTitle}</span>
                                            </div>
                                            <div>
                                                <span className="summary-item-label">강사</span>
                                                <span className="summary-item-value">{confirmedData.instructor}</span>
                                            </div>
                                            <div>
                                                <span className="summary-item-label">일시</span>
                                                <span className="summary-item-value is-purple">{confirmedData.dateTime}</span>
                                            </div>
                                            <div>
                                                <span className="summary-item-label">장소</span>
                                                <span className="summary-item-value">{confirmedData.location}</span>
                                            </div>
                                            <div>
                                                <span className="summary-item-label">예약 상태</span>
                                                <span className={`success-status-badge ${confirmedData.isWaitlist ? 'is-waitlist px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-xs font-bold text-[#EA580C]' : ''}`}>
                                                    {confirmedData.isWaitlist ? '대기 예약' : '예약 확정'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirmation Actions */}
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <Button
                                            type="primary"
                                            className="btn-history-link"
                                            onClick={() => navigate('/user/mypage/history')}
                                        >
                                            내 예약 내역 확인하기
                                        </Button>
                                        <Button
                                            className="btn-reset-booking"
                                            onClick={resetBookingState}
                                        >
                                            다른 수업 예약하기
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </main>

            {/* Detailed Policy Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 16 }}>
                        <SafetyCertificateOutlined style={{ color: '#7C3AED' }} />
                        <span>취소 및 환불 상세 규정</span>
                    </div>
                }
                open={policyModalOpen}
                onCancel={() => setPolicyModalOpen(false)}
                footer={[
                    <Button
                        key="confirm"
                        type="primary"
                        block
                        style={{ height: 44, borderRadius: 12, background: '#7C3AED', fontWeight: 700 }}
                        onClick={() => {
                            form.setFieldsValue({ termsAgree: true });
                            setPolicyModalOpen(false);
                            message.success('규정에 동의하셨습니다.');
                        }}
                    >
                        확인했습니다
                    </Button>,
                ]}
            >
                <div style={{ padding: '12px 0' }}>
                    <div className="policy-modal-card">
                        <h4>제 1 조 (수업 예약 및 취소 시간)</h4>
                        <p>모든 그룹 레슨은 시작 3시간 전까지 모바일 웹 및 앱을 통해 무료 취소가 가능합니다.</p>
                    </div>
                    <div className="policy-modal-card">
                        <h4>제 2 조 (노쇼 및 페널티)</h4>
                        <p>수업 시작 3시간 이내 취소 또는 미출석(No-Show) 시 수강권 1회가 자동 차감 처리됩니다.</p>
                    </div>
                    <div className="policy-modal-card">
                        <h4>제 3 조 (대기 예약 및 자동 확정)</h4>
                        <p>대기 인원 중 취소자 발생 시 우선순위에 따라 카카오 알림톡/메일이 발송되며, 알림 수신 후 60분 이내 확정 버튼을 눌러야 최종 접수됩니다.</p>
                    </div>
                </div>
            </Modal>

            {/* Bottom Footer (1140px Max-Width) */}
            <footer className="booking-workspace-footer">
                <div className="booking-workspace-footer__inner">
                    <div className="footer-copy">
                        © 2026 booung Lab. All rights reserved.
                    </div>
                    <div className="footer-nav">
                        <a href="#terms" onClick={(e) => { e.preventDefault(); message.info('이용약관 페이지 준비 중입니다.'); }}>이용약관</a>
                        <span className="footer-dot">·</span>
                        <a href="#privacy" onClick={(e) => { e.preventDefault(); message.info('개인정보처리방침 페이지 준비 중입니다.'); }}>개인정보처리방침</a>
                        <span className="footer-dot">·</span>
                        <a href="#about" onClick={(e) => { e.preventDefault(); message.info('회사소개 페이지 준비 중입니다.'); }}>회사소개</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default User;
