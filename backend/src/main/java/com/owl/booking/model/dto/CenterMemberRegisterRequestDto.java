package com.owl.booking.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CenterMemberRegisterRequestDto {
    private String loginId;
    private String pwd;
    private String name;
    private String email;
    private String hp;
    private String centerId;
}
