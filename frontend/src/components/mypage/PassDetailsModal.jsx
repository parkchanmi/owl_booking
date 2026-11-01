import React, { useEffect, useState } from 'react';
import { Button, DatePicker, Form, Modal, Spin, Table, message } from 'antd';
import { ClockCircleOutlined, PauseCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { memberRequest } from '../../api/myPageApi';
import { membershipUsage } from '../../utils/myPageData';
import './PassDetailsModal.css';

const money = (value) => `${Number(value ?? 0).toLocaleString('ko-KR')}원`;

export default function PassDetailsModal({ dialog, onClose, onChanged, reservations, attendance, holds }) {
    const { mode, pass } = dialog || {};
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    useEffect(() => {
        let active = true;
        setPreview(null); setError(''); form.resetFields();
        if (mode !== 'refund' || !pass) return;
        setLoading(true);
        memberRequest(`/api/member/memberships/${pass.id}/refund-preview`)
            .then((data) => { if (active) setPreview(data); })
            .catch((failure) => { if (active) setError(failure.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [mode, pass, form]);
    const saveHold = async ({ dates }) => {
        setSaving(true);
        try {
            await memberRequest('/api/member/holds', { method: 'POST', body: JSON.stringify({
                mmId: pass.id, startDat: dates[0].format('YYYY-MM-DDT00:00:00'), endDat: dates[1].format('YYYY-MM-DDT00:00:00'),
            }) });
            message.success('일시정지 기간이 등록되었습니다.');
            onChanged(); onClose();
        } catch (failure) { message.error(failure.message); }
        finally { setSaving(false); }
    };
    const usage = pass ? membershipUsage(pass, reservations, attendance) : [];
    const history = holds.filter((hold) => hold.mm?.id === pass?.id);
    const Icon = mode === 'refund' ? SafetyCertificateOutlined : mode === 'hold' ? PauseCircleOutlined : ClockCircleOutlined;
    return <Modal
        open={Boolean(pass)}
        className="pass-details-modal"
        title={<div className="pass-details-title"><Icon /><span>{mode === 'refund' ? '예상 환불액 확인' : mode === 'hold' ? '이용권 일시정지' : '이용권 차감 이력'}</span></div>}
        onCancel={saving ? undefined : onClose}
        closable={!saving}
        maskClosable={!saving}
        centered
        width={mode === 'usage' ? 600 : 520}
        destroyOnHidden
        footer={<Button
            type="primary"
            block
            className="pass-details-confirm"
            loading={saving}
            disabled={mode === 'hold' && (!pass?.holdRemaining || pass?.expired)}
            onClick={mode === 'hold' ? () => form.submit() : onClose}
        >{mode === 'hold' ? '일시정지 등록' : '확인했습니다'}</Button>}
    >
        <div className="pass-details-body">
        <p className="pass-details-subtitle">{pass?.title || '이용권'}</p>
        {mode === 'usage' && <>
            <section className="pass-details-card">
                <h4>차감 이력 안내</h4>
                <p>이용 기간 내 예약·출석 수업을 중복 없이 표시합니다. 예약된 수업도 사용 횟수에 포함됩니다.</p>
            </section>
            <Table className="pass-details-usage" rowKey="realProgramId" size="small" dataSource={usage} scroll={{ x: 420 }} columns={[
                { title: '수업', dataIndex: 'programName' },
                { title: '일시', render: (_, row) => `${dayjs(row.programDat).format('YYYY.MM.DD')} ${row.startTime || ''}` },
                { title: '상태', render: (_, row) => row.attendanceStatus === 'PRESENT' ? '출석' : row.attendanceStatus === 'ABSENT' ? '결석' : '예약' },
            ]} pagination={{ pageSize: 6 }} />
        </>}
        {mode === 'refund' && <Spin spinning={loading}>
            {error && <div className="pass-details-card pass-details-card--error" role="alert"><h4>조회 실패</h4><p>{error}</p></div>}
            {preview && <>
                <section className="pass-details-card">
                    <h4>이용권 정산 정보</h4>
                    <dl className="pass-details-summary">
                        <div><dt>등록 금액</dt><dd>{money(preview.totalAmount)}</dd></div>
                        <div><dt>잔여 기간</dt><dd>{preview.remainingDays}일 / {preview.totalDays}일</dd></div>
                        <div><dt>잔여 횟수</dt><dd>{preview.remainingCount == null ? '횟수 제한 없음' : `${preview.remainingCount}회 / ${preview.totalCount}회`}</dd></div>
                    </dl>
                    <div className="pass-details-refund-total"><span>예상 환불액</span><strong>{money(preview.refundAmount)}</strong></div>
                </section>
                <section className="pass-details-card">
                    <h4>센터 환불 기준</h4>
                    <p>잔여 기간 {preview.periodThresholdPercent}% 초과{preview.totalCount != null && `, 잔여 횟수 ${preview.countThresholdPercent}% 초과`}</p>
                    <p className={preview.refundable ? 'pass-details-eligible' : 'pass-details-ineligible'}>{preview.refundable ? '센터 환불 기준을 충족합니다.' : '현재 센터 환불 기준을 충족하지 않습니다.'}</p>
                </section>
            </>}
            <section className="pass-details-card"><h4>환불 신청 안내</h4><p>환불 신청은 센터에 문의해 주세요. 결제 취소와 회원 환불 신청 접수 기능은 준비 중입니다.</p></section>
        </Spin>}
        {mode === 'hold' && <>
            <section className="pass-details-card">
                <h4>일시정지 이용 안내</h4>
                <p>남은 일시정지 가능 일수: <strong>{pass?.holdRemaining}일</strong></p>
                <p>이용권 기간 안에서 시작일과 종료일을 선택해 주세요. 종료일을 포함해 계산하며, 등록만으로 만료일이 자동 연장되지는 않습니다.</p>
            </section>
            <Form form={form} className="pass-details-hold-form" layout="vertical" onFinish={saveHold} disabled={saving || !pass?.holdRemaining || pass?.expired}>
                <Form.Item name="dates" label="일시정지 기간" rules={[{ required: true, message: '기간을 선택해 주세요.' }, { validator: (_, dates) => !dates || dates[1].startOf('day').diff(dates[0].startOf('day'), 'day') + 1 <= pass.holdRemaining ? Promise.resolve() : Promise.reject(new Error('남은 가능 일수를 초과했습니다.')) }]}>
                    <DatePicker.RangePicker disabledDate={(date) => date.isBefore(dayjs(), 'day') || (pass?.startDat && date.isBefore(pass.startDat, 'day')) || (pass?.endDat && date.isAfter(pass.endDat, 'day'))} />
                </Form.Item>
            </Form>
            <section className="pass-details-card">
                <h4>등록된 일시정지 기록</h4>
                {history.length ? history.map((hold) => <p className="pass-details-hold-record" key={hold.id}>{dayjs(hold.startDat).format('YYYY.MM.DD')} ~ {dayjs(hold.endDat).format('YYYY.MM.DD')}</p>) : <p>등록된 기록이 없습니다.</p>}
            </section>
        </>}
        </div>
    </Modal>;
}
