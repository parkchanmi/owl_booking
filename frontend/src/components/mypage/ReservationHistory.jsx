import React, { useState } from 'react';
import { Button, ConfigProvider, Empty, Select, Space, Table, Tag } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { classStart } from '../../utils/myPageData';
import './ReservationHistory.css';

export default function ReservationHistory({ reservations, attendance, loading, selectedDate, onResetDate, onCancel, busy }) {
    const [filter, setFilter] = useState('all');
    const byProgram = new Map(attendance.map((row) => [row.realProgramId, row]));
    const booked = new Set(reservations.filter((row) => !row.waitlist).map((row) => row.realProgramId));
    let rows = [
        ...reservations.map((row) => ({ ...row, attendanceStatus: row.waitlist ? null : byProgram.get(row.realProgramId)?.attendanceStatus, rowId: `${row.waitlist ? 'wait' : 'booking'}-${row.id}`, cancellable: classStart(row).isAfter(dayjs()) })),
        ...attendance.filter((row) => !booked.has(row.realProgramId) && row.attendanceStatus).map((row) => ({ ...row, rowId: `attendance-${row.id}`, cancellable: false })),
    ];
    if (selectedDate) rows = rows.filter((row) => dayjs(row.programDat).isSame(selectedDate, 'day'));
    if (filter === 'future') rows = rows.filter((row) => !row.waitlist && classStart(row).isAfter(dayjs()));
    if (filter === 'attendance') rows = rows.filter((row) => row.attendanceStatus);
    if (filter === 'waitlist') rows = rows.filter((row) => row.waitlist);
    rows.sort((a, b) => classStart(b).valueOf() - classStart(a).valueOf());
    const status = (row) => row.waitlist ? '대기 중' : row.attendanceStatus === 'PRESENT' ? '출석' : row.attendanceStatus === 'ABSENT' ? '결석' : classStart(row).isBefore(dayjs()) ? '출석 미기록' : '예약 확정';
    return <div className="reservation-history">
        <Space wrap style={{ marginBottom: 20, width: '100%', justifyContent: 'space-between' }}>
            <div className="reservation-history-heading"><h3>{selectedDate ? dayjs(selectedDate).format('YYYY.MM.DD') : '전체'} 예약·출석 내역</h3><Tag className="reservation-history-count">{rows.length}건</Tag></div>
            <Space>
                {selectedDate && <Button className="reservation-history-date-button" onClick={onResetDate}>전체 날짜</Button>}
                <ConfigProvider theme={{
                    token: { colorPrimary: '#7C3AED', colorBorder: '#DDD6FE', colorText: '#6D28D9', fontSize: 12, controlHeight: 34 },
                    components: { Select: {
                        borderRadius: 9999, selectorBg: '#FBFBFE', hoverBorderColor: '#C4B5FD',
                        activeBorderColor: '#7C3AED', activeOutlineColor: 'rgba(124, 58, 237, 0.08)',
                        optionSelectedBg: '#EDE9FE', optionSelectedColor: '#6D28D9', optionSelectedFontWeight: 600,
                        optionActiveBg: '#F5F3FF', optionFontSize: 12, optionHeight: 34, optionPadding: '8px 12px',
                    } },
                }}>
                    <Select
                        aria-label="예약 내역 필터"
                        className="reservation-history-filter"
                        classNames={{ popup: { root: 'reservation-history-filter-popup' } }}
                        suffixIcon={<DownOutlined style={{ color: '#8B5CF6', fontSize: 10 }} />}
                        value={filter}
                        onChange={setFilter}
                        options={[{ value: 'all', label: '전체 내역' }, { value: 'future', label: '다가오는 예약' }, { value: 'attendance', label: '출석·결석' }, { value: 'waitlist', label: '대기 신청' }]}
                    />
                </ConfigProvider>
            </Space>
        </Space>
        <Table className="reservation-history-table" rowKey="rowId" dataSource={rows} loading={loading} pagination={{ pageSize: 8 }} scroll={{ x: 580 }} locale={{ emptyText: <Empty description="해당 내역이 없습니다." /> }} columns={[
            { title: '수업', render: (_, row) => <><strong className="reservation-history-class-title">{row.programName || '수업'}</strong><div className="reservation-history-class-meta">{row.centerName} · {row.instructorName || '강사 미배정'}</div></> },
            { title: '일시', render: (_, row) => <div className="reservation-history-schedule">{dayjs(row.programDat).format('YYYY.MM.DD')}<div>{row.startTime} ~ {row.endTime}</div></div> },
            { title: '상태', render: (_, row) => <Tag className={`reservation-history-status ${row.waitlist ? 'reservation-history-status--waiting' : row.attendanceStatus === 'ABSENT' ? 'reservation-history-status--absent' : status(row) === '출석 미기록' ? 'reservation-history-status--unrecorded' : ''}`}>{status(row)}</Tag> },
            { title: '', align: 'right', render: (_, row) => row.cancellable && !row.attendanceStatus && <Button className="reservation-history-cancel-button" disabled={busy} onClick={() => onCancel('cancel', { id: row.id, isWaitlist: row.waitlist, title: row.programName, dateStr: `${dayjs(row.programDat).format('YYYY.MM.DD')} ${row.startTime} ~ ${row.endTime}`, instructor: row.instructorName })}>{row.waitlist ? '대기 취소' : '예약 취소'}</Button> },
        ]} />
    </div>;
}
