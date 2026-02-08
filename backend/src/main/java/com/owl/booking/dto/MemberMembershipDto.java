package com.owl.booking.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberMembershipDto {

    String id;

    LocalDateTime startDat;

    LocalDateTime endDat;

    Long uCnt;

    Long hDay;

    CenterDto center;

    MemberDto member;

    MembershipDto membership;
}
