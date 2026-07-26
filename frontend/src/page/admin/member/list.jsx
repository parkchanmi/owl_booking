import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Space, Card, Tag, message, Flex, Popconfirm } from 'antd';
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import '../adminList.css';
import CenterMemberFormModal from './CenterMemberFormModal';
import { fetchCenterMembers, registerCenterMember, createCenterMember, withdrawCenterMember } from '../../../api/centerMemberApi';
import { fetchCenters } from '../../../api/centerApi';
import { fetchMembers } from '../../../api/memberApi';

const CenterMemberList = () => {
    const navigate = useNavigate();
    const [centerMembers, setCenterMembers] = useState([]);
    const [centers, setCenters] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [keyword, setKeyword] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('register');
    const [submitting, setSubmitting] = useState(false);

    const loadCenterMembers = async () => {
        setLoading(true);
        try {
            const data = await fetchCenterMembers();
            setCenterMembers(data);
        } catch (error) {
            console.error('센터 회원 목록 조회 실패:', error);
            message.error('센터 회원 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCenterMembers();
        fetchCenters().then(setCenters).catch(() => message.error('센터 목록을 불러오지 못했습니다.'));
        fetchMembers().then(setMembers).catch(() => message.error('회원 목록을 불러오지 못했습니다.'));
    }, []);

    const openRegisterModal = () => {
        setModalMode('register');
        setModalOpen(true);
    };

    const openLinkModal = () => {
        setModalMode('link');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleSubmit = async (values) => {
        if (modalMode === 'link') {
            const duplicate = centerMembers.some((cm) => (
                cm.center?.id === values.center?.id && cm.member?.id === values.member?.id
            ));
            if (duplicate) {
                message.error('이미 해당 센터에 추가된 회원입니다.');
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
            message.success('회원이 추가되었습니다.');
            closeModal();
            loadCenterMembers();
        } catch (error) {
            console.error('센터 회원 저장 실패:', error);
            if (error.response?.status === 409) {
                message.error('이미 사용중인 아이디입니다.');
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
            message.success(result.deleted ? '회원 정보가 삭제되었습니다.' : '이력이 있어 탈퇴 상태로 변경되었습니다.');
            loadCenterMembers();
            fetchMembers().then(setMembers).catch(() => {});
        } catch (error) {
            message.error(error.response?.data?.message ?? '회원 탈퇴 처리 중 오류가 발생했습니다.');
        }
    };

    const filteredCenterMembers = Array.isArray(centerMembers)
        ? centerMembers.filter((cm) => {
            if (selectedCenter && cm.center?.id !== selectedCenter) return false;
            const text = keyword.trim().toLowerCase();
            if (!text) return true;
            return [cm.center?.name, cm.member?.name, cm.member?.hp]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(text));
        })
        : [];

    const columns = [
        { title: '센터', key: 'center', render: (_, r) => r.center?.name ?? '-' },
        { title: '회원명', key: 'memberName', render: (_, r) => r.member?.name ?? '-' },
        { title: '아이디', key: 'loginId', render: (_, r) => r.member?.loginId ?? '-' },
        { title: '연락처', key: 'hp', render: (_, r) => r.member?.hp ?? '-' },
        { title: '이메일', key: 'email', render: (_, r) => r.member?.email ?? '-' },
        {
            title: '상태',
            key: 'status',
            align: 'center',
            width: 90,
            render: (_, r) => {
                const color = r.status === '이용중' ? 'green' : r.status === '정지중' ? 'orange' : r.status === '탈퇴' ? 'red' : 'default';
                return <Tag color={color}>{r.status ?? '미등록'}</Tag>;
            },
        },
        {
            title: '관리',
            key: 'actions',
            width: 90,
            render: (_, record) => (
                <Space size={4}>
                    <Button
                        size="small"
                        disabled={!record.member?.id}
                        onClick={() => navigate(`/admin/member/detail?id=${record.member.id}&centerId=${record.center?.id ?? ''}`)}
                    >
                        편집
                    </Button>
                    <Popconfirm
                        title="회원 탈퇴 처리하시겠습니까?"
                        okText="탈퇴"
                        cancelText="취소"
                        disabled={!record.member?.id || record.status === '탈퇴'}
                        onConfirm={() => handleWithdraw(record)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} disabled={!record.member?.id || record.status === '탈퇴'} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <DashboardLayout title="센터 회원 관리">
            <Card bordered={false}>
                <Flex justify="space-between" align="center" className="admin-list-toolbar">
                    <Space>
                        <Select
                            style={{ width: 200 }}
                            value={selectedCenter}
                            onChange={setSelectedCenter}
                            placeholder="센터 전체"
                            allowClear
                        >
                            {centers.map((c) => (
                                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                            ))}
                        </Select>
                        <Input
                            placeholder="센터명, 회원명, 연락처 검색"
                            prefix={<SearchOutlined />}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            style={{ width: 280 }}
                            allowClear
                        />
                    </Space>
                    <Space>
                        <Button icon={<PlusOutlined />} onClick={openLinkModal}>
                            기존회원추가
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openRegisterModal}>
                            신규회원추가
                        </Button>
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
                centers={centers}
                members={members}
                confirmLoading={submitting}
                onCancel={closeModal}
                onSubmit={handleSubmit}
            />
        </DashboardLayout>
    );
};

export default CenterMemberList;
