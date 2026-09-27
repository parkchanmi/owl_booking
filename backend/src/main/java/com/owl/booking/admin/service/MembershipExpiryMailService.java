package com.owl.booking.admin.service;

import com.owl.booking.common.service.MailService;
import com.owl.booking.model.dto.CenterConfigDto;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.type.MemberStatus;
import com.owl.booking.model.repository.MemberMembershipRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class MembershipExpiryMailService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy년 M월 d일");

    private final MemberMembershipRepository memberMembershipRepository;
    private final CenterConfigService centerConfigService;
    private final MemberMembershipService memberMembershipService;
    private final MailService mailService;

    public MembershipExpiryMailService(
            MemberMembershipRepository memberMembershipRepository,
            CenterConfigService centerConfigService,
            MemberMembershipService memberMembershipService,
            MailService mailService
    ) {
        this.memberMembershipRepository = memberMembershipRepository;
        this.centerConfigService = centerConfigService;
        this.memberMembershipService = memberMembershipService;
        this.mailService = mailService;
    }

    public Map<String, Integer> sendForCenter(String centerId) {
        CenterConfigDto config = centerConfigService.getByCenterId(centerId);
        int countThreshold = config.getMembershipExpiryCountThreshold();
        int daysThreshold = config.getMembershipExpiryDaysThreshold();
        String subjectTemplate = config.getMembershipExpiryEmailSubject();
        String bodyTemplate = config.getMembershipExpiryEmailTemplate();

        if (subjectTemplate == null || subjectTemplate.isBlank()
                || bodyTemplate == null || bodyTemplate.isBlank()) {
            throw new IllegalStateException("이용권 만료 메일 템플릿이 설정되지 않았습니다.");
        }

        int targetCount = 0;
        int sentCount = 0;
        int failedCount = 0;
        LocalDate today = LocalDate.now();

        for (MemberMembership memberMembership : memberMembershipRepository.findByCenter_Id(centerId)) {
            if (!isEligible(memberMembership, today, countThreshold, daysThreshold)) {
                continue;
            }

            targetCount++;
            long remainingCount = calculateRemainingCount(memberMembership);
            try {
                mailService.sendHtmlMessage(
                        memberMembership.getMember().getEmail(),
                        replaceVariables(subjectTemplate, memberMembership, remainingCount),
                        replaceVariables(bodyTemplate, memberMembership, remainingCount)
                );
                sentCount++;
            } catch (RuntimeException exception) {
                failedCount++;
            }
        }

        Map<String, Integer> result = new LinkedHashMap<>();
        result.put("targetCount", targetCount);
        result.put("sentCount", sentCount);
        result.put("failedCount", failedCount);
        return result;
    }

    private boolean isEligible(
            MemberMembership memberMembership,
            LocalDate today,
            int countThreshold,
            int daysThreshold
    ) {
        if (memberMembership.getRefundedAt() != null
                || memberMembership.getMember() == null
                || memberMembership.getMember().getStatus() != MemberStatus.ACTIVE
                || memberMembership.getMember().getEmail() == null
                || memberMembership.getMember().getEmail().isBlank()
                || memberMembership.getCenter() == null
                || memberMembership.getMembership() == null
                || memberMembership.getStartDat() == null
                || memberMembership.getEndDat() == null) {
            return false;
        }

        LocalDate startDate = memberMembership.getStartDat().toLocalDate();
        LocalDate endDate = memberMembership.getEndDat().toLocalDate();
        if (today.isBefore(startDate) || today.isAfter(endDate)) {
            return false;
        }

        long remainingDays = ChronoUnit.DAYS.between(today, endDate);
        boolean countEligible = memberMembership.getUCnt() != null
                && calculateRemainingCount(memberMembership) <= countThreshold;
        boolean daysEligible = remainingDays <= daysThreshold;
        return countEligible || daysEligible;
    }

    private long calculateRemainingCount(MemberMembership memberMembership) {
        if (memberMembership.getUCnt() == null) {
            return 0L;
        }
        return Math.max(0L, memberMembership.getUCnt() - memberMembershipService.calculateUsedCount(memberMembership));
    }

    private String replaceVariables(String template, MemberMembership memberMembership, long remainingCount) {
        return template
                .replace("{회원명}", memberMembership.getMember().getName())
                .replace("{센터명}", memberMembership.getCenter().getName())
                .replace("{이용권명}", memberMembership.getMembership().getName())
                .replace("{잔여횟수}", String.valueOf(remainingCount))
                .replace("{만료일}", DATE_FORMAT.format(memberMembership.getEndDat().toLocalDate()));
    }
}
