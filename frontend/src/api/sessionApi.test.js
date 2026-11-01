import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchSession } from './sessionApi.js';

test('session checks use the actual server cookie and bypass cached responses', async () => {
    const member = { id: 'member', loginId: 'login', name: '회원', hasAdminCenter: false };
    const result = await fetchSession(async (url, options) => {
        assert.equal(url, '/api/member/info');
        assert.equal(options.credentials, 'include');
        assert.equal(options.cache, 'no-store');
        return { status: 200, ok: true, json: async () => member };
    });
    assert.deepEqual(result, member);
});

test('missing or expired sessions become guests without trying to read a login error body', async () => {
    for (const status of [401, 403]) {
        assert.equal(await fetchSession(async () => ({ status, ok: false, json: () => { throw new Error('Must not parse'); } })), null);
    }
});

test('server and connection errors remain distinguishable from logged out sessions', async () => {
    await assert.rejects(() => fetchSession(async () => ({ status: 500, ok: false })), /로그인 정보를 확인하지 못했습니다/);
    await assert.rejects(() => fetchSession(async () => { throw new Error('connection failed'); }), /connection failed/);
});

test('incomplete account data never authorizes protected pages', async () => {
    for (const member of [null, {}, { loginId: 'missing-id' }, { id: 'missing-login' }]) {
        assert.equal(await fetchSession(async () => ({ status: 200, ok: true, json: async () => member })), null);
    }
});

test('administrator session metadata is preserved for the member card and administrator guard', async () => {
    const member = { id: 'admin', loginId: 'admin-login', hasAdminCenter: true };
    const result = await fetchSession(async () => ({ status: 200, ok: true, json: async () => member }));
    assert.equal(result.hasAdminCenter, true);
});
