package com.owl.booking.utils;

import com.owl.booking.admin.service.MemberMembershipService;
import com.owl.booking.admin.service.SalesService;
import com.owl.booking.model.dto.SalesReportDto;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.MemberMembershipRefund;
import com.owl.booking.model.repository.MemberMembershipRefundRepository;
import com.owl.booking.model.repository.MemberRepository;
import java.util.List;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:seed-refund;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.hikari.connection-init-sql=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class DataInitializerRefundTest {
    @Autowired private MemberRepository memberRepository;
    @Autowired private MemberMembershipService memberMembershipService;
    @Autowired private MemberMembershipRefundRepository refundRepository;
    @Autowired private SalesService salesService;

    @Test
    void seedsOneActiveMembershipAndOneRefundForUser() {
        Member user = memberRepository.findByLoginId("user");
        assertNotNull(user);
        assertEquals(1, memberMembershipService.getByMemberId(user.getId()).size());

        List<MemberMembershipRefund> refunds = refundRepository.findByMemberIdOrderByRefundedAtDesc(user.getId());
        assertEquals(1, refunds.size());
        assertEquals("1개월 기본권", refunds.get(0).getMembershipName());
        assertEquals(100_000L, refunds.get(0).getTotalAmount());
        assertEquals(66_666L, refunds.get(0).getRefundAmount());
    }

    @Test
    void salesReportUsesPaymentDatesAndRefundHistory() {
        SalesReportDto report = salesService.getReport(null, LocalDate.now().minusDays(20), LocalDate.now());

        assertEquals(2, report.saleCount());
        assertEquals(1, report.refundCount());
        assertEquals(180_000L, report.grossSales());
        assertEquals(66_666L, report.refundTotal());
        assertEquals(113_334L, report.netSales());
    }
}
