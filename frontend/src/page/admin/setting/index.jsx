import React, { useEffect, useState } from 'react';
import { Empty, Grid, Select, Tabs, message } from 'antd';
import {
    ShopOutlined,
    DownOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    MailOutlined,
    SettingOutlined,
    PercentageOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import './index.css';
import { fetchCenters } from '../../../api/centerApi';
import { fetchCenterMembers } from '../../../api/centerMemberApi';
import WaitPanel from './WaitPanel';
import CancelPanel from './CancelPanel';
import SettingPanel from './SettingPanel';
import RefundPolicyPanel from './RefundPolicyPanel';
import NotificationPanel from './NotificationPanel';

const TAB_KEYS = ['wait', 'cancel', 'setting', 'refund', 'notification'];

const BookingIndex = () => {
    const screens = Grid.useBreakpoint();
    const [centers, setCenters] = useState([]);
    const [centersLoading, setCentersLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const tabParam = searchParams.get('tab');
    const activeTab = TAB_KEYS.includes(tabParam) ? tabParam : 'wait';

    useEffect(() => {
        Promise.all([fetchCenters(), fetchCenterMembers()])
            .then(([centerData, centerMemberData]) => {
                const centerMap = new Map();
                (Array.isArray(centerData) ? centerData : []).forEach((center) => {
                    if (center?.id) centerMap.set(center.id, center);
                });
                (Array.isArray(centerMemberData) ? centerMemberData : []).forEach((item) => {
                    if (item?.center?.id) centerMap.set(item.center.id, item.center);
                });
                const list = Array.from(centerMap.values());
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
        {
            key: 'refund',
            label: '환불기준',
            icon: <PercentageOutlined />,
            children: <RefundPolicyPanel centerId={selectedCenter} />,
        },
        {
            key: 'notification',
            label: '알림 설정',
            icon: <MailOutlined />,
            children: <NotificationPanel centerId={selectedCenter} />,
        },
    ];

    return (
        <DashboardLayout title="센터별 환경설정">
            <div className="booking-settings">
                <div className="booking-settings-toolbar">
                    <div className="booking-settings-toolbar-info">
                        <span className="booking-settings-toolbar-icon"><ShopOutlined /></span>
                        <div>
                            <div className="booking-settings-toolbar-title">센터별 환경설정</div>
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
                        tabPosition={screens.md ? 'left' : 'top'}
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
