import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Flex, Input, Popconfirm, Select, Space, Table, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import DashboardLayout from '../../../components/DashboardLayout';
import '../adminList.css';
import InstructorFormModal from './InstructorFormModal';
import { createInstructor, deleteInstructor, fetchInstructors, updateInstructor } from '../../../api/instructorApi';
import { fetchCenters } from '../../../api/centerApi';
import { fetchCenterMembers } from '../../../api/centerMemberApi';

const InstructorList = () => {
    const [instructors, setInstructors] = useState([]);
    const [centers, setCenters] = useState([]);
    const [centerMembers, setCenterMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadInstructors = async () => {
        setLoading(true);
        try {
            const data = await fetchInstructors();
            setInstructors(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('강사 목록 조회 실패:', error);
            message.error('강사 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const loadCenterMembers = async () => {
        try {
            const data = await fetchCenterMembers();
            setCenterMembers(Array.isArray(data) ? data : []);
        } catch {
            message.error('센터 관리자 목록을 불러오지 못했습니다.');
        }
    };

    useEffect(() => {
        loadInstructors();
        loadCenterMembers();
        fetchCenters()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setCenters(list);
                if (list.length > 0) setSelectedCenter(list[0].id);
            })
            .catch(() => message.error('센터 목록을 불러오지 못했습니다.'));
    }, []);

    const adminUsers = useMemo(() => (
        centerMembers
            .filter((centerMember) => (
                centerMember.center?.id === selectedCenter
                && centerMember.member?.id
                && centerMember.member?.type === 'ADMIN'
                && centerMember.member?.status !== 'WITHDRAWN'
            ))
            .map((centerMember) => centerMember.member)
    ), [centerMembers, selectedCenter]);

    const openAddModal = () => {
        if (!selectedCenter) {
            message.info('먼저 센터를 선택해주세요.');
            return;
        }
        setModalMode('add');
        setEditingInstructor(null);
        setModalOpen(true);
    };

    const openEditModal = (record) => {
        setModalMode('edit');
        setEditingInstructor(record);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingInstructor(null);
    };

    const handleSubmit = async (values) => {
        const selectedMember = adminUsers.find((member) => member.id === values.member?.id);
        const centerId = values.center?.id ?? selectedCenter;

        setSubmitting(true);
        try {
            const payload = {
                ...values,
                center: centerId ? { id: centerId } : null,
                name: values.name || selectedMember?.name,
                hp: values.hp || selectedMember?.hp,
            };

            if (modalMode === 'edit') {
                await updateInstructor(editingInstructor.id, payload);
                message.success('강사 정보가 수정되었습니다.');
            } else {
                await createInstructor(payload);
                message.success('강사가 추가되었습니다.');
            }
            closeModal();
            loadInstructors();
            loadCenterMembers();
        } catch (error) {
            console.error('강사 저장 실패:', error);
            message.error(error.response?.data?.message ?? '강사 저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteInstructor(record.id);
            message.success('강사가 삭제되었습니다.');
            loadInstructors();
        } catch (error) {
            console.error('강사 삭제 실패:', error);
            message.error('강사 삭제 중 오류가 발생했습니다.');
        }
    };

    const filteredInstructors = useMemo(() => (
        (Array.isArray(instructors) ? instructors : [])
            .filter((instructor) => !selectedCenter || instructor.center?.id === selectedCenter)
            .filter((instructor) => {
                const text = keyword.trim().toLowerCase();
                if (!text) return true;
                return [
                    instructor.center?.name,
                    instructor.name,
                    instructor.hp,
                    instructor.member?.name,
                    instructor.member?.loginId,
                ].filter(Boolean).some((field) => String(field).toLowerCase().includes(text));
            })
    ), [instructors, keyword, selectedCenter]);

    const columns = [
        { title: '센터', key: 'center', render: (_, row) => row.center?.name ?? '-' },
        { title: '강사 이름', dataIndex: 'name', key: 'name' },
        { title: '연결 사용자', key: 'member', render: (_, row) => (row.member?.name ? `${row.member.name} (${row.member.loginId ?? '-'})` : '-') },
        { title: '연락처', dataIndex: 'hp', key: 'hp' },
        { title: '강사 소개', dataIndex: 'info', key: 'info', ellipsis: true },
        {
            title: '관리',
            key: 'actions',
            width: 160,
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => openEditModal(record)}>
                        편집
                    </Button>
                    <Popconfirm
                        title="강사를 삭제하시겠습니까?"
                        okText="삭제"
                        cancelText="취소"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button size="small" danger>
                            삭제
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <DashboardLayout title="강사 관리">
            <Card bordered={false}>
                <Flex justify="space-between" align="center" className="admin-list-toolbar">
                    <Space>
                        <Select
                            style={{ width: 200 }}
                            value={selectedCenter}
                            onChange={setSelectedCenter}
                            placeholder="센터 선택"
                        >
                            {centers.map((center) => (
                                <Select.Option key={center.id} value={center.id}>{center.name}</Select.Option>
                            ))}
                        </Select>
                        <Input
                            placeholder="센터명, 강사 이름, 연락처 검색"
                            prefix={<SearchOutlined />}
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            style={{ width: 300 }}
                            allowClear
                        />
                    </Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                        강사 추가
                    </Button>
                </Flex>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredInstructors}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <InstructorFormModal
                open={modalOpen}
                mode={modalMode}
                initialValues={editingInstructor}
                selectedCenterId={selectedCenter}
                centers={centers}
                members={adminUsers}
                confirmLoading={submitting}
                onCancel={closeModal}
                onSubmit={handleSubmit}
            />
        </DashboardLayout>
    );
};

export default InstructorList;
