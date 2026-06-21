package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.MembershipService;
import com.owl.booking.model.dto.MembershipDto;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/memberships")
public class MembershipController {

    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping
    public List<MembershipDto> getMemberships() {
        return membershipService.getAllMemberships();
    }

    @PostMapping
    public MembershipDto createMembership(@RequestBody MembershipDto membershipDto) {
        return membershipService.createMembership(membershipDto);
    }

    @PutMapping("/{id}")
    public MembershipDto updateMembership(@PathVariable String id, @RequestBody MembershipDto membershipDto) {
        return membershipService.updateMembership(id, membershipDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMembership(@PathVariable String id) {
        membershipService.deleteMembership(id);
        return ResponseEntity.noContent().build();
    }
}
