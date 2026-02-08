package com.owl.booking.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProgramDto {
    String id;

    String name;

    String dayOfWeek;

    String startTime;

    String endTime;

    Long maxCapacity;

    CenterDto center;

    InstructorDto instructor;
}
