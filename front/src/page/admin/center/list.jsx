import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Card, Popconfirm, message, Flex } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import DashboardLayout from '../../../components/DashboardLayout';
import CenterFormModal from '../../../components/center/CenterFormModal';
import { fetchCenters, createCenter, updateCenter, deleteCenter } from '../../../api/centerApi';

const CenterList = () => {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingCenter, setEditingCenter] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadCenters = async () => {
        setLoading(true);
        try {
            const data = await fetchCenters();
            setCenters(data);
        } catch (error) {
            console.error('센터 목록 조회 실패:', error);
            message.error('센터 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCenters();
    }, []);

    const openAddModal = () => {
        setModalMode('add');
        setEditingCenter(null);
        setModalOpen(true);
    };

    const openEditModal = (record) => {
        setModalMode('edit');
        setEditingCenter(record);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingCenter(null);
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            if (modalMode === 'edit') {
                await updateCenter(editingCenter.id, values);
                message.success('센터 정보가 수정되었습니다.');
            } else {
                await createCenter(values);
                message.success('센터가 추가되었습니다.');
            }
            closeModal();
            loadCenters();
        } catch (error) {
            console.error('센터 저장 실패:', error);
            message.error('센터 저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteCenter(record.id);
            message.success('센터가 삭제되었습니다.');
            loadCenters();
        } catch (error) {
            console.error('센터 삭제 실패:', error);
            message.error('센터 삭제 중 오류가 발생했습니다.');
        }
    };

    const filteredCenters = Array.isArray(centers) 
    ? centers.filter((center) => {
        const text = keyword.trim().toLowerCase();
        if (!text) return true;
        return [center.name, center.bizName, center.ceoName]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(text));
    })
    : [];

    const columns = [
        { title: '센터명', dataIndex: 'name', key: 'name' },
        { title: '상호', dataIndex: 'bizName', key: 'bizName' },
        { title: '대표자명', dataIndex: 'ceoName', key: 'ceoName' },
        { title: '사업자등록번호', dataIndex: 'bizNo', key: 'bizNo' },
        {
            title: '주소',
            key: 'addr',
            render: (_, record) => [record.addr, record.addrDetail].filter(Boolean).join(' '),
        },
        { title: '전화번호', dataIndex: 'tel', key: 'tel' },
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
                        title="센터를 삭제하시겠습니까?"
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
        <DashboardLayout title="센터 관리">
            <Card bordered={false}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="센터명, 상호, 대표자명 검색"
                        prefix={<SearchOutlined />}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ width: 280 }}
                        allowClear
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                        센터 추가
                    </Button>
                </Flex>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredCenters}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <CenterFormModal
                open={modalOpen}
                mode={modalMode}
                initialValues={editingCenter}
                confirmLoading={submitting}
                onCancel={closeModal}
                onSubmit={handleSubmit}
            />
        </DashboardLayout>
    );
};

export default CenterList;
