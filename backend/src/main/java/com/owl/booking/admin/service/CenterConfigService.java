package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterConfigDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.CenterConfig;
import com.owl.booking.model.entity.type.ConfirmMode;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.CenterRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CenterConfigService {

    private final CenterConfigRepository centerConfigRepository;
    private final CenterRepository centerRepository;

    public CenterConfigService(CenterConfigRepository centerConfigRepository, CenterRepository centerRepository) {
        this.centerConfigRepository = centerConfigRepository;
        this.centerRepository = centerRepository;
    }

    public CenterConfigDto getByCenterId(String centerId) {
        CenterConfig config = centerConfigRepository.findByCenter_Id(centerId)
                .orElseGet(() -> createDefault(centerId));
        return toDto(config);
    }

    public CenterConfigDto updateByCenterId(String centerId, CenterConfigDto dto) {
        CenterConfig config = centerConfigRepository.findByCenter_Id(centerId)
                .orElseGet(() -> createDefault(centerId));

        if (dto.getConfirmMode() != null) config.setConfirmMode(dto.getConfirmMode());
        if (dto.getWaitlistCapacity() != null) config.setWaitlistCapacity(dto.getWaitlistCapacity());
        if (dto.getCancleDeadlineMinutes() != null) config.setCancleDeadlineMinutes(dto.getCancleDeadlineMinutes());
        if (dto.getBookingOpenDays() != null) config.setBookingOpenDays(dto.getBookingOpenDays());
        if (dto.getGenerationStartDat() != null) config.setGenerationStartDat(dto.getGenerationStartDat());
        if (dto.getAutoGenerateEnabled() != null) config.setAutoGenerateEnabled(dto.getAutoGenerateEnabled());
        if (dto.getGenerationDaysOfWeek() != null) config.setGenerationDaysOfWeek(dto.getGenerationDaysOfWeek());

        return toDto(centerConfigRepository.save(config));
    }

    private CenterConfig createDefault(String centerId) {
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Center not found"));
        CenterConfig config = CenterConfig.builder()
                .confirmMode(ConfirmMode.AUTO)
                .bookingOpenDays(7L)
                .generationStartDat(14L)
                .autoGenerateEnabled(true)
                .generationDaysOfWeek("월,화,수,목,금,토,일")
                .center(center)
                .build();
        return centerConfigRepository.save(config);
    }

    private CenterConfigDto toDto(CenterConfig config) {
        CenterConfigDto dto = new CenterConfigDto();
        dto.setId(config.getId());
        dto.setConfirmMode(config.getConfirmMode());
        dto.setWaitlistCapacity(config.getWaitlistCapacity());
        dto.setCancleDeadlineMinutes(config.getCancleDeadlineMinutes());
        dto.setBookingOpenDays(config.getBookingOpenDays());
        dto.setGenerationStartDat(config.getGenerationStartDat());
        dto.setAutoGenerateEnabled(config.getAutoGenerateEnabled());
        dto.setGenerationDaysOfWeek(config.getGenerationDaysOfWeek());
        return dto;
    }
}
