import React, { useEffect, useRef, useState } from 'react';
import {
    BoldOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    ItalicOutlined,
    MailOutlined,
    ReloadOutlined,
    UnderlineOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, Input, InputNumber, Modal, Row, Space, Tabs, Tag, Typography, message } from 'antd';
import { fetchCenterConfig, updateCenterConfig } from '../../../api/centerConfigApi';

const { Text, Title } = Typography;

const actionButton = (href, label) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 22px;">
  <tr>
    <td style="border-radius:4px;background-color:#17212b;">
      <a href="${href}" target="_blank" rel="noopener" style="display:inline-block;padding:13px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;line-height:1;">${label}</a>
    </td>
  </tr>
</table>`.trim();

const buildEmailTemplate = ({ badge, title, intro, details, action = '', notice }) => `
<div data-owl-email-template="v1" style="margin:0;padding:32px 16px;background-color:#f4f6f8;font-family:Arial,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#20252b;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-collapse:separate;background-color:#ffffff;border:1px solid #e5e9ee;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:22px 32px;background-color:#17212b;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="color:#ffffff;font-size:20px;font-weight:700;line-height:1.2;">OWL</td>
                  <td align="right" style="color:#b8c5d1;font-size:12px;line-height:1.4;">{센터명}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 18px;">
              <span style="display:inline-block;padding:6px 10px;background-color:#eaf4ff;color:#1268b3;font-size:12px;font-weight:700;line-height:1;border-radius:4px;">${badge}</span>
              <h1 style="margin:16px 0 12px;color:#17212b;font-size:26px;font-weight:700;line-height:1.4;letter-spacing:0;">${title}</h1>
              <p style="margin:0;color:#56616d;font-size:15px;line-height:1.8;">${intro}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:separate;background-color:#f7f9fb;border:1px solid #e7ebef;border-radius:6px;">
                ${details}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 36px;">
              ${action}
              <p style="margin:0;padding:16px 18px;border-left:4px solid #2f80c9;background-color:#f1f7fc;color:#34414e;font-size:14px;line-height:1.7;">${notice}</p>
              <p style="margin:26px 0 0;color:#56616d;font-size:14px;line-height:1.8;">감사합니다.<br><strong style="color:#20252b;">{센터명}</strong> 드림</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background-color:#f7f9fb;border-top:1px solid #e7ebef;color:#89939e;font-size:11px;line-height:1.6;text-align:center;">
              본 메일은 {센터명}의 서비스 이용 안내를 위해 발송되었습니다.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`.trim();

const detailRow = (label, value, withBorder = true) => `
<tr>
  <td style="width:34%;padding:14px 18px;${withBorder ? 'border-bottom:1px solid #e7ebef;' : ''}color:#7a8590;font-size:13px;line-height:1.5;">${label}</td>
  <td style="padding:14px 18px;${withBorder ? 'border-bottom:1px solid #e7ebef;' : ''}color:#20252b;font-size:14px;font-weight:700;line-height:1.5;">${value}</td>
