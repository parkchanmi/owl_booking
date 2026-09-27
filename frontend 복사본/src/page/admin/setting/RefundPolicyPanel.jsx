import React, { useEffect, useState } from 'react';
import { Button, Card, Form, InputNumber, message } from 'antd';
import { fetchCenterConfig, updateCenterConfig } from '../../../api/centerConfigApi';

const RefundPolicyPanel = ({ centerId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!centerId) return;

        let active = true;
        setLoading(true);
        form.resetFields();
        fetchCenterConfig(centerId)
            .then((config) => {
                if (active) {
                    form.setFieldsValue({
                        refundCountThresholdPercent: config.refundCountThresholdPercent ?? 0,
                        refundPeriodThresholdPercent: config.refundPeriodThresholdPercent ?? 0,
                    });
                }
            })
            .catch(() => {
                if (active) message.error('환불기준을 불러오지 못했습니다.');
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
            message.success('환불기준이 저장되었습니다.');
        } catch {
            message.error('환불기준 저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card bordered={false}>
            <Form
                form={form}
                layout="vertical"
                initialValues={{ refundCountThresholdPercent: 0, refundPeriodThresholdPercent: 0 }}
                onFinish={handleSave}
                disabled={loading || !centerId}
            >
                <Form.Item
                    name="refundCountThresholdPercent"
                    label="잔여 횟수"
                    extra="전체 이용 횟수 대비 남은 횟수의 비율이 이 값 이하이면 환불할 수 없습니다."
                    rules={[{ required: true, message: '횟수 기준을 입력해주세요.' }]}
                >
                    <InputNumber min={0} max={100} precision={0} addonAfter="%" style={{ width: 160 }} />
                </Form.Item>
                <Form.Item
                    name="refundPeriodThresholdPercent"
                    label="잔여 기간"
                    extra="전체 이용 기간 대비 남은 기간의 비율이 이 값 이하이면 환불할 수 없습니다."
                    rules={[{ required: true, message: '기간 기준을 입력해주세요.' }]}
                >
                    <InputNumber min={0} max={100} precision={0} addonAfter="%" style={{ width: 160 }} />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit" loading={saving}>저장</Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default RefundPolicyPanel;
