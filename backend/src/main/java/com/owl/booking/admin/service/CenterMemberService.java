package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterDto;
import com.owl.booking.model.dto.MemberDto;
import com.owl.booking.model.dto.CenterMemberDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.CenterMember;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.MemberRepository;
import com.owl.booking.model.repository.CenterMemberRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CenterMemberService {

    private final CenterMemberRepository centerMemberRepository;
    private final CenterRepository centerRepository;
    private final MemberRepository memberRepository;

    public CenterMemberService(
            CenterMemberRepository centerMemberRepository,
            CenterRepository centerRepository,
            MemberRepository memberRepository
    ) {
        this.centerMemberRepository = centerMemberRepository;
        this.centerRepository = centerRepository;
        this.memberRepository = memberRepository;
    }

    public List<CenterMemberDto> getAllCenterMembers() {
        return centerMemberRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public CenterMemberDto createCenterMember(CenterMemberDto centerMemberDto) {
        CenterMember centerMember = CenterMember.builder()
                .center(findCenter(centerMemberDto.getCenter()))
                .member(findMember(centerMemberDto.getMember()))
                .build();

        return toDto(centerMemberRepository.save(centerMember));
    }

    public CenterMemberDto updateCenterMember(String id, CenterMemberDto centerMemberDto) {
        CenterMember centerMember = centerMemberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "CenterMember not found"));

        centerMember.setCenter(findCenter(centerMemberDto.getCenter()));
        centerMember.setMember(findMember(centerMemberDto.getMember()));

        return toDto(centerMemberRepository.save(centerMember));
    }

    public void deleteCenterMember(String id) {
        if (!centerMemberRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "CenterMember not found");
        }

        centerMemberRepository.deleteById(id);
    }

    private Center findCenter(CenterDto centerDto) {
        if (centerDto == null || centerDto.getId() == null) {
            return null;
        }

        return centerRepository.findById(centerDto.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Center not found"));
    }

    private Member findMember(MemberDto memberDto) {
        if (memberDto == null || memberDto.getId() == null) {
            return null;
        }

        return memberRepository.findById(memberDto.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Member not found"));
    }

    private CenterMemberDto toDto(CenterMember centerMember) {
        if (centerMember == null) {
            return null;
        }

        CenterMemberDto dto = new CenterMemberDto();
        dto.setId(centerMember.getId());
        dto.setCenter(toCenterDto(centerMember.getCenter()));
        dto.setMember(toMemberDto(centerMember.getMember()));
        return dto;
    }

    private CenterDto toCenterDto(Center center) {
        if (center == null) {
            return null;
        }

        CenterDto centerDto = new CenterDto();
        centerDto.setId(center.getId());
        centerDto.setName(center.getName());
        centerDto.setBizNo(center.getBizNo());
        centerDto.setCeoName(center.getCeoName());
        centerDto.setBizName(center.getBizName());
        centerDto.setAddr(center.getAddr());
        centerDto.setTel(center.getTel());
        return centerDto;
    }

    private MemberDto toMemberDto(Member member) {
        if (member == null) {
            return null;
        }

        MemberDto memberDto = new MemberDto();
        memberDto.setId(member.getId());
        memberDto.setType(member.getType());
        memberDto.setLoginId(member.getLoginId());
        memberDto.setPwd(member.getPwd());
        memberDto.setName(member.getName());
        memberDto.setEmail(member.getEmail());
        memberDto.setHp(member.getHp());
        return memberDto;
    }
}
