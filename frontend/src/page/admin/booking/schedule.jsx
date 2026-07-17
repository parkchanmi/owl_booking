import React, { useEffect, useState, useMemo } from 'react';
import {
    Calendar, Badge, Card, Button, List, Modal, Form,
    Select, DatePicker, Popconfirm, message, Flex, Tag, ConfigProvider,
    Drawer, Descriptions, Table, Input, Space, Segmented,
} from 'antd';
import koKR from 'antd/locale/ko_KR';
import {
    PlusOutlined, DeleteOutlined, InfoCircleOutlined,
    SaveOutlined, LeftOutlined, RightOutlined, AuditOutlined,
    CalendarOutlined, BarsOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchCenters } from '../../../api/centerApi';
import { fetchPrograms } from '../../../api/programApi';
import { fetchInstructors } from '../../../api/instructorApi';

dayjs.locale('ko');

const REAL_PROGRAMS_URL = '/api/realprograms';
const ATTENDANCE_URL = '/api/attendance';
const DAY_MAP = ['일', '월', '화', '수', '목', '금', '토'];
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => dayjs().year() - 1 + i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const DOW_OPTIONS = ['월', '화', '수', '목', '금', '토', '일'];

const BookingSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [centers, setCenters] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [calendarDate, setCalendarDate] = useState(dayjs());
    const [viewMode, setViewMode] = useState('calendar');
    const [createOpen, setCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createForm] = Form.useForm();

    // 리스트 뷰 필터
    const [listYear, setListYear] = useState(null);
    const [listMonth, setListMonth] = useState(null);
    const [listDow, setListDow] = useState(null);
    const [listTime, setListTime] = useState(null);
    const [listInstructorId, setListInstructorId] = useState(null);

    // 상세 드로어
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailTarget, setDetailTarget] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('전체');
    const [memberSearch, setMemberSearch] = useState('');
    const [instructorSelectId, setInstructorSelectId] = useState(null);
    const [instructorSaving, setInstructorSaving] = useState(false);

    // 출석 드로어
    const [attendanceOpen, setAttendanceOpen] = useState(false);
    const [attendanceTarget, setAttendanceTarget] = useState(null);
    const [attendanceList, setAttendanceList] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [attendanceSaving, setAttendanceSaving] = useState(false);

    const loadSchedules = async () => {
        try {
            const res = await axios.get(REAL_PROGRAMS_URL);
            setSchedules(Array.isArray(res.data) ? res.data : []);
        } catch {
            message.error('스케줄 목록을 불러오지 못했습니다.');
        }
    };

    useEffect(() => {
        loadSchedules();
        fetchCenters()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setCenters(list);
                if (list.length > 0) setSelectedCenter(list[0].id);
            })
            .catch(() => message.error('센터 목록을 불러오지 못했습니다.'));
        fetchPrograms()
            .then((data) => setPrograms(Array.isArray(data) ? data : []))
            .catch(() => message.error('수업 목록을 불러오지 못했습니다.'));
        fetchInstructors()
            .then((data) => setInstructors(Array.isArray(data) ? data : []))
            .catch(() => message.error('강사 목록을 불러오지 못했습니다.'));
    }, []);

    const filteredSchedules = useMemo(
        () => (selectedCenter ? schedules.filter((s) => s.center?.id === selectedCenter) : schedules),
        [schedules, selectedCenter]
    );

    const filteredPrograms = selectedCenter
        ? programs.filter((p) => p.center?.id === selectedCenter)
        : programs;

    const watchedClassDate = Form.useWatch('classDate', createForm);

    const availablePrograms = useMemo(() => {
        const date = watchedClassDate || selectedDate;
        const dow = DAY_MAP[dayjs(date).day()];
        return filteredPrograms.filter((p) => p.dayOfWeek?.split(',').includes(dow));
    }, [filteredPrograms, watchedClassDate, selectedDate]);

    const centerInstructors = instructors.filter((i) => i.center?.id === selectedCenter);

    const uniqueTimes = useMemo(
        () => [...new Set(filteredSchedules.map((s) => s.program?.startTime).filter(Boolean))].sort(),
        [filteredSchedules]
    );

    const listViewData = useMemo(
        () =>
            filteredSchedules
                .filter((s) => {
                    const d = dayjs(s.programDat);
                    if (listYear && d.year() !== listYear) return false;
                    if (listMonth && d.month() + 1 !== listMonth) return false;
                    if (listDow && DAY_MAP[d.day()] !== listDow) return false;
                    if (listTime && s.program?.startTime !== listTime) return false;
                    if (listInstructorId && s.program?.instructor?.id !== listInstructorId) return false;
                    return true;
                })
                .sort((a, b) => dayjs(a.programDat).valueOf() - dayjs(b.programDat).valueOf()),
        [filteredSchedules, listYear, listMonth, listDow, listTime, listInstructorId]
    );

    const getSchedulesForDate = (date) =>
        filteredSchedules.filter(
            (s) => dayjs(s.programDat).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );

    const cellRender = (date, info) => {
        if (info.type !== 'date') return info.originNode;
        const daySchedules = getSchedulesForDate(date);
        if (daySchedules.length === 0) return null;
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {daySchedules.slice(0, 2).map((s) => (
                    <li key={s.id} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        <Badge status="processing" text={<span style={{ fontSize: 11 }}>{s.program?.name}</span>} />
                    </li>
                ))}
                {daySchedules.length > 2 && (
                    <li>
                        <span style={{ fontSize: 11, color: '#999' }}>+{daySchedules.length - 2}개 더</span>
                    </li>
                )}
            </ul>
        );
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${REAL_PROGRAMS_URL}/${id}`);
            message.success('스케줄이 삭제되었습니다.');
            loadSchedules();
        } catch {
            message.error('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleCreate = async (values) => {
        setSubmitting(true);
        try {
            const program = filteredPrograms.find((p) => p.id === values.programId);
            await axios.post(REAL_PROGRAMS_URL, {
                programDat: values.classDate.format('YYYY-MM-DD') + 'T00:00:00',
                center: program?.center?.id ? { id: program.center.id } : null,
                program: { id: values.programId },
            });
            message.success('스케줄이 생성되었습니다.');
            setCreateOpen(false);
            loadSchedules();
        } catch {
            message.error('스케줄 생성 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const openCreateModal = () => {
        createForm.resetFields();
        createForm.setFieldValue('classDate', selectedDate);
        setCreateOpen(true);
    };

    // ── 상세 드로어 ──
    const loadDetail = async (scheduleId) => {
        const res = await axios.get(`${REAL_PROGRAMS_URL}/${scheduleId}/detail`);
        setDetailData(res.data);
        setInstructorSelectId(res.data.instructorId ?? null);
    };

    const openDetail = async (schedule) => {
        setDetailOpen(true);
        setDetailTarget(schedule);
        setDetailData(null);
        setStatusFilter('전체');
        setMemberSearch('');
        setDetailLoading(true);
        try {
            await loadDetail(schedule.id);
        } catch {
            message.error('상세 정보를 불러오지 못했습니다.');
            setDetailOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            await axios.delete(`/api/bookings/${bookingId}`);
            message.success('예약이 취소되었습니다.');
            await loadDetail(detailTarget.id);
            loadSchedules();
        } catch {
            message.error('예약 취소 중 오류가 발생했습니다.');
        }
    };

    const handleConfirmWaitlist = async (waitlistId) => {
        try {
            await axios.post(`/api/waitlists/${waitlistId}/confirm`);
            message.success('대기가 확정(예약)되었습니다.');
            await loadDetail(detailTarget.id);
            loadSchedules();
        } catch {
            message.error('대기 확정 중 오류가 발생했습니다.');
        }
    };

    const handleSaveInstructor = async () => {
        if (!detailTarget) return;
        setInstructorSaving(true);
        try {
            await axios.put(`${REAL_PROGRAMS_URL}/${detailTarget.id}`, {
                programDat: dayjs(detailTarget.programDat).format('YYYY-MM-DDTHH:mm:ss'),
                center: detailTarget.center?.id ? { id: detailTarget.center.id } : null,
                program: detailTarget.program?.id ? { id: detailTarget.program.id } : null,
                instructor: instructorSelectId ? { id: instructorSelectId } : null,
            });
            message.success('강사가 변경되었습니다.');
            await loadDetail(detailTarget.id);
        } catch {
            message.error('강사 변경 중 오류가 발생했습니다.');
        } finally {
            setInstructorSaving(false);
        }
    };

    // ── 출석 드로어 ──
    const openAttendance = async (schedule) => {
        setAttendanceOpen(true);
        setAttendanceTarget(schedule);
        setAttendanceList([]);
        setAttendanceMap({});
        setAttendanceLoading(true);
        try {
            const res = await axios.get(`${ATTENDANCE_URL}/${schedule.id}`);
            const list = Array.isArray(res.data) ? res.data : [];
            setAttendanceList(list);
            const map = {};
            list.forEach((item) => {
                map[item.memberId] = item.attendanceStatus ?? null;
            });
            setAttendanceMap(map);
        } catch {
            message.error('출석 정보를 불러오지 못했습니다.');
            setAttendanceOpen(false);
        } finally {
            setAttendanceLoading(false);
        }
    };

    const handleSaveAttendance = async () => {
        if (!attendanceTarget) return;
        const records = Object.entries(attendanceMap)
            .filter(([, status]) => status !== null)
            .map(([memberId, status]) => ({ memberId, status }));
        if (records.length === 0) {
            message.info('변경된 출석 내역이 없습니다.');
            return;
        }
        setAttendanceSaving(true);
        try {
            const res = await axios.post(`${ATTENDANCE_URL}/${attendanceTarget.id}`, records);
            const list = Array.isArray(res.data) ? res.data : [];
            setAttendanceList(list);
            const map = {};
            list.forEach((item) => {
                map[item.memberId] = item.attendanceStatus ?? null;
            });
            setAttendanceMap(map);
            message.success('출석 내역이 저장되었습니다.');
            loadSchedules();
        } catch {
            message.error('저장 중 오류가 발생했습니다.');
        } finally {
            setAttendanceSaving(false);
        }
    };

    const toggleAttendance = (memberId, value) => {
        setAttendanceMap((prev) => ({
            ...prev,
            [memberId]: prev[memberId] === value ? null : value,
        }));
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
    };

    const selectedSchedules = getSchedulesForDate(selectedDate);

    const detailCenterInstructors = instructors.filter(
        (i) => i.center?.id === (detailTarget?.center?.id ?? selectedCenter)
    );

    const filteredBookings = (detailData?.bookings ?? []).filter((b) => {
        const matchStatus = statusFilter === '전체' || b.status === statusFilter;
        const keyword = memberSearch.trim();
        const matchName =
            !keyword ||
            b.memberName?.includes(keyword) ||
            b.memberLoginId?.includes(keyword) ||
            b.memberHp?.includes(keyword);
        return matchStatus && matchName;
    });

    const confirmModeLabel = (mode) => {
        if (mode === 'AUTO') return '자동 확정';
        if (mode === 'MANUAL') return '수동 확정';
        return '-';
    };

    // 공용 액션 버튼
    const scheduleActions = (s) => {
        const hasMembers = (s.bookingCount ?? 0) > 0 || (s.waitlistCount ?? 0) > 0;
        const deleteBtn = hasMembers ? (
            <Button
                key="del"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                    Modal.warning({
                        title: '스케줄을 삭제할 수 없습니다.',
                        content: `예약 ${s.bookingCount ?? 0}명, 대기 ${s.waitlistCount ?? 0}명이 있습니다. 예약/대기 내역을 먼저 처리한 후 삭제해주세요.`,
                        okText: '확인',
                    })
                }
            />
        ) : (
            <Popconfirm
                key="del"
                title="스케줄을 삭제하시겠습니까?"
                okText="삭제"
                cancelText="취소"
                onConfirm={() => handleDelete(s.id)}
            >
                <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
        );
        return [
            <Button key="detail" size="small" icon={<InfoCircleOutlined />} onClick={() => openDetail(s)} />,
            <Button key="attend" size="small" icon={<AuditOutlined />} onClick={() => openAttendance(s)} />,
            deleteBtn,
        ];
    };

    const viewSegmented = (
        <Segmented
            value={viewMode}
            onChange={handleViewModeChange}
            options={[
                { value: 'calendar', icon: <CalendarOutlined /> },
                { value: 'list', icon: <BarsOutlined /> },
            ]}
        />
    );

    // 리스트 뷰 테이블 컬럼
    const listColumns = [
        { title: '수업명', dataIndex: ['program', 'name'], width: 140 },
        { title: '강사', dataIndex: ['program', 'instructor', 'name'], width: 90, render: (v) => v || '-' },
        { title: '일자', dataIndex: 'programDat', width: 110, render: (v) => dayjs(v).format('YYYY-MM-DD') },
        { title: '요일', dataIndex: 'programDat', width: 60, align: 'center', render: (v) => DAY_MAP[dayjs(v).day()] },
        { title: '시간', width: 120, align: 'center', render: (_, s) => `${s.program?.startTime ?? ''} ~ ${s.program?.endTime ?? ''}` },
        { title: '예약', width: 80, align: 'center', render: (_, s) => <Tag color="blue">{s.bookingCount} / {s.program?.maxCapacity ?? '-'}</Tag> },
        { title: '대기', width: 80, align: 'center', render: (_, s) => <Tag color="orange">{s.waitlistCount} / {s.waitlistCapacity ?? '-'}</Tag> },
        {
            title: '',
            width: 100,
            align: 'center',
            render: (_, s) => <Space size={4}>{scheduleActions(s)}</Space>,
        },
    ];

    // 출석 상태 셀 렌더러
    const AttendanceCell = ({ memberId }) => {
        const val = attendanceMap[memberId];
        return (
            <Space size={4}>
                <Button
                    size="small"
                    type={val === 'PRESENT' ? 'primary' : 'default'}
                    style={val === 'PRESENT' ? { background: '#52c41a', borderColor: '#52c41a' } : {}}
                    onClick={() => toggleAttendance(memberId, 'PRESENT')}
                >
                    출석
                </Button>
                <Button
                    size="small"
                    type={val === 'ABSENT' ? 'primary' : 'default'}
                    danger={val === 'ABSENT'}
                    onClick={() => toggleAttendance(memberId, 'ABSENT')}
                >
                    결석
                </Button>
            </Space>
        );
    };

    const attendanceColumns = [
        { title: '회원명', dataIndex: 'memberName', width: 90 },
        { title: '연락처', dataIndex: 'memberHp', width: 120, render: (v) => v || '-' },
        {
            title: '예약상태',
            dataIndex: 'bookingStatus',
            width: 80,
            align: 'center',
            render: (v) => <Tag color={v === '예약' ? 'blue' : 'orange'}>{v}</Tag>,
        },
        {
            title: '출석',
            width: 140,
            align: 'center',
            render: (_, r) => <AttendanceCell memberId={r.memberId} />,
        },
    ];

    const bookingColumns = [
        { title: '회원명', dataIndex: 'memberName', width: 90 },
        { title: '연락처', dataIndex: 'memberHp', width: 120, render: (v) => v || '-' },
        { title: '아이디', dataIndex: 'memberLoginId', width: 90 },
        {
            title: '상태',
            dataIndex: 'status',
            width: 60,
            align: 'center',
            render: (v) => <Tag color={v === '예약' ? 'blue' : 'orange'}>{v}</Tag>,
        },
        ...(!detailData?.hasAttendance ? [{
            title: '',
            width: 80,
            align: 'center',
            render: (_, b) => {
                if (b.status === '예약') {
                    return (
                        <Popconfirm
                            title="예약을 취소하시겠습니까?"
                            okText="취소"
                            okButtonProps={{ danger: true }}
                            cancelText="닫기"
                            onConfirm={() => handleCancelBooking(b.id)}
                        >
                            <Button size="small" danger>예약취소</Button>
                        </Popconfirm>
                    );
                }
               /* if (b.status === '대기') {
                    return (
                        <Popconfirm
                            title="대기를 예약으로 확정하시겠습니까?"
                            okText="확정"
                            cancelText="닫기"
                            onConfirm={() => handleConfirmWaitlist(b.id)}
                        >
                            <Button size="small" type="primary">대기확정</Button>
                        </Popconfirm>
                    );
                }*/
                return null;
            },
        }] : []),
    ];

    return (
        <DashboardLayout title="수업 스케줄 관리">
            <ConfigProvider locale={koKR}>
                {/* 센터 선택 */}
                <Card bordered={false} style={{ marginBottom: 16 }}>
                    <Flex align="center" gap={12}>
                        <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>센터 선택</span>
                        <Select style={{ width: 240 }} value={selectedCenter} onChange={setSelectedCenter}>
                            {centers.map((c) => (
                                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                            ))}
                        </Select>
                    </Flex>
                </Card>

                {viewMode === 'list' ? (
                    /* ── 리스트 뷰 ── */
                    <Card bordered={false}>
                        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap={8}>
                            <Space wrap size={8}>
                                <Select value={listYear} onChange={setListYear} style={{ width: 90 }} size="small" allowClear placeholder="년도 전체">
                                    {YEAR_OPTIONS.map((y) => <Select.Option key={y} value={y}>{y}년</Select.Option>)}
                                </Select>
                                <Select value={listMonth} onChange={setListMonth} style={{ width: 80 }} size="small" allowClear placeholder="월 전체">
                                    {MONTH_OPTIONS.map((m) => <Select.Option key={m} value={m}>{m}월</Select.Option>)}
                                </Select>
                                <Select value={listDow} onChange={setListDow} style={{ width: 90 }} size="small" allowClear placeholder="요일 전체">
                                    {DOW_OPTIONS.map((d) => <Select.Option key={d} value={d}>{d}요일</Select.Option>)}
                                </Select>
                                <Select value={listTime} onChange={setListTime} style={{ width: 100 }} size="small" allowClear placeholder="시간 전체">
                                    {uniqueTimes.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                                </Select>
                                <Select value={listInstructorId} onChange={setListInstructorId} style={{ width: 110 }} size="small" allowClear placeholder="강사 전체">
                                    {centerInstructors.map((i) => <Select.Option key={i.id} value={i.id}>{i.name}</Select.Option>)}
                                </Select>
                            </Space>
                            <Space>
                                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>스케줄 생성</Button>
                                {viewSegmented}
                            </Space>
                        </Flex>
                        <Table
                            dataSource={listViewData}
                            columns={listColumns}
                            rowKey="id"
                            size="small"
                            pagination={{ pageSize: 20, showSizeChanger: false }}
                            locale={{ emptyText: '해당 조건의 스케줄이 없습니다.' }}
                            summary={() => (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={8}>
                                        <span style={{ fontSize: 12, color: '#999' }}>총 {listViewData.length}건</span>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            )}
                        />
                    </Card>
                ) : (
                    /* ── 달력 뷰 ── */
                    <Flex gap={16} align="flex-start">
                        <Card bordered={false} style={{ flex: 1, minWidth: 0 }}>
                            <Calendar
                                mode="month"
                                onPanelChange={(date) => setCalendarDate(date)}
                                onSelect={(date, { source }) => { if (source === 'date') setSelectedDate(date); }}
                                cellRender={cellRender}
                                headerRender={({ value, onChange }) => (
                                    <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                                        <Flex gap={6} align="center">
                                            <Button size="small" icon={<LeftOutlined />}
                                                onClick={() => onChange(value.subtract(1, 'month'))} />
                                            <Select value={value.year()} onChange={(y) => onChange(value.year(y))} size="small" style={{ width: 82 }}>
                                                {YEAR_OPTIONS.map((y) => <Select.Option key={y} value={y}>{y}년</Select.Option>)}
                                            </Select>
                                            <Select value={value.month() + 1} onChange={(m) => onChange(value.month(m - 1))} size="small" style={{ width: 68 }}>
                                                {MONTH_OPTIONS.map((m) => <Select.Option key={m} value={m}>{m}월</Select.Option>)}
                                            </Select>
                                            <Button size="small" icon={<RightOutlined />}
                                                onClick={() => onChange(value.add(1, 'month'))} />
                                        </Flex>
                                        <Space>
                                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>스케줄 생성</Button>
                                            {viewSegmented}
                                        </Space>
                                    </Flex>
                                )}
                            />
                        </Card>

                        {/* 선택일 스케줄 목록 */}
                        <Card
                            title={selectedDate.format('YYYY년 MM월 DD일 (ddd)')}
                            extra={<Tag color="blue">{selectedSchedules.length}건</Tag>}
                            bordered={false}
                            style={{ width: 320, flexShrink: 0 }}
                        >
                            {selectedSchedules.length === 0 ? (
                                <div style={{ color: '#999', textAlign: 'center', padding: '32px 0', fontSize: 13 }}>
                                    등록된 스케줄이 없습니다.
                                </div>
                            ) : (
                                <List
                                    dataSource={selectedSchedules}
                                    renderItem={(s) => (
                                        <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                                            <div style={{ width: '100%' }}>
                                                <Flex align="center" justify="space-between" gap={8} style={{ marginBottom: 4 }}>
                                                    <Flex align="center" gap={4} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                                        <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                                            {s.program?.name}
                                                        </span>
                                                        {s.program?.instructor?.name && (
                                                            <span style={{ fontSize: 13, fontWeight: 400, color: '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                                · {s.program.instructor.name}
                                                            </span>
                                                        )}
                                                    </Flex>
                                                    <Space size={4}>{scheduleActions(s)}</Space>
                                                </Flex>
                                                <div style={{ fontSize: 12, color: '#666' }}>
                                                    {s.program?.startTime ?? ''} ~ {s.program?.endTime ?? ''}
                                                </div>
                                                <div style={{ fontSize: 12, marginTop: 2 }}>
                                                    <span style={{ color: '#1677ff' }}>예약 {s.bookingCount ?? 0}/{s.program?.maxCapacity ?? '-'}</span>
                                                    <span style={{ color: '#999' }}> · </span>
                                                    <span style={{ color: '#fa8c16' }}>대기 {s.waitlistCount ?? 0}/{s.waitlistCapacity ?? '-'}</span>
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Card>
                    </Flex>
                )}
            </ConfigProvider>

            {/* 스케줄 생성 모달 */}
            <Modal title="수업 스케줄 생성" open={createOpen} onCancel={() => setCreateOpen(false)}
                onOk={() => createForm.submit()} okText="생성" cancelText="취소" confirmLoading={submitting} destroyOnClose>
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreate}
                    style={{ marginTop: 16 }}
                    onValuesChange={(changed) => {
                        if ('classDate' in changed) {
                            const dow = DAY_MAP[dayjs(changed.classDate).day()];
                            const currentProgramId = createForm.getFieldValue('programId');
                            const stillValid = filteredPrograms.find(
                                (p) => p.id === currentProgramId && p.dayOfWeek?.split(',').includes(dow)
                            );
                            if (!stillValid) createForm.setFieldValue('programId', undefined);
                        }
                    }}
                >
                    <Form.Item name="classDate" label="수업 날짜" rules={[{ required: true, message: '날짜를 선택해주세요.' }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="programId" label="수업 선택" rules={[{ required: true, message: '수업을 선택해주세요.' }]}>
                        <Select
                            placeholder={watchedClassDate ? `${DAY_MAP[dayjs(watchedClassDate).day()]}요일 개설 가능한 수업` : '수업 선택'}
                            showSearch
                            optionFilterProp="label"
                            notFoundContent="해당 요일에 개설 가능한 수업이 없습니다."
                        >
                            {availablePrograms.map((p) => (
                                <Select.Option key={p.id} value={p.id} label={p.name}>
                                    <div>{p.name}</div>
                                    <div style={{ fontSize: 11, color: '#999' }}>
                                        {p.dayOfWeek} {p.startTime}~{p.endTime}
                                        {p.instructor?.name ? ` · ${p.instructor.name}` : ''}
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 상세 드로어 */}
            <Drawer title="스케줄 상세" open={detailOpen} onClose={() => setDetailOpen(false)} width={560} loading={detailLoading}>
                {detailData && (
                    <>
                        <Descriptions title="수업 정보" bordered column={2} size="small" style={{ marginBottom: 24 }}>
                            <Descriptions.Item label="수업명" span={2}>{detailData.programName}</Descriptions.Item>
                            <Descriptions.Item label="강사" span={2}>
                                <Flex gap={8} align="center">
                                    <Select style={{ flex: 1 }} size="small" value={instructorSelectId} onChange={setInstructorSelectId} placeholder="강사 선택">
                                        {detailCenterInstructors.map((i) => (
                                            <Select.Option key={i.id} value={i.id}>{i.name}</Select.Option>
                                        ))}
                                    </Select>
                                    <Button size="small" type="primary" icon={<SaveOutlined />} loading={instructorSaving}
                                        disabled={instructorSelectId === detailData.instructorId} onClick={handleSaveInstructor}>
                                        저장
                                    </Button>
                                </Flex>
                            </Descriptions.Item>
                            <Descriptions.Item label="일자">{dayjs(detailData.programDat).format('YYYY-MM-DD (ddd)')}</Descriptions.Item>
                            <Descriptions.Item label="시간">{detailData.startTime} ~ {detailData.endTime}</Descriptions.Item>
                            <Descriptions.Item label="예약 인원">
                                <Tag color="blue">{detailData.bookingCount} / {detailData.maxCapacity ?? '-'}명</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="대기 인원">
                                <Tag color="orange">{detailData.waitlistCount} / {detailData.waitlistCapacity ?? '-'}명</Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <Descriptions title="적용 정책" bordered column={1} size="small" style={{ marginBottom: 24 }}>
                            <Descriptions.Item label="취소 가능 시간">
                                {detailData.cancleDeadlineMinutes != null ? `수업 ${detailData.cancleDeadlineMinutes}분 전까지` : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="대기 확정 방식">{confirmModeLabel(detailData.confirmMode)}</Descriptions.Item>
                        </Descriptions>

                        <div>
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>예약 회원 목록</div>
                            <Space style={{ marginBottom: 8 }}>
                                <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 100 }} size="small">
                                    <Select.Option value="전체">전체</Select.Option>
                                    <Select.Option value="예약">예약</Select.Option>
                                    <Select.Option value="대기">대기</Select.Option>
                                </Select>
                                <Input.Search placeholder="회원명/아이디/연락처" value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)} style={{ width: 200 }} size="small" allowClear />
                            </Space>
                            <Table dataSource={filteredBookings} columns={bookingColumns} rowKey="id" size="small"
                                pagination={{ pageSize: 10, hideOnSinglePage: true }} locale={{ emptyText: '예약 회원이 없습니다.' }} />
                        </div>
                    </>
                )}
            </Drawer>

            {/* 출석 드로어 */}
            <Drawer
                title={
                    <span>
                        출석 관리
                        {attendanceTarget && (
                            <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8, color: '#666' }}>
                                {attendanceTarget.program?.name} · {dayjs(attendanceTarget.programDat).format('MM/DD (ddd)')}
                            </span>
                        )}
                    </span>
                }
                open={attendanceOpen}
                onClose={() => setAttendanceOpen(false)}
                width={520}
                loading={attendanceLoading}
                footer={
                    <Flex justify="space-between" align="center">
                        <span style={{ fontSize: 12, color: '#999' }}>
                            출석/결석 버튼을 다시 클릭하면 선택 해제됩니다.
                        </span>
                        <Button type="primary" loading={attendanceSaving} onClick={handleSaveAttendance}>
                            저장
                        </Button>
                    </Flex>
                }
            >
                <Table
                    dataSource={attendanceList}
                    columns={attendanceColumns}
                    rowKey="memberId"
                    size="small"
                    pagination={false}
                    locale={{ emptyText: '예약 회원이 없습니다.' }}
                />
            </Drawer>
        </DashboardLayout>
    );
};

export default BookingSchedule;
