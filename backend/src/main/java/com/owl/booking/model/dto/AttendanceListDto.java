package com.owl.booking.model.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttendanceListDto {
    private String memberId;
    private String memberName;
    private String memberHp;
    private String memberLoginId;
    private String bookingStatus;    // "예약" or "대기"
    private String attendanceStatus; // "PRESENT", "ABSENT", or null
    private String attendanceId;
}
