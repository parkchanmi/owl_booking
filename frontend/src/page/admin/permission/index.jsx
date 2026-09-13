import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Col, Empty, Form, Input, Modal, Row, Select, Space, Spin, Table, Typography, message } from 'antd';
import { DownOutlined, EditOutlined, SaveOutlined, ShopOutlined } from '@ant-design/icons';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchCenters } from '../../../api/centerApi';
import { fetchCenterConfig, updateCenterConfig } from '../../../api/centerConfigApi';
import { fetchCenterMembers } from '../../../api/centerMemberApi';
import '../booking/index.css';

const { Text, Title } = Typography;

const ROLE_KEYS = ['OWNER', 'MANAGER', 'INSTRUCTOR'];

const DEFAULT_ROLE_LABELS = {
    OWNER: '총관리자',
    MANAGER: '매니저',
    INSTRUCTOR: '강사',
};

const DEFAULT_MENU_PERMISSIONS = {
    OWNER: ['center-list', 'instructor-list', 'instructor-attendance', 'class-list', 'booking-index', 'booking-schedule', 'ticket-list', 'member-list', 'permission-list'],
    MANAGER: ['instructor-list', 'class-list', 'booking-index', 'booking-schedule', 'ticket-list', 'member-list'],
    INSTRUCTOR: ['instructor-attendance'],
};

const DEFAULT_MEMBER_MAPPINGS = {
    OWNER: [],
    MANAGER: [],
    INSTRUCTOR: [],
};

const MENU_OPTIONS = [
    { value: 'center-list', label: '센터 관리' },
    { value: 'instructor-list', label: '강사 관리' },
    { value: 'instructor-attendance', label: '강사용 출결' },
    { value: 'class-list', label: '수업 관리' },
    { value: 'booking-index', label: '예약 관리 > 예약 설정' },
    { value: 'booking-schedule', label: '예약 관리 > 수업 스케줄 관리' },
    { value: 'ticket-list', label: '이용권 관리' },
    { value: 'member-list', label: '센터 회원 관리' },
    { value: 'permission-list', label: '권한 설정' },
];

const parseJson = (value, fallback) => {
    if (!value) return fallback;
    try {
        return { ...fallback, ...JSON.parse(value) };
    } catch {
        return fallback;
    }
};

