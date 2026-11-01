package com.owl.booking.model.dto;

import com.owl.booking.model.entity.type.ConfirmMode;

// 회원 화면에 필요한 정책만 노출한다.
public record ReservationPolicyDto(
        Long cancleDeadlineMinutes,
        ConfirmMode confirmMode,
        Long waitlistCapacity,
        Integer refundCountThresholdPercent,
        Integer refundPeriodThresholdPercent
) {
    public static ReservationPolicyDto from(CenterConfigDto config) {
        return new ReservationPolicyDto(config.getCancleDeadlineMinutes(), config.getConfirmMode(),
                config.getWaitlistCapacity(), config.getRefundCountThresholdPercent(),
                config.getRefundPeriodThresholdPercent());
    }
}
