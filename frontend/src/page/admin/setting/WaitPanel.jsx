import React, { useEffect, useState } from 'react';
import { Card, Form, Radio, InputNumber, Button, message, Divider, Typography } from 'antd';
import { fetchCenterConfig, updateCenterConfig } from '../../../api/centerConfigApi';

const { Title } = Typography;

const WaitPanel = ({ centerId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!centerId) {
            form.setFieldsValue({ confirmMode: 'MANUAL', waitlistCapacity: 5 });
            return;
        }

        let active = true;
        setLoading(true);
        fetchCenterConfig(centerId)
            .then((config) => {
                if (!active) return;
                form.setFieldsValue({
                    confirmMode: config.confirmMode || 'MANUAL',
                    waitlistCapacity: config.waitlistCapacity ?? 5,
                });
            })
            .catch(() => {
                if (active) message.error('대기 예약 설정을 불러오지 못했습니다.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [centerId, form]);

    const handleSave = async (values) => {
        if (!centerId) return;
        setSaving(true);
        try {
            await updateCenterConfig(centerId, values);
            message.success('대기 예약 설정이 저장되었습니다.');
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
                initialValues={{ confirmMode: 'MANUAL', waitlistCapacity: 5 }}
                disabled={loading || !centerId}
                onFinish={handleSave}
            >
                <Title level={5}>대기 확정 방법</Title>
                <Form.Item name="confirmMode" label="확정 방식">
                    <Radio.Group>
                        <Radio value="MANUAL">수동</Radio>
                        <Radio value="AUTO">자동</Radio>
                    </Radio.Group>
                </Form.Item>

                <Divider />

                <Title level={5}>대기 가능 인원 수</Title>
                <Form.Item
                    name="waitlistCapacity"
                    label="최대 대기 인원"
                    rules={[{ required: true, message: '대기 가능 인원 수를 입력해주세요.' }]}
                >
                    <InputNumber min={1} max={100} addonAfter="명" style={{ width: 160 }} />
                </Form.Item>

                <Form.Item style={{ marginTop: 8 }}>
                    <Button type="primary" htmlType="submit" disabled={!centerId} loading={saving}>저장</Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default WaitPanel;
