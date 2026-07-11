import React, { useEffect, useState } from 'react';
import { Card, Form, Radio, InputNumber, Button, message, Divider, Typography, Select, Flex } from 'antd';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchCenters } from '../../../api/centerApi';

const { Title } = Typography;

const BookingWait = () => {
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
            message.success('대기 예약 설정이 저장되었습니다.');
        } catch {
            message.error('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <DashboardLayout title="대기 예약 관리">
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
                        <Button type="primary" htmlType="submit" disabled={!selectedCenter}>저장</Button>
                    </Form.Item>
                </Form>
            </Card>
        </DashboardLayout>
    );
};

export default BookingWait;
