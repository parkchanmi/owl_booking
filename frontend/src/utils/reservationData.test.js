import { test } from 'node:test';
import assert from 'node:assert/strict';
import { remainingUses, usableMemberships, reservationPolicy, myReservationStatus, isReservationClosed } from './reservationData.js';

test('booking closes at the exact class start, including classes already booked or waitlisted', () => {
    const date = '2026-11-01T00:00:00';
    assert.equal(isReservationClosed(date, '10:00', '2026-11-01T09:59:59'), false);
    assert.equal(isReservationClosed(date, '10:00', '2026-11-01T10:00:00'), true);
    assert.equal(isReservationClosed(date, '10:00', '2026-11-01T15:00:00'), true);
    assert.equal(isReservationClosed('2026-11-02', '10:00', '2026-11-01T15:00:00'), false);
    assert.equal(isReservationClosed(null, '10:00', '2026-11-01'), true);
    assert.equal(isReservationClosed(date, 'invalid', '2026-11-01'), true);
});

test('owned status matches the actual schedule ID for each day, not the shared class name', () => {
    const bookings = [{ realProgramId: 'nov-1', programName: '필라테스 기초반' }, { realProgramId: 'nov-3', programName: '필라테스 기초반' }];
    const waitlists = [{ realProgramId: 'nov-2' }];
    assert.equal(myReservationStatus('nov-1', bookings, waitlists), 'booked');
    assert.equal(myReservationStatus('nov-2', bookings, waitlists), 'waitlisted');
    assert.equal(myReservationStatus('nov-3', bookings, waitlists), 'booked');
    assert.equal(myReservationStatus('nov-4', bookings, waitlists), null);
    assert.equal(myReservationStatus(null, bookings, waitlists), null);
    assert.equal(myReservationStatus('nov-1', [], waitlists), null);
});

const ticket = {
    id: 'pass', center: { id: 'center' }, uCnt: 10, actualUsedCount: 3,
    startDat: '2026-11-01T00:00:00', endDat: '2026-11-30T00:00:00',
};

test('remaining uses follow the real API fields, including unlimited and exhausted passes', () => {
    assert.equal(remainingUses(ticket), 7);
    assert.equal(remainingUses({ ...ticket, actualUsedCount: 12 }), 0);
    assert.equal(remainingUses({ ...ticket, uCnt: null }), null);
    assert.equal(remainingUses({ ...ticket, remainingCount: 2 }), 2);
    assert.equal(remainingUses({ ...ticket, remainingCount: null }), null);
});

test('passes must match the center and cover the class date, including both boundary dates', () => {
    assert.equal(usableMemberships([ticket], 'other', '2026-11-01').length, 0);
    assert.equal(usableMemberships([ticket], 'center', '2026-10-31').length, 0);
    assert.equal(usableMemberships([ticket], 'center', '2026-12-01').length, 0);
    assert.equal(usableMemberships([ticket], 'center', '2026-11-01').length, 1);
    assert.equal(usableMemberships([ticket], 'center', '2026-11-30').length, 1);
    assert.equal(usableMemberships([{ ...ticket, actualUsedCount: 10 }], 'center', '2026-11-10').length, 0);
});

test('policy uses saved minutes, refund thresholds and confirmation mode without a mock fallback', () => {
    assert.equal(reservationPolicy(null), null);
    const policy = { cancleDeadlineMinutes: 90, confirmMode: 'AUTO', refundCountThresholdPercent: 20, refundPeriodThresholdPercent: 30 };
    assert.match(reservationPolicy(policy).cancellation, /90분/);
    assert.match(reservationPolicy(policy).refund, /20%/);
    assert.match(reservationPolicy(policy).refund, /30%/);
    assert.match(reservationPolicy(policy).waitlist, /자동 확정/);
    assert.match(reservationPolicy({ ...policy, confirmMode: 'MANUAL' }).waitlist, /링크/);
    assert.match(reservationPolicy({ ...policy, cancleDeadlineMinutes: 0 }).cancellation, /0분/);
    assert.match(reservationPolicy({ ...policy, cancleDeadlineMinutes: null }).cancellation, /문의/);
});
