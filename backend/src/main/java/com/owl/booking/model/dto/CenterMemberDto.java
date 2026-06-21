package com.owl.booking.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CenterMemberDto {

    String id;

    CenterDto center;
    
    MemberDto member;
}
