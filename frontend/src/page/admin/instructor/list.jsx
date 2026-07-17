import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Card, Popconfirm, message, Flex } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import DashboardLayout from '../../../components/DashboardLayout';
import InstructorFormModal from './InstructorFormModal';
import { fetchInstructors, createInstructor, updateInstructor, deleteInstructor } from '../../../api/instructorApi';

const InstructorList = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadInstructors = async () => {
        setLoading(true);
        try {
            const data = await fetchInstructors();
            setInstructors(data);
        } catch (error) {
            console.error('강사 목록 조회 실패:', error);
            message.error('강사 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInstructors();
    }, []);

    const openAddModal = () => {
        setModalMode('add');
        setEditingInstructor(null);
        setModalOpen(true);
    };

    const openEditModal = (record) => {
        setModalMode('edit');
        setEditingInstructor(record);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingInstructor(null);
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            if (modalMode === 'edit') {
                await updateInstructor(editingInstructor.id, values);
                message.success('강사 정보가 수정되었습니다.');
            } else {
                await createInstructor(values);
                message.success('강사가 추가되었습니다.');
            }
            closeModal();
            loadInstructors();
        } catch (error) {
            console.error('강사 저장 실패:', error);
            message.error('강사 저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteInstructor(record.id);
            message.success('강사가 삭제되었습니다.');
            loadInstructors();
        } catch (error) {
            console.error('강사 삭제 실패:', error);
            message.error('강사 삭제 중 오류가 발생했습니다.');
        }
    };

    const filteredInstructors = Array.isArray(instructors)
        ? instructors.filter((instructor) => {
            const text = keyword.trim().toLowerCase();
            if (!text) return true;
            return [instructor.name, instructor.hp]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(text));
        })
        : [];

    const columns = [
        { title: '강사 이름', dataIndex: 'name', key: 'name' },
        { title: '연락처', dataIndex: 'hp', key: 'hp' },
        { title: '강사 소개', dataIndex: 'info', key: 'info', ellipsis: true },
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
                        title="강사를 삭제하시겠습니까?"
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
        <DashboardLayout title="강사 관리">
            <Card bordered={false}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="강사 이름, 연락처 검색"
                        prefix={<SearchOutlined />}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ width: 280 }}
                        allowClear
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                        강사 추가
                    </Button>
                </Flex>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredInstructors}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <InstructorFormModal
                open={modalOpen}
                mode={modalMode}
                initialValues={editingInstructor}
                confirmLoading={submitting}
                onCancel={closeModal}
                onSubmit={handleSubmit}
            />
        </DashboardLayout>
    );
};

export default InstructorList;
