package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.CenterService;
import com.owl.booking.model.dto.CenterDto;
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
@RequestMapping("/api/admin/centers")
public class CenterController {

    private final CenterService centerService;

    public CenterController(CenterService centerService) {
        this.centerService = centerService;
    }

    @GetMapping
    public List<CenterDto> getCenters() {
        return centerService.getAllCenters();
    }

    @PostMapping
    public CenterDto createCenter(@RequestBody CenterDto centerDto) {
        return centerService.createCenter(centerDto);
    }

    @PutMapping("/{id}")
    public CenterDto updateCenter(@PathVariable String id, @RequestBody CenterDto centerDto) {
        return centerService.updateCenter(id, centerDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCenter(@PathVariable String id) {
        centerService.deleteCenter(id);
        return ResponseEntity.noContent().build();
    }
}
