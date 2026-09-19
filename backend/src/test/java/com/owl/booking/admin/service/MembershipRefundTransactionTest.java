package com.owl.booking.admin.service;

import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.MemberMembershipRefund;
import com.owl.booking.model.entity.Membership;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.MemberMembershipRefundRepository;
import com.owl.booking.model.repository.MemberMembershipRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MembershipRefundTransactionTest {
    @Test
    void refundSavesHistoryAndCannotBeRepeated() {
        MemberMembershipRepository memberships = mock(MemberMembershipRepository.class);
        MemberMembershipRefundRepository refunds = mock(MemberMembershipRefundRepository.class);
        CenterConfigRepository configs = mock(CenterConfigRepository.class);
        MemberMembershipService memberMembershipService = mock(MemberMembershipService.class);
        MembershipRefundService service = new MembershipRefundService(memberships, refunds, configs, memberMembershipService);
        LocalDate today = LocalDate.now();
        MemberMembership issued = MemberMembership.builder()
                .id("issued-1")
                .startDat(today.minusDays(10).atStartOfDay())
                .endDat(today.plusDays(10).atStartOfDay())
                .uCnt(10L)
                .purchasePrice(100_000L)
                .center(Center.builder().id("center-1").build())
                .member(Member.builder().id("member-1").build())
                .membership(Membership.builder().name("10회권").build())
                .build();
        when(memberships.findByIdForUpdate("issued-1")).thenReturn(Optional.of(issued));
        when(refunds.save(any(MemberMembershipRefund.class))).thenAnswer(call -> call.getArgument(0));

        MemberMembershipRefund history = service.refund("issued-1");

        assertEquals("center-1", history.getCenterId());
        assertEquals("member-1", history.getMemberId());
        assertEquals(100_000L, history.getTotalAmount());
        assertEquals(50_000L, history.getRefundAmount());
        assertNotNull(issued.getRefundedAt());
        verify(memberships).save(issued);
        assertThrows(ResponseStatusException.class, () -> service.refund("issued-1"));
    }
}
