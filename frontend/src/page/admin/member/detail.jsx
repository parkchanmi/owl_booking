import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Table, Tag, Button, Space, Popconfirm, message, Spin, Modal, Form, Select, DatePicker, InputNumber } from 'antd';
import { LeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchMemberById } from '../../../api/memberApi';
import { fetchMemberMemberships, updateMemberMembership, createMemberMembership } from '../../../api/memberMembershipApi';
import { fetchHoldHistories, createHoldHistory, updateHoldHistory, deleteHoldHistory } from '../../../api/holdHistoryApi';
import { fetchCenters } from '../../../api/centerApi';
import { fetchMemberships } from '../../../api/membershipApi';

const { RangePicker } = DatePicker;

const MemberDetail = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const memberId = searchParams.get('id');

    const [member, setMember] = useState(null);
    const [memberships, setMemberships] = useState([]);
    const [holdHistories, setHoldHistories] = useState([]);
    const [centers, setCenters] = useState([]);
    const [membershipOptions, setMembershipOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingMembership, setEditingMembership] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [registerSubmitting, setRegisterSubmitting] = useState(false);
    const [registerForm] = Form.useForm();
    const registerCenterId = Form.useWatch('centerId', registerForm);

    const [holdModalOpen, setHoldModalOpen] = useState(false);
    const [holdSubmitting, setHoldSubmitting] = useState(false);
    const [holdForm] = Form.useForm();
    const holdRange = Form.useWatch('range', holdForm);

    const [editHoldModalOpen, setEditHoldModalOpen] = useState(false);
    const [editingHoldHistory, setEditingHoldHistory] = useState(null);
    const [editHoldSubmitting, setEditHoldSubmitting] = useState(false);
    const [editHoldForm] = Form.useForm();
    const editHoldRange = Form.useWatch('range', editHoldForm);

    const loadDetail = async () => {
        setLoading(true);
        try {
            const [memberData, membershipData, holdHistoryData] = await Promise.all([
                fetchMemberById(memberId),
                fetchMemberMemberships(memberId),
                fetchHoldHistories(memberId),
            ]);
            setMember(memberData);
            setMemberships(Array.isArray(membershipData) ? membershipData : []);
            setHoldHistories(Array.isArray(holdHistoryData) ? holdHistoryData : []);
        } catch {
            message.error('회원 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!memberId) return;
        loadDetail();
        fetchCenters().then(setCenters).catch(() => message.error('센터 목록을 불러오지 못했습니다.'));
        fetchMemberships().then(setMembershipOptions).catch(() => message.error('이용권 목록을 불러오지 못했습니다.'));
    }, [memberId]);

    const openEditModal = (record) => {
        setEditingMembership(record);
        form.setFieldsValue({
            startDat: record.startDat ? dayjs(record.startDat) : null,
            endDat: record.endDat ? dayjs(record.endDat) : null,
            uCnt: record.uCnt,
            hDay: record.hDay,
        });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingMembership(null);
        form.resetFields();
    };

    const handleEditSubmit = async (values) => {
        setSubmitting(true);
        try {
            await updateMemberMembership(editingMembership.id, {
                startDat: values.startDat.format('YYYY-MM-DDTHH:mm:ss'),
                endDat: values.endDat.format('YYYY-MM-DDTHH:mm:ss'),
                uCnt: values.uCnt,
                hDay: values.hDay,
            });
            message.success('이용권 정보가 수정되었습니다.');
            closeEditModal();
            loadDetail();
        } catch {
            message.error('수정 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const openRegisterModal = () => {
        registerForm.resetFields();
        setRegisterModalOpen(true);
    };

    const closeRegisterModal = () => {
        setRegisterModalOpen(false);
        registerForm.resetFields();
    };

    const handleRegisterSubmit = async (values) => {
        setRegisterSubmitting(true);
        try {
            await createMemberMembership({
                memberId,
                centerId: values.centerId,
                membershipId: values.membershipId,
                startDat: values.startDat.format('YYYY-MM-DDTHH:mm:ss'),
            });
            message.success('이용권이 등록되었습니다.');
            closeRegisterModal();
            loadDetail();
        } catch {
            message.error('이용권 등록 중 오류가 발생했습니다.');
        } finally {
            setRegisterSubmitting(false);
        }
    };

    const openHoldModal = () => {
        holdForm.resetFields();
        setHoldModalOpen(true);
    };

    const closeHoldModal = () => {
        setHoldModalOpen(false);
        holdForm.resetFields();
    };

    const handleHoldSubmit = async (values) => {
        setHoldSubmitting(true);
        try {
            const [start, end] = values.range;
            await createHoldHistory({
                mmId: values.mmId,
                startDat: start.format('YYYY-MM-DDTHH:mm:ss'),
                endDat: end.format('YYYY-MM-DDTHH:mm:ss'),
            });
            message.success('보류 처리가 저장되었습니다.');
            closeHoldModal();
            loadDetail();
        } catch {
            message.error('보류 처리 중 오류가 발생했습니다.');
        } finally {
            setHoldSubmitting(false);
        }
    };

    const openEditHoldModal = (record) => {
        setEditingHoldHistory(record);
        editHoldForm.setFieldsValue({
            range: record.startDat && record.endDat ? [dayjs(record.startDat), dayjs(record.endDat)] : null,
        });
        setEditHoldModalOpen(true);
    };

    const closeEditHoldModal = () => {
        setEditHoldModalOpen(false);
        setEditingHoldHistory(null);
        editHoldForm.resetFields();
    };

    const handleEditHoldSubmit = async (values) => {
        setEditHoldSubmitting(true);
        try {
            const [start, end] = values.range;
            await updateHoldHistory(editingHoldHistory.id, {
                startDat: start.format('YYYY-MM-DDTHH:mm:ss'),
                endDat: end.format('YYYY-MM-DDTHH:mm:ss'),
            });
            message.success('보류 이력이 수정되었습니다.');
            closeEditHoldModal();
            loadDetail();
        } catch {
            message.error('수정 중 오류가 발생했습니다.');
        } finally {
            setEditHoldSubmitting(false);
        }
    };

    const handleDeleteHoldHistory = async (record) => {
        try {
            await deleteHoldHistory(record.id);
            message.success('보류 이력이 삭제되었습니다.');
            loadDetail();
        } catch {
            message.error('삭제 중 오류가 발생했습니다.');
        }
    };

    const filteredMembershipOptions = registerCenterId
        ? membershipOptions.filter((m) => m.center?.id === registerCenterId)
        : membershipOptions;

    const holdDays = holdRange?.[0] && holdRange?.[1]
        ? holdRange[1].startOf('day').diff(holdRange[0].startOf('day'), 'day') + 1
        : null;

    const editHoldDays = editHoldRange?.[0] && editHoldRange?.[1]
        ? editHoldRange[1].startOf('day').diff(editHoldRange[0].startOf('day'), 'day') + 1
        : null;

    const holdHistoryColumns = [
        { title: '이용권명', key: 'name', render: (_, r) => r.mm?.membership?.name ?? '-' },
        { title: '센터', key: 'center', render: (_, r) => r.mm?.center?.name ?? '-' },
        {
            title: '보류시작일',
            key: 'startDat',
            align: 'center',
            render: (_, r) => (r.startDat ? dayjs(r.startDat).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '보류종료일',
            key: 'endDat',
            align: 'center',
            render: (_, r) => (r.endDat ? dayjs(r.endDat).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '실제일수',
            key: 'hDay',
            align: 'center',
            render: (_, r) => (r.hDay != null ? `${r.hDay}일` : '-'),
        },
        {
            title: '관리',
            key: 'actions',
            align: 'center',
            width: 90,
            render: (_, record) => (
                <Space size={4}>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEditHoldModal(record)} />
                    <Popconfirm
                        title="보류 이력을 삭제하시겠습니까?"
                        okText="삭제"
                        cancelText="취소"
                        onConfirm={() => handleDeleteHoldHistory(record)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ].map((col) => ({ ...col, onHeaderCell: () => ({ style: { textAlign: 'center' } }) }));

    const columns = [
        { title: '이용권명', key: 'name', render: (_, r) => r.membership?.name ?? '-' },
        { title: '센터', key: 'center', render: (_, r) => r.center?.name ?? '-' },
        {
            title: '시작일',
            key: 'startDat',
            align: 'center',
            render: (_, r) => (r.startDat ? dayjs(r.startDat).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '종료일',
            key: 'endDat',
            align: 'center',
            render: (_, r) => (r.endDat ? dayjs(r.endDat).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '잔여횟수',
            key: 'uCnt',
            align: 'center',
            render: (_, r) => (r.uCnt != null ? `${r.uCnt - (r.actualUsedCount ?? 0)}회` : '-'),
        },
        {
            title: '보류가능일수',
            key: 'hDay',
            align: 'center',
            render: (_, r) => (r.hDay != null ? `${r.hDay - (r.actualHoldDays ?? 0)}일` : '-'),
        },
        {
            title: '상태',
            key: 'status',
            align: 'center',
            width: 90,
            render: (_, r) => {
                const expired = r.endDat && dayjs(r.endDat).isBefore(dayjs());
                return <Tag color={expired ? 'red' : 'green'}>{expired ? '만료' : '사용중'}</Tag>;
            },
        },
        {
            title: '관리',
            key: 'actions',
            align: 'center',
            width: 70,
            render: (_, record) => (
                <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
            ),
        },
    ].map((col) => ({ ...col, onHeaderCell: () => ({ style: { textAlign: 'center' } }) }));

    return (
        <DashboardLayout title="회원 상세">
            <Button icon={<LeftOutlined />} style={{ marginBottom: 16 }} onClick={() => navigate('/admin/member/list')}>
                목록으로
            </Button>

            <Spin spinning={loading}>
                <Card title="회원 정보" bordered={false} style={{ marginBottom: 16 }}>
                    <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="아이디">{member?.loginId ?? '-'}</Descriptions.Item>
                        <Descriptions.Item label="이름">{member?.name ?? '-'}</Descriptions.Item>
                        <Descriptions.Item label="이메일">{member?.email ?? '-'}</Descriptions.Item>
                        <Descriptions.Item label="연락처">{member?.hp ?? '-'}</Descriptions.Item>
                        <Descriptions.Item label="회원구분" span={2}>
                            <Tag color={member?.type === 'ADMIN' ? 'purple' : 'blue'}>
                                {member?.type === 'ADMIN' ? '관리자' : '일반회원'}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card
                    title="보유 이용권"
                    bordered={false}
                    extra={
                        <Space>
                            <Button icon={<PauseCircleOutlined />} onClick={openHoldModal} disabled={memberships.length === 0}>
                                보류 처리
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={openRegisterModal}>
                                이용권 등록
                            </Button>
                        </Space>
                    }
                >
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={memberships}
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: '보유한 이용권이 없습니다.' }}
                    />
                </Card>

                <Card title="보류 처리 이력" bordered={false} style={{ marginTop: 16 }}>
                    <Table
                        rowKey="id"
                        columns={holdHistoryColumns}
                        dataSource={holdHistories}
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: '보류 처리 이력이 없습니다.' }}
                    />
                </Card>
            </Spin>

            <Modal
                title="이용권 정보 수정"
                open={editModalOpen}
                onCancel={closeEditModal}
                onOk={() => form.submit()}
                okText="저장"
                cancelText="취소"
                confirmLoading={submitting}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleEditSubmit} style={{ marginTop: 16 }}>
                    <Form.Item
                        name="startDat"
                        label="시작일"
                        rules={[{ required: true, message: '시작일을 선택해주세요.' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item
                        name="endDat"
                        label="종료일"
                        rules={[{ required: true, message: '종료일을 선택해주세요.' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item name="uCnt" label="이용가능횟수">
                        <InputNumber min={0} addonAfter="회" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="hDay" label="보류가능일수">
                        <InputNumber min={0} addonAfter="일" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="이용권 등록"
                open={registerModalOpen}
                onCancel={closeRegisterModal}
                onOk={() => registerForm.submit()}
                okText="등록"
                cancelText="취소"
                confirmLoading={registerSubmitting}
                destroyOnClose
            >
                <Form
                    form={registerForm}
                    layout="vertical"
                    onFinish={handleRegisterSubmit}
                    style={{ marginTop: 16 }}
                    onValuesChange={(changed) => {
                        if ('centerId' in changed) {
                            registerForm.setFieldValue('membershipId', undefined);
                        }
                    }}
                >
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
                        name="membershipId"
                        label="이용권"
                        rules={[{ required: true, message: '이용권을 선택해주세요.' }]}
                    >
                        <Select placeholder={registerCenterId ? '이용권 선택' : '센터를 먼저 선택해주세요'} showSearch optionFilterProp="label">
                            {filteredMembershipOptions.map((m) => (
                                <Select.Option key={m.id} value={m.id} label={m.name}>
                                    <div>{m.name}</div>
                                    <div style={{ fontSize: 11, color: '#999' }}>
                                        {m.useCnt}회 · {m.durationDays}일{m.holdDays != null ? ` · 보류 ${m.holdDays}일` : ''}
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="startDat"
                        label="시작일"
                        rules={[{ required: true, message: '시작일을 선택해주세요.' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="보류 처리"
                open={holdModalOpen}
                onCancel={closeHoldModal}
                onOk={() => holdForm.submit()}
                okText="저장"
                cancelText="취소"
                confirmLoading={holdSubmitting}
                destroyOnClose
            >
                <Form form={holdForm} layout="vertical" onFinish={handleHoldSubmit} style={{ marginTop: 16 }}>
                    <Form.Item
                        name="mmId"
                        label="이용권"
                        rules={[{ required: true, message: '이용권을 선택해주세요.' }]}
                    >
                        <Select placeholder="이용권 선택">
                            {memberships.map((mm) => (
                                <Select.Option key={mm.id} value={mm.id}>
                                    {mm.membership?.name} ({mm.center?.name})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="range"
                        label="보류 시작~종료일"
                        rules={[{ required: true, message: '보류 기간을 선택해주세요.' }]}
                    >
                        <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item label="실제일수">
                        <InputNumber value={holdDays} disabled addonAfter="일" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="보류 이력 수정"
                open={editHoldModalOpen}
                onCancel={closeEditHoldModal}
                onOk={() => editHoldForm.submit()}
                okText="저장"
                cancelText="취소"
                confirmLoading={editHoldSubmitting}
                destroyOnClose
            >
                <Form form={editHoldForm} layout="vertical" onFinish={handleEditHoldSubmit} style={{ marginTop: 16 }}>
                    <Form.Item
                        name="range"
                        label="보류 시작~종료일"
                        rules={[{ required: true, message: '보류 기간을 선택해주세요.' }]}
                    >
                        <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item label="실제일수">
                        <InputNumber value={editHoldDays} disabled addonAfter="일" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    );
};

export default MemberDetail;
