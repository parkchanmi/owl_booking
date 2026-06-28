import React from 'react';
import { Card, Form, Radio, InputNumber, Button, message, Divider, Typography } from 'antd';
import DashboardLayout from '../../../components/DashboardLayout';

const { Title } = Typography;

const BookingWait = () => {
    const [form] = Form.useForm();

    const handleSave = async (values) => {
        try {
            console.log('저장:', values);
            message.success('대기 예약 설정이 저장되었습니다.');
        } catch {
            message.error('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <DashboardLayout title="대기 예약 관리">
            <Card bordered={false}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ confirmMethod: 'auto', maxWaitCount: 5 }}
                    onFinish={handleSave}
                >
                    <Title level={5}>대기 확정 방법</Title>
                    <Form.Item name="confirmMethod" label="확정 방식">
                        <Radio.Group>
                            <Radio value="auto">자동</Radio>
                            <Radio value="manual">수동</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Divider />

                    <Title level={5}>대기 가능 인원 수</Title>
                    <Form.Item
                        name="maxWaitCount"
                        label="최대 대기 인원"
                        rules={[{ required: true, message: '대기 가능 인원 수를 입력해주세요.' }]}
                    >
                        <InputNumber min={1} max={100} addonAfter="명" style={{ width: 160 }} />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 8 }}>
                        <Button type="primary" htmlType="submit">저장</Button>
                    </Form.Item>
                </Form>
            </Card>
        </DashboardLayout>
    );
};

export default BookingWait;
