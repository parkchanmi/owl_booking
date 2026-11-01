import React, { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Button, message, Typography } from 'antd';
import { fetchCenterConfig, updateCenterConfig } from '../../../api/centerConfigApi';

const { Title } = Typography;

const CancelPanel = ({ centerId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;
        form.resetFields();
        if (!centerId) return;
        setLoading(true);
        fetchCenterConfig(centerId)
            .then((config) => {
                if (active) form.setFieldsValue({ cancleDeadlineMinutes: config.cancleDeadlineMinutes });
            })
            .catch(() => { if (active) message.error('예약 취소 설정을 불러오지 못했습니다.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [centerId, form]);

    const handleSave = async (values) => {
        if (!centerId) return;
        setSaving(true);
        try {
            await updateCenterConfig(centerId, values);
            message.success('예약 취소 설정이 저장되었습니다.');
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
                disabled={loading || !centerId}
                onFinish={handleSave}
            >
                <Title level={5}>취소 가능 시간</Title>
                <Form.Item
                    name="cancleDeadlineMinutes"
                    label="수업 시작 전 취소 가능 시간"
                    extra="설정한 시간 이후에는 예약 취소가 불가합니다."
                    rules={[{ required: true, message: '취소 가능 시간을 입력해주세요.' }]}
                >
                    <InputNumber min={0} max={4320} precision={0} addonAfter="분 전까지" style={{ width: 200 }} />
                </Form.Item>

                <Form.Item style={{ marginTop: 8 }}>
                    <Button type="primary" htmlType="submit" disabled={!centerId} loading={saving}>저장</Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CancelPanel;