const PermissionIndex = () => {
    const [centers, setCenters] = useState([]);
    const [centerMembers, setCenterMembers] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [centersLoading, setCentersLoading] = useState(true);
    const [configLoading, setConfigLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [labelModalOpen, setLabelModalOpen] = useState(false);
    const [labelSaving, setLabelSaving] = useState(false);
    const [labelForm] = Form.useForm();
    const [roleLabels, setRoleLabels] = useState(DEFAULT_ROLE_LABELS);
    const [menuPermissions, setMenuPermissions] = useState(DEFAULT_MENU_PERMISSIONS);
    const [memberMappings, setMemberMappings] = useState(DEFAULT_MEMBER_MAPPINGS);

    useEffect(() => {
        fetchCenters()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setCenters(list);
                if (list.length > 0) setSelectedCenter(list[0].id);
            })
            .catch(() => message.error('센터 목록을 불러오지 못했습니다.'))
            .finally(() => setCentersLoading(false));

        fetchCenterMembers()
            .then((data) => setCenterMembers(Array.isArray(data) ? data : []))
            .catch(() => message.error('센터 관리자 목록을 불러오지 못했습니다.'));
    }, []);

    useEffect(() => {
        if (!selectedCenter) return;

        setConfigLoading(true);
        fetchCenterConfig(selectedCenter)
            .then((config) => {
                setRoleLabels(parseJson(config.roleLabelsJson, DEFAULT_ROLE_LABELS));
                setMenuPermissions(parseJson(config.roleMenuPermissionsJson, DEFAULT_MENU_PERMISSIONS));
                setMemberMappings(parseJson(config.roleMemberMappingsJson, DEFAULT_MEMBER_MAPPINGS));
            })
            .catch(() => message.error('권한 설정을 불러오지 못했습니다.'))
            .finally(() => setConfigLoading(false));
    }, [selectedCenter]);

    const adminUsers = useMemo(() => (
        centerMembers
            .filter((centerMember) => (
                centerMember.center?.id === selectedCenter
                && centerMember.member?.id
                && centerMember.member?.type === 'ADMIN'
            ))
            .map((centerMember) => ({
                ...centerMember.member,
                key: centerMember.member.id,
            }))
    ), [centerMembers, selectedCenter]);

    const adminUserIds = useMemo(() => new Set(adminUsers.map((member) => member.id)), [adminUsers]);

    useEffect(() => {
        setMemberMappings((prev) => {
            const next = { ...prev };
            ROLE_KEYS.forEach((roleKey) => {
                next[roleKey] = (next[roleKey] ?? []).filter((memberId) => adminUserIds.has(memberId));
            });
            return next;
        });
    }, [adminUserIds]);

    const selectedCenterName = centers.find((center) => center.id === selectedCenter)?.name ?? '';

    const handleMenuChange = (roleKey, values) => {
        setMenuPermissions((prev) => ({ ...prev, [roleKey]: values }));
    };

    const handleMemberChange = (roleKey, values) => {
        setMemberMappings((prev) => ({ ...prev, [roleKey]: values }));
    };

    const memberColumns = [
        { title: '이름', dataIndex: 'name', width: 90, render: (value) => value || '-' },
        { title: '아이디', dataIndex: 'loginId', width: 110, render: (value) => value || '-' },
        { title: '연락처', dataIndex: 'hp', width: 130, render: (value) => value || '-' },
    ];

    const openLabelModal = () => {
        labelForm.setFieldsValue(roleLabels);
        setLabelModalOpen(true);
    };

    const handleSave = async () => {
        if (!selectedCenter) return;

        const sanitizedMemberMappings = { ...memberMappings };
        ROLE_KEYS.forEach((roleKey) => {
            sanitizedMemberMappings[roleKey] = (sanitizedMemberMappings[roleKey] ?? [])
                .filter((memberId) => adminUserIds.has(memberId));
        });

        setSaving(true);
        try {
            await updateCenterConfig(selectedCenter, {
                roleMenuPermissionsJson: JSON.stringify(menuPermissions),
                roleMemberMappingsJson: JSON.stringify(sanitizedMemberMappings),
            });
            setMemberMappings(sanitizedMemberMappings);
            window.dispatchEvent(new Event('permission-settings-saved'));
            message.success('권한 설정이 저장되었습니다.');
        } catch {
            message.error('권한 설정 저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleLabelSave = async () => {
        if (!selectedCenter) return;

        try {
            const values = await labelForm.validateFields();
            const nextRoleLabels = {
                OWNER: values.OWNER || DEFAULT_ROLE_LABELS.OWNER,
                MANAGER: values.MANAGER || DEFAULT_ROLE_LABELS.MANAGER,
                INSTRUCTOR: values.INSTRUCTOR || DEFAULT_ROLE_LABELS.INSTRUCTOR,
            };

            setLabelSaving(true);
            await updateCenterConfig(selectedCenter, {
                roleLabelsJson: JSON.stringify(nextRoleLabels),
            });
            setRoleLabels(nextRoleLabels);
            setLabelModalOpen(false);
            message.success('권한 명칭이 저장되었습니다.');
        } catch (error) {
            if (error?.errorFields) return;
            message.error('권한 명칭 저장 중 오류가 발생했습니다.');
        } finally {
            setLabelSaving(false);
        }
    };

    return (
        <DashboardLayout title="권한 설정">
            <div className="booking-settings">
                <div className="booking-settings-toolbar">
                    <div className="booking-settings-toolbar-info">
                        <span className="booking-settings-toolbar-icon"><ShopOutlined /></span>
                        <div>
                            <div className="booking-settings-toolbar-title">센터별 권한 설정</div>
                            <div className="booking-settings-toolbar-label">권한별 메뉴 노출과 센터 관리자를 한 화면에서 설정합니다.</div>
                        </div>
                    </div>
                    <Space>
                        <Select
                            value={selectedCenter}
                            onChange={setSelectedCenter}
                            placeholder="센터 선택"
                            loading={centersLoading}
                            popupMatchSelectWidth={false}
                            suffixIcon={<DownOutlined style={{ fontSize: 12 }} />}
                            className="booking-center-select"
                        >
                            {centers.map((center) => (
                                <Select.Option key={center.id} value={center.id}>{center.name}</Select.Option>
                            ))}
                        </Select>
                        <Button icon={<EditOutlined />} onClick={openLabelModal} disabled={!selectedCenter}>
                            권한 명칭 변경
                        </Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving} disabled={!selectedCenter}>
                            저장
                        </Button>
                    </Space>
                </div>

                {!centersLoading && centers.length === 0 ? (
                    <Empty description="등록된 센터가 없습니다." style={{ padding: '48px 0' }} />
                ) : (
                    <Spin spinning={configLoading}>
                        <Row gutter={[16, 16]}>
                            {ROLE_KEYS.map((roleKey) => (
                                <Col xs={24} xl={8} key={roleKey}>
                                    <Card
                                        title={roleLabels[roleKey]}
                                        bordered={false}
                                        styles={{ body: { minHeight: 420 } }}
                                        extra={<Text type="secondary">{selectedCenterName}</Text>}
                                    >
                                        <Form layout="vertical">
                                            <Form.Item label="보이는 메뉴">
                                                <Checkbox.Group
                                                    value={menuPermissions[roleKey] ?? []}
                                                    onChange={(values) => handleMenuChange(roleKey, values)}
                                                    style={{ width: '100%' }}
                                                >
                                                    <Space direction="vertical" size={8}>
                                                        {MENU_OPTIONS.map((option) => (
                                                            <Checkbox key={option.value} value={option.value}>
                                                                {option.label}
                                                            </Checkbox>
                                                        ))}
                                                    </Space>
                                                </Checkbox.Group>
                                            </Form.Item>

                                            <Form.Item label="매핑 사용자">
                                                <Table
                                                    rowKey="id"
                                                    size="small"
                                                    columns={memberColumns}
                                                    dataSource={adminUsers}
                                                    pagination={false}
                                                    scroll={{ y: 180 }}
                                                    rowSelection={{
                                                        selectedRowKeys: memberMappings[roleKey] ?? [],
                                                        onChange: (selectedRowKeys) => handleMemberChange(roleKey, selectedRowKeys),
                                                        preserveSelectedRowKeys: false,
                                                    }}
                                                    locale={{ emptyText: '해당 센터에 연결된 관리자 사용자가 없습니다.' }}
                                                />
                                            </Form.Item>
                                        </Form>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {adminUsers.length === 0 && (
                            <Card bordered={false} style={{ marginTop: 16 }}>
                                <Title level={5} style={{ marginTop: 0 }}>매핑 가능한 센터 관리자가 없습니다.</Title>
                                <Text type="secondary">센터 회원 관리에서 관리자 사용자를 해당 센터에 먼저 연결해주세요.</Text>
                            </Card>
                        )}
                    </Spin>
                )}
            </div>

            <Modal
                title="권한 명칭 변경"
                open={labelModalOpen}
                onCancel={() => setLabelModalOpen(false)}
                onOk={handleLabelSave}
                confirmLoading={labelSaving}
                okText="저장"
                cancelText="취소"
                destroyOnHidden
            >
                <Form form={labelForm} layout="vertical">
                    <Form.Item
                        name="OWNER"
                        label="총관리자 권한명"
                        rules={[{ required: true, message: '총관리자 권한명을 입력해주세요.' }]}
                    >
                        <Input placeholder="총관리자" maxLength={20} />
                    </Form.Item>
                    <Form.Item
                        name="MANAGER"
                        label="매니저 권한명"
                        rules={[{ required: true, message: '매니저 권한명을 입력해주세요.' }]}
                    >
                        <Input placeholder="매니저" maxLength={20} />
                    </Form.Item>
                    <Form.Item
                        name="INSTRUCTOR"
                        label="강사 권한명"
                        rules={[{ required: true, message: '강사 권한명을 입력해주세요.' }]}
                    >
                        <Input placeholder="강사" maxLength={20} />
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    );
};

export default PermissionIndex;
