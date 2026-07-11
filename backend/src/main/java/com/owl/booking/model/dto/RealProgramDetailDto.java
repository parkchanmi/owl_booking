package com.owl.booking.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RealProgramDetailDto {

    private String id;
    private String programName;
    private String instructorId;
    private String instructorName;
    private LocalDateTime programDat;
    private String startTime;
    private String endTime;
    private Long maxCapacity;
    private long bookingCount;
    private long waitlistCount;
    private Long waitlistCapacity;

    private Long cancleDeadlineMinutes;
    private String confirmMode;

    private boolean hasAttendance;

    private List<BookingMemberInfo> bookings;

    @Data
    @Builder
    public static class BookingMemberInfo {
        private String id;
        private String memberName;
        private String memberHp;
        private String memberLoginId;
        private String status;
    }
}
