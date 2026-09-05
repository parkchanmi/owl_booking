import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Flex, Input, Popconfirm, Select, Space, Table, Tabs, Tag, message } from 'antd';
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import '../adminList.css';
import CenterMemberFormModal from './CenterMemberFormModal';
import { createCenterMember, fetchCenterMembers, registerCenterMember, withdrawCenterMember } from '../../../api/centerMemberApi';
import { fetchCenters } from '../../../api/centerApi';
import { fetchMembers } from '../../../api/memberApi';

const TYPE_LABELS = {
    USER: '회원',
    ADMIN: '관리자',
};

const STATUS_COLORS = {
    이용중: 'green',
    정지중: 'orange',
    탈퇴: 'red',
};

const CenterMemberList = () => {
    const navigate = useNavigate();
    const [centerMembers, setCenterMembers] = useState([]);
    const [centers, setCenters] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [activeType, setActiveType] = useState('USER');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('register');
    const [submitting, setSubmitting] = useState(false);

    const loadCenterMembers = async () => {
        setLoading(true);
        try {
            const data = await fetchCenterMembers();
            setCenterMembers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('센터 회원 목록 조회 실패:', error);
            message.error('센터 회원 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async () => {
        try {
            const data = await fetchMembers();
            setMembers(Array.isArray(data) ? data : []);
        } catch {
            message.error('회원 목록을 불러오지 못했습니다.');
        }
    };

    useEffect(() => {
        loadCenterMembers();
        fetchCenters()
            .then((data) => setCenters(Array.isArray(data) ? data : []))
            .catch(() => message.error('센터 목록을 불러오지 못했습니다.'));
        loadMembers();
    }, []);

    const openRegisterModal = () => {
        if (!selectedCenter) {
            message.info('먼저 센터를 선택해주세요.');
            return;
        }
        setModalMode('register');
        setModalOpen(true);
    };

    const openLinkModal = () => {
        if (!selectedCenter) {
            message.info('먼저 센터를 선택해주세요.');
            return;
        }
        setModalMode('link');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleTabChange = (type) => {
        setActiveType(type);
        setKeyword('');
    };

    const handleSubmit = async (values) => {
        if (modalMode === 'link') {
            const duplicate = centerMembers.some((centerMember) => (
                centerMember.center?.id === values.center?.id && centerMember.member?.id === values.member?.id
            ));
            if (duplicate) {
                message.error(`이미 해당 센터에 추가된 ${TYPE_LABELS[activeType]}입니다.`);
                return;
            }
        }

        setSubmitting(true);
        try {
            if (modalMode === 'link') {
                await createCenterMember(values);
            } else {
                await registerCenterMember(values);
            }
            message.success(`${TYPE_LABELS[activeType]}이 추가되었습니다.`);
            closeModal();
            loadCenterMembers();
            loadMembers();
        } catch (error) {
            console.error('센터 회원 저장 실패:', error);
            if (error.response?.status === 409) {
                message.error('이미 사용중인 아이디이거나 해당 센터에 연결된 사용자입니다.');
            } else {
                message.error('센터 회원 저장 중 오류가 발생했습니다.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleWithdraw = async (record) => {
        try {
            const result = await withdrawCenterMember(record.id);
            message.success(result.deleted ? '사용자 연결이 삭제되었습니다.' : '이력이 있어 탈퇴 상태로 변경되었습니다.');
            loadCenterMembers();
            loadMembers();
        } catch (error) {
            message.error(error.response?.data?.message ?? '탈퇴 처리 중 오류가 발생했습니다.');
        }
    };

    const filteredCenterMembers = useMemo(() => (
        (Array.isArray(centerMembers) ? centerMembers : []).filter((centerMember) => {
            if (centerMember.member?.type !== activeType) return false;
            if (selectedCenter && centerMember.center?.id !== selectedCenter) return false;

            const text = keyword.trim().toLowerCase();
            if (!text) return true;
            return [
                centerMember.center?.name,
                centerMember.member?.name,
                centerMember.member?.loginId,
                centerMember.member?.hp,
                centerMember.member?.email,
            ].filter(Boolean).some((field) => String(field).toLowerCase().includes(text));
        })
    ), [activeType, centerMembers, keyword, selectedCenter]);

    const columns = [
        { title: '센터', key: 'center', render: (_, row) => row.center?.name ?? '-' },
        { title: '구분', key: 'type', width: 90, align: 'center', render: (_, row) => TYPE_LABELS[row.member?.type] ?? '-' },
        { title: '이름', key: 'memberName', render: (_, row) => row.member?.name ?? '-' },
        { title: '아이디', key: 'loginId', render: (_, row) => row.member?.loginId ?? '-' },
        { title: '연락처', key: 'hp', render: (_, row) => row.member?.hp ?? '-' },
        { title: '이메일', key: 'email', render: (_, row) => row.member?.email ?? '-' },
        activeType === 'USER' ? {
            title: '상태',
            key: 'status',
            align: 'center',
            width: 90,
            render: (_, row) => <Tag color={STATUS_COLORS[row.status] ?? 'default'}>{row.status ?? '미등록'}</Tag>,
        } : null,
        {
            title: '관리',
            key: 'actions',
            width: 90,
            render: (_, record) => (
                <Space size={4}>
                    {activeType === 'USER' && (
                        <Button
                            size="small"
                            disabled={!record.member?.id}
                            onClick={() => navigate(`/admin/member/detail?id=${record.member.id}&centerId=${record.center?.id ?? ''}`)}
                        >
                            편집
                        </Button>
                    )}
                    <Popconfirm
                        title={`${TYPE_LABELS[activeType]} 연결을 해제하시겠습니까?`}
                        okText="해제"
                        cancelText="취소"
                        disabled={!record.member?.id || record.status === '탈퇴'}
                        onConfirm={() => handleWithdraw(record)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} disabled={!record.member?.id || record.status === '탈퇴'} />
                    </Popconfirm>
                </Space>
            ),
        },
    ].filter(Boolean);

    return (
        <DashboardLayout title="센터 회원 관리">
            <Card bordered={false}>
                <Tabs
                    activeKey={activeType}
                    onChange={handleTabChange}
                    items={[
                        { key: 'USER', label: '회원' },
                        { key: 'ADMIN', label: '관리자' },
                    ]}
                />

                <Flex justify="space-between" align="center" className="admin-list-toolbar">
                    <Space>
                        <Select
                            style={{ width: 200 }}
                            value={selectedCenter}
                            onChange={setSelectedCenter}
                            placeholder="센터 전체"
                            allowClear
                        >
                            {centers.map((center) => (
                                <Select.Option key={center.id} value={center.id}>{center.name}</Select.Option>
                            ))}
                        </Select>
                        <Input
                            placeholder="센터명, 이름, 연락처 검색"
                            prefix={<SearchOutlined />}
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            style={{ width: 280 }}
                            allowClear
                        />
                    </Space>
                    <Space>
                        <Button icon={<PlusOutlined />} onClick={openLinkModal}>
                            기존{TYPE_LABELS[activeType]}추가
                        </Button>
                        {activeType === 'USER' && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={openRegisterModal}>
                                신규회원추가
                            </Button>
                        )}
                    </Space>
                </Flex>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredCenterMembers}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <CenterMemberFormModal
                open={modalOpen}
                mode={modalMode}
                memberType={activeType}
                selectedCenterId={selectedCenter}
                centers={centers}
                members={members}
                centerMembers={centerMembers}
                confirmLoading={submitting}
                onCancel={closeModal}
                onSubmit={handleSubmit}
            />
        </DashboardLayout>
    );
};

export default CenterMemberList;
