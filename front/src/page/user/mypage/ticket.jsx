import React from 'react';
import { Card, Table, Tag, Progress, Typography } from 'antd';
import UserLayout from '../../../components/UserLayout';

const MOCK_TICKETS = [
    {
        id: 1,
        name: '요가 10회권',
        centerName: '부엉이 피트니스 강남점',
        purchaseDate: '2026-05-01',
        expireDate: '2026-07-31',
        totalCount: 10,
        usedCount: 7,
        status: 'active',
    },
    {
        id: 2,
        name: '필라테스 20회권',
        centerName: '부엉이 피트니스 강남점',
        purchaseDate: '2026-04-01',
        expireDate: '2026-06-30',
        totalCount: 20,
        usedCount: 20,
        status: 'expired',
    },
    {
        id: 3,
        name: '스피닝 5회권',
        centerName: '부엉이 피트니스 홍대점',
        purchaseDate: '2026-06-10',
        expireDate: '2026-08-10',
        totalCount: 5,
        usedCount: 1,
        status: 'active',
    },
];

const MyTicket = () => {
    const columns = [
        { title: '이용권명', dataIndex: 'name', key: 'name' },
        { title: '센터', dataIndex: 'centerName', key: 'centerName' },
        { title: '구매일', dataIndex: 'purchaseDate', key: 'purchaseDate' },
        { title: '만료일', dataIndex: 'expireDate', key: 'expireDate' },
        {
            title: '잔여 횟수',
            key: 'remain',
            align: 'center',
            render: (_, r) => {
                const remain = r.totalCount - r.usedCount;
                return (
                    <span>{remain} / {r.totalCount}회</span>
                );
            },
        },
        {
            title: '사용 현황',
            key: 'progress',
            width: 160,
            render: (_, r) => {
                const percent = Math.round((r.usedCount / r.totalCount) * 100);
                return (
                    <Progress
                        percent={percent}
                        size="small"
                        status={r.status === 'expired' ? 'exception' : percent === 100 ? 'exception' : 'active'}
                    />
                );
            },
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (v) => (
                <Tag color={v === 'active' ? 'green' : 'default'}>
                    {v === 'active' ? '사용중' : '만료'}
                </Tag>
            ),
        },
    ];

    return (
        <UserLayout title="마이페이지">
            <Card bordered={false} title="이용권 내역">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={MOCK_TICKETS}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </UserLayout>
    );
};

export default MyTicket;
