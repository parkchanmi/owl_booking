package com.owl.booking.admin.service;

import com.owl.booking.model.dto.SalesReportDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.MemberMembershipRefund;
import com.owl.booking.model.entity.Membership;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.MemberMembershipRefundRepository;
import com.owl.booking.model.repository.MemberMembershipRepository;
import com.owl.booking.model.repository.MemberRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SalesServiceTest {
    @Test
    void usesPaymentDateAndPurchasePriceAndSubtractsRefunds() {
        MemberMembershipRepository memberships = mock(MemberMembershipRepository.class);
        MemberMembershipRefundRepository refunds = mock(MemberMembershipRefundRepository.class);
        CenterRepository centers = mock(CenterRepository.class);
        MemberRepository members = mock(MemberRepository.class);
        SalesService service = new SalesService(memberships, refunds, centers, members);

        Center center = Center.builder().id("center-1").name("센터").build();
        Member member = Member.builder().id("member-1").name("회원").build();
        MemberMembership issued = MemberMembership.builder()
                .id("issued-1")
                .center(center)
                .member(member)
                .membership(Membership.builder().name("30회권").price(120_000L).build())
                .startDat(LocalDate.of(2026, 8, 25).atStartOfDay())
                .paymentDate(LocalDate.of(2026, 9, 3))
                .purchasePrice(100_000L)
                .build();
        MemberMembershipRefund refund = MemberMembershipRefund.builder()
                .id("refund-1")
                .centerId(center.getId())
                .memberId(member.getId())
                .membershipName("30회권")
                .refundedAt(LocalDate.of(2026, 9, 5).atStartOfDay())
                .refundAmount(40_000L)
                .build();
        when(centers.findAll()).thenReturn(List.of(center));
        when(members.findAll()).thenReturn(List.of(member));
        when(memberships.findAll()).thenReturn(List.of(issued));
        when(refunds.findAll()).thenReturn(List.of(refund));

        SalesReportDto report = service.getReport("center-1", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30));
        assertEquals(100_000L, report.grossSales());
        assertEquals(40_000L, report.refundTotal());
        assertEquals(60_000L, report.netSales());
        assertEquals(2, report.entries().size());

        SalesReportDto paymentDay = service.getReport("center-1", LocalDate.of(2026, 9, 3), LocalDate.of(2026, 9, 3));
        assertEquals(1, paymentDay.saleCount());
        assertEquals(0, paymentDay.refundCount());

        SalesReportDto startDay = service.getReport("center-1", LocalDate.of(2026, 8, 25), LocalDate.of(2026, 8, 25));
        assertEquals(0, startDay.saleCount());
    }
}
