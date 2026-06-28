import React from 'react';
import { Card, Form, InputNumber, Button, message, Typography } from 'antd';
import DashboardLayout from '../../../components/DashboardLayout';

const { Title } = Typography;

const BookingCancel = () => {
    const [form] = Form.useForm();

    const handleSave = async (values) => {
        try {
            console.log('저장:', values);
            message.success('예약 취소 설정이 저장되었습니다.');
        } catch {
            message.error('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <DashboardLayout title="예약 취소 관리">
            <Card bordered={false}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ cancelableHours: 2 }}
                    onFinish={handleSave}
                >
                    <Title level={5}>취소 가능 시간</Title>
                    <Form.Item
                        name="cancelableHours"
                        label="수업 시작 전 취소 가능 시간"
                        extra="설정한 시간 이후에는 예약 취소가 불가합니다."
                        rules={[{ required: true, message: '취소 가능 시간을 입력해주세요.' }]}
                    >
                        <InputNumber min={0} max={72} addonAfter="시간 전까지" style={{ width: 200 }} />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 8 }}>
                        <Button type="primary" htmlType="submit">저장</Button>
                    </Form.Item>
                </Form>
            </Card>
        </DashboardLayout>
    );
};

export default BookingCancel;
