import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Switch } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { memberRequest } from '../../api/myPageApi';
import './MemberSettings.css';

export default function MemberSettings({ member, onUpdate }) {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    useEffect(() => { form.setFieldsValue({ email: member?.email, hp: member?.hp }); }, [member, form]);
    const save = async (values) => {
        setSaving(true);
        try {
            const contact = await memberRequest('/api/member/contact', { method: 'PUT', body: JSON.stringify(values) });
            onUpdate((previous) => ({ ...previous, ...contact }));
            message.success('연락처를 저장했습니다.');
        } catch (error) { message.error(error.message); }
        finally { setSaving(false); }
    };
    return <div className="member-settings">
        <section className="member-settings-card" aria-labelledby="member-account-title">
            <h3 id="member-account-title">계정 정보</h3>
            <dl className="member-settings-account">
                <div><dt>이름</dt><dd>{member?.name || '—'}</dd></div>
                <div><dt>로그인 아이디</dt><dd>{member?.loginId || '—'}</dd></div>
                <div><dt>로그인 방식</dt><dd><span className="member-settings-badge">{member?.provider === 'KAKAO' ? '카카오' : member?.provider === 'LOCAL' ? '일반 계정' : '확인 중'}</span></dd></div>
            </dl>
        </section>
        <section className="member-settings-card" aria-labelledby="member-contact-title">
            <h3 id="member-contact-title">연락처 수정</h3>
            <p className="member-settings-description">예약과 이용 안내를 받을 연락처를 관리합니다.</p>
            <Form form={form} layout="vertical" onFinish={save} disabled={!member || saving} className="member-settings-contact" requiredMark={false}>
                <div className="member-settings-fields">
                    <Form.Item name="email" label="이메일" rules={[{ required: true, message: '이메일을 입력해 주세요.' }, { type: 'email', message: '이메일 형식을 확인해 주세요.' }]}><Input autoComplete="email" placeholder="이메일을 입력해 주세요" /></Form.Item>
                    <Form.Item name="hp" label="휴대전화" rules={[{ pattern: /^[0-9+()\s-]*$/, message: '전화번호 형식을 확인해 주세요.' }]}><Input maxLength={20} autoComplete="tel" inputMode="tel" placeholder="휴대전화 번호를 입력해 주세요" /></Form.Item>
                </div>
                <div className="member-settings-save-row">
                    <Button htmlType="submit" loading={saving} className="member-settings-save">연락처 저장</Button>
                </div>
            </Form>
        </section>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    {/* Card 1: 대시보드 요약 지표 설정 */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px 20px',
                                            border: '1px solid #F1F0F7',
                                            borderRadius: 16,
                                            background: '#FFFFFF',
                                        }}
                                    >
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: '#18181B' }}>대시보드 요약 지표</span>
                                            <span style={{ fontSize: 12, color: '#71717A', marginLeft: 12 }}>
                                                상단 배너에 고정할 핵심 운동 지표를 설정합니다.
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '0 16px',
                                                height: 34,
                                                borderRadius: 9999,
                                                background: '#F5F3FF',
                                                border: 'none',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: '#6D28D9',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => message.info('지표 편집 기능을 준비 중입니다.')}
                                        >
                                            <span>지표 편집</span>
                                            <SettingOutlined />
                                        </button>
                                    </div>

                                    {/* Card 2: 알림 수신 설정 */}
                                    <div
                                        style={{
                                            background: '#FFFFFF',
                                            border: '1px solid #F1F0F7',
                                            borderRadius: 18,
                                            padding: '22px 26px',
                                        }}
                                    >
                                        <h3 style={{ fontWeight: 700, fontSize: 15, color: '#18181B', margin: '0 0 16px' }}>
                                            알림 수신 설정
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {/* Item 1 */}
                                            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F1FC' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: '#18181B' }}>수업 예약 리마인드 알림</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>수업 시작 3시간 및 1시간 전 카카오 알림톡/앱 푸시 발송</div>
                                                </div>
                                                <Switch disabled title="알림 수신 설정 기능을 준비 중입니다." />
                                            </div>

                                            {/* Item 2 */}
                                            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F1FC' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: '#18181B' }}>대기 승격 긴급 알림</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>대기 중이던 수업에 공석 발생 시 즉시 카카오 알림톡 및 긴급 알림</div>
                                                </div>
                                                <Switch disabled title="알림 수신 설정 기능을 준비 중입니다." />
                                            </div>

                                            {/* Item 3 */}
                                            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F1FC' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: '#18181B' }}>이용권 만료 임박 안내</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>잔여 이용권 만료 14일, 7일 전 리마인드 전송</div>
                                                </div>
                                                <Switch disabled title="알림 수신 설정 기능을 준비 중입니다." />
                                            </div>

                                            {/* Item 4 */}
                                            <div style={{ padding: '12px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: '#18181B' }}>마케팅 및 혜택 소식 수신</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>신규 클래스 오픈 및 첫 등록/재등록 특별 할인 안내 (선택)</div>
                                                </div>
                                                <Switch disabled title="알림 수신 설정 기능을 준비 중입니다." />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 3: 계정 및 보안 관리 */}
                                    <div
                                        style={{
                                            background: '#FFFFFF',
                                            border: '1px solid #F1F0F7',
                                            borderRadius: 18,
                                            padding: '22px 26px',
                                        }}
                                    >
                                        <h3 style={{ fontWeight: 700, fontSize: 15, color: '#18181B', margin: '0 0 12px' }}>
                                            계정 및 보안 관리
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {/* ID */}
                                            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F4F5' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: '#18181B' }}>기본 로그인 아이디</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>{member?.loginId || '—'}</div>
                                                </div>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 84, height: 34, borderRadius: 9999, background: '#F4F4F5', fontSize: 12, fontWeight: 500, color: '#71717A' }}>
                                                    기본 계정
                                                </span>
                                            </div>

                                            {/* Kakao */}
                                            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F4F5' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 22, height: 22, background: '#FEE500', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: '#18181B' }}>
                                                        K
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 14, color: '#18181B' }}>카카오 로그인</div>
                                                        <span style={{ fontSize: 12, color: '#71717A', marginTop: 2, display: 'block' }} className="font-num">{member?.provider === 'KAKAO' ? (member?.email || '카카오 계정') + ' (연동 완료)' : '연동된 카카오 계정이 없습니다.'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    style={{ width: 84, height: 34, borderRadius: 9999, background: '#F4F4F5', border: 'none', fontSize: 12, fontWeight: 500, color: '#52525B', cursor: 'pointer' }}
                                                    onClick={() => message.info('카카오 계정 연결 해제 기능을 준비 중입니다.')}
                                                >
                                                    연동 해제
                                                </button>
                                            </div>


                                            {/* Password */}
                                            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F4F4F5' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: '#18181B' }}>로그인 비밀번호</div>
                                                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>주기적인 변경으로 계정을 안전하게 보호하세요.</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    style={{ width: 84, height: 34, borderRadius: 9999, background: '#F4F4F5', border: 'none', fontSize: 12, fontWeight: 500, color: '#52525B', cursor: 'pointer' }}
                                                    onClick={() => message.info('비밀번호 변경 기능을 준비 중입니다.')}
                                                >
                                                    변경
                                                </button>
                                            </div>

                                            {/* Withdraw */}
                                            <div style={{ padding: '14px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: '#DC2626' }}>회원 탈퇴</div>
                                                    <div style={{ fontSize: 12, color: '#DC2626', opacity: 0.8, marginTop: 2 }}>회원 탈퇴 기능을 준비 중입니다.</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    style={{ width: 84, height: 34, borderRadius: 9999, background: '#FEF2F2', border: 'none', fontSize: 12, fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}
                                                    onClick={() => message.info('회원 탈퇴 기능을 준비 중입니다.')}
                                                >
                                                    탈퇴 신청
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
    </div>;
}
