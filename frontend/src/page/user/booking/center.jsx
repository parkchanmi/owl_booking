import React, { useState, useEffect, useMemo } from 'react';
import { Card, Select, Table, Button, Tag, Space, Typography, Empty, message, Spin } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import UserLayout from '../../../components/UserLayout';
import { fetchCenters } from '../../../api/centerApi';
import { fetchRealPrograms } from '../../../api/realProgramApi';

const { Title, Text } = Typography;

const BookingCenter = () => {
    const [centers, setCenters] = useState([]);
    const [selectedCenterId, setSelectedCenterId] = useState(null);
    const [allPrograms, setAllPrograms] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchCenters().catch(() => []),
            fetchRealPrograms().catch(() => []),
        ])
            .then(([centerList, programList]) => {
                const cList = Array.isArray(centerList) ? centerList : [];
                setCenters(cList);
                if (cList.length > 0) {
                    setSelectedCenterId(cList[0].id);
                }
                setAllPrograms(Array.isArray(programList) ? programList : []);
            })
            .catch(() => message.error('데이터를 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, []);

    const selectedCenter = useMemo(
        () => centers.find((c) => String(c.id) === String(selectedCenterId)),
        [centers, selectedCenterId]
    );

    const classes = useMemo(() => {
        if (!selectedCenterId) return [];
        return allPrograms
            .filter((p) => {
                const pCenterId = p.center?.id || p.centerId;
                return !pCenterId || String(pCenterId) === String(selectedCenterId);
            })
            .map((s) => {
                const prog = s.program || {};
                const maxCap = prog.maxCapacity || s.maxCapacity || 10;
                const bookCnt = s.bookingCount || 0;
                const remain = Math.max(0, maxCap - bookCnt);

                return {
                    id: s.id,
                    name: prog.name || s.programName || '수업',
                    instructorName: prog.instructor?.name || s.instructorName || '-',
                    date: s.programDat ? dayjs(s.programDat).format('YYYY-MM-DD') : '-',
                    time: `${prog.startTime || s.startTime || '09:00'} ~ ${prog.endTime || s.endTime || '10:00'}`,
                    totalCount: maxCap,
                    remainCount: remain,
                };
            });
    }, [allPrograms, selectedCenterId]);

    const columns = [
        { title: '수업명', dataIndex: 'name', key: 'name' },
        { title: '강사명', dataIndex: 'instructorName', key: 'instructorName' },
        { title: '날짜', dataIndex: 'date', key: 'date' },
        { title: '시간', dataIndex: 'time', key: 'time' },
        {
            title: '잔여 인원',
            key: 'remain',
            align: 'center',
            render: (_, r) => (
                <Tag color={r.remainCount === 0 ? 'red' : r.remainCount <= 3 ? 'orange' : 'green'}>
                    {r.remainCount === 0 ? '마감' : `${r.remainCount}명 / ${r.totalCount}명`}
                </Tag>
            ),
        },
        {
            title: '예약/대기',
            key: 'action',
            align: 'center',
            render: (_, r) => (
                <Button
                    type={r.remainCount === 0 ? 'default' : 'primary'}
                    size="small"
                    className={r.remainCount === 0 ? 'border-amber-400 text-amber-600 hover:text-amber-500' : ''}
                    onClick={() => {
                        if (r.remainCount === 0) {
                            message.info(`[${r.name}] 예약 인원이 마감되어 대기자 등록으로 진행됩니다.`);
                        } else {
                            message.info(`[${r.name}] 예약 신청 기능으로 연결됩니다.`);
                        }
                    }}
                >
                    {r.remainCount === 0 ? '대기 신청' : '예약하기'}
                </Button>
            ),
        },
    ];

    return (
        <UserLayout title="예약 관리">
            <Spin spinning={loading}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Card bordered={false}>
                        <Title level={5} style={{ marginBottom: 12 }}>예약할 센터 선택</Title>
                        <Select
                            placeholder="센터를 선택해주세요"
                            style={{ width: '100%', maxWidth: 400 }}
                            value={selectedCenterId}
                            onChange={(val) => setSelectedCenterId(val)}
                            options={centers.map((c) => ({ value: c.id, label: c.name }))}
                        />
                        {selectedCenter && (
                            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                                <EnvironmentOutlined style={{ marginRight: 4 }} />
                                {selectedCenter.addr} {selectedCenter.addrDetail || ''}
                            </Text>
                        )}
                    </Card>

                    <Card bordered={false} title="수업 리스트">
                        {selectedCenterId ? (
                            classes.length > 0 ? (
                                <Table
                                    rowKey="id"
                                    columns={columns}
                                    dataSource={classes}
                                    pagination={{ pageSize: 10 }}
                                />
                            ) : (
                                <Empty description="선택된 센터에 개설된 수업 스케줄이 없습니다." />
                            )
                        ) : (
                            <Empty description="센터를 선택하면 수업 목록이 표시됩니다." />
                        )}
                    </Card>
                </Space>
            </Spin>
        </UserLayout>
    );
};

export default BookingCenter;
