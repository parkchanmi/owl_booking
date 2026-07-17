import React, { useEffect } from 'react';
import { Modal, Form, Select, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const itemStyle = { marginBottom: 14 };

const CenterMemberFormModal = ({ open, mode, initialValues, centers, members, confirmLoading, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const isEdit = mode === 'edit';

    useEffect(() => {
        if (open) {
            form.setFieldsValue(
                initialValues
                    ? {
                        centerId: initialValues.center?.id,
                        memberId: initialValues.member?.id,
                    }
                    : {}
            );
        } else {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then(({ centerId, memberId }) => {
            onSubmit({
                center: centerId ? { id: centerId } : null,
                member: memberId ? { id: memberId } : null,
            });
        });
    };

    return (
        <Modal
            title={
                <Space align="center" size={10}>
                    <UserOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                    <Title level={5} style={{ margin: 0 }}>{isEdit ? '센터 회원 편집' : '센터 회원 추가'}</Title>
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

                <Form.Item name="memberId" label="회원" style={itemStyle} rules={[{ required: true, message: '회원을 선택해주세요.' }]}>
                    <Select
                        placeholder="회원 선택"
                        showSearch
                        optionFilterProp="label"
                        options={(members || []).map((m) => ({
                            value: m.id,
                            label: `${m.name} (${m.loginId})`,
                        }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CenterMemberFormModal;
