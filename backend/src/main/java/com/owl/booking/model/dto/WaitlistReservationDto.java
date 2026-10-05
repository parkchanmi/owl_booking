package com.owl.booking.model.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WaitlistReservationDto {

    private String waitlistId;
    private String centerName;
    private String programName;
    private String instructorName;
    private LocalDateTime programDat;
    private String startTime;
    private String endTime;
    private Long maxCapacity;
    private long bookingCount;
}
