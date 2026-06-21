package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterDto;
import com.owl.booking.model.dto.InstructorDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.Instructor;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.InstructorRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class InstructorService {

    private final InstructorRepository instructorRepository;
    private final CenterRepository centerRepository;

    public InstructorService(InstructorRepository instructorRepository, CenterRepository centerRepository) {
        this.instructorRepository = instructorRepository;
        this.centerRepository = centerRepository;
    }

    public List<InstructorDto> getAllInstructors() {
        return instructorRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public InstructorDto createInstructor(InstructorDto instructorDto) {
        Instructor instructor = Instructor.builder()
                .name(instructorDto.getName())
                .hp(instructorDto.getHp())
                .info(instructorDto.getInfo())
                .center(findCenter(instructorDto.getCenter()))
                .build();

        return toDto(instructorRepository.save(instructor));
    }

    public InstructorDto updateInstructor(String id, InstructorDto instructorDto) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Instructor not found"));

        instructor.setName(instructorDto.getName());
        instructor.setHp(instructorDto.getHp());
        instructor.setInfo(instructorDto.getInfo());
        instructor.setCenter(findCenter(instructorDto.getCenter()));

        return toDto(instructorRepository.save(instructor));
    }

    public void deleteInstructor(String id) {
        if (!instructorRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Instructor not found");
        }

        instructorRepository.deleteById(id);
    }

    private Center findCenter(CenterDto centerDto) {
        if (centerDto == null || centerDto.getId() == null) {
            return null;
        }

        return centerRepository.findById(centerDto.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Center not found"));
    }

    private InstructorDto toDto(Instructor instructor) {
        InstructorDto instructorDto = new InstructorDto();
        instructorDto.setId(instructor.getId());
        instructorDto.setName(instructor.getName());
        instructorDto.setHp(instructor.getHp());
        instructorDto.setInfo(instructor.getInfo());
        instructorDto.setCenter(toCenterDto(instructor.getCenter()));
        return instructorDto;
    }

    private CenterDto toCenterDto(Center center) {
        if (center == null) {
            return null;
        }

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