</tr>`;

const TEMPLATE_TYPES = [
    {
        key: 'expiry',
        label: '이용권 만료 임박',
        icon: <MailOutlined />,
        description: '잔여 횟수 또는 만료일까지 남은 기간이 기준에 도달했을 때 발송합니다.',
        subjectField: 'membershipExpiryEmailSubject',
        templateField: 'membershipExpiryEmailTemplate',
        defaultSubject: '[{센터명}] 이용권 만료 임박 안내',
        legacyTemplate: [
            '<h2>{회원명}님, 이용권 만료가 임박했습니다.</h2>',
            '<p>안녕하세요, {센터명}입니다.</p>',
            '<p>이용 중인 <strong>{이용권명}</strong>의 만료가 가까워 안내드립니다.</p>',
            '<p>잔여 횟수: <strong>{잔여횟수}회</strong><br>만료일: <strong>{만료일}</strong></p>',
            '<p>남은 이용 기간을 확인하시고 이용에 참고해 주세요.</p>',
            '<p>감사합니다.<br>{센터명} 드림</p>',
        ].join(''),
        defaultTemplate: buildEmailTemplate({
            badge: '이용권 안내',
            title: '{회원명}님, 이용권 만료가 임박했습니다.',
            intro: '이용 중인 <strong style="color:#20252b;">{이용권명}</strong>의 만료가 가까워 안내드립니다.',
            details: detailRow('잔여 횟수', '{잔여횟수}회') + detailRow('만료일', '{만료일}', false),
            notice: '남은 이용 기간과 횟수를 확인하시고 이용에 참고해 주세요.',
        }),
        variables: ['{회원명}', '{센터명}', '{이용권명}', '{잔여횟수}', '{만료일}'],
    },
    {
        key: 'waitlist-available',
        label: '대기 > 예약 가능 알림',
        icon: <ClockCircleOutlined />,
        description: '대기 중인 수업에 자리가 발생해 회원이 예약을 확정할 수 있을 때 발송합니다.',
        subjectField: 'waitlistAvailableEmailSubject',
        templateField: 'waitlistAvailableEmailTemplate',
        defaultSubject: '[{센터명}] 예약 가능한 자리가 생겼습니다',
        legacyTemplate: [
            '<h2>{회원명}님, 예약 가능한 자리가 생겼습니다.</h2>',
            '<p>대기 중이던 <strong>{수업명}</strong> 수업에 자리가 발생했습니다.</p>',
            '<p>수업 일시: <strong>{수업일시}</strong><br>예약 확정 기한: <strong>{확정기한}</strong></p>',
            '<p>기한 내 예약을 확정해 주세요.</p>',
            '<p>감사합니다.<br>{센터명} 드림</p>',
        ].join(''),
        defaultTemplate: buildEmailTemplate({
            badge: '예약 가능 안내',
            title: '{회원명}님, 예약 가능한 자리가 생겼습니다.',
            intro: '대기 중이던 <strong style="color:#20252b;">{수업명}</strong> 수업에 자리가 발생했습니다.',
            details: detailRow('수업 일시', '{수업일시}') + detailRow('예약 확정 기한', '{확정기한}', false),
            action: actionButton('{예약링크}', '예약하기'),
            notice: '예약 확정 기한이 지나면 다음 대기 회원에게 기회가 넘어갈 수 있으니 기한 내 확정해 주세요.',
        }),
        variables: ['{회원명}', '{센터명}', '{수업명}', '{수업일시}', '{확정기한}', '{예약링크}'],
    },
    {
        key: 'waitlist-confirmed',
        label: '대기 확정 알림',
        icon: <CheckCircleOutlined />,
        description: '대기 중이던 수업의 예약이 최종 확정되었을 때 발송합니다.',
        subjectField: 'waitlistConfirmedEmailSubject',
        templateField: 'waitlistConfirmedEmailTemplate',
        defaultSubject: '[{센터명}] 대기 예약이 확정되었습니다',
        legacyTemplate: [
            '<h2>{회원명}님, 예약이 확정되었습니다.</h2>',
            '<p>대기 중이던 <strong>{수업명}</strong> 수업의 예약이 확정되었습니다.</p>',
            '<p>수업 일시: <strong>{수업일시}</strong></p>',
            '<p>수업 시간에 맞춰 방문해 주세요.</p>',
            '<p>감사합니다.<br>{센터명} 드림</p>',
        ].join(''),
        defaultTemplate: buildEmailTemplate({
            badge: '예약 확정',
            title: '{회원명}님, 예약이 확정되었습니다.',
            intro: '대기 중이던 <strong style="color:#20252b;">{수업명}</strong> 수업의 예약이 최종 확정되었습니다.',
            details: detailRow('수업명', '{수업명}') + detailRow('수업 일시', '{수업일시}', false),
            notice: '원활한 수업 진행을 위해 시작 시간에 맞춰 방문해 주세요.',
        }),
        variables: ['{회원명}', '{센터명}', '{수업명}', '{수업일시}'],
    },
];

const DEFAULT_FORM_VALUES = TEMPLATE_TYPES.reduce((values, type) => ({
    ...values,
    [type.subjectField]: type.defaultSubject,
    [type.templateField]: type.defaultTemplate,
}), {
    membershipExpiryCountThreshold: 3,
    membershipExpiryDaysThreshold: 7,
});

const normalizeLoadedValues = (config) => TEMPLATE_TYPES.reduce((values, type) => {
    const loadedTemplate = config[type.templateField];
    const usesLegacyDefault = !loadedTemplate || loadedTemplate.trim() === type.legacyTemplate;

    return {
        ...values,
        [type.subjectField]: config[type.subjectField] || type.defaultSubject,
        [type.templateField]: usesLegacyDefault ? type.defaultTemplate : loadedTemplate,
    };
}, {
    ...DEFAULT_FORM_VALUES,
    ...config,
});

const PREVIEW_VALUES = {
    '{회원명}': '김회원',
    '{센터명}': 'OWL 강남센터',
    '{이용권명}': '필라테스 20회 이용권',
    '{잔여횟수}': '3',
    '{만료일}': '2026년 10월 4일',
    '{수업명}': '리포머 필라테스',
    '{수업일시}': '2026년 9월 28일 오후 7:00',
    '{확정기한}': '2026년 9월 27일 오후 6:00',
    '{예약링크}': 'https://example.com/waitlist/reserve?token=sample',
};

const VARIABLE_DESCRIPTIONS = {
    '{회원명}': '메일을 받는 회원의 이름',
    '{센터명}': '알림을 발송하는 센터의 이름',
    '{이용권명}': '회원이 이용 중인 이용권의 이름',
    '{잔여횟수}': '발송 시점에 남아 있는 이용 횟수',
    '{만료일}': '회원 이용권의 만료 예정일',
    '{수업명}': '예약 또는 대기 중인 수업의 이름',
    '{수업일시}': '해당 수업이 진행되는 날짜와 시간',
    '{확정기한}': '대기 예약을 확정할 수 있는 마감 일시',
    '{예약링크}': '예약 가능 메일에서 회원이 예약을 확정하는 링크',
};

const renderPreviewHtml = (template) => Object.entries(PREVIEW_VALUES).reduce(
    (html, [variable, sample]) => html.split(variable).join(sample),
    template
);

const buildPreviewDocument = (template) => `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>html,body{margin:0;padding:0;background:#f4f6f8;}table{border-spacing:0;}img{border:0;}</style>
  </head>
  <body>${renderPreviewHtml(template)}</body>
</html>`;

const MailTemplateEditor = ({ value = '', onChange, disabled, variables }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const emitChange = () => onChange?.(editorRef.current?.innerHTML ?? '');
    const applyCommand = (command, commandValue) => {
        if (disabled || !editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, commandValue);
        emitChange();
    };

    const toolbarButton = (label, icon, command) => (
        <Button
            type="text"
            icon={icon}
            aria-label={label}
            title={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand(command)}
        />
    );

    return (
        <div className={`notification-mail-editor${disabled ? ' is-disabled' : ''}`}>
            <div className="notification-mail-editor-toolbar">
                <Space size={2}>
                    {toolbarButton('굵게', <BoldOutlined />, 'bold')}
                    {toolbarButton('기울임', <ItalicOutlined />, 'italic')}
                    {toolbarButton('밑줄', <UnderlineOutlined />, 'underline')}
                    {toolbarButton('글머리 목록', <UnorderedListOutlined />, 'insertUnorderedList')}
                </Space>
                <div className="notification-mail-variables" aria-label="메일 치환 변수">
                    {variables.map((variable) => (
                        <Tag
                            key={variable}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => applyCommand('insertText', variable)}
                        >
                            {variable}
                        </Tag>
                    ))}
                </div>
            </div>
            <div
                ref={editorRef}
                className="notification-mail-editor-content"
                contentEditable={!disabled}
                suppressContentEditableWarning
                onInput={emitChange}
                role="textbox"
                aria-multiline="true"
                aria-label="메일 본문"
            />
        </div>
    );
};

const MailTemplateFields = ({ form, type, disabled, onReset }) => {
    const [isVariableGuideOpen, setIsVariableGuideOpen] = useState(false);
    const templateValue = Form.useWatch(type.templateField, form) ?? type.defaultTemplate;
    const subjectValue = Form.useWatch(type.subjectField, form) ?? type.defaultSubject;

    return (
        <div className="notification-template-panel">
            <div className="notification-template-header">
                <div>
                    <Text strong>{type.label}</Text>
                    <Text type="secondary">{type.description}</Text>
                </div>
                <Button icon={<ReloadOutlined />} onClick={() => onReset(type)} disabled={disabled}>
                    기본 템플릿으로 초기화
                </Button>
            </div>

            <Form.Item
                name={type.subjectField}
                label="메일 제목"
                rules={[{ required: true, whitespace: true, message: '메일 제목을 입력해주세요.' }]}
            >
                <Input maxLength={255} showCount />
            </Form.Item>

            <Row gutter={[16, 16]}>
                <Col xs={24} xl={12}>
                    <div className="notification-template-label notification-template-label-with-action">
                        <span>메일 본문</span>
                        <Button
                            type="text"
                            size="small"
                            icon={<InfoCircleOutlined />}
                            aria-label="메일 치환 변수 안내"
                            title="메일 치환 변수 안내"
                            onClick={() => setIsVariableGuideOpen(true)}
                        />
                    </div>
                    <Form.Item
                        name={type.templateField}
                        rules={[{ required: true, message: '메일 본문을 입력해주세요.' }]}
                        noStyle
                    >
                        <MailTemplateEditor variables={type.variables} />
                    </Form.Item>
                </Col>
                <Col xs={24} xl={12}>
                    <div className="notification-template-label">미리보기</div>
                    <div className="notification-mail-preview-shell">
                        <div className="notification-mail-preview-meta">
                            <span>제목</span>
                            <strong>{renderPreviewHtml(subjectValue)}</strong>
                        </div>
                        <iframe
                            title={`${type.label} 메일 미리보기`}
                            className="notification-mail-preview"
                            srcDoc={buildPreviewDocument(templateValue)}
                            sandbox=""
                        />
                    </div>
                </Col>
            </Row>

            <Modal
                title="메일 치환 변수 안내"
                open={isVariableGuideOpen}
                onCancel={() => setIsVariableGuideOpen(false)}
                footer={(
                    <Button type="primary" onClick={() => setIsVariableGuideOpen(false)}>
                        확인
                    </Button>
                )}
                width={520}
            >
                <div className="notification-variable-guide">
                    <Text>
                        중괄호로 표시된 항목은 메일을 전송할 때 해당 회원, 센터, 이용권 또는 수업의 실제 데이터로 자동 변경됩니다.
                    </Text>
                    <div className="notification-variable-guide-example">
                        <code>{'{회원명}'}님</code>
                        <span>→</span>
                        <strong>김회원님</strong>
                    </div>
                    <div className="notification-variable-guide-list">
                        {type.variables.map((variable) => (
                            <div className="notification-variable-guide-item" key={variable}>
                                <code>{variable}</code>
                                <span>{VARIABLE_DESCRIPTIONS[variable]}</span>
                            </div>
                        ))}
                    </div>
                    <Text type="secondary">
                        변수의 중괄호와 이름을 변경하거나 삭제하면 실제 데이터로 치환되지 않습니다.
                    </Text>
                </div>
            </Modal>
        </div>
    );
};

const NotificationPanel = ({ centerId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!centerId) return;

        let active = true;
        setLoading(true);
        fetchCenterConfig(centerId)
            .then((config) => {
                if (!active) return;
                form.setFieldsValue(normalizeLoadedValues(config));
            })
            .catch(() => {
                if (active) message.error('알림 설정을 불러오지 못했습니다.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [centerId, form]);

    const handleResetTemplate = (type) => {
        form.setFieldsValue({
            [type.subjectField]: type.defaultSubject,
            [type.templateField]: type.defaultTemplate,
        });
        message.info(`${type.label} 기본 템플릿으로 초기화했습니다.`);
    };

    const handleSave = async (values) => {
        if (!centerId) return;
        setSaving(true);
        try {
            await updateCenterConfig(centerId, values);
            message.success('알림 설정이 저장되었습니다.');
        } catch {
            message.error('알림 설정 저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card bordered={false} className="notification-settings-card">
            <Form
                form={form}
                layout="vertical"
                initialValues={DEFAULT_FORM_VALUES}
                disabled={loading || !centerId}
                onFinish={handleSave}
            >
                <Title level={5}>이용권 만료 알림 기준</Title>
                <Text type="secondary">잔여 횟수 또는 남은 기간 중 하나라도 기준에 도달하면 만료 임박 메일을 발송합니다.</Text>

                <Row gutter={16} className="notification-threshold-row">
                    <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                            name="membershipExpiryCountThreshold"
                            label="잔여 이용 횟수"
                            rules={[{ required: true, message: '횟수 기준을 입력해주세요.' }]}
                        >
                            <InputNumber min={1} max={100} precision={0} addonAfter="회 이하" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} lg={8}>
                        <Form.Item
                            name="membershipExpiryDaysThreshold"
                            label="만료까지 남은 기간"
                            rules={[{ required: true, message: '기간 기준을 입력해주세요.' }]}
                        >
                            <InputNumber min={1} max={365} precision={0} addonAfter="일 이하" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={5}>메일 템플릿</Title>
                <Text type="secondary">알림 유형별 제목과 본문을 수정하고 미리보기로 확인할 수 있습니다.</Text>

                <Tabs
                    className="notification-template-tabs"
                    items={TEMPLATE_TYPES.map((type) => ({
                        key: type.key,
                        label: type.label,
                        icon: type.icon,
                        children: (
                            <MailTemplateFields
                                form={form}
                                type={type}
                                disabled={loading || !centerId}
                                onReset={handleResetTemplate}
                            />
                        ),
                    }))}
                />

                <Form.Item className="notification-settings-actions">
                    <Button type="primary" htmlType="submit" loading={saving}>
                        알림 설정 저장
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default NotificationPanel;
