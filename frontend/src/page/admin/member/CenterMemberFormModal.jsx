import React, { useEffect } from 'react';
import { Modal, Form, Select, Input, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const itemStyle = { marginBottom: 14 };

const CenterMemberFormModal = ({ open, mode, centers, members, confirmLoading, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const isLink = mode === 'link';

    useEffect(() => {
        if (!open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            if (isLink) {
                onSubmit({
                    center: values.centerId ? { id: values.centerId } : null,
                    member: values.memberId ? { id: values.memberId } : null,
                });
            } else {
                onSubmit({
                    centerId: values.centerId,
                    loginId: values.loginId,
                    pwd: values.pwd,
                    name: values.name,
                    email: values.email,
                    hp: values.hp,
                });
            }
        });
    };

    return (
        <Modal
            title={
                <Space align="center" size={10}>
                    <UserOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                    <Title level={5} style={{ margin: 0 }}>{isLink ? '기존 회원 추가' : '신규 회원 추가'}</Title>
                </Space>
            }
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={confirmLoading}
            okText="추가"
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

                {isLink ? (
                    <Form.Item name="memberId" label="회원" style={itemStyle} rules={[{ required: true, message: '회원을 선택해주세요.' }]}>
                        <Select
                            placeholder="회원 선택"
                            showSearch
                            optionFilterProp="label"
                            options={(members || []).filter((m) => m.status !== 'WITHDRAWN').map((m) => ({
                                value: m.id,
                                label: `${m.name} (${m.loginId})`,
                            }))}
                        />
                    </Form.Item>
                ) : (
                    <>
                        <Form.Item name="loginId" label="아이디" style={itemStyle} rules={[{ required: true, message: '아이디를 입력해주세요.' }]}>
                            <Input placeholder="로그인 아이디" />
                        </Form.Item>

                        <Form.Item name="pwd" label="비밀번호" style={itemStyle} rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}>
                            <Input.Password placeholder="비밀번호" />
                        </Form.Item>

                        <Form.Item name="name" label="이름" style={itemStyle} rules={[{ required: true, message: '이름을 입력해주세요.' }]}>
                            <Input placeholder="이름 입력" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="이메일"
                            style={itemStyle}
                            rules={[
                                { required: true, message: '이메일을 입력해주세요.' },
                                { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
                            ]}
                        >
                            <Input placeholder="이메일 입력" />
                        </Form.Item>

                        <Form.Item name="hp" label="연락처" style={itemStyle}>
                            <Input placeholder="연락처 입력 (선택)" />
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default CenterMemberFormModal;
