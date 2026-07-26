import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Card, Popconfirm, message, Flex, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import DashboardLayout from '../../../components/DashboardLayout';
import '../adminList.css';
import TicketFormModal from './TicketFormModal';
import { fetchMemberships, createMembership, updateMembership, deleteMembership } from '../../../api/membershipApi';
import { fetchCenters } from '../../../api/centerApi';

const STATUS_LABEL = { ACTIVE: '사용', EXPIRED: '만료' };

const TicketList = () => {
    const [memberships, setMemberships] = useState([]);
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingMembership, setEditingMembership] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadMemberships = async () => {
        setLoading(true);
        try {
            const data = await fetchMemberships();
            setMemberships(data);
        } catch (error) {
            console.error('이용권 목록 조회 실패:', error);
            message.error('이용권 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMemberships();
        fetchCenters().then(setCenters).catch(() => message.error('센터 목록을 불러오지 못했습니다.'));
    }, []);

    const openAddModal = () => {
        setModalMode('add');
        setEditingMembership(null);
        setModalOpen(true);
    };

    const openEditModal = (record) => {
        setModalMode('edit');
        setEditingMembership(record);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingMembership(null);
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            if (modalMode === 'edit') {
                await updateMembership(editingMembership.id, values);
                message.success('이용권 정보가 수정되었습니다.');
            } else {
                await createMembership(values);
                message.success('이용권이 추가되었습니다.');
            }
            closeModal();
            loadMemberships();
        } catch (error) {
            console.error('이용권 저장 실패:', error);
            message.error('이용권 저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteMembership(record.id);
            message.success('이용권이 삭제되었습니다.');
            loadMemberships();
        } catch (error) {
            console.error('이용권 삭제 실패:', error);
            message.error('이용권 삭제 중 오류가 발생했습니다.');
        }
    };

    const filteredMemberships = Array.isArray(memberships)
        ? memberships.filter((m) => {
            const text = keyword.trim().toLowerCase();
            if (!text) return true;
            return [m.name, m.center?.name]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(text));
        })
        : [];

    const columns = [
        { title: '이용권명', dataIndex: 'name', key: 'name' },
        { title: '센터', key: 'center', render: (_, r) => r.center?.name ?? '-' },
        { title: '이용 횟수', dataIndex: 'useCnt', key: 'useCnt', align: 'center', render: (v) => (v != null ? `${v}회` : '-') },
        { title: '이용 기간', dataIndex: 'durationDays', key: 'durationDays', align: 'center', render: (v) => (v != null ? `${v}일` : '-') },
        { title: '보류 가능 일수', dataIndex: 'holdDays', key: 'holdDays', align: 'center', render: (v) => (v != null ? `${v}일` : '-') },
        { title: '가격', dataIndex: 'price', key: 'price', align: 'right', render: (v) => (v != null ? `${v.toLocaleString()}원` : '-') },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{STATUS_LABEL[status] ?? status}</Tag>
            ),
        },
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
                        title="이용권을 삭제하시겠습니까?"
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
        <DashboardLayout title="이용권 관리">
            <Card bordered={false}>
                <Flex justify="space-between" align="center" className="admin-list-toolbar">
                    <Input
                        placeholder="이용권명, 센터명 검색"
                        prefix={<SearchOutlined />}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ width: 280 }}
                        allowClear
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                        이용권 추가
                    </Button>
                </Flex>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredMemberships}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <TicketFormModal
                open={modalOpen}
                mode={modalMode}
                initialValues={editingMembership}
                centers={centers}
                confirmLoading={submitting}
                onCancel={closeModal}
                onSubmit={handleSubmit}
            />
        </DashboardLayout>
    );
};

export default TicketList;
