import React, { useState } from 'react';
import {
    Card, Table, Button, Input, Space, Tag, Popconfirm,
    Modal, Form, Select, InputNumber, message, Flex,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import DashboardLayout from '../../../components/DashboardLayout';

const MOCK_CLASSES = [
    {
        id: 1,
        name: '요가 기초반',
        instructorName: '김지수',
        category: 'yoga',
        totalCount: 15,
        status: 'active',
        description: '초보자를 위한 기초 요가 수업입니다.',
    },
    {
        id: 2,
        name: '필라테스 중급반',
        instructorName: '이민준',
        category: 'pilates',
        totalCount: 10,
        status: 'active',
        description: '코어 강화를 위한 중급 필라테스 수업입니다.',
    },
    {
        id: 3,
        name: '스피닝 입문반',
        instructorName: '박서연',
        category: 'spinning',
        totalCount: 20,
        status: 'inactive',
        description: '실내 사이클링 입문 수업입니다.',
    },
    {
        id: 4,
        name: '크로스핏 고급반',
        instructorName: '최준혁',
        category: 'crossfit',
        totalCount: 12,
        status: 'active',
        description: '고강도 기능성 운동 수업입니다.',
    },
];

const CATEGORIES = [
    { value: 'yoga', label: '요가' },
    { value: 'pilates', label: '필라테스' },
    { value: 'spinning', label: '스피닝' },
    { value: 'crossfit', label: '크로스핏' },
    { value: 'etc', label: '기타' },
];

const INSTRUCTORS = [
    { id: 1, name: '김지수' },
    { id: 2, name: '이민준' },
    { id: 3, name: '박서연' },
    { id: 4, name: '최준혁' },
];

const ClassList = () => {
    const [classes, setClasses] = useState(MOCK_CLASSES);
    const [keyword, setKeyword] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingClass, setEditingClass] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const filtered = classes.filter((c) => {
        const text = keyword.trim().toLowerCase();
        if (!text) return true;
        return [c.name, c.instructorName].some((f) => f.toLowerCase().includes(text));
    });

    const openAddModal = () => {
        setModalMode('add');
        setEditingClass(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEditModal = (record) => {
        setModalMode('edit');
        setEditingClass(record);
        form.setFieldsValue(record);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingClass(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            if (modalMode === 'edit') {
                setClasses((prev) =>
                    prev.map((c) => (c.id === editingClass.id ? { ...c, ...values } : c))
                );
                message.success('수업 정보가 수정되었습니다.');
            } else {
                const newClass = { id: Date.now(), ...values };
                setClasses((prev) => [newClass, ...prev]);
                message.success('수업이 추가되었습니다.');
            }
            closeModal();
        } catch {
            message.error('저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (record) => {
        setClasses((prev) => prev.filter((c) => c.id !== record.id));
        message.success('수업이 삭제되었습니다.');
    };

    const columns = [
        { title: '수업명', dataIndex: 'name', key: 'name' },
        { title: '강사명', dataIndex: 'instructorName', key: 'instructorName' },
        {
            title: '카테고리',
            dataIndex: 'category',
            key: 'category',
            render: (v) => CATEGORIES.find((c) => c.value === v)?.label ?? v,
        },
        {
            title: '정원',
            dataIndex: 'totalCount',
            key: 'totalCount',
            align: 'center',
            render: (v) => `${v}명`,
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (v) => (
                <Tag color={v === 'active' ? 'green' : 'default'}>
                    {v === 'active' ? '활성' : '비활성'}
                </Tag>
            ),
        },
        { title: '수업 설명', dataIndex: 'description', key: 'description', ellipsis: true },
        {
            title: '관리',
            key: 'actions',
            width: 140,
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => openEditModal(record)}>편집</Button>
                    <Popconfirm
                        title="수업을 삭제하시겠습니까?"
                        okText="삭제"
                        cancelText="취소"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button size="small" danger>삭제</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <DashboardLayout title="수업 관리">
            <Card bordered={false}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="수업명, 강사명 검색"
                        prefix={<SearchOutlined />}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{ width: 260 }}
                        allowClear
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                        수업 추가
                    </Button>
                </Flex>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filtered}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={modalMode === 'edit' ? '수업 편집' : '수업 추가'}
                open={modalOpen}
                onCancel={closeModal}
                onOk={() => form.submit()}
                okText={modalMode === 'edit' ? '수정' : '추가'}
                cancelText="취소"
                confirmLoading={submitting}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: 16 }}
                    initialValues={{ status: 'active' }}
                >
                    <Form.Item
                        name="name"
                        label="수업명"
                        rules={[{ required: true, message: '수업명을 입력해주세요.' }]}
                    >
                        <Input placeholder="수업명 입력" />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="카테고리"
                        rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
                    >
                        <Select placeholder="카테고리 선택">
                            {CATEGORIES.map((c) => (
                                <Select.Option key={c.value} value={c.value}>{c.label}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="instructorName"
                        label="담당 강사"
                        rules={[{ required: true, message: '강사를 선택해주세요.' }]}
                    >
                        <Select placeholder="강사 선택">
                            {INSTRUCTORS.map((i) => (
                                <Select.Option key={i.id} value={i.name}>{i.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="totalCount"
                        label="정원"
                        rules={[{ required: true, message: '정원을 입력해주세요.' }]}
                    >
                        <InputNumber min={1} max={100} addonAfter="명" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="status" label="상태">
                        <Select>
                            <Select.Option value="active">활성</Select.Option>
                            <Select.Option value="inactive">비활성</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="수업 설명">
                        <Input.TextArea rows={3} placeholder="수업 설명 입력" />
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    );
};

export default ClassList;
