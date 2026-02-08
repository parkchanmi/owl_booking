package com.owl.booking.dto;

import com.owl.booking.entity.type.MemberType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberDto {

    String id;

    MemberType type;

    String loginId;

    String pwd;

    String name;

    String email;

    String hp;
}
