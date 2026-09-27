import React, { useState } from 'react';
import { Card, Select, Table, Button, Tag, Space, Typography, Row, Col, Empty } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import UserLayout from '../../../components/UserLayout';

const { Title, Text } = Typography;

const MOCK_CENTERS = [
    { id: 1, name: '부엉이 피트니스 강남점', addr: '서울 강남구 테헤란로 123' },
    { id: 2, name: '부엉이 피트니스 홍대점', addr: '서울 마포구 와우산로 45' },
    { id: 3, name: '부엉이 피트니스 판교점', addr: '경기 성남시 분당구 판교로 88' },
];

const MOCK_CLASSES = {
    1: [
        { id: 1, name: '요가 기초반', instructorName: '김지수', date: '2026-06-28', time: '09:00~10:00', totalCount: 15, remainCount: 3 },
        { id: 2, name: '필라테스 중급반', instructorName: '이민준', date: '2026-06-28', time: '11:00~12:00', totalCount: 10, remainCount: 0 },
        { id: 3, name: '스피닝 입문반', instructorName: '박서연', date: '2026-06-29', time: '14:00~15:00', totalCount: 20, remainCount: 12 },
    ],
    2: [
        { id: 4, name: '크로스핏 고급반', instructorName: '최준혁', date: '2026-06-28', time: '10:00~11:00', totalCount: 12, remainCount: 5 },
        { id: 5, name: '요가 심화반', instructorName: '김지수', date: '2026-06-29', time: '13:00~14:00', totalCount: 10, remainCount: 2 },
    ],
    3: [
        { id: 6, name: '필라테스 기초반', instructorName: '박서연', date: '2026-06-28', time: '09:00~10:00', totalCount: 8, remainCount: 8 },
    ],
};

const BookingCenter = () => {
    const [selectedCenterId, setSelectedCenterId] = useState(null);

    const selectedCenter = MOCK_CENTERS.find((c) => c.id === selectedCenterId);
    const classes = selectedCenterId ? (MOCK_CLASSES[selectedCenterId] ?? []) : [];

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
                    {r.remainCount === 0 ? '마감' : `${r.remainCount}명`}
                </Tag>
            ),
        },
        {
            title: '예약',
            key: 'action',
            align: 'center',
            render: (_, r) => (
                <Button
                    type="primary"
                    size="small"
                    disabled={r.remainCount === 0}
                    onClick={() => console.log('예약:', r.id)}
                >
                    {r.remainCount === 0 ? '대기 신청' : '예약하기'}
                </Button>
            ),
        },
    ];

    return (
        <UserLayout title="예약 관리">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card bordered={false}>
                    <Title level={5} style={{ marginBottom: 12 }}>예약할 센터 선택</Title>
                    <Select
                        placeholder="센터를 선택해주세요"
                        style={{ width: '100%', maxWidth: 400 }}
                        value={selectedCenterId}
                        onChange={(val) => setSelectedCenterId(val)}
                        options={MOCK_CENTERS.map((c) => ({ value: c.id, label: c.name }))}
                    />
                    {selectedCenter && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                            {selectedCenter.addr}
                        </Text>
                    )}
                </Card>

                <Card bordered={false} title="수업 리스트">
                    {selectedCenterId ? (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={classes}
                            pagination={{ pageSize: 10 }}
                        />
                    ) : (
                        <Empty description="센터를 선택하면 수업 목록이 표시됩니다." />
                    )}
                </Card>
            </Space>
        </UserLayout>
    );
};

export default BookingCenter;
