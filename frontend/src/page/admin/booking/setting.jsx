import React from 'react';
import { Card, Form, InputNumber, Button, message, Divider, Typography } from 'antd';
import DashboardLayout from '../../../components/DashboardLayout';

const { Title } = Typography;

const BookingSetting = () => {
    const [form] = Form.useForm();

    const handleSave = async (values) => {
        try {
            console.log('저장:', values);
            message.success('수업 예약 설정이 저장되었습니다.');
        } catch {
            message.error('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <DashboardLayout title="수업 예약 설정">
            <Card bordered={false}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ openDaysUser: 7, scheduleCreateDaysAdmin: 14 }}
                    onFinish={handleSave}
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
                        extra="관리자가 수업 스케줄을 생성하는 기준 일수입니다."
                        rules={[{ required: true, message: '스케줄 생성 기준일을 입력해주세요.' }]}
                    >
                        <InputNumber min={1} max={90} addonAfter="일 전" style={{ width: 160 }} />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 8 }}>
                        <Button type="primary" htmlType="submit">저장</Button>
                    </Form.Item>
                </Form>
            </Card>
        </DashboardLayout>
    );
};

export default BookingSetting;
