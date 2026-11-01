package com.owl.booking.common.controller;

import com.owl.booking.admin.service.CenterConfigService;
import com.owl.booking.admin.service.MemberMembershipService;
import com.owl.booking.common.service.MemberService;
import com.owl.booking.model.dto.CenterConfigDto;
import com.owl.booking.model.dto.MemberMembershipDto;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.type.ConfirmMode;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class MemberReservationDataTest {
    @Test
    void membershipLookupUsesAuthenticatedMemberAndRejectsAnonymousRequests() {
        Member member = Member.builder().id("current-member").build();
        List<MemberMembershipDto> passes = List.of(new MemberMembershipDto());
        int[] membershipLookups = {0};
        MemberService members = new MemberService(null, null, null, null) {
            @Override public Member findByLoginId(String loginId) {
                assertEquals("current-login", loginId);
                return member;
            }
        };
        MemberMembershipService memberships = new MemberMembershipService(null, null, null, null, null, null, null) {
            @Override public List<MemberMembershipDto> getByMemberId(String memberId) {
                assertEquals("current-member", memberId);
                membershipLookups[0]++;
                return passes;
            }
        };
        MemberController controller = new MemberController(members, null, null);
        ReflectionTestUtils.setField(controller, "memberMembershipService", memberships);

        assertEquals(401, controller.getMyMemberships(null).getStatusCode().value());
        assertEquals(0, membershipLookups[0]);
        var auth = new UsernamePasswordAuthenticationToken("current-login", null, List.of());
        assertSame(passes, controller.getMyMemberships(auth).getBody());
        assertEquals(1, membershipLookups[0]);
    }

    @Test
    void reservationPolicyContainsSavedValuesWithoutAdminSettings() {
        CenterConfigDto config = new CenterConfigDto();
        config.setCancleDeadlineMinutes(90L);
        config.setConfirmMode(ConfirmMode.AUTO);
        config.setWaitlistCapacity(4L);
        config.setRefundCountThresholdPercent(20);
        config.setRefundPeriodThresholdPercent(30);
        config.setRoleMemberMappingsJson("private admin mappings");
        CenterConfigService configs = new CenterConfigService(null, null) {
            @Override public CenterConfigDto getByCenterId(String centerId) {
                assertEquals("center", centerId);
                return config;
            }
        };
        PublicCenterController controller = new PublicCenterController();
        ReflectionTestUtils.setField(controller, "centerConfigService", configs);

        var policy = controller.getReservationPolicy("center");
        assertEquals(90L, policy.cancleDeadlineMinutes());
        assertEquals(ConfirmMode.AUTO, policy.confirmMode());
        assertEquals(4L, policy.waitlistCapacity());
        assertEquals(20, policy.refundCountThresholdPercent());
        assertEquals(30, policy.refundPeriodThresholdPercent());
        assertFalse(policy.toString().contains("private admin mappings"));
    }
}
