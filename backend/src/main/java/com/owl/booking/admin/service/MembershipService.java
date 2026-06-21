package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterDto;
import com.owl.booking.model.dto.MembershipDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.Membership;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.MembershipRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final CenterRepository centerRepository;

    public MembershipService(MembershipRepository membershipRepository, CenterRepository centerRepository) {
        this.membershipRepository = membershipRepository;
        this.centerRepository = centerRepository;
    }

    public List<MembershipDto> getAllMemberships() {
        return membershipRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public MembershipDto createMembership(MembershipDto membershipDto) {
        Membership membership = Membership.builder()
                .name(membershipDto.getName())
                .useCnt(membershipDto.getUseCnt())
                .durationDays(membershipDto.getDurationDays())
                .holdDays(membershipDto.getHoldDays())
                .price(membershipDto.getPrice())
                .status(membershipDto.getStatus())
                .center(findCenter(membershipDto.getCenter()))
                .build();

        return toDto(membershipRepository.save(membership));
    }

    public MembershipDto updateMembership(String id, MembershipDto membershipDto) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Membership not found"));

        membership.setName(membershipDto.getName());
        membership.setUseCnt(membershipDto.getUseCnt());
        membership.setDurationDays(membershipDto.getDurationDays());
        membership.setHoldDays(membershipDto.getHoldDays());
        membership.setPrice(membershipDto.getPrice());
        membership.setStatus(membershipDto.getStatus());
        membership.setCenter(findCenter(membershipDto.getCenter()));

        return toDto(membershipRepository.save(membership));
    }

    public void deleteMembership(String id) {
        if (!membershipRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Membership not found");
        }

        membershipRepository.deleteById(id);
    }

    private Center findCenter(CenterDto centerDto) {
        if (centerDto == null || centerDto.getId() == null) {
            return null;
        }

        return centerRepository.findById(centerDto.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Center not found"));
    }

    private MembershipDto toDto(Membership membership) {
        MembershipDto membershipDto = new MembershipDto();
        membershipDto.setId(membership.getId());
        membershipDto.setName(membership.getName());
        membershipDto.setUseCnt(membership.getUseCnt());
        membershipDto.setDurationDays(membership.getDurationDays());
        membershipDto.setHoldDays(membership.getHoldDays());
        membershipDto.setPrice(membership.getPrice());
        membershipDto.setStatus(membership.getStatus());
        membershipDto.setCenter(toCenterDto(membership.getCenter()));
        return membershipDto;
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
}
