import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, DatePicker, Input, Segmented, Select, Space, Table, Tag, message } from 'antd';
import { BarChartOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import DashboardLayout from '../../../components/DashboardLayout';
import AdminPageToolbar from '../../../components/AdminPageToolbar';
import { fetchCenters } from '../../../api/centerApi';
import { fetchSalesReport } from '../../../api/salesApi';
import './index.css';

dayjs.locale('ko');

const formatMoney = (amount) => `${(amount ?? 0).toLocaleString('ko-KR')}원`;

const SalesIndex = () => {
    const navigate = useNavigate();
    const [centers, setCenters] = useState([]);
    const [centerId, setCenterId] = useState(null);
    const [dateRange, setDateRange] = useState(() => [dayjs().startOf('month'), dayjs().endOf('month')]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('ALL');
    const [keyword, setKeyword] = useState('');
    const requestId = useRef(0);

    useEffect(() => {
        fetchCenters()
            .then((data) => setCenters(Array.isArray(data) ? data : []))
            .catch(() => message.error('센터 목록을 불러오지 못했습니다.'));
    }, []);

    const loadReport = useCallback(async () => {
        const currentRequest = ++requestId.current;
        setLoading(true);
        setReport(null);
        try {
            const data = await fetchSalesReport({
                centerId: centerId || undefined,
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD'),
            });
            if (currentRequest === requestId.current) setReport(data);
        } catch {
            if (currentRequest === requestId.current) message.error('매출 내역을 불러오지 못했습니다.');
        } finally {
            if (currentRequest === requestId.current) setLoading(false);
        }
    }, [centerId, dateRange]);

    useEffect(() => {
        loadReport();
    }, [loadReport]);

    const entries = useMemo(() => {
        const text = keyword.trim().toLowerCase();
        return (report?.entries ?? []).filter((entry) => {
            if (type !== 'ALL' && entry.type !== type) return false;
            if (!text) return true;
            return [entry.centerName, entry.memberName, entry.membershipName]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(text));
        });
    }, [keyword, report, type]);

    const columns = [
        { title: '일자', dataIndex: 'date', key: 'date', width: 120 },
        {
            title: '구분', dataIndex: 'type', key: 'type', width: 90,
            render: (value) => <Tag color={value === 'SALE' ? 'green' : 'red'}>{value === 'SALE' ? '결제' : '환불'}</Tag>,
        },
        { title: '센터', dataIndex: 'centerName', key: 'centerName' },
        {
            title: '회원', dataIndex: 'memberName', key: 'memberName',
            render: (value, row) => (
                <Button
                    type="link"
                    className="sales-member-link"
                    onClick={() => navigate(`/admin/member/detail?id=${encodeURIComponent(row.memberId)}&centerId=${encodeURIComponent(row.centerId)}`)}
                >
                    {value}
                </Button>
            ),
        },
        { title: '이용권', dataIndex: 'membershipName', key: 'membershipName' },
        {
            title: '금액', dataIndex: 'amount', key: 'amount', align: 'right', width: 150,
            render: (value, row) => (
                <span className={row.type === 'REFUND' ? 'sales-refund-amount' : 'sales-payment-amount'}>
                    {row.type === 'REFUND' ? '-' : '+'}{formatMoney(value)}
                </span>
            ),
        },
    ];

    return (
        <DashboardLayout title="매출 관리">
            <AdminPageToolbar icon={<BarChartOutlined />} title="매출 관리" description="결제 및 환불 내역">
                <Select value={centerId ?? 'all'} onChange={(value) => setCenterId(value === 'all' ? null : value)} style={{ width: 180 }}>
                    <Select.Option value="all">전체 센터</Select.Option>
                    {centers.map((center) => <Select.Option key={center.id} value={center.id}>{center.name}</Select.Option>)}
                </Select>
                <DatePicker.RangePicker
                    value={dateRange}
                    onChange={(value) => value?.[0] && value?.[1] && setDateRange(value)}
                    allowClear={false}
                    className="sales-date-range"
                />
                <Button icon={<ReloadOutlined />} onClick={loadReport} loading={loading}>새로고침</Button>
            </AdminPageToolbar>

            <div className="sales-summary">
                <div className="sales-summary-item">
                    <span>총매출</span>
                    <strong>{report ? formatMoney(report.grossSales) : '-'}</strong>
                    <small>결제 {report?.saleCount ?? 0}건</small>
                </div>
                <div className="sales-summary-item">
                    <span>환불</span>
                    <strong className="sales-refund-amount">{report ? formatMoney(report.refundTotal) : '-'}</strong>
                    <small>환불 {report?.refundCount ?? 0}건</small>
                </div>
                <div className="sales-summary-item">
                    <span>순매출</span>
                    <strong className="sales-net-amount">{report ? formatMoney(report.netSales) : '-'}</strong>
                    <small>{dateRange[0].format('YYYY.MM.DD')} ~ {dateRange[1].format('YYYY.MM.DD')}</small>
                </div>
            </div>

            <div className="sales-list-controls">
                <Segmented
                    value={type}
                    onChange={setType}
                    options={[{ label: '전체', value: 'ALL' }, { label: '결제', value: 'SALE' }, { label: '환불', value: 'REFUND' }]}
                />
                <Space size={12}>
                    <span className="sales-result-count">{entries.length}건</span>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="센터, 회원, 이용권 검색"
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        allowClear
                        className="sales-search"
                    />
                </Space>
            </div>

            <Card bordered={false} className="sales-table">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={entries}
                    loading={loading}
                    pagination={{ pageSize: 20, showSizeChanger: false }}
                    scroll={{ x: 760 }}
                    locale={{ emptyText: '해당 기간의 거래 내역이 없습니다.' }}
                />
            </Card>
        </DashboardLayout>
    );
};

export default SalesIndex;
