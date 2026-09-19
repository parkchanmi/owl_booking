package com.owl.booking.admin.service;

import com.owl.booking.model.dto.MembershipRefundPreviewDto;
import com.owl.booking.model.entity.CenterConfig;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.MemberMembershipRefund;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.MemberMembershipRefundRepository;
import com.owl.booking.model.repository.MemberMembershipRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MembershipRefundService {
    private final MemberMembershipRepository memberMembershipRepository;
    private final MemberMembershipRefundRepository refundRepository;
    private final CenterConfigRepository centerConfigRepository;
    private final MemberMembershipService memberMembershipService;

    public MembershipRefundService(
            MemberMembershipRepository memberMembershipRepository,
            MemberMembershipRefundRepository refundRepository,
            CenterConfigRepository centerConfigRepository,
            MemberMembershipService memberMembershipService
    ) {
        this.memberMembershipRepository = memberMembershipRepository;
        this.refundRepository = refundRepository;
        this.centerConfigRepository = centerConfigRepository;
        this.memberMembershipService = memberMembershipService;
    }

    public List<MemberMembershipRefund> getByMemberId(String memberId) {
        return refundRepository.findByMemberIdOrderByRefundedAtDesc(memberId);
    }

    public MembershipRefundPreviewDto preview(String id) {
        MemberMembership mm = findActive(id);
        return calculate(mm, LocalDate.now());
    }

    @Transactional
    public MemberMembershipRefund refund(String id) {
        MemberMembership mm = memberMembershipRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "MemberMembership not found"));
        if (mm.getRefundedAt() != null) {
            throw new ResponseStatusException(BAD_REQUEST, "Membership is already refunded");
        }

        LocalDateTime refundedAt = LocalDateTime.now();
        MembershipRefundPreviewDto preview = calculate(mm, refundedAt.toLocalDate());
        if (!preview.isRefundable()) {
            throw new ResponseStatusException(BAD_REQUEST, "Membership does not meet refund criteria");
        }

        MemberMembershipRefund history = MemberMembershipRefund.builder()
                .memberMembershipId(mm.getId())
                .centerId(mm.getCenter().getId())
                .memberId(mm.getMember().getId())
                .membershipName(preview.getMembershipName())
                .startDat(mm.getStartDat())
                .endDat(mm.getEndDat())
                .refundedAt(refundedAt)
                .totalDays(preview.getTotalDays())
                .totalCount(preview.getTotalCount())
                .remainingDays(preview.getRemainingDays())
                .remainingCount(preview.getRemainingCount())
                .totalAmount(preview.getTotalAmount())
                .refundAmount(preview.getRefundAmount())
                .build();
        refundRepository.save(history);
        mm.setRefundedAt(refundedAt);
        memberMembershipRepository.save(mm);
        return history;
    }

    private MemberMembership findActive(String id) {
        MemberMembership mm = memberMembershipRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "MemberMembership not found"));
        if (mm.getRefundedAt() != null) {
            throw new ResponseStatusException(BAD_REQUEST, "Membership is already refunded");
        }
        return mm;
    }

    private MembershipRefundPreviewDto calculate(MemberMembership mm, LocalDate today) {
        long totalDays = Math.max(1, ChronoUnit.DAYS.between(mm.getStartDat().toLocalDate(), mm.getEndDat().toLocalDate()));
        long remainingDays = Math.max(0, Math.min(totalDays, ChronoUnit.DAYS.between(today, mm.getEndDat().toLocalDate())));
        Long totalCount = mm.getUCnt();
        Long remainingCount = totalCount == null ? null : Math.max(0, totalCount - memberMembershipService.calculateUsedCount(mm));
        CenterConfig config = centerConfigRepository.findByCenter_Id(mm.getCenter().getId()).orElse(null);
        int periodThreshold = config == null || config.getRefundPeriodThresholdPercent() == null ? 0 : config.getRefundPeriodThresholdPercent();
        int countThreshold = config == null || config.getRefundCountThresholdPercent() == null ? 0 : config.getRefundCountThresholdPercent();

        boolean periodEligible = remainingDays * 100 > (long) periodThreshold * totalDays;
        boolean countEligible = totalCount == null || (totalCount > 0 && remainingCount * 100 > (long) countThreshold * totalCount);
        Long purchasePrice = mm.getPurchasePrice() != null ? mm.getPurchasePrice() : mm.getMembership().getPrice();
        long totalAmount = purchasePrice == null ? 0 : purchasePrice;
        long ratioNumerator = remainingDays;
        long ratioDenominator = totalDays;
        if (totalCount != null && totalCount > 0 && remainingCount * totalDays < remainingDays * totalCount) {
            ratioNumerator = remainingCount;
            ratioDenominator = totalCount;
        }
        long refundAmount = BigDecimal.valueOf(totalAmount)
                .multiply(BigDecimal.valueOf(ratioNumerator))
                .divide(BigDecimal.valueOf(ratioDenominator), 0, RoundingMode.DOWN)
                .longValueExact();

        MembershipRefundPreviewDto preview = new MembershipRefundPreviewDto();
        preview.setMembershipName(mm.getMembership().getName());
        preview.setTotalDays(totalDays);
        preview.setRemainingDays(remainingDays);
        preview.setRemainingPeriodPercent(100.0 * remainingDays / totalDays);
        preview.setTotalCount(totalCount);
        preview.setRemainingCount(remainingCount);
        preview.setRemainingCountPercent(totalCount == null || totalCount == 0 ? null : 100.0 * remainingCount / totalCount);
        preview.setTotalAmount(totalAmount);
        preview.setRefundAmount(refundAmount);
        preview.setPeriodThresholdPercent(periodThreshold);
        preview.setCountThresholdPercent(countThreshold);
        preview.setRefundable(periodEligible && countEligible);
        return preview;
    }
}
