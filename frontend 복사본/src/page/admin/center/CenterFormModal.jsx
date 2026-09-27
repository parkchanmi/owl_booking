import React, { useEffect } from 'react';
import { Modal, Form, Input, Typography, Space, Button, message, Row, Col } from 'antd';
import { ShopOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;

const itemStyle = { marginBottom: 14 };

const CenterFormModal = ({ open, mode, initialValues, confirmLoading, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const isEdit = mode === 'edit';

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues || {});
        } else {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            onSubmit(values);
        });
    };

    const handleSearchAddress = () => {
        if (!window.daum?.Postcode) {
            message.error('주소 검색 서비스를 불러오지 못했습니다.');
            return;
        }
        new window.daum.Postcode({
            oncomplete: (data) => {
                form.setFieldsValue({ addr: data.roadAddress || data.jibunAddress });
            },
        }).open();
    };

    return (
        <Modal
            title={
                <Space align="center" size={10}>
                    <ShopOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                    <Title level={5} style={{ margin: 0 }}>{isEdit ? '센터 편집' : '센터 추가'}</Title>
                </Space>
            }
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={confirmLoading}
            okText={isEdit ? '저장' : '추가'}
            cancelText="취소"
            centered
            destroyOnClose
            styles={{
                header: { paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid #f0f0f0' },
                body: { paddingTop: 8 },
            }}
        >
            <Form form={form} layout="vertical" requiredMark={false}>
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item name="bizNo" label="사업자등록번호" style={itemStyle} rules={[{ required: true, message: '사업자등록번호를 입력해주세요.' }]}>
                            <Input placeholder="사업자등록번호 입력" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="ceoName" label="대표자명" style={itemStyle} rules={[{ required: true, message: '대표자명을 입력해주세요.' }]}>
                            <Input placeholder="대표자명 입력" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item name="bizName" label="상호" style={itemStyle} rules={[{ required: true, message: '상호를 입력해주세요.' }]}>
                            <Input placeholder="상호 입력" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="name" label="센터명" style={itemStyle} rules={[{ required: true, message: '센터명을 입력해주세요.' }]}>
                            <Input placeholder="센터명 입력" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="센터 주소" required style={itemStyle}>
                    <Space.Compact style={{ width: '100%', marginBottom: 6 }}>
                        <Form.Item name="addr" noStyle rules={[{ required: true, message: '주소 검색을 통해 주소를 입력해주세요.' }]}>
                            <Input placeholder="주소 검색 버튼을 클릭해주세요" readOnly />
                        </Form.Item>
                        <Button icon={<SearchOutlined />} onClick={handleSearchAddress}>
                            주소 검색
                        </Button>
                    </Space.Compact>
                    <Form.Item name="addrDetail" noStyle>
                        <Input placeholder="상세 주소를 입력해주세요 (동/호수 등)" />
                    </Form.Item>
                </Form.Item>

                <Form.Item name="tel" label="센터 전화번호" style={itemStyle}>
                    <Input placeholder="센터 전화번호 입력" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CenterFormModal;
