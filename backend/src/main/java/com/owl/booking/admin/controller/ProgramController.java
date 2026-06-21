package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.ProgramService;
import com.owl.booking.model.dto.ProgramDto;
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
@RequestMapping("/api/admin/programs")
public class ProgramController {

    private final ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }

    @GetMapping
    public List<ProgramDto> getPrograms() {
        return programService.getAllPrograms();
    }

    @PostMapping
    public ProgramDto createProgram(@RequestBody ProgramDto programDto) {
        return programService.createProgram(programDto);
    }

    @PutMapping("/{id}")
    public ProgramDto updateProgram(@PathVariable String id, @RequestBody ProgramDto programDto) {
        return programService.updateProgram(id, programDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable String id) {
        programService.deleteProgram(id);
        return ResponseEntity.noContent().build();
    }
}
