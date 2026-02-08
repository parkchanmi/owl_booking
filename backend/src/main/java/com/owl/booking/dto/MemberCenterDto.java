package com.owl.booking.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberCenterDto {

    String id;

    MemberDto member;

    CenterDto center;
}
