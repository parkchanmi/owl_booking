import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AuditOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FireOutlined,
    IdcardOutlined,
    ReloadOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    TrophyOutlined,
    UserOutlined,
    UserSwitchOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { Button, Select, Skeleton, message } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAttendance } from '../../api/attendanceApi';
import { fetchCenterConfigs } from '../../api/centerConfigApi';
import { fetchCenterMembers } from '../../api/centerMemberApi';
import { fetchCenters } from '../../api/centerApi';
import { fetchInstructors } from '../../api/instructorApi';
import { fetchRealPrograms } from '../../api/realProgramApi';
import './index.css';

dayjs.locale('ko');

const STAT_ITEMS = [
    { key: 'totalMembers', title: '전체 회원 수', suffix: '명', icon: <UserOutlined />, tone: 'violet' },
    { key: 'activeMembershipMembers', title: '이용권 등록 중인 회원 수', suffix: '명', icon: <IdcardOutlined />, tone: 'emerald' },
    { key: 'totalAdmins', title: '전체 관리자 수', suffix: '명', icon: <UserSwitchOutlined />, tone: 'purple' },
    { key: 'managerCount', title: '매니저 수', suffix: '명', icon: <TeamOutlined />, tone: 'sky' },
    { key: 'instructorCount', title: '강사 수', suffix: '명', icon: <TrophyOutlined />, tone: 'lime' },
    { key: 'monthClassCount', title: '이번달 진행중인 수업 수', suffix: '개', icon: <CalendarOutlined />, tone: 'indigo' },
    { key: 'todayClassCount', title: '오늘 진행중인 수업 수', suffix: '개', icon: <FireOutlined />, tone: 'amber' },
    { key: 'bookingMemberCount', title: '예약 회원 수', suffix: '명', icon: <CheckCircleOutlined />, tone: 'blue' },
    { key: 'waitlistMemberCount', title: '대기 회원 수', suffix: '명', icon: <ClockCircleOutlined />, tone: 'orange' },
    { key: 'presentMemberCount', title: '정상 출결 회원 수', suffix: '명', icon: <AuditOutlined />, tone: 'green' },
    { key: 'absentMemberCount', title: '결석 회원 수', suffix: '명', icon: <WarningOutlined />, tone: 'rose' },
];

const METRIC_GROUPS = [
    {
        key: 'people',
        label: 'People',
        title: '센터 구성 인원',
        description: '회원과 운영 인력을 한 번에 확인합니다.',
        icon: <TeamOutlined />,
        itemKeys: ['totalMembers', 'activeMembershipMembers', 'totalAdmins', 'managerCount', 'instructorCount'],
    },
    {
        key: 'program',
        label: 'Program',
        title: '수업 및 예약',
        description: '진행 수업과 오늘의 참여 수요입니다.',
        icon: <CalendarOutlined />,
        itemKeys: ['monthClassCount', 'todayClassCount', 'bookingMemberCount', 'waitlistMemberCount'],
    },
    {
        key: 'attendance',
        label: 'Attendance',
        title: '오늘 출결',
        description: '오늘 수업의 출결 집계입니다.',
        icon: <AuditOutlined />,
        itemKeys: ['presentMemberCount', 'absentMemberCount'],
    },
];

const safeList = (value) => (Array.isArray(value) ? value : []);
const isSameCenter = (item, centerId) => !centerId || item?.center?.id === centerId;
const uniqueCount = (items, getKey) => new Set(items.map(getKey).filter(Boolean)).size;
const parseJson = (value, fallback) => {
    if (!value) return fallback;
    try {
        return { ...fallback, ...JSON.parse(value) };
    } catch {
        return fallback;
    }
};
const collectCenters = (centerData, ...relatedData) => {
    const centerMap = new Map();

    safeList(centerData).forEach((center) => {
        if (center?.id) centerMap.set(center.id, center);
    });
    relatedData.flatMap(safeList).forEach((item) => {
        if (item?.center?.id) centerMap.set(item.center.id, item.center);
    });

    return Array.from(centerMap.values());
};

