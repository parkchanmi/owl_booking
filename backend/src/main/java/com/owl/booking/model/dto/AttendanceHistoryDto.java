package com.owl.booking.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AttendanceHistoryDto {
    private String id;
    private String bookingId;
    private String realProgramId;
    private String centerName;
    private String programName;
    private LocalDateTime programDat;
    private String startTime;
    private String endTime;
    private String instructorName;
    private String bookingStatus;
    private String attendanceStatus;
    private LocalDateTime recordedAt;
}
