package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.MemberMembershipService;
import com.owl.booking.model.dto.MemberMembershipCreateRequestDto;
import com.owl.booking.model.dto.MemberMembershipDto;
import com.owl.booking.model.dto.MemberMembershipUpdateRequestDto;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/membermemberships")
public class MemberMembershipController {

    private final MemberMembershipService memberMembershipService;

    public MemberMembershipController(MemberMembershipService memberMembershipService) {
        this.memberMembershipService = memberMembershipService;
    }

    @GetMapping
    public List<MemberMembershipDto> getMemberMemberships(@RequestParam String memberId) {
        return memberMembershipService.getByMemberId(memberId);
    }

    @PostMapping
    public MemberMembershipDto createMemberMembership(@RequestBody MemberMembershipCreateRequestDto request) {
        return memberMembershipService.createMemberMembership(request);
    }

    @PutMapping("/{id}")
    public MemberMembershipDto updateMemberMembership(
            @PathVariable String id,
            @RequestBody MemberMembershipUpdateRequestDto request
    ) {
        return memberMembershipService.updateEditableFields(id, request);
    }
}
