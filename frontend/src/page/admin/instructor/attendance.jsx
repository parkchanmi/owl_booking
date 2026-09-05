import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, ConfigProvider, Descriptions, Empty, Flex, Input, Select, Space, Spin, Table, Tag, message } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { AuditOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchInstructors } from '../../../api/instructorApi';

dayjs.locale('ko');

const REAL_PROGRAMS_URL = '/api/realprograms';
const ATTENDANCE_URL = '/api/attendance';
const DAY_MAP = ['일', '월', '화', '수', '목', '금', '토'];
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, index) => dayjs().year() - 1 + index);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

const InstructorAttendance = () => {
    const [memberInfo, setMemberInfo] = useState(null);
    const [instructors, setInstructors] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [attendanceList, setAttendanceList] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceSaving, setAttendanceSaving] = useState(false);
    const [listYear, setListYear] = useState(dayjs().year());
    const [listMonth, setListMonth] = useState(dayjs().month() + 1);
    const [keyword, setKeyword] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [memberRes, instructorData, scheduleRes] = await Promise.all([
                axios.get('/api/member/info'),
                fetchInstructors(),
                axios.get(REAL_PROGRAMS_URL),
            ]);
            setMemberInfo(memberRes.data);
            setInstructors(Array.isArray(instructorData) ? instructorData : []);
            setSchedules(Array.isArray(scheduleRes.data) ? scheduleRes.data : []);
        } catch {
            message.error('강사용 출결 화면 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const matchedInstructorIds = useMemo(() => {
        if (!memberInfo) return [];

        const matched = instructors.filter((instructor) => instructor.member?.id === memberInfo.id);
        return matched.map((instructor) => instructor.id);
    }, [instructors, memberInfo]);

    const filteredSchedules = useMemo(() => (
        schedules
            .filter((schedule) => matchedInstructorIds.includes(schedule.program?.instructor?.id))
            .filter((schedule) => {
                const date = dayjs(schedule.programDat);
                if (listYear && date.year() !== listYear) return false;
                if (listMonth && date.month() + 1 !== listMonth) return false;

                const text = keyword.trim().toLowerCase();
                if (!text) return true;
                return [
                    schedule.center?.name,
                    schedule.program?.name,
                    schedule.program?.instructor?.name,
                    schedule.program?.startTime,
                    schedule.program?.endTime,
                ].filter(Boolean).some((field) => String(field).toLowerCase().includes(text));
            })
            .sort((a, b) => dayjs(a.programDat).valueOf() - dayjs(b.programDat).valueOf())
    ), [keyword, listMonth, listYear, matchedInstructorIds, schedules]);

    const loadAttendance = async (schedule) => {
        setSelectedSchedule(schedule);
        setAttendanceList([]);
        setAttendanceMap({});
        setAttendanceLoading(true);
        try {
            const res = await axios.get(`${ATTENDANCE_URL}/${schedule.id}`);
            const list = Array.isArray(res.data) ? res.data : [];
            const map = {};
            list.forEach((item) => {
                map[item.memberId] = item.attendanceStatus ?? null;
            });
            setAttendanceList(list);
            setAttendanceMap(map);
        } catch {
            message.error('출석 정보를 불러오지 못했습니다.');
        } finally {
            setAttendanceLoading(false);
        }
    };

    const toggleAttendance = (memberId, value) => {
        setAttendanceMap((prev) => ({
            ...prev,
            [memberId]: prev[memberId] === value ? null : value,
        }));
    };

    const handleSaveAttendance = async () => {
        if (!selectedSchedule) return;

        const records = Object.entries(attendanceMap)
            .filter(([, status]) => status !== null)
            .map(([memberId, status]) => ({ memberId, status }));

        if (records.length === 0) {
            message.info('변경된 출석 내역이 없습니다.');
            return;
        }

        setAttendanceSaving(true);
        try {
            const res = await axios.post(`${ATTENDANCE_URL}/${selectedSchedule.id}`, records);
            const list = Array.isArray(res.data) ? res.data : [];
            const map = {};
            list.forEach((item) => {
                map[item.memberId] = item.attendanceStatus ?? null;
            });
            setAttendanceList(list);
            setAttendanceMap(map);
            message.success('출석 내역이 저장되었습니다.');
        } catch {
            message.error('출석 저장 중 오류가 발생했습니다.');
        } finally {
            setAttendanceSaving(false);
        }
    };

    const AttendanceCell = ({ memberId }) => {
        const value = attendanceMap[memberId];
        return (
            <Space size={4}>
                <Button
                    size="small"
                    type={value === 'PRESENT' ? 'primary' : 'default'}
                    style={value === 'PRESENT' ? { background: '#52c41a', borderColor: '#52c41a' } : {}}
                    onClick={() => toggleAttendance(memberId, 'PRESENT')}
                >
                    출석
                </Button>
                <Button
                    size="small"
                    type={value === 'ABSENT' ? 'primary' : 'default'}
                    danger={value === 'ABSENT'}
                    onClick={() => toggleAttendance(memberId, 'ABSENT')}
                >
                    결석
                </Button>
            </Space>
        );
    };

    const scheduleColumns = [
        { title: '센터', key: 'center', width: 130, render: (_, row) => row.center?.name ?? '-' },
        { title: '수업명', key: 'programName', render: (_, row) => row.program?.name ?? '-' },
        { title: '일자', dataIndex: 'programDat', width: 120, render: (value) => dayjs(value).format('YYYY-MM-DD') },
        { title: '요일', dataIndex: 'programDat', width: 70, align: 'center', render: (value) => DAY_MAP[dayjs(value).day()] },
        { title: '시간', key: 'time', width: 130, align: 'center', render: (_, row) => `${row.program?.startTime ?? ''} ~ ${row.program?.endTime ?? ''}` },
        { title: '예약', key: 'bookingCount', width: 90, align: 'center', render: (_, row) => <Tag color="blue">{row.bookingCount ?? 0} / {row.program?.maxCapacity ?? '-'}</Tag> },
        {
            title: '',
            key: 'actions',
            width: 100,
            align: 'center',
            render: (_, row) => (
                <Button size="small" type="primary" icon={<AuditOutlined />} onClick={() => loadAttendance(row)}>
                    출결
                </Button>
            ),
        },
    ];

    const attendanceColumns = [
        { title: '회원명', dataIndex: 'memberName', width: 110 },
        { title: '연락처', dataIndex: 'memberHp', width: 140, render: (value) => value || '-' },
        {
            title: '예약상태',
            dataIndex: 'bookingStatus',
            width: 90,
            align: 'center',
            render: (value) => <Tag color={value === '예약' ? 'blue' : 'orange'}>{value}</Tag>,
        },
        {
            title: '출결',
            width: 150,
            align: 'center',
            render: (_, row) => <AttendanceCell memberId={row.memberId} />,
        },
    ];

    return (
        <DashboardLayout title="강사용 출결">
            <ConfigProvider locale={koKR}>
                <Spin spinning={loading}>
                    <Card bordered={false} style={{ marginBottom: 16 }}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                            <Space wrap>
                                <Select value={listYear} onChange={setListYear} style={{ width: 100 }} allowClear placeholder="연도 전체">
                                    {YEAR_OPTIONS.map((year) => <Select.Option key={year} value={year}>{year}년</Select.Option>)}
                                </Select>
                                <Select value={listMonth} onChange={setListMonth} style={{ width: 100 }} allowClear placeholder="월 전체">
                                    {MONTH_OPTIONS.map((month) => <Select.Option key={month} value={month}>{month}월</Select.Option>)}
                                </Select>
                                <Input
                                    placeholder="센터명, 수업명 검색"
                                    prefix={<SearchOutlined />}
                                    value={keyword}
                                    onChange={(event) => setKeyword(event.target.value)}
                                    style={{ width: 240 }}
                                    allowClear
                                />
                            </Space>
                            <Button icon={<ReloadOutlined />} onClick={loadData}>
                                새로고침
                            </Button>
                        </Flex>
                    </Card>

                    {matchedInstructorIds.length === 0 ? (
                        <Empty
                            description="로그인 사용자와 일치하는 강사 정보가 없습니다."
                            style={{ padding: '48px 0' }}
                        />
                    ) : (
                        <Card bordered={false}>
                            <Table
                                rowKey="id"
                                columns={scheduleColumns}
                                dataSource={filteredSchedules}
                                pagination={{ pageSize: 15, showSizeChanger: false }}
                                locale={{ emptyText: '해당 수업 스케줄이 없습니다.' }}
                            />
                        </Card>
                    )}

                    {selectedSchedule && (
                        <Card
                            title="수업 정보 및 출결 처리"
                            bordered={false}
                            style={{ marginTop: 16 }}
                            extra={(
                                <Button type="primary" loading={attendanceSaving} onClick={handleSaveAttendance}>
                                    저장
                                </Button>
                            )}
                        >
                            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
                                <Descriptions.Item label="센터">{selectedSchedule.center?.name ?? '-'}</Descriptions.Item>
                                <Descriptions.Item label="강사">{selectedSchedule.program?.instructor?.name ?? '-'}</Descriptions.Item>
                                <Descriptions.Item label="수업명">{selectedSchedule.program?.name ?? '-'}</Descriptions.Item>
                                <Descriptions.Item label="일자">{dayjs(selectedSchedule.programDat).format('YYYY-MM-DD (ddd)')}</Descriptions.Item>
                                <Descriptions.Item label="시간">{selectedSchedule.program?.startTime ?? ''} ~ {selectedSchedule.program?.endTime ?? ''}</Descriptions.Item>
                                <Descriptions.Item label="예약 인원">{selectedSchedule.bookingCount ?? 0} / {selectedSchedule.program?.maxCapacity ?? '-'}명</Descriptions.Item>
                            </Descriptions>

                            <Spin spinning={attendanceLoading}>
                                <Table
                                    rowKey="memberId"
                                    columns={attendanceColumns}
                                    dataSource={attendanceList}
                                    size="small"
                                    pagination={false}
                                    locale={{ emptyText: '예약 회원이 없습니다.' }}
                                />
                            </Spin>
                        </Card>
                    )}
                </Spin>
            </ConfigProvider>
        </DashboardLayout>
    );
};

export default InstructorAttendance;
