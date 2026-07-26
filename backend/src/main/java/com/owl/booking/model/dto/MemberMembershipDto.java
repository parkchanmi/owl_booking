package com.owl.booking.model.dto;

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

    // 실제 이용된 횟수 (예약/출석/결석 이력의 수업 기준 중복 제거 건수) - 조회 시 계산되는 값
    Long actualUsedCount;

    // 실제 보류 사용일 (HoldHistory 합산) - 조회 시 계산되는 값
    Long actualHoldDays;

    CenterDto center;

    MemberDto member;

    MembershipDto membership;
}
