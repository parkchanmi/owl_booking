import dayjs from 'dayjs';
import { remainingUses } from './reservationData.js';

export function classStart(item) {
    return dayjs(`${dayjs(item.programDat).format('YYYY-MM-DD')}T${item.startTime || '00:00'}`);
}

export function membershipCard(mm, now = dayjs()) {
    const remaining = remainingUses(mm);
    const total = mm.uCnt ?? mm.ucnt ?? mm.UCnt ?? mm.membership?.useCnt ?? null;
    const expired = Boolean(mm.endDat && dayjs(mm.endDat).isBefore(now, 'day')) || remaining === 0;
    const days = mm.endDat ? dayjs(mm.endDat).startOf('day').diff(now.startOf('day'), 'day') : null;
    return {
        ...mm, title: mm.membership?.name || '이용권', branch: mm.center?.name || '센터 미등록',
        category: remaining === null ? '기간제 이용권' : '횟수제 이용권',
        remainingCount: remaining, totalCount: total,
        rate: total > 0 && remaining !== null ? Math.max(0, Math.min(100, remaining / total * 100)) : 100,
        startDate: mm.startDat ? dayjs(mm.startDat).format('YYYY.MM.DD') : '시작일 미등록',
        endDate: mm.endDat ? dayjs(mm.endDat).format('YYYY.MM.DD') : '만료일 없음',
        dDay: expired ? '만료 / 소진' : days === null ? '기간 제한 없음' : days === 0 ? '오늘 만료' : `D-${days}`,
        paymentDate: mm.paymentDate ? dayjs(mm.paymentDate).format('YYYY.MM.DD') : '등록 정보 없음',
        paymentMethod: '등록 정보 없음',
        paymentAmount: mm.purchasePrice == null ? '등록 정보 없음' : `${Number(mm.purchasePrice).toLocaleString('ko-KR')}원`,
        holdRemaining: mm.remainingHoldDays ?? Math.max(0, (mm.hDay ?? mm.hday ?? 0) - (mm.actualHoldDays ?? 0)),
        expired,
    };
}

export function memberMetrics(reservations, attendance, now = dayjs()) {
    const recorded = attendance.filter((row) => row.attendanceStatus === 'PRESENT' || row.attendanceStatus === 'ABSENT');
    const present = recorded.filter((row) => row.attendanceStatus === 'PRESENT').length;
    return {
        monthlyBookings: reservations.filter((row) => !row.waitlist && dayjs(row.programDat).isSame(now, 'month')).length,
        attendanceRate: recorded.length ? Math.round(present / recorded.length * 100) : null,
        waitlistCount: reservations.filter((row) => row.waitlist && classStart(row).isAfter(now)).length,
    };
}

export function calendarDots(date, reservations, attendance) {
    const matches = (row) => row.programDat && dayjs(row.programDat).isSame(date, 'day');
    const dots = [];
    if (reservations.some((row) => matches(row) && !row.waitlist) || attendance.some((row) => matches(row) && row.attendanceStatus === 'PRESENT')) dots.push('#6D28D9');
    if (reservations.some((row) => matches(row) && row.waitlist)) dots.push('#EA580C');
    if (attendance.some((row) => matches(row) && row.attendanceStatus === 'ABSENT')) dots.push('#D4D4D8');
    return dots;
}

// 서버의 이용권 사용 횟수와 동일하게 센터/이용 기간 내 예약·출석 수업을 중복 제거한다.
export function membershipUsage(pass, reservations, attendance) {
    const rows = new Map();
    [...reservations.filter((row) => !row.waitlist), ...attendance].forEach((row) => {
        if (row.centerId !== pass.center?.id || !row.programDat) return;
        if (pass.startDat && dayjs(row.programDat).isBefore(pass.startDat, 'day')) return;
        if (pass.endDat && dayjs(row.programDat).isAfter(pass.endDat, 'day')) return;
        rows.set(row.realProgramId, row);
    });
    return [...rows.values()].sort((a, b) => classStart(b).valueOf() - classStart(a).valueOf());
}
