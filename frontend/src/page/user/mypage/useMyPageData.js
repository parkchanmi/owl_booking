import { useEffect, useState, useCallback } from 'react';
import { memberRequest } from '../../../api/myPageApi';

const SOURCES = {
    centers: '/api/centers', reservations: '/api/bookings/mine', waitlists: '/api/waitlists/mine',
    memberships: '/api/member/memberships', attendance: '/api/member/attendance', holds: '/api/member/holds',
};
const EMPTY = Object.fromEntries(Object.keys(SOURCES).map((key) => [key, []]));

export default function useMyPageData() {
    const [data, setData] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [revision, setRevision] = useState(0);
    const reload = useCallback(() => { setLoading(true); setRevision((value) => value + 1); }, []);
    useEffect(() => {
        let active = true;
        const entries = Object.entries(SOURCES);
        Promise.allSettled(entries.map(([, url]) => memberRequest(url))).then((results) => {
            if (!active) return;
            const next = {}, failures = {};
            entries.forEach(([key], index) => {
                const result = results[index];
                if (result.status === 'fulfilled' && Array.isArray(result.value)) next[key] = result.value;
                else { next[key] = []; failures[key] = result.reason?.message || '데이터를 불러오지 못했습니다.'; }
            });
            setData(next);
            setErrors(failures);
            setLoading(false);
        });
        return () => { active = false; };
    }, [revision]);
    return { ...data, errors, loading, reload };
}
