package com.owl.booking.admin.service;

import com.owl.booking.model.dto.SalesEntryDto;
import com.owl.booking.model.dto.SalesReportDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.MemberMembershipRefund;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.MemberMembershipRefundRepository;
import com.owl.booking.model.repository.MemberMembershipRepository;
import com.owl.booking.model.repository.MemberRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class SalesService {
    private final MemberMembershipRepository membershipRepository;
    private final MemberMembershipRefundRepository refundRepository;
    private final CenterRepository centerRepository;
    private final MemberRepository memberRepository;

    public SalesService(
            MemberMembershipRepository membershipRepository,
            MemberMembershipRefundRepository refundRepository,
            CenterRepository centerRepository,
            MemberRepository memberRepository
    ) {
        this.membershipRepository = membershipRepository;
        this.refundRepository = refundRepository;
        this.centerRepository = centerRepository;
        this.memberRepository = memberRepository;
    }

    public SalesReportDto getReport(String centerId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid sales date range");
        }

        Map<String, Center> centers = centerRepository.findAll().stream()
                .collect(Collectors.toMap(Center::getId, Function.identity()));
        Map<String, Member> members = memberRepository.findAll().stream()
                .collect(Collectors.toMap(Member::getId, Function.identity()));
        List<SalesEntryDto> entries = new ArrayList<>();

        for (MemberMembership issued : membershipRepository.findAll()) {
            if (issued.getCenter() == null || issued.getMember() == null || issued.getMembership() == null) continue;
            LocalDate paymentDate = issued.getPaymentDate() != null
                    ? issued.getPaymentDate() : issued.getStartDat().toLocalDate();
            String issuedCenterId = issued.getCenter().getId();
            if (!matches(centerId, issuedCenterId, paymentDate, startDate, endDate)) continue;
            Long price = issued.getPurchasePrice() != null ? issued.getPurchasePrice() : issued.getMembership().getPrice();
            entries.add(new SalesEntryDto(
                    "SALE:" + issued.getId(), "SALE", paymentDate,
                    issuedCenterId, issued.getCenter().getName(),
                    issued.getMember().getId(), issued.getMember().getName(),
                    issued.getMembership().getName(), price == null ? 0 : price
            ));
        }

        for (MemberMembershipRefund refund : refundRepository.findAll()) {
            LocalDate refundDate = refund.getRefundedAt().toLocalDate();
            if (!matches(centerId, refund.getCenterId(), refundDate, startDate, endDate)) continue;
            Center center = centers.get(refund.getCenterId());
            Member member = members.get(refund.getMemberId());
            entries.add(new SalesEntryDto(
                    "REFUND:" + refund.getId(), "REFUND", refundDate,
                    refund.getCenterId(), center == null ? refund.getCenterId() : center.getName(),
                    refund.getMemberId(), member == null ? refund.getMemberId() : member.getName(),
                    refund.getMembershipName(), refund.getRefundAmount()
            ));
        }

        entries.sort(Comparator.comparing(SalesEntryDto::date).reversed().thenComparing(SalesEntryDto::id));
        long grossSales = entries.stream().filter(entry -> "SALE".equals(entry.type())).mapToLong(SalesEntryDto::amount).sum();
        long refundTotal = entries.stream().filter(entry -> "REFUND".equals(entry.type())).mapToLong(SalesEntryDto::amount).sum();
        long saleCount = entries.stream().filter(entry -> "SALE".equals(entry.type())).count();
        long refundCount = entries.size() - saleCount;
        return new SalesReportDto(grossSales, refundTotal, grossSales - refundTotal, saleCount, refundCount, entries);
    }

    private boolean matches(String centerId, String entryCenterId, LocalDate date, LocalDate startDate, LocalDate endDate) {
        return (centerId == null || centerId.equals(entryCenterId))
                && !date.isBefore(startDate)
                && !date.isAfter(endDate);
    }
}
