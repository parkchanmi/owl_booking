package com.owl.booking.dto;

import com.owl.booking.entity.type.ConfirmMode;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CenterConfigDto {

    private String id;

    private ConfirmMode confirmMode;

    private Long waitlistCapacity;

    private Long cancleDeadlineMinutes;

    private Long bookingOpenDays;

    private Long generationStartDat;

    private CenterDto center;
}
