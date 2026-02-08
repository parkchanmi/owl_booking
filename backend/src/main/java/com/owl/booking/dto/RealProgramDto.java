package com.owl.booking.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RealProgramDto {
    String id;

    LocalDateTime programDat;

    CenterDto center;

    ProgramDto program;
}
