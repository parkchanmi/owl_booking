import React, { useEffect, useState } from 'react';
import {
    Card, Table, Button, Input, Space, Popconfirm,
    Modal, Form, Select, InputNumber, TimePicker, message, Flex, Radio, Tag,
} from 'antd';
import { PlusOutlined, SearchOutlined, PauseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchPrograms, createProgram, updateProgram, pauseProgram, deleteProgram } from '../../../api/programApi';
import { fetchCenters } from '../../../api/centerApi';
import { fetchInstructors } from '../../../api/instructorApi';

const DAY_ORDER = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_OPTIONS = DAY_ORDER.map((d) => ({ value: d, label: d }));

const ClassList = () => {
    const [programs, setPrograms] = useState([]);
    const [centers, setCenters] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [keyword, setKeyword] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingProgram, setEditingProgram] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const loadPrograms = async () => {
        setLoading(true);
        try {
            const data = await fetchPrograms();
            setPrograms(data);
        } catch {
            message.error('수업 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPrograms();
        fetchCenters()
            .then((data) => {
                setCenters(data);
                if (data.length > 0) setSelectedCenter(data[0].id);
            })
            .catch(() => message.error('센터 목록을 불러오지 못했습니다.'));
        fetchInstructors().then(setInstructors).catch(() => message.error('강사 목록을 불러오지 못했습니다.'));
    }, []);

    const filtered = programs.filter((p) => {
        if (selectedCenter && p.center?.id !== selectedCenter) return false;
        const text = keyword.trim().toLowerCase();
        if (!text) return true;
        return [p.name, p.instructor?.name]
            .filter(Boolean)
            .some((f) => f.toLowerCase().includes(text));
    });

    const openAddModal = () => {
        setModalMode('add');
        setEditingProgram(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEditModal = (record) => {
        setModalMode('edit');
        setEditingProgram(record);
        form.setFieldsValue({
            name: record.name,
            dayOfWeek: record.dayOfWeek ? record.dayOfWeek.split(',') : [],
            startTime: record.startTime ? dayjs(record.startTime, 'HH:mm') : null,
            endTime: record.endTime ? dayjs(record.endTime, 'HH:mm') : null,
            maxCapacity: record.maxCapacity,
            active: record.active !== false,
            centerId: record.center?.id,
            instructorId: record.instructor?.id,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingProgram(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        const payload = {
            name: values.name,
            dayOfWeek: Array.isArray(values.dayOfWeek)
                ? [...values.dayOfWeek].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)).join(',')
                : values.dayOfWeek,
            startTime: values.startTime?.format('HH:mm'),
            endTime: values.endTime?.format('HH:mm'),
            maxCapacity: values.maxCapacity,
            active: values.active,
            center: values.centerId ? { id: values.centerId } : null,
            instructor: values.instructorId ? { id: values.instructorId } : null,
        };
        try {
            if (modalMode === 'edit') {
                await updateProgram(editingProgram.id, payload);
                message.success('수업 정보가 수정되었습니다.');
            } else {
                await createProgram(payload);
                message.success('수업이 추가되었습니다.');
            }
            closeModal();
            loadPrograms();
        } catch {
            message.error('저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePause = async (record) => {
        try {
            await pauseProgram(record.id);
            message.success('수업이 중지되었습니다.');
            loadPrograms();
        } catch {
            message.error('중지 처리 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async (record) => {
        try {
            const res = await deleteProgram(record.id);
            if (res.status === 204) {
                message.success('수업이 삭제되었습니다.');
            } else {
                message.success('이력이 있어 정지 처리되었습니다.');
            }
            loadPrograms();
        } catch {
            message.error('처리 중 오류가 발생했습니다.');
        }
    };

    const columns = [
        {
            title: '수업명',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <Button type="link" style={{ padding: 0 }} onClick={() => openEditModal(record)}>
                    {name}
                </Button>
            ),
        },
        { title: '센터', key: 'center', render: (_, r) => r.center?.name ?? '-' },
        { title: '요일', dataIndex: 'dayOfWeek', key: 'dayOfWeek', align: 'center' },
        {
            title: '시간',
            key: 'time',
            render: (_, r) => r.startTime && r.endTime ? `${r.startTime} ~ ${r.endTime}` : '-',
        },
        { title: '강사', key: 'instructor', render: (_, r) => r.instructor?.name ?? '-' },
        {
            title: '정원',
            dataIndex: 'maxCapacity',
            key: 'maxCapacity',
            align: 'center',
            render: (v) => (v != null ? `${v}명` : '-'),
        },
        {
            title: '상태',
            key: 'active',
            align: 'center',
            width: 80,
            render: (_, r) => (
                <Tag color={r.active !== false ? 'green' : 'red'}>
                    {r.active !== false ? '운영' : '중지'}
                </Tag>
            ),
        },
        {
            title: '관리',
            key: 'actions',
            width: 90,
            align: 'center',
            render: (_, record) => (
                <Space size={4}>
                    <Popconfirm
                        title="수업을 중지하시겠습니까?"
                        okText="중지"
                        cancelText="취소"
                        disabled={record.active === false}
                        onConfirm={() => handlePause(record)}
                    >
                        <Button
                            size="small"
                            icon={<PauseCircleOutlined />}
                            disabled={record.active === false}
                            title="중지"
                        />
                    </Popconfirm>
                    <Popconfirm
                        title={
                            <span>
                                수업을 삭제하시겠습니까?<br />
                                <span style={{ fontSize: 12, color: '#999' }}>이력이 있으면 정지 처리됩니다.</span>
                            </span>
                        }
                        okText="확인"
                        cancelText="취소"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} title="삭제" />
                    </Popconfirm>
                </Space>
            ),
        },
    ].map((col) => ({ ...col, onHeaderCell: () => ({ style: { textAlign: 'center' } }) }));

    return (
        <DashboardLayout title="수업 관리">
            <Card bordered={false}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Space>
                        <Select
                            style={{ width: 200 }}
                            value={selectedCenter}
                            onChange={setSelectedCenter}
                        >
                            {centers.map((c) => (
                                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                            ))}
                        </Select>
                        <Input
                            placeholder="수업명, 강사명 검색"
                            prefix={<SearchOutlined />}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            style={{ width: 220 }}
                            allowClear
                        />
                    </Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                        수업 추가
                    </Button>
                </Flex>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filtered}
                    loading={loading}
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
                >
                    <Form.Item
                        name="name"
                        label="수업명"
                        rules={[{ required: true, message: '수업명을 입력해주세요.' }]}
                    >
                        <Input placeholder="수업명 입력" />
                    </Form.Item>

                    <Form.Item
                        name="centerId"
                        label="센터"
                        rules={[{ required: true, message: '센터를 선택해주세요.' }]}
                    >
                        <Select placeholder="센터 선택">
                            {centers.map((c) => (
                                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="instructorId"
                        label="담당 강사"
                        rules={[{ required: true, message: '강사를 선택해주세요.' }]}
                    >
                        <Select placeholder="강사 선택">
                            {instructors.map((i) => (
                                <Select.Option key={i.id} value={i.id}>{i.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dayOfWeek"
                        label="요일"
                        rules={[{ required: true, message: '요일을 선택해주세요.' }]}
                    >
                        <Select placeholder="요일 선택" options={DAY_OPTIONS} mode="multiple" />
                    </Form.Item>

                    <Flex gap={12}>
                        <Form.Item
                            name="startTime"
                            label="시작 시간"
                            rules={[{ required: true, message: '시작 시간을 선택해주세요.' }]}
                            style={{ flex: 1 }}
                        >
                            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            name="endTime"
                            label="종료 시간"
                            rules={[{ required: true, message: '종료 시간을 선택해주세요.' }]}
                            style={{ flex: 1 }}
                        >
                            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
                        </Form.Item>
                    </Flex>

                    <Form.Item
                        name="maxCapacity"
                        label="정원"
                        rules={[{ required: true, message: '정원을 입력해주세요.' }]}
                    >
                        <InputNumber min={1} max={100} addonAfter="명" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="active"
                        label="상태"
                        initialValue={true}
                        rules={[{ required: true }]}
                    >
                        <Radio.Group>
                            <Radio value={true}>운영</Radio>
                            <Radio value={false}>중지</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    );
};

export default ClassList;
