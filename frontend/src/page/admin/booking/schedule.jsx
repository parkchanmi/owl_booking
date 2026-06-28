import React, { useState } from 'react';
import {
    Card, Table, Button, Space, Tag, Modal, Form, Select,
    DatePicker, TimePicker, InputNumber, Drawer, Descriptions, message, Flex,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import DashboardLayout from '../../../components/DashboardLayout';

const { RangePicker: TimeRangePicker } = TimePicker;

const MOCK_SCHEDULES = [
    {
        id: 1,
        className: '요가 기초반',
        classDate: '2026-06-28',
        startTime: '09:00',
        endTime: '10:00',
        instructorName: '김지수',
        totalCount: 15,
        reservedCount: 12,
        waitCount: 3,
    },
    {
        id: 2,
        className: '필라테스 중급반',
        classDate: '2026-06-28',
        startTime: '11:00',
        endTime: '12:00',
        instructorName: '이민준',
        totalCount: 10,
        reservedCount: 10,
        waitCount: 5,
    },
    {
        id: 3,
        className: '스피닝 입문반',
        classDate: '2026-06-29',
        startTime: '14:00',
        endTime: '15:00',
        instructorName: '박서연',
        totalCount: 20,
        reservedCount: 8,
        waitCount: 0,
    },
];

const OPEN_CLASSES = [
    { id: 1, name: '요가 기초반' },
    { id: 2, name: '필라테스 중급반' },
    { id: 3, name: '스피닝 입문반' },
    { id: 4, name: '크로스핏 고급반' },
];

const INSTRUCTORS = [
    { id: 1, name: '김지수' },
    { id: 2, name: '이민준' },
    { id: 3, name: '박서연' },
];

const BookingSchedule = () => {
    const [schedules, setSchedules] = useState(MOCK_SCHEDULES);
    const [createOpen, setCreateOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const columns = [
        { title: '수업명', dataIndex: 'className', key: 'className' },
        {
            title: '수업시간',
            key: 'classTime',
            render: (_, r) => `${r.classDate} ${r.startTime}~${r.endTime}`,
        },
        { title: '강사명', dataIndex: 'instructorName', key: 'instructorName' },
        {
            title: '수업인원',
            dataIndex: 'totalCount',
            key: 'totalCount',
            align: 'center',
            render: (v) => `${v}명`,
        },
        {
            title: '예약인원',
            dataIndex: 'reservedCount',
            key: 'reservedCount',
            align: 'center',
            render: (v, r) => (
                <Tag color={v >= r.totalCount ? 'red' : 'blue'}>{v}명</Tag>
            ),
        },
        {
            title: '대기인원',
            dataIndex: 'waitCount',
            key: 'waitCount',
            align: 'center',
            render: (v) => <Tag color={v > 0 ? 'orange' : 'default'}>{v}명</Tag>,
        },
        {
            title: '관리',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Button
                    size="small"
                    onClick={() => {
                        setSelectedSchedule(record);
                        setDetailOpen(true);
                    }}
                >
                    상세
                </Button>
            ),
        },
    ];

    const openCreateModal = () => {
        form.resetFields();
        setCreateOpen(true);
    };

    const handleCreate = async (values) => {
        setSubmitting(true);
        try {
            const [start, end] = values.timeRange;
            const newSchedule = {
                id: Date.now(),
                className: OPEN_CLASSES.find((c) => c.id === values.classId)?.name ?? '',
                classDate: values.classDate.format('YYYY-MM-DD'),
                startTime: start.format('HH:mm'),
                endTime: end.format('HH:mm'),
                instructorName: INSTRUCTORS.find((i) => i.id === values.instructorId)?.name ?? '',
                totalCount: values.totalCount,
                reservedCount: 0,
                waitCount: 0,
            };
            setSchedules((prev) => [newSchedule, ...prev]);
            message.success('수업 스케줄이 생성되었습니다.');
            setCreateOpen(false);
        } catch {
            message.error('스케줄 생성 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="수업 스케줄 관리">
            <Card bordered={false}>
                <Flex justify="flex-end" style={{ marginBottom: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                        수업 스케줄 생성
                    </Button>
                </Flex>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={schedules}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* 수업 스케줄 생성 모달 */}
            <Modal
                title="수업 스케줄 생성"
                open={createOpen}
                onCancel={() => setCreateOpen(false)}
                onOk={() => form.submit()}
                okText="생성"
                cancelText="취소"
                confirmLoading={submitting}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="classId"
                        label="수업 선택"
                        rules={[{ required: true, message: '수업을 선택해주세요.' }]}
                    >
                        <Select placeholder="오픈 가능한 수업 선택">
                            {OPEN_CLASSES.map((c) => (
                                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="classDate"
                        label="수업 날짜"
                        rules={[{ required: true, message: '날짜를 선택해주세요.' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item
                        name="timeRange"
                        label="수업 시간"
                        rules={[{ required: true, message: '수업 시간을 선택해주세요.' }]}
                    >
                        <TimeRangePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="instructorId"
                        label="강사 선택"
                        rules={[{ required: true, message: '강사를 선택해주세요.' }]}
                    >
                        <Select placeholder="강사 선택">
                            {INSTRUCTORS.map((i) => (
                                <Select.Option key={i.id} value={i.id}>{i.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="totalCount"
                        label="수업 인원"
                        rules={[{ required: true, message: '수업 인원을 입력해주세요.' }]}
                    >
                        <InputNumber min={1} max={100} addonAfter="명" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 수업 상세 정보 Drawer */}
            <Drawer
                title="수업 상세 정보"
                open={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setSelectedSchedule(null);
                }}
                width={480}
            >
                {selectedSchedule && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="수업명">{selectedSchedule.className}</Descriptions.Item>
                        <Descriptions.Item label="수업 날짜">{selectedSchedule.classDate}</Descriptions.Item>
                        <Descriptions.Item label="수업 시간">
                            {selectedSchedule.startTime} ~ {selectedSchedule.endTime}
                        </Descriptions.Item>
                        <Descriptions.Item label="강사명">{selectedSchedule.instructorName}</Descriptions.Item>
                        <Descriptions.Item label="수업 인원">{selectedSchedule.totalCount}명</Descriptions.Item>
                        <Descriptions.Item label="예약 인원">
                            <Tag color={selectedSchedule.reservedCount >= selectedSchedule.totalCount ? 'red' : 'blue'}>
                                {selectedSchedule.reservedCount}명
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="대기 인원">
                            <Tag color={selectedSchedule.waitCount > 0 ? 'orange' : 'default'}>
                                {selectedSchedule.waitCount}명
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </DashboardLayout>
    );
};

export default BookingSchedule;
