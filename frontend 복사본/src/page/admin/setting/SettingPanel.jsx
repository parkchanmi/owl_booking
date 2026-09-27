import React, { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Button, message, Divider, Typography, Select } from 'antd';
import { fetchCenterConfig, updateCenterConfig } from '../../../api/centerConfigApi';

const { Title } = Typography;

const DAY_ORDER = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_OPTIONS = DAY_ORDER.map((d) => ({ value: d, label: d }));

const SettingPanel = ({ centerId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!centerId) return;
        setLoading(true);
        fetchCenterConfig(centerId)
            .then((config) => {
                form.setFieldsValue({
                    openDaysUser: config.bookingOpenDays ?? 7,
                    scheduleCreateDaysAdmin: config.generationStartDat ?? 14,
                    generationDaysOfWeek: config.generationDaysOfWeek
                        ? config.generationDaysOfWeek.split(',')
                        : DAY_ORDER,
                });
            })
            .catch(() => message.error('수업 예약 설정을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, [centerId]);

    const handleSave = async (values) => {
        setSaving(true);
        try {
            await updateCenterConfig(centerId, {
                bookingOpenDays: values.openDaysUser,
                generationStartDat: values.scheduleCreateDaysAdmin,
                generationDaysOfWeek: [...values.generationDaysOfWeek]
                    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
                    .join(','),
            });
            message.success('수업 예약 설정이 저장되었습니다.');
        } catch {
            message.error('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card bordered={false}>
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    openDaysUser: 7,
                    scheduleCreateDaysAdmin: 14,
                    generationDaysOfWeek: DAY_ORDER,
                }}
                onFinish={handleSave}
                disabled={loading}
            >
                <Title level={5}>수업 오픈 일정 (사용자 기준)</Title>
                <Form.Item
                    name="openDaysUser"
                    label="수업 오픈 기준일"
                    extra="사용자에게 수업 예약을 오픈하는 기준 일수입니다."
                    rules={[{ required: true, message: '수업 오픈 기준일을 입력해주세요.' }]}
                >
                    <InputNumber min={1} max={90} addonAfter="일 전" style={{ width: 160 }} />
                </Form.Item>

                <Divider />

                <Title level={5}>수업 스케줄 생성 기준 일자 (관리자 기준)</Title>
                <Form.Item
                    name="scheduleCreateDaysAdmin"
                    label="스케줄 생성 기준일"
                    extra="자동생성이 켜져 있을 때(수업 관리 페이지 상단 스위치), 스케줄러가 오늘로부터 며칠 뒤까지의 스케줄을 미리 생성할지에 대한 기준 일수입니다."
                    rules={[{ required: true, message: '스케줄 생성 기준일을 입력해주세요.' }]}
                >
                    <InputNumber min={1} max={90} addonAfter="일 전" style={{ width: 160 }} />
                </Form.Item>

                <Form.Item
                    name="generationDaysOfWeek"
                    label="스케줄러 실행 요일"
                    extra="자동생성 스케줄러를 실행할 요일을 선택합니다. (매일 새벽 1시에 실행)"
                    rules={[{ required: true, message: '실행 요일을 선택해주세요.' }]}
                >
                    <Select placeholder="실행 요일 선택" options={DAY_OPTIONS} mode="multiple" />
                </Form.Item>

                <Form.Item style={{ marginTop: 8 }}>
                    <Button type="primary" htmlType="submit" loading={saving} disabled={!centerId}>저장</Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default SettingPanel;
