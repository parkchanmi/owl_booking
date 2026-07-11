package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.AttendanceService;
import com.owl.booking.model.dto.AttendanceListDto;
import com.owl.booking.model.dto.AttendanceSaveDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping("/{realProgramId}")
    public List<AttendanceListDto> getAttendance(@PathVariable String realProgramId) {
        return attendanceService.getAttendanceList(realProgramId);
    }

    @PostMapping("/{realProgramId}")
    public List<AttendanceListDto> saveAttendance(
            @PathVariable String realProgramId,
            @RequestBody List<AttendanceSaveDto> records) {
        return attendanceService.saveAttendance(realProgramId, records);
    }
}
