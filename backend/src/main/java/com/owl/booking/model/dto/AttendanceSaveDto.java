package com.owl.booking.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttendanceSaveDto {
    private String memberId;
    private String status; // "PRESENT" or "ABSENT"
}
