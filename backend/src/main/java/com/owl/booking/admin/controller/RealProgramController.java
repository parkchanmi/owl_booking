package com.owl.booking.admin.controller;

import com.owl.booking.model.dto.RealProgramDetailDto;
import com.owl.booking.model.dto.RealProgramDto;
import com.owl.booking.model.dto.RealProgramListItemDto;
import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.admin.service.RealProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/realprograms")
public class RealProgramController {

    @Autowired
    private RealProgramService realProgramService;

    @GetMapping
    public List<RealProgramListItemDto> getAllRealPrograms() {
        return realProgramService.findAllSummary();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RealProgram> getRealProgramById(@PathVariable String id) {
        return realProgramService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<RealProgramDetailDto> getRealProgramDetail(@PathVariable String id) {
        try {
            return ResponseEntity.ok(realProgramService.getDetail(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public RealProgram createRealProgram(@RequestBody RealProgramDto realProgramDto) {
        return realProgramService.save(realProgramDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RealProgram> updateRealProgram(@PathVariable String id, @RequestBody RealProgramDto realProgramDto) {
        realProgramDto.setId(id);
        return ResponseEntity.ok(realProgramService.save(realProgramDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRealProgram(@PathVariable String id) {
        try {
            realProgramService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        }
    }
}