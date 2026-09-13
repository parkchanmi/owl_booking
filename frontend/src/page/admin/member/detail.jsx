import React, { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Card,
    DatePicker,
    Descriptions,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Spin,
    Table,
    Tag,
} from 'antd';
import { DeleteOutlined, EditOutlined, LeftOutlined, PauseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchCenterMembers } from '../../../api/centerMemberApi';
import { fetchMemberById, updateMemberContact } from '../../../api/memberApi';
import { fetchMemberMemberships, updateMemberMembership, createMemberMembership } from '../../../api/memberMembershipApi';
import { fetchHoldHistories, createHoldHistory, updateHoldHistory, deleteHoldHistory } from '../../../api/holdHistoryApi';
import { fetchMemberships } from '../../../api/membershipApi';
import { fetchMemberBookingAttendanceHistories } from '../../../api/attendanceApi';

const { RangePicker } = DatePicker;

const formatDateTime = (value) => value.format('YYYY-MM-DDTHH:mm:ss');

const rangesOverlap = (startA, endA, startB, endB) => {
    if (!startA || !endA || !startB || !endB) return false;
    const aStart = dayjs(startA).startOf('day');
    const aEnd = dayjs(endA).startOf('day');
    const bStart = dayjs(startB).startOf('day');
    const bEnd = dayjs(endB).startOf('day');
    return !aEnd.isBefore(bStart) && !aStart.isAfter(bEnd);
};

const getHoldDays = (range) => {
    if (!range?.[0] || !range?.[1]) return null;
    return range[1].startOf('day').diff(range[0].startOf('day'), 'day') + 1;
};

const isWithinDateRange = (startDat, endDat, boundaryStartDat, boundaryEndDat) => {
    if (!startDat || !endDat || !boundaryStartDat || !boundaryEndDat) return false;
    const start = dayjs(startDat).startOf('day');
    const end = dayjs(endDat).startOf('day');
    const boundaryStart = dayjs(boundaryStartDat).startOf('day');
    const boundaryEnd = dayjs(boundaryEndDat).startOf('day');
    return !start.isBefore(boundaryStart) && !end.isAfter(boundaryEnd);
};

