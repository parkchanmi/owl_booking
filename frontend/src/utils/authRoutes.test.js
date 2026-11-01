import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUserPage, loginDestination } from './authRoutes.js';

test('all user aliases and the waitlist confirmation page require a session', () => {
    for (const path of ['/reservation', '/mypage', '/user', '/user/booking', '/user/booking/center', '/user/mypage/history', '/user/mypage/ticket', '/waitlist/reserve']) assert.equal(isUserPage(path), true);
    for (const path of ['/', '/login', '/join', '/oauth/kakao/callback']) assert.equal(isUserPage(path), false);
});

test('successful login preserves protected destinations and query parameters', () => {
    assert.equal(loginDestination(false, '/mypage?tab=passes'), '/mypage?tab=passes');
    assert.equal(loginDestination(false, '/waitlist/reserve?token=example'), '/waitlist/reserve?token=example');
    assert.equal(loginDestination(true, '/admin/booking'), '/admin/booking');
});

test('return destinations cannot redirect outside the app, loop to login or send members to admin pages', () => {
    for (const path of ['https://example.com', '//example.com', '/\\example.com', '/login', '/', '/user/../../login', undefined]) assert.equal(loginDestination(false, path), '/reservation');
    assert.equal(loginDestination(false, '/admin'), '/reservation');
    assert.equal(loginDestination(true), '/admin');
});

test('cross-role destinations return each account to its own home without redirect loops', () => {
    for (const path of ['/reservation', '/mypage', '/user/booking', '/user/mypage/history', '/waitlist/reserve?token=example']) assert.equal(loginDestination(true, path), '/admin');
    for (const path of ['/admin', '/admin/booking', '/admin/member/list']) assert.equal(loginDestination(false, path), '/reservation');
    assert.equal(loginDestination(true, '/admin'), '/admin');
    assert.equal(loginDestination(false, '/reservation'), '/reservation');
});
