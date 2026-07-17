package com.owl.booking.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CenterMemberDto {

    String id;

    CenterDto center;

    MemberDto member;

    // 이용중 / 정지 / 미등록 - 조회 시 계산되는 값
    String status;
}
