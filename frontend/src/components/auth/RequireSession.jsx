import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useSession from '../../hooks/useSession';
import SessionFeedback from './SessionFeedback';

function SessionCheck({ adminOnly }) {
    const session = useSession();
    const location = useLocation();
    if (session.status === 'loading') return <SessionFeedback />;
    if (session.status === 'error') return <SessionFeedback error={session.error} onRetry={session.refresh} />;
    if (!session.member) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
    const admin = Boolean(session.member.hasAdminCenter);
    if (adminOnly !== admin) return <Navigate to={admin ? '/admin' : '/reservation'} replace />;
    return <Outlet />;
}

export default function RequireSession({ adminOnly = false }) {
    const location = useLocation();
    // 뒤로 가기와 같은 경로 재진입도 서버 세션을 다시 확인한다.
    return <SessionCheck key={location.key} adminOnly={adminOnly} />;
}
