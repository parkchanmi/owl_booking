import React, { useEffect } from 'react';
import { Form, Input, Modal, Select, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const itemStyle = { marginBottom: 14 };

const TYPE_LABELS = {
    USER: '회원',
    ADMIN: '관리자',
};

const CenterMemberFormModal = ({
    open,
    mode,
    memberType = 'USER',
    selectedCenterId,
    centers,
    members,
    centerMembers,
    confirmLoading,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const isLink = mode === 'link';
    const typeLabel = TYPE_LABELS[memberType] ?? '회원';
    const watchedCenterId = Form.useWatch('centerId', form);

    useEffect(() => {
        if (open) {
            form.setFieldsValue({ centerId: selectedCenterId });
        } else {
            form.resetFields();
        }
    }, [open, selectedCenterId, form]);

    const memberOptions = (members || [])
        .filter((member) => member.type === memberType)
        .filter((member) => member.status !== 'WITHDRAWN')
        .filter((member) => !watchedCenterId || !(centerMembers || []).some((centerMember) => (
            centerMember.center?.id === watchedCenterId && centerMember.member?.id === member.id
        )))
        .map((member) => ({
            value: member.id,
            label: `${member.name ?? '-'} (${member.loginId ?? '아이디 없음'})`,
        }));

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
            title={(
                <Space align="center" size={10}>
                    <UserOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                    <Title level={5} style={{ margin: 0 }}>{isLink ? `기존 ${typeLabel} 추가` : '신규 회원 추가'}</Title>
                </Space>
            )}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={confirmLoading}
            okText="추가"
            cancelText="취소"
            centered
            destroyOnHidden
            styles={{
                header: { paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid #f0f0f0' },
                body: { paddingTop: 8 },
            }}
        >
            <Form form={form} layout="vertical" requiredMark={false}>
                <Form.Item name="centerId" label="센터" style={itemStyle} rules={[{ required: true, message: '센터를 선택해주세요.' }]}>
                    <Select placeholder="센터 선택" disabled>
                        {(centers || []).map((center) => (
                            <Select.Option key={center.id} value={center.id}>{center.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {isLink ? (
                    <Form.Item name="memberId" label={typeLabel} style={itemStyle} rules={[{ required: true, message: `${typeLabel}를 선택해주세요.` }]}>
                        <Select
                            placeholder={`${typeLabel} 선택`}
                            showSearch
                            optionFilterProp="label"
                            options={memberOptions}
                            notFoundContent={`추가 가능한 ${typeLabel}가 없습니다.`}
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
