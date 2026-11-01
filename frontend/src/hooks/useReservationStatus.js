import { useCallback, useEffect, useState } from 'react';
import { memberRequest } from '../api/myPageApi';

export default function useReservationStatus() {
    const [bookings, setBookings] = useState([]);
    const [waitlists, setWaitlists] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [revision, setRevision] = useState(0);
    const refresh = useCallback(() => { setLoading(true); setRevision((value) => value + 1); }, []);

    useEffect(() => {
        let active = true;
        memberRequest('/api/member/attendance')
            .then((rows) => { if (active) setAttendance(Array.isArray(rows) ? rows : []); })
            .catch(() => { if (active) setAttendance([]); });
        Promise.all([memberRequest('/api/bookings/mine'), memberRequest('/api/waitlists/mine')])
            .then(([reserved, waiting]) => {
                if (!Array.isArray(reserved) || !Array.isArray(waiting)) throw new Error('예약 상태 응답 오류');
                if (active) { setBookings(reserved); setWaitlists(waiting); setError(false); }
            })
            .catch(() => { if (active) setError(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [revision]);

    useEffect(() => {
        const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', onVisible);
        return () => { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', onVisible); };
    }, [refresh]);
    return { bookings, waitlists, attendance, loading, error, refresh };
}
