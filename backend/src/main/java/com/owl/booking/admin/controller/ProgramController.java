package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.ProgramService;
import com.owl.booking.model.dto.ProgramDto;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PatchMapping("/{id}/pause")
    public ProgramDto pauseProgram(@PathVariable String id) {
        return programService.pauseProgram(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgram(@PathVariable String id) {
        boolean deleted = programService.deleteProgram(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Map.of("action", "deactivated"));
    }
}
