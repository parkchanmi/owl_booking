import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Card, Popconfirm, message, Flex } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import DashboardLayout from '../../../components/DashboardLayout';
import CenterMemberFormModal from './CenterMemberFormModal';
import { fetchCenterMembers, createCenterMember, updateCenterMember, deleteCenterMember } from '../../../api/centerMemberApi';
import { fetchCenters } from '../../../api/centerApi';
import { fetchMembers } from '../../../api/memberApi';

const CenterMemberList = () => {
    const [centerMembers, setCenterMembers] = useState([]);
    const [centers, setCenters] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingCenterMember, setEditingCenterMember] = useState(null);
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

    const openAddModal = () => {
        setModalMode('add');
        setEditingCenterMember(null);
        setModalOpen(true);
    };

    const openEditModal = (record) => {
        setModalMode('edit');
        setEditingCenterMember(record);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingCenterMember(null);
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            if (modalMode === 'edit') {
                await updateCenterMember(editingCenterMember.id, values);
                message.success('센터 회원 정보가 수정되었습니다.');
            } else {
                await createCenterMember(values);
                message.success('센터 회원이 추가되었습니다.');
            }
            closeModal();
            loadCenterMembers();
        } catch (error) {
            console.error('센터 회원 저장 실패:', error);
            message.error('센터 회원 저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteCenterMember(record.id);
            message.success('센터 회원이 삭제되었습니다.');
            loadCenterMembers();
        } catch (error) {
            console.error('센터 회원 삭제 실패:', error);
            message.error('센터 회원 삭제 중 오류가 발생했습니다.');
        }
    };

    const filteredCenterMembers = Array.isArray(centerMembers)
        ? centerMembers.filter((cm) => {
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
            title: '관리',
            key: 'actions',
            width: 160,
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => openEditModal(record)}>
                        편집
                    </Button>
                    <Popconfirm
                        title="센터 회원을 삭제하시겠습니까?"
                        okText="삭제"
                        cancelText="취소"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button size="small" danger>
                            삭제
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <DashboardLayout title="센터 회원 관리">
            <Card bordered={false}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="센터명, 회원명, 연락처 검색"
                        prefix={<SearchOutlined />}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ width: 280 }}
                        allowClear
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                        센터 회원 추가
                    </Button>
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
                initialValues={editingCenterMember}
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
