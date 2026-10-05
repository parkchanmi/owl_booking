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
    SyncOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import Header, { INITIAL_NOTIFICATIONS } from '../../components/common/Header';
import './userBooking.css';

const { Text } = Typography;

const KOREAN_DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const User = ({ hasTicket: propHasTicket, userTickets: propUserTickets, onNavigateBuyTicket }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();

    // 로그인한 실제 회원 정보
    const [memberInfo, setMemberInfo] = useState(null);

    // 지점 목록 (실제 백엔드 조회) - activeTicket 및 displayTicketName보다 먼저 선언
    const [centers, setCenters] = useState([]);
    const [selectedCenterId, setSelectedCenterId] = useState(null);
    const selectedCenter = useMemo(
        () => centers.find((c) => c.id === selectedCenterId) ?? centers[0] ?? null,
        [centers, selectedCenterId]
    );

    // URL 쿼리 파라미터 확인 (?hasTicket=false 또는 ?noTicket=true 등 개발/테스트/연동 지원)
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const queryOverride = useMemo(() => {
        if (searchParams.get('noTicket') === 'true' || searchParams.get('noTicket') === '1') return false;
        if (searchParams.get('hasTicket') === 'false' || searchParams.get('hasTicket') === '0') return false;
        if (searchParams.get('hasTicket') === 'true' || searchParams.get('hasTicket') === '1') return true;
        return null;
    }, [searchParams]);

    const [userMemberships, setUserMemberships] = useState([]);
    const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [hasTicketState, setHasTicketState] = useState(true);

    useEffect(() => {
        fetch('/api/member/info', { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setMemberInfo(data))
            .catch((err) => console.error('회원 정보 조회 실패:', err));
    }, []);

    // 회원의 실제 유효 이용권 보유 여부 확인 (잔여 횟수 및 만료일 기준)
    useEffect(() => {
        if (queryOverride !== null || propHasTicket !== undefined || propUserTickets !== undefined) return;
        if (!memberInfo?.id) return;

        fetch(`/api/admin/membermemberships?memberId=${memberInfo.id}`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (Array.isArray(data)) {
                    setUserMemberships(data);
                    const validPasses = data.filter((mm) => {
                        const countValid = mm.remainCount == null || mm.remainCount > 0;
                        const dateValid = !mm.endDat || !dayjs(mm.endDat).isBefore(dayjs().startOf('day'));
                        return countValid && dateValid;
                    });
                    setHasTicketState(validPasses.length > 0);
                }
            })
            .catch((err) => console.error('회원 이용권 조회 실패:', err));
    }, [memberInfo, queryOverride, propHasTicket, propUserTickets]);

    // 유효한 이용권 목록
    const validMemberships = useMemo(() => {
        if (Array.isArray(propUserTickets)) {
            return propUserTickets;
        }
        return userMemberships.filter((mm) => {
            const countValid = mm.remainCount == null || mm.remainCount > 0;
            const dateValid = !mm.endDat || !dayjs(mm.endDat).isBefore(dayjs().startOf('day'));
            return countValid && dateValid;
        });
    }, [propUserTickets, userMemberships]);

    const hasTicket = useMemo(() => {
        if (propHasTicket !== undefined) return Boolean(propHasTicket);
        if (Array.isArray(propUserTickets)) return propUserTickets.length > 0;
        if (queryOverride !== null) return queryOverride;
        return hasTicketState;
    }, [propHasTicket, propUserTickets, queryOverride, hasTicketState]);

    // 현재 표시할 활성 이용권 데이터 (없을 시 레퍼런스 시안의 기본값 표출)
    const activeTicket = useMemo(() => {
        if (validMemberships.length > 0) {
            return validMemberships[selectedTicketIndex % validMemberships.length];
        }
        return null;
    }, [validMemberships, selectedTicketIndex]);

    const displayTicketName = useMemo(() => {
        return activeTicket?.membership?.name
            || (selectedCenter?.name ? `${selectedCenter.name} 전용 30회권` : '강남 시그니처점 전용 30회권');
    }, [activeTicket, selectedCenter]);

    const displayTicketRemain = useMemo(() => {
        return activeTicket?.remainCount != null
            ? `${activeTicket.remainCount}회 남음`
            : '8회 남음';
    }, [activeTicket]);

    const displayTicketExpiry = useMemo(() => {
        return activeTicket?.endDat
            ? `유효기간: ${dayjs(activeTicket.endDat).format('YYYY.MM.DD')} 만료`
            : '유효기간: 2026.12.31 만료';
    }, [activeTicket]);

    const handleChangeTicket = () => {
        if (validMemberships.length > 1) {
            setTicketModalOpen(true);
        } else {
            message.info('보유 중인 다른 이용권 목록이 없습니다.');
        }
    };

    const handleBuyTicket = () => {
        if (onNavigateBuyTicket) {
            onNavigateBuyTicket();
        } else {
            navigate('/mypage?tab=passes');
        }
    };

    // 실제 스케줄(RealProgram) 목록
    const [realPrograms, setRealPrograms] = useState([]);
    const [programsLoading, setProgramsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/centers', { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                setCenters(data);
                if (data.length > 0) {
                    setSelectedCenterId((prev) => prev ?? data[0].id);
                }
            })
            .catch((err) => console.error('센터 목록 조회 실패:', err));
    }, []);

    useEffect(() => {
        setProgramsLoading(true);
        fetch('/api/realprograms', { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => setRealPrograms(data))
            .catch((err) => console.error('수업 스케줄 조회 실패:', err))
            .finally(() => setProgramsLoading(false));
    }, []);

    // 기준 오늘 날짜
    const BASE_TODAY = useMemo(() => dayjs(), []);

    // 날짜 상태: 선택된 전체 일자 및 월간 탐색 기준
    const [selectedDate, setSelectedDate] = useState(BASE_TODAY);
    const [currentMonthDate, setCurrentMonthDate] = useState(BASE_TODAY.startOf('month'));
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

    // 선택된 날짜 + 지점 기준 실제 수업 목록 (RealProgram을 카드/슬롯 구조로 그룹핑)
    const programsForSelectedDate = useMemo(() => {
        if (!selectedCenterId) return [];

        const filtered = realPrograms.filter((rp) => (
            rp.programDat
            && rp.center?.id === selectedCenterId
            && dayjs(rp.programDat).isSame(selectedDate, 'day')
        ));

        const groups = new Map();
        filtered.forEach((rp) => {
            const groupKey = rp.program?.id || `${rp.program?.name}-${rp.program?.startTime}`;
            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    id: groupKey,
                    title: rp.program?.name || '수업',
                    instructor: rp.program?.instructor?.name ? `${rp.program.instructor.name} 강사` : '강사 미배정',
                    slots: [],
                });
            }

            const maxCapacity = rp.program?.maxCapacity;
            const remain = maxCapacity != null ? Math.max(maxCapacity - (rp.bookingCount || 0), 0) : null;
            const hasBookingSeat = remain === null || remain > 0;
            const hasWaitlist = (rp.waitlistCount ?? 0) > 0;
            const waitlistCapacity = rp.waitlistCapacity;
            const isWaitlistFull = waitlistCapacity != null && (rp.waitlistCount ?? 0) >= waitlistCapacity;
            const isWaitlistAvailable = !isWaitlistFull && (!hasBookingSeat || hasWaitlist);
            groups.get(groupKey).slots.push({
                id: rp.id,
                realProgramId: rp.id,
                startTime: rp.program?.startTime,
                endTime: rp.program?.endTime,
                time: `${rp.program?.startTime ?? ''} - ${rp.program?.endTime ?? ''}`,
                remain,
                total: maxCapacity,
                waitlistCount: rp.waitlistCount ?? 0,
                waitlistCapacity,
                status: isWaitlistFull ? 'waitlistClosed' : isWaitlistAvailable ? 'waitlist' : 'open',
            });
        });

        return Array.from(groups.values());
    }, [realPrograms, selectedCenterId, selectedDate]);

    // 슬롯 선택 핸들러
    const handleSelectSlot = (program, slot) => {
        if (slot.status === 'waitlistClosed') return;

        setSelectedProgram(program);
        setSelectedSlot(slot);
        setIsWaitlist(slot.status === 'waitlist');
        setPanelState('form');

        // Form.Item DTO 필드 동기화
        form.setFieldsValue({
            centerId: selectedCenter?.id,
            realProgramId: slot.realProgramId,
            programDate: currentSelectedDate.format('YYYY-MM-DD'),
            startTime: slot.startTime,
            endTime: slot.endTime,
            termsAgree: true,
        });
    };

    // 예약 제출 핸들러 (실제 백엔드 예약 생성 API 호출)
    const handleReservationSubmit = async () => {
        if (!hasTicket) {
            message.warning('사용 가능한 이용권이 없습니다. 이용권을 먼저 구매해 주세요.');
            return;
        }

        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const response = await fetch(isWaitlist ? '/api/waitlists' : '/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ realProgramId: values.realProgramId || selectedSlot?.realProgramId }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                message.error(errorBody?.message || '수업 예약이 마감되었거나 처리 중 오류가 발생했습니다.');
                return;
            }

            message.success(isWaitlist ? '대기 신청이 완료되었습니다!' : '수업 예약이 정상적으로 완료되었습니다!');

            setConfirmedData({
                programTitle: selectedProgram.title,
                instructor: selectedProgram.instructor,
                dateTime: `${formattedDateString} · ${selectedSlot.time}`,
                location: selectedCenter?.name,
                isWaitlist,
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
                centers={centers}
                selectedCenterId={selectedCenterId}
                onSelectCenterId={(id) => {
                    setSelectedCenterId(id);
                    resetBookingState();
                    form.setFieldsValue({ centerId: id });
                }}
                userName={memberInfo?.name}
                userGrade={memberInfo?.hasAdminCenter ? '센터 관리자' : '일반 회원'}
                userInitials={memberInfo?.name ? memberInfo.name.slice(0, 1) : undefined}
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
                                {programsLoading ? (
                                    <div style={{ padding: '32px 0', textAlign: 'center', color: '#A1A1AA', fontSize: 13 }}>
                                        수업 목록을 불러오는 중입니다...
                                    </div>
                                ) : programsForSelectedDate.length === 0 ? (
                                    <div style={{ padding: '32px 0', textAlign: 'center', color: '#A1A1AA', fontSize: 13 }}>
                                        선택하신 날짜에 개설된 수업이 없습니다.
                                    </div>
                                ) : (
                                    programsForSelectedDate.map((prog) => (
                                        <article key={prog.id} className="class-schedule-card">
                                            <div className="class-card-meta">
                                                <div className="class-card-icon-badge">
                                                    <svg fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="22">
                                                        <circle cx="12" cy="4" r="2" />
                                                        <path d="m4 17 5-2 3-5 3 5 5 2" />
                                                        <path d="M12 9v5l-3 6" />
                                                        <path d="M15 20l-3-6" />
                                                    </svg>
                                                </div>
                                                <div className="class-card-text">
                                                    <h3>{prog.title}</h3>
                                                    <p>{prog.instructor}</p>
                                                </div>
                                            </div>

                                            {/* Slot Buttons */}
                                            <div className="class-card-slots">
                                                {prog.slots.map((slot) => {
                                                    const isSlotActive = selectedSlot?.id === slot.id;
                                                    const isClosed = slot.status === 'waitlistClosed';
                                                    const isWaitlistSlot = slot.status === 'waitlist';

                                                    return (
                                                        <button
                                                            key={slot.id}
                                                            type="button"
                                                            disabled={isClosed}
                                                            className={`fixed-slot-btn min-w-[84px] w-[84px] h-[44px] flex flex-col items-center justify-center ${
                                                                isClosed
                                                                    ? 'is-disabled'
                                                                    : isSlotActive
                                                                    ? 'is-active-regular'
                                                                    : ''
                                                            }`}
                                                            onClick={() => handleSelectSlot(prog, slot)}
                                                        >
                                                            <span className="slot-time">{slot.startTime}</span>
                                                            <span className="slot-count text-[10px] whitespace-nowrap tracking-tight leading-none mt-0.5">
                                                                {isClosed ? '대기마감' : isWaitlistSlot ? '대기' : `${slot.remain}/${slot.total}`}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </article>
                                    ))
                                )}
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
                                        {/* Top Center Preview Banner */}
                                        <div className="studio-banner-card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span className="studio-banner-tag">{selectedCenter?.name}</span>
                                            </div>
                                            <div className="studio-banner-bottom">
                                                <p className="studio-title">{selectedProgram.title}</p>
                                                <p className="studio-desc">{selectedProgram.instructor}</p>
                                            </div>
                                        </div>

                                        <h2 className="panel-details-header-title">
                                            예약 세부 정보
                                        </h2>

                                        {/* Selected Class Details Form & Info */}
                                        <Form form={form} layout="vertical" onFinish={handleReservationSubmit}>
                                            {/* Hidden form items mapping directly to backend DTO fields */}
                                            <Form.Item name="centerId" hidden><input /></Form.Item>
                                            <Form.Item name="realProgramId" hidden><input /></Form.Item>
                                            <Form.Item name="programDate" hidden><input /></Form.Item>
                                            <Form.Item name="startTime" hidden><input /></Form.Item>
                                            <Form.Item name="endTime" hidden><input /></Form.Item>

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
                                                        <span className="info-value-text">{selectedCenter?.name}</span>
                                                    </div>
                                                    <div className="info-grid-cell">
                                                        <span className="info-label">정원</span>
                                                        <span className="info-value-text">{selectedSlot.total != null ? `${selectedSlot.total}명` : '제한 없음'}</span>
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

                                            {hasTicket ? (
                                                <>
                                                    {/* 보유 이용권 카드 박스 (Reference: rsvp-general.png & code.html) */}
                                                    <div className="ticket-pass-card">
                                                        <div className="ticket-pass-card__top">
                                                            <div className="ticket-pass-title-group">
                                                                <div className="ticket-pass-icon">
                                                                    <svg
                                                                        width="14"
                                                                        height="14"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                                                                        <path d="M13 5v2" />
                                                                        <path d="M13 17v2" />
                                                                        <path d="M13 11v2" />
                                                                    </svg>
                                                                </div>
                                                                <span className="ticket-pass-name">{displayTicketName}</span>
                                                            </div>
                                                            <span className="ticket-remain-badge">{displayTicketRemain}</span>
                                                        </div>
                                                        <div className="ticket-pass-card__bottom">
                                                            <span className="ticket-expire-date">{displayTicketExpiry}</span>
                                                            <button
                                                                type="button"
                                                                className="ticket-change-btn"
                                                                onClick={handleChangeTicket}
                                                            >
                                                                <span>다른 이용권 사용</span>
                                                                <span style={{ fontSize: 13, lineHeight: 1 }}>›</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* 대기 예약 유의사항 박스 (Reference: rsvp-wait.png) */}
                                                    {isWaitlist && (
                                                        <div className="waitlist-notice-box">
                                                            <div className="waitlist-notice-title">
                                                                <InfoCircleOutlined style={{ color: '#D97706', fontSize: 13 }} />
                                                                <span>대기 예약 유의사항</span>
                                                            </div>
                                                            <div className="waitlist-notice-desc">
                                                                <p>• 공석 발생 시 대기 순서와 센터 설정에 따라 안내 메일이 발송됩니다.</p>
                                                                <p>• 예약 확정 시 이용권 1회가 차감됩니다.</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 취소 및 환불 규정 문구 & 약관 동의 체크박스 */}
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
                                                            initialValue={true}
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
                                                    </div>

                                                    {/* 예약 액션 버튼 및 하단 안내 문구 */}
                                                    <div style={{ marginTop: 16 }}>
                                                        {isWaitlist ? (
                                                            <Button
                                                                type="primary"
                                                                htmlType="submit"
                                                                loading={submitting}
                                                                className="btn-waitlist-submit"
                                                            >
                                                                <span>대기 예약 하기</span>
                                                                <SyncOutlined style={{ fontSize: 13 }} />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="primary"
                                                                htmlType="submit"
                                                                loading={submitting}
                                                                className="btn-reserve-submit"
                                                            >
                                                                <span>예약 완료하기</span>
                                                                <span style={{ fontSize: 16 }}>→</span>
                                                            </Button>
                                                        )}
                                                        <p className="cta-sub-note">
                                                            예약 관련 문의는 각 센터 고객센터를 이용해주세요.
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                /* No Ticket Card Component (Reference: uiux/reservationpage/rsvp-noticket.png) */
                                                <div className="rsvp-no-ticket-card">
                                                    <div className="rsvp-no-ticket-icon-wrap">
                                                        <svg
                                                            width="26"
                                                            height="26"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="#7C3AED"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                                                            <path d="M12 9v3" />
                                                            <circle cx="12" cy="15.5" r="0.75" fill="#7C3AED" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="rsvp-no-ticket-title">사용 가능한 이용권이 없습니다</h4>
                                                    <p className="rsvp-no-ticket-desc">
                                                        해당 클래스를 예약하려면 이용권을 먼저 구매해 주세요.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className="btn-buy-ticket"
                                                        onClick={handleBuyTicket}
                                                    >
                                                        <span>이용권 구매하러 가기</span>
                                                        <span style={{ fontSize: 16 }}>→</span>
                                                    </button>
                                                </div>
                                            )}
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

            {/* 다른 이용권 선택 모달 */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 16 }}>
                        <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="#7C3AED"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                            <path d="M13 5v2" />
                            <path d="M13 17v2" />
                            <path d="M13 11v2" />
                        </svg>
                        <span>보유 이용권 선택</span>
                    </div>
                }
                open={ticketModalOpen}
                onCancel={() => setTicketModalOpen(false)}
                footer={null}
                centered
                width={440}
            >
                <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {validMemberships.map((mm, idx) => {
                        const isSelected = (selectedTicketIndex % validMemberships.length) === idx;
                        return (
                            <div
                                key={mm.id || idx}
                                onClick={() => {
                                    setSelectedTicketIndex(idx);
                                    setTicketModalOpen(false);
                                    message.success(`'${mm.membership?.name || '선택한 이용권'}'(으)로 변경되었습니다.`);
                                }}
                                style={{
                                    padding: '14px 18px',
                                    borderRadius: 14,
                                    border: isSelected ? '1.5px solid #7C3AED' : '1px solid #EDE9FE',
                                    background: isSelected ? '#FAF8FF' : '#FFFFFF',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 14, color: '#18181B' }}>
                                        {mm.membership?.name || '이용권'}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 3 }}>
                                        {mm.endDat ? `유효기간: ${dayjs(mm.endDat).format('YYYY.MM.DD')} 만료` : '무제한'}
                                    </div>
                                </div>
                                <span
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: 9999,
                                        background: '#EDE9FE',
                                        color: '#6D28D9',
                                        fontSize: 11,
                                        fontWeight: 700,
                                    }}
                                >
                                    {mm.remainCount != null ? `${mm.remainCount}회 남음` : '기간제'}
                                </span>
                            </div>
                        );
                    })}
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
