import React, { useEffect, useState } from 'react';
import { Card, Select, Tabs, Divider, message } from 'antd';
import { ShopOutlined, DownOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import './index.css';
import { fetchCenters } from '../../../api/centerApi';
import WaitPanel from './WaitPanel';
import CancelPanel from './CancelPanel';
import SettingPanel from './SettingPanel';

const TAB_KEYS = ['wait', 'cancel', 'setting'];

const BookingIndex = () => {
    const [centers, setCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const tabParam = searchParams.get('tab');
    const activeTab = TAB_KEYS.includes(tabParam) ? tabParam : 'wait';

    useEffect(() => {
        fetchCenters()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setCenters(list);
                if (list.length > 0) setSelectedCenter(list[0].id);
            })
            .catch(() => message.error('센터 목록을 불러오지 못했습니다.'));
    }, []);

    const handleTabChange = (key) => {
        setSearchParams(key === 'wait' ? {} : { tab: key });
    };

    const items = [
        { key: 'wait', label: '대기 예약 관리', children: <WaitPanel centerId={selectedCenter} /> },
        { key: 'cancel', label: '예약 취소 관리', children: <CancelPanel centerId={selectedCenter} /> },
        { key: 'setting', label: '수업 예약 설정', children: <SettingPanel centerId={selectedCenter} /> },
    ];

    const centerSelect = (
        <>
            <Select
                variant="borderless"
                value={selectedCenter}
                onChange={setSelectedCenter}
                placeholder="센터 선택"
                popupMatchSelectWidth={false}
                prefix={<ShopOutlined style={{ color: '#8c8c8c' }} />}
                suffixIcon={<DownOutlined style={{ fontSize: 12 }} />}
                style={{ fontSize: 16, fontWeight: 600 }}
                className="booking-center-select"
            >
                {centers.map((c) => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
            </Select>
            <Divider type="vertical" style={{ height: 20, margin: '0 16px 0 4px' }} />
        </>
    );

    return (
        <DashboardLayout title="예약 관리">
            <Card bordered={false}>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    items={items}
                    tabBarExtraContent={{ left: centerSelect }}
                />
            </Card>
        </DashboardLayout>
    );
};

export default BookingIndex;
