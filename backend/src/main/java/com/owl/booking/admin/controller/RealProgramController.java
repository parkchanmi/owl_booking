package com.owl.booking.admin.controller;

import com.owl.booking.model.dto.RealProgramDto;
import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.admin.service.RealProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/realprograms")
public class RealProgramController {

    @Autowired
    private RealProgramService realProgramService;

    @GetMapping
    public List<RealProgram> getAllRealPrograms() {
        return realProgramService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RealProgram> getRealProgramById(@PathVariable String id) {
        return realProgramService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public RealProgram createRealProgram(@RequestBody RealProgramDto realProgramDto) {
        return realProgramService.save(realProgramDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRealProgram(@PathVariable String id) {
        realProgramService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}