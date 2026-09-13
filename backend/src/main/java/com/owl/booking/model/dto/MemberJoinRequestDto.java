package com.owl.booking.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberJoinRequestDto {

    private String userType;

    private String loginId;

    private String pwd;

    private String name;

    private String email;

    private String hp;

    private String businessNo;

    private String ceoName;

    private String companyName;

    private String address1;

    private String address2;

    private String tel;
}
