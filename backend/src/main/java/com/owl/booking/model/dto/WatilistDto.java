package com.owl.booking.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WatilistDto {

    String id;

    MemberDto member;

    RealProgramDto program;
}
