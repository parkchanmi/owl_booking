package com.owl.booking.admin.service;

import com.owl.booking.common.service.MailService;
import com.owl.booking.model.dto.CenterConfigDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.Membership;
import com.owl.booking.model.entity.type.MemberStatus;
import com.owl.booking.model.repository.MemberMembershipRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MembershipExpiryMailServiceTest {

    @Mock private MemberMembershipRepository memberMembershipRepository;
    @Mock private CenterConfigService centerConfigService;
    @Mock private MemberMembershipService memberMembershipService;
    @Mock private MailService mailService;

    private MembershipExpiryMailService service;

    @BeforeEach
    void setUp() {
        service = new MembershipExpiryMailService(
                memberMembershipRepository,
                centerConfigService,
                memberMembershipService,
                mailService
        );
    }

    @Test
    void sendsOnlyToMembershipsWithinConfiguredThreshold() {
        CenterConfigDto config = new CenterConfigDto();
        config.setMembershipExpiryCountThreshold(3);
        config.setMembershipExpiryDaysThreshold(7);
        config.setMembershipExpiryEmailSubject("[{센터명}] 만료 안내");
        config.setMembershipExpiryEmailTemplate("{회원명} {이용권명} {잔여횟수}회 {만료일}");
        when(centerConfigService.getByCenterId("center-1")).thenReturn(config);

        MemberMembership target = membership("target", "target@example.com");
        MemberMembership nonTarget = membership("non-target", "other@example.com");
        when(memberMembershipRepository.findByCenter_Id("center-1")).thenReturn(List.of(target, nonTarget));
        when(memberMembershipService.calculateUsedCount(target)).thenReturn(8L);
        when(memberMembershipService.calculateUsedCount(nonTarget)).thenReturn(2L);

        Map<String, Integer> result = service.sendForCenter("center-1");

        assertEquals(1, result.get("targetCount"));
        assertEquals(1, result.get("sentCount"));
        assertEquals(0, result.get("failedCount"));
        verify(mailService).sendHtmlMessage(
                eq("target@example.com"),
                eq("[OWL 강남센터] 만료 안내"),
                contains("김회원 10회 이용권 2회")
        );
    }

    private MemberMembership membership(String id, String email) {
        LocalDate today = LocalDate.now();
        Center center = Center.builder().id("center-1").name("OWL 강남센터").build();
        Member member = Member.builder()
                .id("member-" + id)
                .name("김회원")
                .email(email)
                .status(MemberStatus.ACTIVE)
                .build();
        Membership membership = Membership.builder().name("10회 이용권").build();
        return MemberMembership.builder()
                .id(id)
                .startDat(today.minusDays(10).atStartOfDay())
                .endDat(today.plusDays(30).atStartOfDay())
                .uCnt(10L)
                .center(center)
                .member(member)
                .membership(membership)
                .build();
    }
}
