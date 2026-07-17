package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.CenterConfigService;
import com.owl.booking.model.dto.CenterConfigDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/center-configs")
public class CenterConfigController {

    private final CenterConfigService centerConfigService;

    public CenterConfigController(CenterConfigService centerConfigService) {
        this.centerConfigService = centerConfigService;
    }

    @GetMapping("/{centerId}")
    public CenterConfigDto getConfig(@PathVariable String centerId) {
        return centerConfigService.getByCenterId(centerId);
    }

    @PutMapping("/{centerId}")
    public CenterConfigDto updateConfig(@PathVariable String centerId, @RequestBody CenterConfigDto dto) {
        return centerConfigService.updateByCenterId(centerId, dto);
    }
}
