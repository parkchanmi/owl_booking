package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.CenterMemberService;
import com.owl.booking.model.dto.CenterMemberDto;
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
@RequestMapping("/api/admin/centermembers")
public class CenterMemberController {

    private final CenterMemberService centerMemberService;

    public CenterMemberController(CenterMemberService centerMemberService) {
        this.centerMemberService = centerMemberService;
    }

    @GetMapping
    public List<CenterMemberDto> getCenterMembers() {
        return centerMemberService.getAllCenterMembers();
    }

    @PostMapping
    public CenterMemberDto createCenterMember(@RequestBody CenterMemberDto centerMemberDto) {
        return centerMemberService.createCenterMember(centerMemberDto);
    }

    @PutMapping("/{id}")
    public CenterMemberDto updateCenterMember(@PathVariable String id, @RequestBody CenterMemberDto centerMemberDto) {
        return centerMemberService.updateCenterMember(id, centerMemberDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCenterMember(@PathVariable String id) {
        centerMemberService.deleteCenterMember(id);
        return ResponseEntity.noContent().build();
    }
}