const Admin = () => {
    const [centers, setCenters] = useState([]);
    const [selectedCenterId, setSelectedCenterId] = useState(null);
    const [centerMembers, setCenterMembers] = useState([]);
    const [centerConfigs, setCenterConfigs] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const [centerData, centerMemberData, centerConfigData, instructorData, scheduleData] = await Promise.all([
                fetchCenters(),
                fetchCenterMembers(),
                fetchCenterConfigs(),
                fetchInstructors(),
                fetchRealPrograms(),
            ]);

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

            const centerList = collectCenters(
                centerData,
                centerMemberList,
                centerConfigList,
                instructorList,
                scheduleList
            );

            setCenters(centerList);
            setSelectedCenterId((currentCenterId) => (
                centerList.some((center) => center.id === currentCenterId)
                    ? currentCenterId
                    : centerList[0]?.id ?? null
            ));
            setCenterMembers(centerMemberList);
            setCenterConfigs(centerConfigList);
            setInstructors(instructorList);
            setSchedules(scheduleList);
            setAttendanceRows(attendanceList.flatMap(safeList));
        } catch {
            message.error('대시보드 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const selectedCenter = useMemo(
        () => centers.find((center) => center.id === selectedCenterId) ?? null,
        [centers, selectedCenterId]
    );

    const stats = useMemo(() => {
        const centerId = selectedCenterId;
        const membersByCenter = centerMembers.filter((item) => isSameCenter(item, centerId));
        const userMembers = membersByCenter.filter((item) => item.type === 'USER');
        const adminMembers = membersByCenter.filter((item) => item.type === 'ADMIN');
        const schedulesByCenter = schedules.filter((item) => isSameCenter(item, centerId));
        const configsByCenter = centerConfigs.filter((item) => isSameCenter(item, centerId));
        const todaySchedules = schedulesByCenter.filter((item) => dayjs(item.programDat).isSame(dayjs(), 'day'));
        const monthSchedules = schedulesByCenter.filter((item) => dayjs(item.programDat).isSame(dayjs(), 'month'));
        const userMemberIds = new Set(userMembers.map((item) => item.member?.id).filter(Boolean));
        const managerIds = configsByCenter.flatMap((config) => (
            parseJson(config.roleMemberMappingsJson, { MANAGER: [] }).MANAGER ?? []
        ));
        const attendanceByCenter = centerId
            ? attendanceRows.filter((row) => userMemberIds.has(row.memberId))
            : attendanceRows;

        return {
            totalMembers: uniqueCount(userMembers, (item) => item.member?.id),
            activeMembershipMembers: uniqueCount(
                userMembers.filter((item) => item.status === '이용중'),
                (item) => item.member?.id
            ),
            totalAdmins: uniqueCount(adminMembers, (item) => item.member?.id),
            managerCount: new Set(managerIds).size,
            instructorCount: centerId
                ? instructors.filter((item) => item.center?.id === centerId).length
                : instructors.length,
            monthClassCount: monthSchedules.length,
            todayClassCount: todaySchedules.length,
            bookingMemberCount: todaySchedules.reduce((sum, item) => sum + (item.bookingCount ?? 0), 0),
            waitlistMemberCount: todaySchedules.reduce((sum, item) => sum + (item.waitlistCount ?? 0), 0),
            presentMemberCount: uniqueCount(
                attendanceByCenter.filter((item) => item.attendanceStatus === 'PRESENT'),
                (item) => item.memberId
            ),
            absentMemberCount: uniqueCount(
                attendanceByCenter.filter((item) => item.attendanceStatus === 'ABSENT'),
                (item) => item.memberId
            ),
        };
    }, [attendanceRows, centerConfigs, centerMembers, instructors, schedules, selectedCenterId]);

    return (
        <DashboardLayout title="관리자 Dashboard" userLabel="부엉이 관리자님">
            <div className="admin-dashboard-shell">
                <section className="admin-briefing" aria-labelledby="admin-briefing-title">
                    <div className="admin-briefing-date" aria-label={dayjs().format('YYYY년 M월 D일 dddd')}>
                        <span>{dayjs().format('MMM').toUpperCase()}</span>
                        <strong>{dayjs().format('DD')}</strong>
                        <em>{dayjs().format('dddd')}</em>
                    </div>

                    <div className="admin-briefing-copy">
                        <div className="admin-briefing-kicker">
                            <ThunderboltOutlined />
                            <span>LIVE OPERATIONS</span>
                        </div>
                        <h2 id="admin-briefing-title">{selectedCenter?.name ?? '센터'} 운영 현황</h2>
                        <p>오늘 필요한 운영 숫자만 압축해서 보여드립니다.</p>
                        <div className="admin-center-switcher">
                            <div>
                                <span>조회 센터</span>
                                <Select
                                    value={selectedCenterId ?? undefined}
                                    onChange={setSelectedCenterId}
                                    variant="borderless"
                                    popupMatchSelectWidth={false}
                                    aria-label="센터 선택"
                                    loading={loading}
                                >
                                    {centers.map((center) => (
                                        <Select.Option key={center.id} value={center.id}>{center.name}</Select.Option>
                                    ))}
                                </Select>
                            </div>
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={loadDashboard}
                                loading={loading}
                                aria-label="대시보드 새로고침"
                            />
                        </div>
                    </div>

                    <div className="admin-briefing-live">
                        <div>
                            <span className="admin-briefing-live-icon"><FireOutlined /></span>
                            <span>오늘 수업</span>
                            <strong>{stats.todayClassCount}<small>개</small></strong>
                        </div>
                        <div>
                            <span className="admin-briefing-live-icon"><CheckCircleOutlined /></span>
                            <span>예약 회원</span>
                            <strong>{stats.bookingMemberCount}<small>명</small></strong>
                        </div>
                        <div>
                            <span className="admin-briefing-live-icon"><AuditOutlined /></span>
                            <span>정상 출결</span>
                            <strong>{stats.presentMemberCount}<small>명</small></strong>
                        </div>
                    </div>
                </section>

                <section className="admin-metrics" aria-labelledby="admin-metrics-title">
                    <header className="admin-metrics-header">
                        <div>
                            <span>OPERATIONS INDEX</span>
                            <h3 id="admin-metrics-title">운영 지표</h3>
                        </div>
                        <p>선택한 센터 기준 · {dayjs().format('YYYY.MM.DD HH:mm')}</p>
                    </header>

                    <div className="admin-metrics-grid">
                        {METRIC_GROUPS.map((group) => {
                            const items = group.itemKeys.map((key) => STAT_ITEMS.find((item) => item.key === key));
                            const maxValue = Math.max(...items.map((item) => stats[item.key]), 1);

                            return (
                                <section key={group.key} className={`admin-metric-group admin-metric-group-${group.key}`}>
                                    <header className="admin-metric-group-header">
                                        <span className="admin-metric-group-icon">{group.icon}</span>
                                        <div>
                                            <span>{group.label}</span>
                                            <h4>{group.title}</h4>
                                            <p>{group.description}</p>
                                        </div>
                                    </header>

                                    <div className="admin-metric-list">
                                        {items.map((item) => (
                                            <div key={item.key} className={`admin-metric-row tone-${item.tone}`}>
                                                {loading ? (
                                                    <Skeleton active title={false} paragraph={{ rows: 1, width: '100%' }} />
                                                ) : (
                                                    <>
                                                        <span className="admin-metric-icon">{item.icon}</span>
                                                        <div className="admin-metric-content">
                                                            <span>{item.title}</span>
                                                            <div className="admin-metric-track" aria-hidden="true">
                                                                <i style={{ width: `${Math.max((stats[item.key] / maxValue) * 100, stats[item.key] ? 8 : 0)}%` }} />
                                                            </div>
                                                        </div>
                                                        <strong>{stats[item.key]}<small>{item.suffix}</small></strong>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default Admin;
