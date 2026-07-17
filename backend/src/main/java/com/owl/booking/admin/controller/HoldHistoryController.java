package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.HoldHistoryService;
import com.owl.booking.model.dto.HoldHistoryCreateRequestDto;
import com.owl.booking.model.dto.HoldHistoryDto;
import com.owl.booking.model.dto.HoldHistoryUpdateRequestDto;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/holdhistories")
public class HoldHistoryController {

    private final HoldHistoryService holdHistoryService;

    public HoldHistoryController(HoldHistoryService holdHistoryService) {
        this.holdHistoryService = holdHistoryService;
    }

    @GetMapping
    public List<HoldHistoryDto> getHoldHistories(@RequestParam String memberId) {
        return holdHistoryService.getByMemberId(memberId);
    }

    @PostMapping
    public HoldHistoryDto createHoldHistory(@RequestBody HoldHistoryCreateRequestDto request) {
        return holdHistoryService.createHoldHistory(request);
    }

    @PutMapping("/{id}")
    public HoldHistoryDto updateHoldHistory(@PathVariable String id, @RequestBody HoldHistoryUpdateRequestDto request) {
        return holdHistoryService.updateHoldHistory(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoldHistory(@PathVariable String id) {
        holdHistoryService.deleteHoldHistory(id);
        return ResponseEntity.noContent().build();
    }
}
