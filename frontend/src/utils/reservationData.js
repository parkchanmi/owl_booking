import dayjs from 'dayjs';

export function isReservationClosed(programDat, startTime, now = dayjs()) {
    if (!programDat) return true;
    const start = startTime ? dayjs(`${dayjs(programDat).format('YYYY-MM-DD')}T${startTime}`) : dayjs(programDat);
    return !start.isValid() || !dayjs(now).isBefore(start);
}

export function myReservationStatus(realProgramId, bookings, waitlists) {
    if (!realProgramId) return null;
    if (bookings.some((row) => row.realProgramId === realProgramId)) return 'booked';
    if (waitlists.some((row) => row.realProgramId === realProgramId)) return 'waitlisted';
    return null;
}

export function remainingUses(ticket) {
    if ('remainingCount' in ticket) return ticket.remainingCount;
    return ticket.uCnt == null ? null : Math.max(0, ticket.uCnt - (ticket.actualUsedCount ?? 0));
}

export function usableMemberships(tickets, centerId, date) {
    return tickets.filter((ticket) => {
        const remaining = remainingUses(ticket);
        return ticket.center?.id === centerId
            && (remaining === null || remaining > 0)
            && (!ticket.startDat || !dayjs(date).isBefore(ticket.startDat, 'day'))
            && (!ticket.endDat || !dayjs(date).isAfter(ticket.endDat, 'day'));
    });
}

export function reservationPolicy(policy) {
    if (!policy) return null;
    return {
        cancellation: policy.cancleDeadlineMinutes == null
            ? '센터에 취소 가능 시간을 문의해 주세요.'
            : `수업 시작 ${policy.cancleDeadlineMinutes}분 전까지 예약을 취소할 수 있습니다.`,
        refund: `잔여 기간 비율이 ${policy.refundPeriodThresholdPercent}% 이하면 환불할 수 없습니다. 횟수제 이용권은 잔여 횟수 비율이 ${policy.refundCountThresholdPercent}% 이하여도 환불할 수 없습니다. 환불액은 잔여 기간과 잔여 횟수 중 낮은 비율로 계산됩니다.`,
        waitlist: policy.confirmMode === 'AUTO'
            ? '공석 발생 시 대기 순서대로 자동 확정되며, 등록된 이메일로 확정 안내가 발송됩니다.'
            : '공석 발생 시 등록된 이메일로 예약 안내가 발송됩니다. 안내된 링크에서 예약을 확정해 주세요.',
    };
}
