import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Typography, Space } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';

const { Title } = Typography;

const itemStyle = { marginBottom: 14 };

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: '사용' },
    { value: 'EXPIRED', label: '만료' },
];

const TicketFormModal = ({ open, mode, initialValues, centers, confirmLoading, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const isEdit = mode === 'edit';

    useEffect(() => {
        if (open) {
            form.setFieldsValue(
                initialValues
                    ? {
                        name: initialValues.name,
                        useCnt: initialValues.useCnt,
                        durationDays: initialValues.durationDays,
                        holdDays: initialValues.holdDays,
                        price: initialValues.price,
                        status: initialValues.status,
                        centerId: initialValues.center?.id,
                    }
                    : { status: 'ACTIVE' }
            );
        } else {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            const { centerId, ...rest } = values;
            onSubmit({ ...rest, center: centerId ? { id: centerId } : null });
        });
    };

    return (
        <Modal
            title={
                <Space align="center" size={10}>
                    <IdcardOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                    <Title level={5} style={{ margin: 0 }}>{isEdit ? '이용권 편집' : '이용권 추가'}</Title>
                </Space>
            }
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={confirmLoading}
            okText={isEdit ? '저장' : '추가'}
            cancelText="취소"
            centered
            destroyOnClose
            styles={{
                header: { paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid #f0f0f0' },
                body: { paddingTop: 8 },
            }}
        >
            <Form form={form} layout="vertical" requiredMark={false}>
                <Form.Item name="centerId" label="센터" style={itemStyle} rules={[{ required: true, message: '센터를 선택해주세요.' }]}>
                    <Select placeholder="센터 선택">
                        {(centers || []).map((c) => (
                            <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="name" label="이용권명" style={itemStyle} rules={[{ required: true, message: '이용권명을 입력해주세요.' }]}>
                    <Input placeholder="이용권명 입력" />
                </Form.Item>

                <Form.Item name="useCnt" label="이용 횟수" style={itemStyle} rules={[{ required: true, message: '이용 횟수를 입력해주세요.' }]}>
                    <InputNumber min={1} addonAfter="회" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="durationDays" label="이용 기간" style={itemStyle} rules={[{ required: true, message: '이용 기간을 입력해주세요.' }]}>
                    <InputNumber min={1} addonAfter="일" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="holdDays" label="보류 가능 일수" style={itemStyle}>
                    <InputNumber min={0} addonAfter="일" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="price" label="가격" style={itemStyle} rules={[{ required: true, message: '가격을 입력해주세요.' }]}>
                    <InputNumber min={0} addonAfter="원" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="status" label="상태" style={itemStyle} rules={[{ required: true, message: '상태를 선택해주세요.' }]}>
                    <Select placeholder="상태 선택" options={STATUS_OPTIONS} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TicketFormModal;
