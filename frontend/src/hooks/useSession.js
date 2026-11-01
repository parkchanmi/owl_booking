import { useCallback, useEffect, useState } from 'react';
import { fetchSession } from '../api/sessionApi';

export default function useSession() {
    const [session, setSession] = useState({ status: 'loading', member: null, error: '' });
    const [revision, setRevision] = useState(0);
    const refresh = useCallback(() => {
        setSession((previous) => previous.status === 'error' ? { status: 'loading', member: null, error: '' } : previous);
        setRevision((value) => value + 1);
    }, []);

    useEffect(() => {
        let active = true;
        fetchSession()
            .then((member) => { if (active) setSession({ status: member ? 'authenticated' : 'guest', member, error: '' }); })
            .catch((error) => { if (active) setSession({ status: 'error', member: null, error: error.message }); });
        return () => { active = false; };
    }, [revision]);

    useEffect(() => {
        const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', onVisible);
        return () => { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', onVisible); };
    }, [refresh]);
    return { ...session, refresh };
}
