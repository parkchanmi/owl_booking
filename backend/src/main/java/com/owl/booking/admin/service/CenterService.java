package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.repository.CenterRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CenterService {

    private final CenterRepository centerRepository;

    public CenterService(CenterRepository centerRepository) {
        this.centerRepository = centerRepository;
    }

    public List<CenterDto> getAllCenters() {
        return centerRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public CenterDto createCenter(CenterDto centerDto) {
        Center center = Center.builder()
                .name(centerDto.getName())
                .bizNo(centerDto.getBizNo())
                .ceoName(centerDto.getCeoName())
                .bizName(centerDto.getBizName())
                .addr(centerDto.getAddr())
                .tel(centerDto.getTel())
                .build();

        return toDto(centerRepository.save(center));
    }

    public CenterDto updateCenter(String id, CenterDto centerDto) {
        Center center = centerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Center not found"));

        center.setName(centerDto.getName());
        center.setBizNo(centerDto.getBizNo());
        center.setCeoName(centerDto.getCeoName());
        center.setBizName(centerDto.getBizName());
        center.setAddr(centerDto.getAddr());
        center.setTel(centerDto.getTel());

        return toDto(centerRepository.save(center));
    }

    public void deleteCenter(String id) {
        if (!centerRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Center not found");
        }

        centerRepository.deleteById(id);
    }

    private CenterDto toDto(Center center) {
        CenterDto centerDto = new CenterDto();
        centerDto.setId(center.getId());
        centerDto.setName(center.getName());
        centerDto.setBizNo(center.getBizNo());
        centerDto.setCeoName(center.getCeoName());
        centerDto.setBizName(center.getBizName());
        centerDto.setAddr(center.getAddr());
        centerDto.setTel(center.getTel());
        return centerDto;
    }
}
