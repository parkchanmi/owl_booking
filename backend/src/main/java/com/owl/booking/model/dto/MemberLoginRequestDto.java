package com.owl.booking.model.dto;

import com.owl.booking.model.entity.type.MemberType;

public record MemberLoginRequestDto(String loginId, String pwd, MemberType loginType) {}
