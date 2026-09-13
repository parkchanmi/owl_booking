import React, { useEffect, useState } from 'react';
import { Empty, Form, Input, List, Modal, Radio, Select, Space, Spin, Typography } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { searchMembers } from '../../../api/memberApi';

const { Text, Title } = Typography;

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
    centerMembers,
    confirmLoading,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const isLink = mode === 'link';
    const typeLabel = TYPE_LABELS[memberType] ?? '회원';
    const watchedCenterId = Form.useWatch('centerId', form);
    const watchedMemberId = Form.useWatch('memberId', form);

    useEffect(() => {
        if (open) {
            form.setFieldsValue({ centerId: selectedCenterId });
            setSearchKeyword('');
            setSearchResults([]);
            setSearched(false);
            form.setFieldsValue({ memberId: undefined });
        } else {
            form.resetFields();
            setSearchKeyword('');
            setSearchResults([]);
            setSearched(false);
        }
    }, [open, selectedCenterId, memberType, form]);

    const isAlreadyLinked = (memberId) => (
        !!watchedCenterId && (centerMembers || []).some((centerMember) => (
            centerMember.center?.id === watchedCenterId && centerMember.member?.id === memberId
            && centerMember.type === memberType
        ))
    );

    const handleSearch = async (value = searchKeyword) => {
        const keyword = value.trim();
        form.setFieldsValue({ memberId: undefined });

        if (!keyword) {
            setSearchResults([]);
            setSearched(false);
            return;
        }

        setSearching(true);
        setSearched(true);
        try {
            const data = await searchMembers({ keyword, type: memberType });
            const linkableMembers = (Array.isArray(data) ? data : [])
                .filter((member) => !isAlreadyLinked(member.id));
            setSearchResults(linkableMembers);
        } catch (error) {
            console.error('회원 검색 실패:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            if (isLink) {
                onSubmit({
                    center: values.centerId ? { id: values.centerId } : null,
                    member: values.memberId ? { id: values.memberId } : null,
                    type: memberType,
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
                    <>
                        <Form.Item label={`${typeLabel} 검색`} style={itemStyle}>
                            <Input.Search
                                placeholder="아이디 또는 이름 입력"
                                enterButton="검색"
                                prefix={<SearchOutlined />}
                                value={searchKeyword}
                                onChange={(event) => setSearchKeyword(event.target.value)}
                                onSearch={handleSearch}
                                allowClear
                            />
                        </Form.Item>

                        <Form.Item
                            name="memberId"
                            label="검색 결과"
                            style={itemStyle}
                            rules={[{ required: true, message: `추가할 ${typeLabel}를 검색 결과에서 선택해주세요.` }]}
                        >
                            {searching ? (
                                <Radio.Group style={{ width: '100%' }} disabled>
                                    <div style={{ minHeight: 128, padding: '32px 0', textAlign: 'center' }}>
                                        <Spin />
                                    </div>
                                </Radio.Group>
                            ) : (
                                <Radio.Group style={{ width: '100%' }}>
                                    <div style={{ minHeight: 128 }}>
                                        <List
                                            bordered
                                            dataSource={searchResults}
                                            locale={{
                                                emptyText: searched
                                                    ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`추가 가능한 ${typeLabel}이 없습니다.`} />
                                                    : '아이디 또는 이름으로 검색해주세요.',
                                            }}
                                            renderItem={(member) => {
                                                const selected = watchedMemberId === member.id;
                                                return (
                                                    <List.Item
                                                        onClick={() => {
                                                            form.setFieldsValue({ memberId: member.id });
                                                        }}
                                                        style={{
                                                            cursor: 'pointer',
                                                            background: selected ? '#e6f4ff' : undefined,
                                                            borderColor: selected ? '#91caff' : undefined,
                                                        }}
                                                    >
                                                        <Radio value={member.id}>
                                                            <Space direction="vertical" size={2}>
                                                                <Text strong>{member.name ?? '-'}</Text>
                                                                <Text type="secondary">
                                                                    {member.loginId ?? '아이디 없음'} · {member.email ?? '이메일 없음'}
                                                                </Text>
                                                            </Space>
                                                        </Radio>
                                                    </List.Item>
                                                );
                                            }}
                                        />
                                    </div>
                                </Radio.Group>
                            )}
                        </Form.Item>
                    </>
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
