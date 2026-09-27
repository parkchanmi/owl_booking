package com.owl.booking.model.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MyBookingDto {

    private String id;
    private String realProgramId;
    private String centerName;
    private String programName;
    private String instructorName;
    private LocalDateTime programDat;
    private String startTime;
    private String endTime;
}
