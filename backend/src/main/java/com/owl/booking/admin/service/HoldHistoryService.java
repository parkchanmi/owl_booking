package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterDto;
import com.owl.booking.model.dto.HoldHistoryCreateRequestDto;
import com.owl.booking.model.dto.HoldHistoryDto;
import com.owl.booking.model.dto.HoldHistoryUpdateRequestDto;
import com.owl.booking.model.dto.MemberMembershipDto;
import com.owl.booking.model.dto.MembershipDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.HoldHistory;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.Membership;
import com.owl.booking.model.entity.type.MemberStatus;
import com.owl.booking.model.repository.HoldHistoryRepository;
import com.owl.booking.model.repository.MemberMembershipRepository;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class HoldHistoryService {

    private final HoldHistoryRepository holdHistoryRepository;
    private final MemberMembershipRepository memberMembershipRepository;

    public HoldHistoryService(
            HoldHistoryRepository holdHistoryRepository,
            MemberMembershipRepository memberMembershipRepository
    ) {
        this.holdHistoryRepository = holdHistoryRepository;
        this.memberMembershipRepository = memberMembershipRepository;
    }

    public List<HoldHistoryDto> getByMemberId(String memberId) {
        return holdHistoryRepository.findByMm_Member_Id(memberId).stream()
                .map(this::toDto)
                .toList();
    }

    // 보류 시작~종료일의 실제 일수를 계산하여 저장 (종료일 포함 계산)
    public HoldHistoryDto createHoldHistory(HoldHistoryCreateRequestDto request) {
        MemberMembership mm = memberMembershipRepository.findById(request.getMmId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "MemberMembership not found"));
        validateNotWithdrawn(mm);
        long hDay = calculateHDay(request.getStartDat(), request.getEndDat());
        validateHoldPeriod(mm, request.getStartDat(), request.getEndDat(), hDay, null);

        HoldHistory holdHistory = HoldHistory.builder()
                .startDat(request.getStartDat())
                .endDat(request.getEndDat())
                .hDay(hDay)
                .mm(mm)
                .build();

        return toDto(holdHistoryRepository.save(holdHistory));
    }

    public HoldHistoryDto updateHoldHistory(String id, HoldHistoryUpdateRequestDto request) {
        HoldHistory holdHistory = holdHistoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "HoldHistory not found"));
        validateNotWithdrawn(holdHistory.getMm());
        long hDay = calculateHDay(request.getStartDat(), request.getEndDat());
        validateHoldPeriod(holdHistory.getMm(), request.getStartDat(), request.getEndDat(), hDay, holdHistory.getId());

        holdHistory.setStartDat(request.getStartDat());
        holdHistory.setEndDat(request.getEndDat());
        holdHistory.setHDay(hDay);

        return toDto(holdHistoryRepository.save(holdHistory));
    }

    public void deleteHoldHistory(String id) {
        if (!holdHistoryRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "HoldHistory not found");
        }
        holdHistoryRepository.deleteById(id);
    }

    private long calculateHDay(LocalDateTime startDat, LocalDateTime endDat) {
        if (startDat == null || endDat == null || endDat.toLocalDate().isBefore(startDat.toLocalDate())) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid hold date range");
        }
        return ChronoUnit.DAYS.between(startDat.toLocalDate(), endDat.toLocalDate()) + 1;
    }

    private void validateNotWithdrawn(MemberMembership mm) {
        if (mm != null && mm.getMember() != null && mm.getMember().getStatus() == MemberStatus.WITHDRAWN) {
            throw new ResponseStatusException(BAD_REQUEST, "Withdrawn member cannot be changed");
        }
    }

    private void validateHoldPeriod(
            MemberMembership mm,
            LocalDateTime startDat,
            LocalDateTime endDat,
            long hDay,
            String excludedId
    ) {
        if (startDat.toLocalDate().isBefore(mm.getStartDat().toLocalDate())
                || endDat.toLocalDate().isAfter(mm.getEndDat().toLocalDate())) {
            throw new ResponseStatusException(BAD_REQUEST, "Hold date range must be within membership date range");
        }

        boolean overlaps = holdHistoryRepository.findByMm_Id(mm.getId()).stream()
                .filter(history -> excludedId == null || !excludedId.equals(history.getId()))
                .anyMatch(history -> rangesOverlap(startDat, endDat, history.getStartDat(), history.getEndDat()));
        if (overlaps) {
            throw new ResponseStatusException(BAD_REQUEST, "Hold date range overlaps existing hold history");
        }

        long usedHoldDays = holdHistoryRepository.findByMm_Id(mm.getId()).stream()
                .filter(history -> excludedId == null || !excludedId.equals(history.getId()))
                .mapToLong(HoldHistory::getHDay)
                .sum();
        long availableHoldDays = mm.getHDay() == null ? 0L : mm.getHDay();
        if (usedHoldDays + hDay > availableHoldDays) {
            throw new ResponseStatusException(BAD_REQUEST, "Hold days exceed remaining hold days");
        }
    }

    private boolean rangesOverlap(
            LocalDateTime startA,
            LocalDateTime endA,
            LocalDateTime startB,
            LocalDateTime endB
    ) {
        return !endA.toLocalDate().isBefore(startB.toLocalDate())
                && !startA.toLocalDate().isAfter(endB.toLocalDate());
    }

    private HoldHistoryDto toDto(HoldHistory holdHistory) {
        HoldHistoryDto dto = new HoldHistoryDto();
        dto.setId(holdHistory.getId());
        dto.setStartDat(holdHistory.getStartDat());
        dto.setEndDat(holdHistory.getEndDat());
        dto.setHDay(holdHistory.getHDay());
        dto.setMm(toMemberMembershipDto(holdHistory.getMm()));
        return dto;
    }

    private MemberMembershipDto toMemberMembershipDto(MemberMembership mm) {
        if (mm == null) return null;
        MemberMembershipDto dto = new MemberMembershipDto();
        dto.setId(mm.getId());
        dto.setCenter(toCenterDto(mm.getCenter()));
        dto.setMembership(toMembershipDto(mm.getMembership()));
        return dto;
    }

    private CenterDto toCenterDto(Center center) {
        if (center == null) return null;
        CenterDto dto = new CenterDto();
        dto.setId(center.getId());
        dto.setName(center.getName());
        return dto;
    }

    private MembershipDto toMembershipDto(Membership membership) {
        if (membership == null) return null;
        MembershipDto dto = new MembershipDto();
        dto.setId(membership.getId());
        dto.setName(membership.getName());
        return dto;
    }
}
