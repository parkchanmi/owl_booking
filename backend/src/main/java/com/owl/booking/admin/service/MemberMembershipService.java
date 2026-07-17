package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterDto;
import com.owl.booking.model.dto.MemberDto;
import com.owl.booking.model.dto.MemberMembershipCreateRequestDto;
import com.owl.booking.model.dto.MemberMembershipDto;
import com.owl.booking.model.dto.MemberMembershipUpdateRequestDto;
import com.owl.booking.model.dto.MembershipDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.Membership;
import com.owl.booking.model.entity.type.AttendanceStatus;
import com.owl.booking.model.repository.AttendanceRepository;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.HoldHistoryRepository;
import com.owl.booking.model.repository.MemberMembershipRepository;
import com.owl.booking.model.repository.MemberRepository;
import com.owl.booking.model.repository.MembershipRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MemberMembershipService {

    private final MemberMembershipRepository memberMembershipRepository;
    private final MemberRepository memberRepository;
    private final CenterRepository centerRepository;
    private final MembershipRepository membershipRepository;
    private final AttendanceRepository attendanceRepository;
    private final HoldHistoryRepository holdHistoryRepository;

    public MemberMembershipService(
            MemberMembershipRepository memberMembershipRepository,
            MemberRepository memberRepository,
            CenterRepository centerRepository,
            MembershipRepository membershipRepository,
            AttendanceRepository attendanceRepository,
            HoldHistoryRepository holdHistoryRepository
    ) {
        this.memberMembershipRepository = memberMembershipRepository;
        this.memberRepository = memberRepository;
        this.centerRepository = centerRepository;
        this.membershipRepository = membershipRepository;
        this.attendanceRepository = attendanceRepository;
        this.holdHistoryRepository = holdHistoryRepository;
    }

    public List<MemberMembershipDto> getByMemberId(String memberId) {
        return memberMembershipRepository.findByMember_Id(memberId).stream()
                .map(this::toDto)
                .toList();
    }

    // 이용권 등록: 이용권 템플릿(Membership) 기준으로 종료일/이용가능횟수/보류가능일수를 계산하여 발급
    public MemberMembershipDto createMemberMembership(MemberMembershipCreateRequestDto request) {
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Member not found"));
        Center center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Center not found"));
        Membership membership = membershipRepository.findById(request.getMembershipId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Membership not found"));

        MemberMembership mm = MemberMembership.builder()
                .startDat(request.getStartDat())
                .endDat(request.getStartDat().plusDays(membership.getDurationDays()))
                .uCnt(membership.getUseCnt())
                .hDay(membership.getHoldDays())
                .center(center)
                .member(member)
                .membership(membership)
                .build();

        return toDto(memberMembershipRepository.save(mm));
    }

    // 시작일/종료일/잔여횟수/보류가능일자 수정
    public MemberMembershipDto updateEditableFields(String id, MemberMembershipUpdateRequestDto request) {
        MemberMembership mm = memberMembershipRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "MemberMembership not found"));

        mm.setStartDat(request.getStartDat());
        mm.setEndDat(request.getEndDat());
        mm.setUCnt(request.getUCnt());
        mm.setHDay(request.getHDay());

        return toDto(memberMembershipRepository.save(mm));
    }

    private MemberMembershipDto toDto(MemberMembership mm) {
        MemberMembershipDto dto = new MemberMembershipDto();
        dto.setId(mm.getId());
        dto.setStartDat(mm.getStartDat());
        dto.setEndDat(mm.getEndDat());
        dto.setUCnt(mm.getUCnt());
        dto.setHDay(mm.getHDay());
        dto.setActualUsedCount(mm.getMember() != null
                ? attendanceRepository.countByMember_IdAndStatusAndRealProgram_ProgramDatBetween(
                        mm.getMember().getId(), AttendanceStatus.PRESENT, mm.getStartDat(), mm.getEndDat())
                : 0L);
        dto.setActualHoldDays(holdHistoryRepository.sumHDayByMmId(mm.getId()));
        dto.setCenter(toCenterDto(mm.getCenter()));
        dto.setMember(toMemberDto(mm.getMember()));
        dto.setMembership(toMembershipDto(mm.getMembership()));
        return dto;
    }

    private CenterDto toCenterDto(Center center) {
        if (center == null) return null;
        CenterDto dto = new CenterDto();
        dto.setId(center.getId());
        dto.setName(center.getName());
        dto.setBizNo(center.getBizNo());
        dto.setCeoName(center.getCeoName());
        dto.setBizName(center.getBizName());
        dto.setAddr(center.getAddr());
        dto.setTel(center.getTel());
        return dto;
    }

    private MemberDto toMemberDto(Member member) {
        if (member == null) return null;
        MemberDto dto = new MemberDto();
        dto.setId(member.getId());
        dto.setType(member.getType());
        dto.setLoginId(member.getLoginId());
        dto.setName(member.getName());
        dto.setEmail(member.getEmail());
        dto.setHp(member.getHp());
        return dto;
    }

    private MembershipDto toMembershipDto(Membership membership) {
        if (membership == null) return null;
        MembershipDto dto = new MembershipDto();
        dto.setId(membership.getId());
        dto.setName(membership.getName());
        dto.setUseCnt(membership.getUseCnt());
        dto.setDurationDays(membership.getDurationDays());
        dto.setHoldDays(membership.getHoldDays());
        dto.setPrice(membership.getPrice());
        dto.setStatus(membership.getStatus());
        return dto;
    }
}
