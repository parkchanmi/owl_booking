import React, { useEffect, useState } from 'react';
import { Select, Tabs, Empty, message } from 'antd';
import {
    ShopOutlined,
    DownOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    SettingOutlined,
} from '@ant-design/icons';
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
    const [centersLoading, setCentersLoading] = useState(true);
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
            .catch(() => message.error('센터 목록을 불러오지 못했습니다.'))
            .finally(() => setCentersLoading(false));
    }, []);

    const handleTabChange = (key) => {
        setSearchParams(key === 'wait' ? {} : { tab: key });
    };

    const items = [
        {
            key: 'wait',
            label: '대기 예약 관리',
            icon: <ClockCircleOutlined />,
            children: <WaitPanel centerId={selectedCenter} />,
        },
        {
            key: 'cancel',
            label: '예약 취소 관리',
            icon: <CloseCircleOutlined />,
            children: <CancelPanel centerId={selectedCenter} />,
        },
        {
            key: 'setting',
            label: '수업 예약 설정',
            icon: <SettingOutlined />,
            children: <SettingPanel centerId={selectedCenter} />,
        },
    ];

    return (
        <DashboardLayout title="예약 관리">
            <div className="booking-settings">
                <div className="booking-settings-toolbar">
                    <div className="booking-settings-toolbar-info">
                        <span className="booking-settings-toolbar-icon"><ShopOutlined /></span>
                        <div>
                            <div className="booking-settings-toolbar-title">센터별 예약 설정</div>
                            <div className="booking-settings-toolbar-label">설정을 적용할 센터를 선택하세요</div>
                        </div>
                    </div>
                    <Select
                        value={selectedCenter}
                        onChange={setSelectedCenter}
                        placeholder="센터 선택"
                        loading={centersLoading}
                        popupMatchSelectWidth={false}
                        suffixIcon={<DownOutlined style={{ fontSize: 12 }} />}
                        className="booking-center-select"
                    >
                        {centers.map((c) => (
                            <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                        ))}
                    </Select>
                </div>

                {!centersLoading && centers.length === 0 ? (
                    <Empty description="등록된 센터가 없습니다." style={{ padding: '48px 0' }} />
                ) : (
                    <Tabs
                        tabPosition="left"
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        items={items}
                        className="booking-settings-tabs"
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default BookingIndex;
