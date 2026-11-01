export async function fetchSession(fetcher = fetch) {
    const response = await fetcher('/api/member/info', { credentials: 'include', cache: 'no-store' });
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) throw new Error('로그인 정보를 확인하지 못했습니다. 다시 시도해 주세요.');
    const member = await response.json();
    if (!member?.id || !member?.loginId) return null;
    return member;
}