const formatPhoneNumber = (value = '') => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.startsWith('02')) {
        if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
        if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, digits.length - 4)}-${digits.slice(-4)}`;
        return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    }
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
};

const MemberDetail = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const memberId = searchParams.get('id');
    const centerId = searchParams.get('centerId');

    const [member, setMember] = useState(null);
    const [centerMembers, setCenterMembers] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [holdHistories, setHoldHistories] = useState([]);
    const [attendanceHistories, setAttendanceHistories] = useState([]);
    const [membershipOptions, setMembershipOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactForm] = Form.useForm();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingMembership, setEditingMembership] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [registerSubmitting, setRegisterSubmitting] = useState(false);
    const [registerForm] = Form.useForm();
    const registerMembershipId = Form.useWatch('membershipId', registerForm);
    const registerStartDat = Form.useWatch('startDat', registerForm);

    const [holdModalOpen, setHoldModalOpen] = useState(false);
    const [holdSubmitting, setHoldSubmitting] = useState(false);
    const [holdForm] = Form.useForm();
    const holdMmId = Form.useWatch('mmId', holdForm);
    const holdRange = Form.useWatch('range', holdForm);

    const [editHoldModalOpen, setEditHoldModalOpen] = useState(false);
    const [editingHoldHistory, setEditingHoldHistory] = useState(null);
    const [editHoldSubmitting, setEditHoldSubmitting] = useState(false);
    const [editHoldForm] = Form.useForm();
    const editHoldRange = Form.useWatch('range', editHoldForm);

    const loadDetail = async () => {
        setLoading(true);
        try {
            const [memberData, membershipData, holdHistoryData, centerMemberData, membershipOptionData, attendanceHistoryData] = await Promise.all([
                fetchMemberById(memberId),
                fetchMemberMemberships(memberId),
                fetchHoldHistories(memberId),
                fetchCenterMembers(),
                fetchMemberships(),
                fetchMemberBookingAttendanceHistories(memberId, centerId),
            ]);
            setMember(memberData);
            setMemberships(Array.isArray(membershipData) ? membershipData : []);
            setHoldHistories(Array.isArray(holdHistoryData) ? holdHistoryData : []);
            setCenterMembers(Array.isArray(centerMemberData) ? centerMemberData : []);
            setMembershipOptions(Array.isArray(membershipOptionData) ? membershipOptionData : []);
            setAttendanceHistories(Array.isArray(attendanceHistoryData) ? attendanceHistoryData : []);
        } catch {
            message.error('회원 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!memberId) return;
        loadDetail();
    }, [memberId, centerId]);

    useEffect(() => {
        if (!member) return;
        contactForm.setFieldsValue({
            email: member.email,
            hp: member.hp,
        });
    }, [contactForm, member]);

    const currentCenterMember = useMemo(() => (
        centerMembers.find((cm) => (
            cm.member?.id === memberId && (!centerId || cm.center?.id === centerId)
        ))
    ), [centerId, centerMembers, memberId]);

    const currentCenter = useMemo(() => {
        const linkedCenter = currentCenterMember?.center;
        if (linkedCenter) return linkedCenter;
        return memberships.find((mm) => !centerId || mm.center?.id === centerId)?.center ?? null;
    }, [centerId, currentCenterMember, memberships]);

    const currentCenterId = currentCenter?.id ?? centerId;
    const currentCenterName = currentCenter?.name ?? '-';
    const currentStatus = currentCenterMember?.status ?? (member?.status === 'WITHDRAWN' ? '탈퇴' : '미등록');
    const isWithdrawn = currentStatus === '탈퇴' || member?.status === 'WITHDRAWN';

    const currentCenterMemberships = useMemo(
        () => memberships.filter((mm) => !currentCenterId || mm.center?.id === currentCenterId),
        [currentCenterId, memberships],
    );

    const currentCenterMembershipOptions = useMemo(
        () => membershipOptions.filter((m) => !currentCenterId || m.center?.id === currentCenterId),
        [currentCenterId, membershipOptions],
    );

    const selectedRegisterMembership = currentCenterMembershipOptions.find((m) => m.id === registerMembershipId);
    const registerEndDat = registerStartDat && selectedRegisterMembership?.durationDays != null
        ? registerStartDat.add(selectedRegisterMembership.durationDays, 'day')
        : null;

    const selectedHoldMembership = currentCenterMemberships.find((mm) => mm.id === holdMmId);
    const holdDays = getHoldDays(holdRange);
    const editHoldDays = getHoldDays(editHoldRange);

    const getRemainingHoldDays = (mmId, excludedHoldId = null) => {
        const mm = memberships.find((item) => item.id === mmId);
        if (!mm) return 0;
        const usedHoldDays = holdHistories
            .filter((history) => history.mm?.id === mmId && history.id !== excludedHoldId)
            .reduce((sum, history) => sum + (history.hDay ?? 0), 0);
        return Math.max((mm.hDay ?? 0) - usedHoldDays, 0);
    };

    const validateMembershipRange = (startDat, endDat, excludedId = null) => {
        if (!startDat || !endDat) return false;
        return memberships.some((mm) => mm.id !== excludedId && rangesOverlap(startDat, endDat, mm.startDat, mm.endDat));
    };

    const validateHoldRange = (mmId, range, excludedHoldId = null) => {
        if (!mmId || !range?.[0] || !range?.[1]) return true;
        const mm = memberships.find((item) => item.id === mmId);
        if (!mm || !isWithinDateRange(range[0], range[1], mm.startDat, mm.endDat)) {
            message.error('보류 기간은 이용권 시작일과 종료일 안에서만 설정할 수 있습니다.');
            return false;
        }
        const days = getHoldDays(range);
        if (days > getRemainingHoldDays(mmId, excludedHoldId)) {
            message.error('잔여 보류일자를 초과하는 보류기간은 설정할 수 없습니다.');
            return false;
        }
        const overlaps = holdHistories.some((history) => (
            history.mm?.id === mmId
            && history.id !== excludedHoldId
            && rangesOverlap(range[0], range[1], history.startDat, history.endDat)
        ));
        if (overlaps) {
            message.error('이미 등록된 보류 기간과 겹칠 수 없습니다.');
            return false;
        }
        return true;
    };

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
        if (isWithdrawn) {
            message.error('탈퇴 상태의 회원은 정보를 변경할 수 없습니다.');
            return;
        }
        if (validateMembershipRange(values.startDat, values.endDat, editingMembership.id)) {
            message.error('다른 이용권의 시작일과 종료일 범위와 겹칠 수 없습니다.');
            return;
        }
        setSubmitting(true);
        try {
            await updateMemberMembership(editingMembership.id, {
                startDat: formatDateTime(values.startDat),
                endDat: formatDateTime(values.endDat),
                uCnt: values.uCnt,
                hDay: values.hDay,
            });
            message.success('이용권 정보가 수정되었습니다.');
            closeEditModal();
            loadDetail();
        } catch (error) {
            message.error(error.response?.data?.message ?? '수정 중 오류가 발생했습니다.');
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
        if (isWithdrawn) {
            message.error('탈퇴 상태의 회원은 이용권을 추가할 수 없습니다.');
            return;
        }
        const selectedMembership = membershipOptions.find((m) => m.id === values.membershipId);
        const endDat = values.startDat.add(selectedMembership.durationDays, 'day');
        if (validateMembershipRange(values.startDat, endDat)) {
            message.error('다른 이용권의 시작일과 종료일 범위와 겹칠 수 없습니다.');
            return;
        }

        setRegisterSubmitting(true);
        try {
            await createMemberMembership({
                memberId,
                centerId: currentCenterId,
                membershipId: values.membershipId,
                startDat: formatDateTime(values.startDat),
            });
            message.success('이용권이 등록되었습니다.');
            closeRegisterModal();
            loadDetail();
        } catch (error) {
            message.error(error.response?.data?.message ?? '이용권 등록 중 오류가 발생했습니다.');
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
        if (isWithdrawn) {
            message.error('탈퇴 상태의 회원은 보류 처리할 수 없습니다.');
            return;
        }
        if (!validateHoldRange(values.mmId, values.range)) return;

        setHoldSubmitting(true);
        try {
            const [start, end] = values.range;
            await createHoldHistory({
                mmId: values.mmId,
                startDat: formatDateTime(start),
                endDat: formatDateTime(end),
            });
            message.success('보류 처리가 저장되었습니다.');
            closeHoldModal();
            loadDetail();
        } catch (error) {
            message.error(error.response?.data?.message ?? '보류 처리 중 오류가 발생했습니다.');
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
        if (isWithdrawn) {
            message.error('탈퇴 상태의 회원은 보류 처리할 수 없습니다.');
            return;
        }
        if (!validateHoldRange(editingHoldHistory.mm?.id, values.range, editingHoldHistory.id)) return;

        setEditHoldSubmitting(true);
        try {
            const [start, end] = values.range;
            await updateHoldHistory(editingHoldHistory.id, {
                startDat: formatDateTime(start),
                endDat: formatDateTime(end),
            });
            message.success('보류 이력이 수정되었습니다.');
            closeEditHoldModal();
            loadDetail();
        } catch (error) {
            message.error(error.response?.data?.message ?? '수정 중 오류가 발생했습니다.');
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

    const handleContactSubmit = async (values) => {
        if (isWithdrawn) {
            message.error('탈퇴 상태의 회원은 정보를 변경할 수 없습니다.');
            return;
        }

        setContactSubmitting(true);
        try {
            const formattedHp = formatPhoneNumber(values.hp ?? '');
            const updatedMember = await updateMemberContact(memberId, {
                email: values.email,
                hp: formattedHp,
            });
            setMember(updatedMember);
            message.success('회원 정보가 저장되었습니다.');
            loadDetail();
        } catch (error) {
            message.error(error.response?.data?.message ?? '회원 정보 저장 중 오류가 발생했습니다.');
        } finally {
            setContactSubmitting(false);
        }
    };

    const membershipColumns = [
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
            title: '잔여 보류일자',
            key: 'hDay',
            align: 'center',
            render: (_, r) => (r.hDay != null ? `${getRemainingHoldDays(r.id)}일` : '-'),
        },
        {
            title: '상태',
            key: 'status',
            align: 'center',
            width: 90,
            render: (_, r) => {
                const expired = r.endDat && dayjs(r.endDat).isBefore(dayjs(), 'day');
                return <Tag color={expired ? 'red' : 'green'}>{expired ? '만료' : '사용중'}</Tag>;
            },
        },
        {
            title: '관리',
            key: 'actions',
            align: 'center',
            width: 70,
            render: (_, record) => (
                <Button size="small" icon={<EditOutlined />} disabled={isWithdrawn} onClick={() => openEditModal(record)} />
            ),
        },
    ].map((col) => ({ ...col, onHeaderCell: () => ({ style: { textAlign: 'center' } }) }));

    const holdHistoryColumns = [
        { title: '이용권명', key: 'name', render: (_, r) => r.mm?.membership?.name ?? '-' },
        { title: '센터', key: 'center', render: (_, r) => r.mm?.center?.name ?? '-' },
        {
            title: '보류 시작일',
            key: 'startDat',
            align: 'center',
            render: (_, r) => (r.startDat ? dayjs(r.startDat).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '보류 종료일',
            key: 'endDat',
            align: 'center',
            render: (_, r) => (r.endDat ? dayjs(r.endDat).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '보류일수',
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
                    <Button size="small" icon={<EditOutlined />} disabled={isWithdrawn} onClick={() => openEditHoldModal(record)} />
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

    const attendanceHistoryColumns = [
        {
            title: '수업일',
            key: 'programDat',
            align: 'center',
            render: (_, r) => (r.programDat ? dayjs(r.programDat).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '시간',
            key: 'time',
            align: 'center',
            render: (_, r) => (r.startTime || r.endTime ? `${r.startTime ?? ''} ~ ${r.endTime ?? ''}` : '-'),
        },
        { title: '수업명', key: 'programName', render: (_, r) => r.programName ?? '-' },
        { title: '강사', key: 'instructorName', render: (_, r) => r.instructorName ?? '-' },
        { title: '센터', key: 'centerName', render: (_, r) => r.centerName ?? '-' },
        {
            title: '예약',
            key: 'bookingStatus',
            align: 'center',
            width: 90,
            render: (_, r) => (
                r.bookingStatus === 'BOOKED'
                    ? <Tag color="blue">예약</Tag>
                    : <Tag>없음</Tag>
            ),
        },
        {
            title: '출결',
            key: 'attendanceStatus',
            align: 'center',
            width: 90,
            render: (_, r) => {
                if (r.attendanceStatus === 'PRESENT') return <Tag color="green">출석</Tag>;
                if (r.attendanceStatus === 'ABSENT') return <Tag color="red">결석</Tag>;
                return <Tag>미처리</Tag>;
            },
        },
        {
            title: '처리일시',
            key: 'recordedAt',
            align: 'center',
            render: (_, r) => (r.recordedAt ? dayjs(r.recordedAt).format('YYYY-MM-DD HH:mm') : '-'),
        },
    ].map((col) => ({ ...col, onHeaderCell: () => ({ style: { textAlign: 'center' } }) }));

    return (
        <DashboardLayout title="회원 상세">
            <Button icon={<LeftOutlined />} style={{ marginBottom: 16 }} onClick={() => navigate('/admin/member/list')}>
                목록으로
            </Button>

            <Spin spinning={loading}>
                <Card
                    title="회원 정보"
                    bordered={false}
                    style={{ marginBottom: 16 }}
                    extra={
                        <Button
                            type="primary"
                            loading={contactSubmitting}
                            disabled={isWithdrawn}
                            onClick={() => contactForm.submit()}
                        >
                            저장
                        </Button>
                    }
                >
                    <Form form={contactForm} component={false} onFinish={handleContactSubmit}>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="아이디">{member?.loginId ?? '-'}</Descriptions.Item>
                            <Descriptions.Item label="이름">{member?.name ?? '-'}</Descriptions.Item>
                            <Descriptions.Item label="이메일">
                                <Form.Item
                                    name="email"
                                    noStyle
                                    rules={[
                                        { required: true, message: '이메일을 입력해주세요.' },
                                        { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
                                    ]}
                                >
                                    <Input size="small" disabled={isWithdrawn} style={{ maxWidth: 260 }} />
                                </Form.Item>
                            </Descriptions.Item>
                            <Descriptions.Item label="연락처">
                                <Form.Item
                                    name="hp"
                                    noStyle
                                    rules={[
                                        {
                                            pattern: /^0\d{1,2}-\d{3,4}-\d{4}$/,
                                            message: '올바른 연락처 형식이 아닙니다.',
                                        },
                                    ]}
                                >
                                    <Input
                                        size="small"
                                        disabled={isWithdrawn}
                                        style={{ maxWidth: 220 }}
                                        onChange={(event) => {
                                            contactForm.setFieldValue('hp', formatPhoneNumber(event.target.value));
                                        }}
                                    />
                                </Form.Item>
                            </Descriptions.Item>
                            <Descriptions.Item label="센터">{currentCenterName}</Descriptions.Item>
                            <Descriptions.Item label="상태">
                                <Tag color={currentStatus === '이용중' ? 'green' : currentStatus === '정지중' ? 'orange' : currentStatus === '탈퇴' ? 'red' : 'default'}>
                                    {currentStatus}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="회원구분">
                                <Tag color={member?.type === 'ADMIN' ? 'purple' : 'blue'}>
                                    {member?.type === 'ADMIN' ? '관리자' : '일반회원'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Form>
                </Card>

                <Card
                    title="보유 이용권"
                    bordered={false}
                    extra={
                        <Space>
                            <Button
                                icon={<PauseCircleOutlined />}
                                onClick={openHoldModal}
                                disabled={isWithdrawn || !currentCenterId || currentCenterMemberships.length === 0}
                            >
                                보류 처리
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={openRegisterModal} disabled={isWithdrawn || !currentCenterId}>
                                이용권 등록
                            </Button>
                        </Space>
                    }
                >
                    <Table
                        rowKey="id"
                        columns={membershipColumns}
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

                <Card title="예약 및 출결내역" bordered={false} style={{ marginTop: 16 }}>
                    <Table
                        rowKey="id"
                        columns={attendanceHistoryColumns}
                        dataSource={attendanceHistories}
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: '예약 및 출결내역이 없습니다.' }}
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
                    <Form.Item name="startDat" label="시작일" rules={[{ required: true, message: '시작일을 선택해주세요.' }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item
                        name="endDat"
                        label="종료일"
                        dependencies={['startDat']}
                        rules={[
                            { required: true, message: '종료일을 선택해주세요.' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const startDat = getFieldValue('startDat');
                                    if (!value || !startDat || !value.isBefore(startDat, 'day')) return Promise.resolve();
                                    return Promise.reject(new Error('종료일은 시작일보다 빠를 수 없습니다.'));
                                },
                            }),
                        ]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="uCnt" label="이용가능횟수">
                        <InputNumber min={0} addonAfter="회" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="hDay" label="보류가능일자">
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
                <Form form={registerForm} layout="vertical" onFinish={handleRegisterSubmit} style={{ marginTop: 16 }}>
                    <Form.Item label="센터">
                        <Input value={currentCenterName} disabled />
                    </Form.Item>
                    <Form.Item name="membershipId" label="이용권" rules={[{ required: true, message: '이용권을 선택해주세요.' }]}>
                        <Select placeholder="이용권 선택" showSearch optionFilterProp="label">
                            {currentCenterMembershipOptions.map((m) => (
                                <Select.Option key={m.id} value={m.id} label={m.name}>
                                    <div>{m.name}</div>
                                    <div style={{ fontSize: 11, color: '#999' }}>
                                        {m.useCnt}회 / {m.durationDays}일{m.holdDays != null ? ` / 보류 ${m.holdDays}일` : ''}
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="startDat" label="시작일" rules={[{ required: true, message: '시작일을 선택해주세요.' }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item label="종료일">
                        <Input value={registerEndDat ? registerEndDat.format('YYYY-MM-DD') : '-'} disabled />
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
                    <Form.Item label="센터">
                        <Input value={currentCenterName} disabled />
                    </Form.Item>
                    <Form.Item name="mmId" label="이용권" rules={[{ required: true, message: '이용권을 선택해주세요.' }]}>
                        <Select placeholder="이용권 선택">
                            {currentCenterMemberships.map((mm) => (
                                <Select.Option key={mm.id} value={mm.id}>
                                    {mm.membership?.name} (잔여 보류 {getRemainingHoldDays(mm.id)}일)
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="range" label="보류 시작~종료일" rules={[{ required: true, message: '보류 기간을 선택해주세요.' }]}>
                        <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item label="보류일수">
                        <InputNumber value={holdDays} disabled addonAfter="일" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="잔여 보류일자">
                        <InputNumber value={selectedHoldMembership ? getRemainingHoldDays(selectedHoldMembership.id) : 0} disabled addonAfter="일" style={{ width: '100%' }} />
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
                    <Form.Item label="센터">
                        <Input value={editingHoldHistory?.mm?.center?.name ?? '-'} disabled />
                    </Form.Item>
                    <Form.Item label="이용권">
                        <Input value={editingHoldHistory?.mm?.membership?.name ?? '-'} disabled />
                    </Form.Item>
                    <Form.Item name="range" label="보류 시작~종료일" rules={[{ required: true, message: '보류 기간을 선택해주세요.' }]}>
                        <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item label="보류일수">
                        <InputNumber value={editHoldDays} disabled addonAfter="일" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="잔여 보류일자">
                        <InputNumber
                            value={editingHoldHistory ? getRemainingHoldDays(editingHoldHistory.mm?.id, editingHoldHistory.id) : 0}
                            disabled
                            addonAfter="일"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    );
};

export default MemberDetail;
