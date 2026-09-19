package com.owl.booking.model.dto;

import java.time.LocalDateTime;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberMembershipCreateRequestDto {
    private String memberId;
    private String centerId;
    private String membershipId;
    private LocalDateTime startDat;
    private LocalDate paymentDate;
}
