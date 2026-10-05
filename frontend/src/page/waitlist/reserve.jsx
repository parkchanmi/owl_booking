import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Result, Spin, Tag, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

const WaitlistReserve = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const waitlistId = searchParams.get('waitlistId');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [reservation, setReservation] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [completed, setCompleted] = useState(null);

    const dateText = useMemo(() => {
        if (!reservation?.programDat) return '-';
        return dayjs(reservation.programDat).format('YYYY년 M월 D일 (ddd)');
    }, [reservation]);

    useEffect(() => {
        if (!token) {
            setErrorMessage('예약 링크가 올바르지 않습니다.');
            setLoading(false);
            return;
        }

        const query = new URLSearchParams({ token });
        if (waitlistId) query.set('waitlistId', waitlistId);

        fetch(`/api/waitlists/reservation?${query.toString()}`, { credentials: 'include' })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => null);
                    throw new Error(body?.message || body?.detail || '대기 예약 정보를 불러오지 못했습니다.');
                }
                return res.json();
            })
            .then((data) => setReservation(data))
            .catch((error) => setErrorMessage(error.message))
            .finally(() => setLoading(false));
    }, [token, waitlistId]);

    const handleReserve = async () => {
        if (!token) return;
        const query = new URLSearchParams({ token });
        if (waitlistId) query.set('waitlistId', waitlistId);
        setSubmitting(true);
        try {
            const res = await fetch(`/api/waitlists/reservation?${query.toString()}`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || body?.detail || '예약 처리 중 오류가 발생했습니다.');
            }
            const data = await res.json();
            setCompleted(data);
            message.success('예약이 완료되었습니다.');
        } catch (error) {
            const text = error.message || '예약 처리 중 오류가 발생했습니다.';
            setErrorMessage(text);
            message.error(text);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f4f6f8' }}>
                <Spin size="large" tip="예약 정보를 확인하는 중입니다." />
            </div>
        );
    }

    if (completed) {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f4f6f8' }}>
                <Card bordered={false} style={{ width: '100%', maxWidth: 520 }}>
                    <Result
                        status="success"
                        icon={<CheckCircleOutlined />}
                        title="예약이 완료되었습니다."
                        subTitle={`${completed.programName ?? ''} 수업 예약이 정상적으로 처리되었습니다.`}
                    />
                </Card>
            </div>
        );
    }

    if (errorMessage && !reservation) {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f4f6f8' }}>
                <Card bordered={false} style={{ width: '100%', maxWidth: 520 }}>
                    <Result status="warning" title={errorMessage} />
                </Card>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f4f6f8' }}>
            <Card bordered={false} style={{ width: '100%', maxWidth: 560 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <div>
                        <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 6 }}>대기 예약 가능 안내</div>
                        <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.35 }}>{reservation.programName}</h1>
                    </div>
                    <Tag color="blue">{Math.max((reservation.maxCapacity ?? 0) - (reservation.bookingCount ?? 0), 0)}자리</Tag>
                </div>

                <div style={{ display: 'grid', gap: 12, padding: 18, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ color: '#1677ff' }} />
                        <span>{reservation.centerName ?? '-'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <ClockCircleOutlined style={{ color: '#1677ff' }} />
                        <span>{dateText} · {reservation.startTime ?? ''} ~ {reservation.endTime ?? ''}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <UserOutlined style={{ color: '#1677ff' }} />
                        <span>{reservation.instructorName ?? '강사 미배정'}</span>
                    </div>
                </div>

                <p style={{ margin: '22px 0 18px', color: '#374151', fontSize: 16, fontWeight: 700 }}>
                    해당 수업을 예약하시겠습니까?
                </p>

                {errorMessage && (
                    <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 8, background: '#fff1f0', color: '#cf1322' }}>
                        {errorMessage}
                    </div>
                )}

                <Button type="primary" block size="large" loading={submitting} onClick={handleReserve}>
                    예약하기
                </Button>
            </Card>
        </div>
    );
};

export default WaitlistReserve;
