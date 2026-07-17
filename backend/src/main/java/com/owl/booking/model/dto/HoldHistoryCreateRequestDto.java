package com.owl.booking.model.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HoldHistoryCreateRequestDto {
    private String mmId;
    private LocalDateTime startDat;
    private LocalDateTime endDat;
}
