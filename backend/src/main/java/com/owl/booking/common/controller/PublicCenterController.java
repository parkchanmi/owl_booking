package com.owl.booking.common.controller;

import com.owl.booking.admin.service.CenterService;
import com.owl.booking.model.dto.CenterDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// 회원용 센터 목록 조회 (예약 화면 등에서 사용, 관리자 소속 여부와 무관)
@RestController
@RequestMapping("/api/centers")
public class PublicCenterController {

    @Autowired
    private CenterService centerService;

    @GetMapping
    public List<CenterDto> getCenters() {
        return centerService.getAllCentersPublic();
    }
}
