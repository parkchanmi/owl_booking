import React, { useEffect } from 'react';
import { Empty, Form, Input, Modal, Select, Space, Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

const { Title } = Typography;

const itemStyle = { marginBottom: 14 };

const InstructorFormModal = ({
    open,
    mode,
    initialValues,
    selectedCenterId,
    centers = [],
    members = [],
    confirmLoading,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const isEdit = mode === 'edit';
    const modalCenterId = initialValues?.center?.id ?? selectedCenterId;

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                ...initialValues,
                center: modalCenterId ? { id: modalCenterId } : undefined,
                member: initialValues?.member?.id ? { id: initialValues.member.id } : undefined,
            });
        } else {
            form.resetFields();
        }
    }, [open, initialValues, modalCenterId, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            onSubmit({
                ...values,
                center: values.center?.id ? { id: values.center.id } : null,
                member: values.member?.id ? { id: values.member.id } : null,
            });
        });
    };

    const handleMemberChange = (memberId) => {
        const member = members.find((item) => item.id === memberId);
        if (!member) return;

        form.setFieldsValue({
            name: form.getFieldValue('name') || member.name,
            hp: form.getFieldValue('hp') || member.hp,
        });
    };

    return (
        <Modal
            title={(
                <Space align="center" size={10}>
                    <TeamOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                    <Title level={5} style={{ margin: 0 }}>{isEdit ? '강사 편집' : '강사 추가'}</Title>
                </Space>
            )}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={confirmLoading}
            okText={isEdit ? '저장' : '추가'}
            cancelText="취소"
            centered
            destroyOnHidden
            styles={{
                header: { paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid #f0f0f0' },
                body: { paddingTop: 8 },
            }}
        >
            <Form form={form} layout="vertical" requiredMark={false}>
                <Form.Item
                    name={['center', 'id']}
                    label="센터"
                    style={itemStyle}
                    rules={[{ required: true, message: '센터를 선택해주세요.' }]}
                >
                    <Select placeholder="센터 선택" disabled>
                        {centers.map((center) => (
                            <Select.Option key={center.id} value={center.id}>{center.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name={['member', 'id']}
                    label="연결 관리자 사용자"
                    style={itemStyle}
                    rules={[{ required: true, message: '강사로 연결할 관리자 사용자를 선택해주세요.' }]}
                >
                    <Select
                        placeholder="센터에 등록된 관리자 선택"
                        optionFilterProp="label"
                        showSearch
                        onChange={handleMemberChange}
                        options={members.map((member) => ({
                            value: member.id,
                            label: `${member.name ?? '-'} (${member.loginId ?? '아이디 없음'})`,
                        }))}
                        notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="센터에 등록된 관리자가 없습니다." />}
                    />
                </Form.Item>

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
