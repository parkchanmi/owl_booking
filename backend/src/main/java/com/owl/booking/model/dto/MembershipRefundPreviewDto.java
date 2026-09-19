package com.owl.booking.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MembershipRefundPreviewDto {
    private String membershipName;
    private long totalDays;
    private long remainingDays;
    private double remainingPeriodPercent;
    private Long totalCount;
    private Long remainingCount;
    private Double remainingCountPercent;
    private long totalAmount;
    private long refundAmount;
    private int periodThresholdPercent;
    private int countThresholdPercent;
    private boolean refundable;
}
