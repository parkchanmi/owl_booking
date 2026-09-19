package com.owl.booking.admin.service;

import com.owl.booking.model.dto.MembershipRefundPreviewDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.CenterConfig;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.Membership;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.MemberMembershipRefundRepository;
import com.owl.booking.model.repository.MemberMembershipRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MembershipRefundServiceTest {
    @Mock private MemberMembershipRepository membershipRepository;
    @Mock private MemberMembershipRefundRepository refundRepository;
    @Mock private CenterConfigRepository configRepository;
    @Mock private MemberMembershipService memberMembershipService;

    private MembershipRefundService service;
    private MemberMembership membership;
    private CenterConfig config;

    @BeforeEach
    void setUp() {
        service = new MembershipRefundService(membershipRepository, refundRepository, configRepository, memberMembershipService);
        LocalDate today = LocalDate.now();
        membership = MemberMembership.builder()
                .id("issued-1")
                .startDat(today.minusDays(10).atStartOfDay())
                .endDat(today.plusDays(10).atStartOfDay())
                .uCnt(10L)
                .purchasePrice(100_000L)
                .center(Center.builder().id("center-1").build())
                .membership(Membership.builder().name("10회권").price(120_000L).build())
                .build();
        config = CenterConfig.builder()
                .refundCountThresholdPercent(25)
                .refundPeriodThresholdPercent(25)
                .build();
        when(membershipRepository.findById("issued-1")).thenReturn(Optional.of(membership));
        when(configRepository.findByCenter_Id("center-1")).thenReturn(Optional.of(config));
    }

    @Test
    void previewUsesSmallerRemainingRatioAndPurchasePrice() {
        when(memberMembershipService.calculateUsedCount(membership)).thenReturn(6L);

        MembershipRefundPreviewDto preview = service.preview("issued-1");

        assertTrue(preview.isRefundable());
        assertEquals(4L, preview.getRemainingCount());
        assertEquals(10L, preview.getRemainingDays());
        assertEquals(40_000L, preview.getRefundAmount());
    }

    @Test
    void thresholdIsExclusive() {
        when(memberMembershipService.calculateUsedCount(membership)).thenReturn(5L);
        config.setRefundCountThresholdPercent(50);

        assertFalse(service.preview("issued-1").isRefundable());
    }

    @Test
    void unlimitedMembershipUsesPeriodOnly() {
        membership.setUCnt(null);
        config.setRefundCountThresholdPercent(100);

        MembershipRefundPreviewDto preview = service.preview("issued-1");

        assertTrue(preview.isRefundable());
        assertEquals(50_000L, preview.getRefundAmount());
        assertEquals(null, preview.getRemainingCount());
    }
}
