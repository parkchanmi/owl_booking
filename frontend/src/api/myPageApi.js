export async function memberRequest(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || error?.detail || (response.status === 401 ? '다시 로그인해 주세요.' : '요청을 처리하지 못했습니다.'));
    }
    return response.status === 204 ? null : response.json();
}
