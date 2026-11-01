import React from 'react';
import { Button, Spin } from 'antd';

export default function SessionFeedback({ error, onRetry, embedded = false }) {
    return <div style={{ minHeight: embedded ? 240 : '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: embedded ? 'transparent' : '#FAF9FD', color: '#71717A' }} role={error ? 'alert' : 'status'}>
        {error ? <><p style={{ margin: 0 }}>{error}</p><Button onClick={onRetry}>다시 확인</Button></> : <><Spin /><p style={{ margin: 0, fontSize: 13 }}>로그인 정보를 확인하고 있습니다.</p></>}
    </div>;
}
