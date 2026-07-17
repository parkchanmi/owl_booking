package com.owl.booking.model.dto;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RealProgramGenerateRequestDto {
    private String centerId;
    private LocalDate startDate;
    private LocalDate endDate;
}
