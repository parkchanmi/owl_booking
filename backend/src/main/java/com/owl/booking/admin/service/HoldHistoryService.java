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
import com.owl.booking.model.repository.HoldHistoryRepository;
import com.owl.booking.model.repository.MemberMembershipRepository;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

        HoldHistory holdHistory = HoldHistory.builder()
                .startDat(request.getStartDat())
                .endDat(request.getEndDat())
                .hDay(calculateHDay(request.getStartDat(), request.getEndDat()))
                .mm(mm)
                .build();

        return toDto(holdHistoryRepository.save(holdHistory));
    }

    public HoldHistoryDto updateHoldHistory(String id, HoldHistoryUpdateRequestDto request) {
        HoldHistory holdHistory = holdHistoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "HoldHistory not found"));

        holdHistory.setStartDat(request.getStartDat());
        holdHistory.setEndDat(request.getEndDat());
        holdHistory.setHDay(calculateHDay(request.getStartDat(), request.getEndDat()));

        return toDto(holdHistoryRepository.save(holdHistory));
    }

    public void deleteHoldHistory(String id) {
        if (!holdHistoryRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "HoldHistory not found");
        }
        holdHistoryRepository.deleteById(id);
    }

    private long calculateHDay(java.time.LocalDateTime startDat, java.time.LocalDateTime endDat) {
        return ChronoUnit.DAYS.between(startDat.toLocalDate(), endDat.toLocalDate()) + 1;
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
