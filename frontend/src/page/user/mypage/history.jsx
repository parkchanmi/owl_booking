import React, { useState } from 'react';
import { Card, Table, Tag, Row, Col, DatePicker, Typography, Statistic, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import UserLayout from '../../../components/UserLayout';

const { Title } = Typography;

const MOCK_HISTORY = [
    { id: 1, className: '요가 기초반', centerName: '강남점', date: '2026-06-05', time: '09:00~10:00', instructorName: '김지수', status: 'attend' },
    { id: 2, className: '필라테스 중급반', centerName: '강남점', date: '2026-06-10', time: '11:00~12:00', instructorName: '이민준', status: 'attend' },
    { id: 3, className: '스피닝 입문반', centerName: '홍대점', date: '2026-06-12', time: '14:00~15:00', instructorName: '박서연', status: 'absent' },
    { id: 4, className: '요가 기초반', centerName: '강남점', date: '2026-06-17', time: '09:00~10:00', instructorName: '김지수', status: 'attend' },
    { id: 5, className: '크로스핏 고급반', centerName: '홍대점', date: '2026-06-20', time: '10:00~11:00', instructorName: '최준혁', status: 'booked' },
    { id: 6, className: '필라테스 중급반', centerName: '강남점', date: '2026-06-25', time: '11:00~12:00', instructorName: '이민준', status: 'booked' },
];

const STATUS_MAP = {
    booked: { label: '예약', color: 'blue' },
    attend: { label: '출석', color: 'green' },
    absent: { label: '결석', color: 'red' },
};

const MyHistory = () => {
    const [selectedMonth, setSelectedMonth] = useState(dayjs());

    const filtered = MOCK_HISTORY.filter((h) =>
        dayjs(h.date).format('YYYY-MM') === selectedMonth.format('YYYY-MM')
    );

    const bookedCount = filtered.filter((h) => h.status === 'booked').length;
    const attendCount = filtered.filter((h) => h.status === 'attend').length;
    const absentCount = filtered.filter((h) => h.status === 'absent').length;

    const columns = [
        { title: '수업명', dataIndex: 'className', key: 'className' },
        { title: '센터', dataIndex: 'centerName', key: 'centerName' },
        { title: '날짜', dataIndex: 'date', key: 'date' },
        { title: '시간', dataIndex: 'time', key: 'time' },
        { title: '강사명', dataIndex: 'instructorName', key: 'instructorName' },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (v) => (
                <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.label}</Tag>
            ),
        },
    ];

    return (
        <UserLayout title="마이페이지">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card bordered={false} style={{ background: '#e6f4ff' }}>
                            <Statistic
                                title="예약"
                                value={bookedCount}
                                suffix="건"
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} style={{ background: '#f6ffed' }}>
                            <Statistic
                                title="출석"
                                value={attendCount}
                                suffix="건"
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} style={{ background: '#fff2e8' }}>
                            <Statistic
                                title="결석"
                                value={absentCount}
                                suffix="건"
                                prefix={<CloseCircleOutlined />}
                                valueStyle={{ color: '#fa541c' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card
                    bordered={false}
                    title={
                        <Row justify="space-between" align="middle">
                            <Col><Title level={5} style={{ margin: 0 }}>예약 리스트</Title></Col>
                            <Col>
                                <DatePicker
                                    picker="month"
                                    value={selectedMonth}
                                    onChange={(val) => val && setSelectedMonth(val)}
                                    format="YYYY년 MM월"
                                    allowClear={false}
                                />
                            </Col>
                        </Row>
                    }
                >
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={filtered}
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            </Space>
        </UserLayout>
    );
};

export default MyHistory;
