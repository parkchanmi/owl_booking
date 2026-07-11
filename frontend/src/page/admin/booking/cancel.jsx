import React, { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Button, message, Typography, Select, Flex } from 'antd';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchCenters } from '../../../api/centerApi';

const { Title } = Typography;

const BookingCancel = () => {
    const [form] = Form.useForm();
    const [centers, setCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState(null);

    useEffect(() => {
        fetchCenters()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setCenters(list);
                if (list.length > 0) setSelectedCenter(list[0].id);
            })
            .catch(() => message.error('센터 목록을 불러오지 못했습니다.'));
    }, []);

    const handleSave = async (values) => {
        try {
            console.log('저장:', { centerId: selectedCenter, ...values });
            message.success('예약 취소 설정이 저장되었습니다.');
        } catch {
            message.error('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <DashboardLayout title="예약 취소 관리">
            <Card bordered={false} style={{ marginBottom: 16 }}>
                <Flex align="center" gap={12}>
                    <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>센터 선택</span>
                    <Select style={{ width: 240 }} value={selectedCenter} onChange={setSelectedCenter}>
                        {centers.map((c) => (
                            <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                        ))}
                    </Select>
                </Flex>
            </Card>

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
                        <Button type="primary" htmlType="submit" disabled={!selectedCenter}>저장</Button>
                    </Form.Item>
                </Form>
            </Card>
        </DashboardLayout>
    );
};

export default BookingCancel;
