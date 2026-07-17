package com.owl.booking.model.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HoldHistoryUpdateRequestDto {
    private LocalDateTime startDat;
    private LocalDateTime endDat;
}
