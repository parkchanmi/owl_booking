import { test } from 'node:test';
import assert from 'node:assert/strict';
import dayjs from 'dayjs';
import { calendarDots, classStart, memberMetrics, membershipCard, membershipUsage } from './myPageData.js';

const now = dayjs('2026-11-01T12:00:00');
const pass = { id: 'pass', center: { id: 'c', name: '센터' }, membership: { name: '10회권', useCnt: 10 }, remainingCount: 7, remainingHoldDays: 8, startDat: '2026-11-01', endDat: '2026-11-30', purchasePrice: 100000, paymentDate: '2026-10-31' };
const row = { id: 'booking', realProgramId: 'class', centerId: 'c', programDat: '2026-11-01T00:00:00', startTime: '19:00' };

test('class start uses the actual start time rather than midnight on the schedule date', () => {
    assert.equal(classStart(row).format('YYYY-MM-DD HH:mm'), '2026-11-01 19:00');
});
test('membership cards use server counts, amount, expiry and hold allowance', () => {
    const card = membershipCard(pass, now);
    assert.equal(card.remainingCount, 7);
    assert.equal(card.totalCount, 10);
    assert.equal(card.rate, 70);
    assert.equal(card.paymentAmount, '100,000원');
    assert.equal(card.holdRemaining, 8);
    assert.equal(card.expired, false);
    assert.equal(card.dDay, 'D-29');
});
test('expired, exhausted, unlimited and missing payment data are distinct', () => {
    assert.equal(membershipCard({ ...pass, remainingCount: 0 }, now).expired, true);
    assert.equal(membershipCard(pass, dayjs('2026-12-01')).expired, true);
    const card = membershipCard({ ...pass, remainingCount: null, purchasePrice: null }, now);
    assert.equal(card.remainingCount, null);
    assert.equal(card.expired, false);
    assert.equal(card.paymentAmount, '등록 정보 없음');
});
test('metrics count monthly bookings separately from upcoming waiting and recorded attendance', () => {
    const data = [row, { ...row, id: 'w', waitlist: true }, { ...row, id: 'old', programDat: '2026-10-31', waitlist: true }];
    const attendance = [{ ...row, attendanceStatus: 'PRESENT' }, { ...row, realProgramId: 'other', attendanceStatus: 'ABSENT' }, { ...row, realProgramId: 'unrecorded' }];
    assert.deepEqual(memberMetrics(data, attendance, now), { monthlyBookings: 1, attendanceRate: 50, waitlistCount: 1 });
    assert.equal(memberMetrics([], [], now).attendanceRate, null);
});
test('calendar dots come only from actual bookings, waiting and absences', () => {
    assert.deepEqual(calendarDots('2026-11-01', [row, { ...row, waitlist: true }], [{ ...row, attendanceStatus: 'ABSENT' }]), ['#6D28D9', '#EA580C', '#D4D4D8']);
    assert.deepEqual(calendarDots('2026-11-02', [row], []), []);
});

test('both calendars show bookings on the 1st and 3rd and waiting on the 2nd with the same colors', () => {
    const records = [row, { ...row, realProgramId: 'third', programDat: '2026-11-03' }, { ...row, realProgramId: 'waiting', programDat: '2026-11-02', waitlist: true }];
    assert.deepEqual(calendarDots('2026-11-01', records, []), ['#6D28D9']);
    assert.deepEqual(calendarDots('2026-11-02', records, []), ['#EA580C']);
    assert.deepEqual(calendarDots('2026-11-03', records, []), ['#6D28D9']);
    assert.deepEqual(calendarDots('2026-11-04', records, []), []);
    assert.deepEqual(calendarDots(dayjs(), [{ ...row, programDat: null }], []), []);
});
test('usage history deduplicates booked and attended classes and excludes other centers, periods and waiting', () => {
    const rows = membershipUsage(pass, [row, { ...row, realProgramId: 'other-center', centerId: 'different' }, { ...row, realProgramId: 'outside', programDat: '2026-10-31' }, { ...row, realProgramId: 'waiting', waitlist: true }], [{ ...row, attendanceStatus: 'PRESENT' }]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].attendanceStatus, 'PRESENT');
});
