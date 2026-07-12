import React, { useEffect } from 'react';
import { Modal, Form, Input, Typography, Space } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

const { Title } = Typography;

const itemStyle = { marginBottom: 14 };

const InstructorFormModal = ({ open, mode, initialValues, confirmLoading, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const isEdit = mode === 'edit';

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues || {});
        } else {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            onSubmit(values);
        });
    };

    return (
        <Modal
            title={
                <Space align="center" size={10}>
                    <TeamOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                    <Title level={5} style={{ margin: 0 }}>{isEdit ? '강사 편집' : '강사 추가'}</Title>
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
                <Form.Item name="name" label="강사 이름" style={itemStyle} rules={[{ required: true, message: '강사 이름을 입력해주세요.' }]}>
                    <Input placeholder="강사 이름 입력" />
                </Form.Item>

                <Form.Item name="hp" label="강사 연락처" style={itemStyle}>
                    <Input placeholder="강사 연락처 입력" />
                </Form.Item>

                <Form.Item name="info" label="강사 소개" style={itemStyle}>
                    <Input.TextArea placeholder="강사 소개 입력" rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default InstructorFormModal;
