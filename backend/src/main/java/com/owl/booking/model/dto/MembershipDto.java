package com.owl.booking.model.dto;

import com.owl.booking.model.entity.type.MembershipStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MembershipDto {

    String id;

    String name;

    Long useCnt;

    Long durationDays;

    Long holdDays;

    Long price;

    MembershipStatus status;

    CenterDto center;
}
