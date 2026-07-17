import React, { useMemo, useState } from 'react';
import {
    BellOutlined,
    CheckCircleOutlined,
    DownOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    LeftOutlined,
    LogoutOutlined,
    RightOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './userBooking.css';

const centers = [
    { id: 1, name: '강남 시그니처점' },
    { id: 2, name: '서초 메인점' },
    { id: 3, name: '역삼 프리미엄점' },
];

const weekDays = [
    { day: 'MON', date: 11 },
    { day: 'TUE', date: 12 },
    { day: 'WED', date: 13, selected: true },
    { day: 'THU', date: 14 },
    { day: 'FRI', date: 15 },
    { day: 'SAT', date: 16, weekend: 'sat' },
    { day: 'SUN', date: 17, weekend: 'sun' },
];

const monthDays = [
    { date: 29, muted: true }, { date: 30, muted: true }, { date: 31, muted: true },
    { date: 1 }, { date: 2 }, { date: 3, weekend: 'sun' }, { date: 4 },
    { date: 5 }, { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 },
    { date: 10, weekend: 'sun' }, { date: 11 }, { date: 12 }, { date: 13, selected: true },
    { date: 14 }, { date: 15 }, { date: 16 }, { date: 17, weekend: 'sun' },
    { date: 18 }, { date: 19 }, { date: 20 }, { date: 21 }, { date: 22 },
    { date: 23 }, { date: 24, weekend: 'sun' }, { date: 25 }, { date: 26 },
    { date: 27 }, { date: 28 }, { date: 29 }, { date: 30 },
    { date: 1, muted: true }, { date: 2, muted: true },
];

const classes = [
    {
        id: 1,
        title: 'Power Vinyasa Yoga',
        trainer: 'Sarah Jenkins',
        studio: 'Studio A',
        icon: 'fitness',
        color: 'primary',
        slots: [
            { time: '07:30', count: '12 / 15', active: true },
            { time: '09:00', count: '7 / 15' },
            { time: '11:30', count: '3 / 15' },
            { time: '14:00', count: '15 / 15', wait: true },
        ],
    },
    {
        id: 2,
        title: 'Advanced Pilates',
        trainer: 'Michael Lee',
        studio: 'Studio B',
        icon: 'pilates',
        color: 'secondary',
        slots: [
            { time: '10:00', count: '14 / 15', almostFull: true },
            { time: '13:00', count: '9 / 15' },
            { time: '16:30', count: '마감', disabled: true },
        ],
    },
];

const classIcon = {
    fitness: '↗',
    pilates: '♙',
};

const User = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('week');
    const [selectedCenterId, setSelectedCenterId] = useState(1);

    const selectedCenter = useMemo(
        () => centers.find((center) => center.id === selectedCenterId) ?? centers[0],
        [selectedCenterId]
    );

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

    return (
        <div className="booking-page">
            <header className="booking-header">
                <div className="booking-header__inner">
                    <div className="booking-header__left">
                        <button className="booking-brand" type="button" onClick={() => navigate('/user/booking')}>
                            BooungBooking
                        </button>
                        <nav className="booking-nav" aria-label="회원 메뉴">
                            <button className="booking-nav__item booking-nav__item--active" type="button">
                                예약 관리
                            </button>
                            <button
                                className="booking-nav__item"
                                type="button"
                                onClick={() => navigate('/user/mypage/history')}
                            >
                                마이페이지
                            </button>
                        </nav>
                    </div>

                    <div className="booking-header__right">
                        <button className="icon-button" type="button" aria-label="알림">
                            <BellOutlined />
                        </button>
                        <div className="profile-box">
                            <div className="profile-copy">
                                <strong>Kim Ji-woo</strong>
                                <span>Premium Member</span>
                            </div>
                            <div className="profile-menu">
                                <button className="profile-avatar" type="button" aria-label="프로필 메뉴">
                                    K
                                </button>
                                <div className="profile-dropdown">
                                    <button type="button" onClick={handleLogout}>
                                        <LogoutOutlined />
                                        로그아웃
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="booking-main">
                <section className="booking-hero">
                    <h1>수업 예약하기</h1>
                    <p>에너지 넘치는 클래스로 당신의 성장을 응원합니다.</p>
                </section>

                <section className="center-card" aria-label="지점 선택">
                    <div className="center-card__info">
                        <div className="center-card__icon">
                            <EnvironmentOutlined />
                        </div>
                        <div>
                            <span>지점 선택</span>
                            <strong>
                                {selectedCenter.name}
                                <InfoCircleOutlined />
                            </strong>
                        </div>
                    </div>

                    <div className="center-select">
                        <button className="center-select__button" type="button">
                            지점 변경하기
                            <DownOutlined />
                        </button>
                        <div className="center-select__menu">
                            {centers.map((center) => (
                                <button
                                    key={center.id}
                                    type="button"
                                    className={center.id === selectedCenterId ? 'is-selected' : ''}
                                    onClick={() => setSelectedCenterId(center.id)}
                                >
                                    {center.name}
                                    {center.id === selectedCenterId && <CheckCircleOutlined />}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="calendar-card" aria-label="예약 날짜 선택">
                    <div className="calendar-card__top">
                        <div className="calendar-card__month">
                            <button type="button" aria-label="이전 주">
                                <LeftOutlined />
                            </button>
                            <strong>2024년 11월</strong>
                            <button type="button" aria-label="다음 주">
                                <RightOutlined />
                            </button>
                        </div>
                        <div className="calendar-switch" role="tablist" aria-label="달력 보기 방식">
                            <button
                                className={viewMode === 'week' ? 'is-active' : ''}
                                type="button"
                                onClick={() => setViewMode('week')}
                            >
                                주간
                            </button>
                            <button
                                className={viewMode === 'month' ? 'is-active' : ''}
                                type="button"
                                onClick={() => setViewMode('month')}
                            >
                                월간
                            </button>
                        </div>
                    </div>

                    {viewMode === 'week' ? (
                        <div className="week-grid">
                            {weekDays.map((day) => (
                                <button
                                    key={day.day}
                                    className={[
                                        'week-day',
                                        day.selected ? 'is-selected' : '',
                                        day.weekend ? `is-${day.weekend}` : '',
                                    ].filter(Boolean).join(' ')}
                                    type="button"
                                >
                                    <span>{day.day}</span>
                                    <strong>{day.date}</strong>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="month-view">
                            <div className="month-weekdays">
                                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                                    <span key={day}>{day}</span>
                                ))}
                            </div>
                            <div className="month-grid">
                                {monthDays.map((day, index) => (
                                    <button
                                        key={`${day.date}-${index}`}
                                        className={[
                                            'month-day',
                                            day.selected ? 'is-selected' : '',
                                            day.muted ? 'is-muted' : '',
                                            day.weekend ? `is-${day.weekend}` : '',
                                        ].filter(Boolean).join(' ')}
                                        type="button"
                                    >
                                        {day.date}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className="class-section">
                    <div className="section-title">
                        <span />
                        <h2>11월 13일 (수) 클래스</h2>
                    </div>

                    <div className="class-list">
                        {classes.map((classItem) => (
                            <article className="class-card" key={classItem.id}>
                                <div className="class-card__summary">
                                    <div className={`class-card__icon class-card__icon--${classItem.color}`}>
                                        {classIcon[classItem.icon]}
                                    </div>
                                    <div>
                                        <h3>{classItem.title}</h3>
                                        <p>
                                            <UserOutlined />
                                            {classItem.trainer}
                                        </p>
                                        <p>
                                            <EnvironmentOutlined />
                                            {classItem.studio}
                                        </p>
                                    </div>
                                </div>

                                <div className="slot-area">
                                    <span>Available Time Slots</span>
                                    <div className="slot-list">
                                        {classItem.slots.map((slot) => (
                                            <button
                                                key={`${classItem.id}-${slot.time}`}
                                                className={[
                                                    'slot-button',
                                                    slot.active ? 'is-active' : '',
                                                    slot.wait ? 'is-wait' : '',
                                                    slot.almostFull ? 'is-almost-full' : '',
                                                    slot.disabled ? 'is-disabled' : '',
                                                ].filter(Boolean).join(' ')}
                                                type="button"
                                                disabled={slot.disabled}
                                            >
                                                <strong>{slot.time}</strong>
                                                <span>{slot.count}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="booking-footer">
                <strong>BooungLab</strong>
                <nav aria-label="푸터 메뉴">
                    <a href="/terms">이용약관</a>
                    <a href="/privacy">개인정보처리방침</a>
                    <a href="/support">고객센터</a>
                    <a href="/company">회사소개</a>
                </nav>
                <p>© 2026 booung Lab. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default User;
