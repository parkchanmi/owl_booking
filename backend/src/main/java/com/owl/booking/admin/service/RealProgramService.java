package com.owl.booking.admin.service;

import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.model.dto.RealProgramDto;
import com.owl.booking.model.repository.RealProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RealProgramService {

    @Autowired
    private RealProgramRepository realProgramRepository;

    public List<RealProgram> findAll() {
        return realProgramRepository.findAll();
    }

    public Optional<RealProgram> findById(String id) {
        return realProgramRepository.findById(id);
    }

    public RealProgram save(RealProgramDto realProgramDto) {
        RealProgram realProgram = new RealProgram();
        realProgram.setId(realProgramDto.getId());
        realProgram.setProgramDat(realProgramDto.getProgramDat());
        // Set center and program entities based on DTO
        return realProgramRepository.save(realProgram);
    }

    public void deleteById(String id) {
        realProgramRepository.deleteById(id);
    }
}