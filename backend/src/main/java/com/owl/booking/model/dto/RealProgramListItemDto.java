package com.owl.booking.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RealProgramListItemDto {

    private String id;
    private LocalDateTime programDat;
    private CenterInfo center;
    private ProgramInfo program;
    private long bookingCount;
    private long waitlistCount;
    private Long waitlistCapacity;

    @Data
    @Builder
    public static class CenterInfo {
        private String id;
        private String name;
    }

    @Data
    @Builder
    public static class ProgramInfo {
        private String id;
        private String name;
        private String startTime;
        private String endTime;
        private Long maxCapacity;
        private InstructorInfo instructor;
    }

    @Data
    @Builder
    public static class InstructorInfo {
        private String id;
        private String name;
    }
}
