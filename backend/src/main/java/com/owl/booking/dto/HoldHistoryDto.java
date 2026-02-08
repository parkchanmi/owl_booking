package com.owl.booking.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HoldHistoryDto {
    
    String id;

    LocalDateTime startDat;

    LocalDateTime endDat;

    Long hDay;

    MemberMembershipDto mm;

}
