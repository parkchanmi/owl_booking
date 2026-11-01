export function isUserPage(path) {
    return path === '/reservation' || path === '/mypage' || path === '/user' || path.startsWith('/user/') || path === '/waitlist/reserve';
}

export function loginDestination(admin, requestedPath) {
    const fallback = admin ? '/admin' : '/reservation';
    if (typeof requestedPath !== 'string' || !requestedPath.startsWith('/') || requestedPath.startsWith('//') || requestedPath.includes('\\')) return fallback;
    const target = new URL(requestedPath, 'https://owl.local');
    if (target.origin !== 'https://owl.local') return fallback;
    const adminPage = target.pathname === '/admin' || target.pathname.startsWith('/admin/');
    if (admin ? !adminPage : !isUserPage(target.pathname)) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
}
