package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterDto;
import com.owl.booking.model.dto.InstructorDto;
import com.owl.booking.model.dto.ProgramDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.Instructor;
import com.owl.booking.model.entity.Program;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.InstructorRepository;
import com.owl.booking.model.repository.ProgramRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ProgramService {

    private final ProgramRepository programRepository;
    private final CenterRepository centerRepository;
    private final InstructorRepository instructorRepository;

    public ProgramService(
            ProgramRepository programRepository,
            CenterRepository centerRepository,
            InstructorRepository instructorRepository
    ) {
        this.programRepository = programRepository;
        this.centerRepository = centerRepository;
        this.instructorRepository = instructorRepository;
    }

    public List<ProgramDto> getAllPrograms() {
        return programRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public ProgramDto createProgram(ProgramDto programDto) {
        Program program = Program.builder()
                .name(programDto.getName())
                .dayOfWeek(programDto.getDayOfWeek())
                .startTime(programDto.getStartTime())
                .endTime(programDto.getEndTime())
                .maxCapacity(programDto.getMaxCapacity())
                .center(findCenter(programDto.getCenter()))
                .instructor(findInstructor(programDto.getInstructor()))
                .build();

        return toDto(programRepository.save(program));
    }

    public ProgramDto updateProgram(String id, ProgramDto programDto) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Program not found"));

        program.setName(programDto.getName());
        program.setDayOfWeek(programDto.getDayOfWeek());
        program.setStartTime(programDto.getStartTime());
        program.setEndTime(programDto.getEndTime());
        program.setMaxCapacity(programDto.getMaxCapacity());
        program.setCenter(findCenter(programDto.getCenter()));
        program.setInstructor(findInstructor(programDto.getInstructor()));

        return toDto(programRepository.save(program));
    }

    public void deleteProgram(String id) {
        if (!programRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Program not found");
        }

        programRepository.deleteById(id);
    }

    private Center findCenter(CenterDto centerDto) {
        if (centerDto == null || centerDto.getId() == null) {
            return null;
        }

        return centerRepository.findById(centerDto.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Center not found"));
    }

    private Instructor findInstructor(InstructorDto instructorDto) {
        if (instructorDto == null || instructorDto.getId() == null) {
            return null;
        }

        return instructorRepository.findById(instructorDto.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Instructor not found"));
    }

    private ProgramDto toDto(Program program) {
        ProgramDto programDto = new ProgramDto();
        programDto.setId(program.getId());
        programDto.setName(program.getName());
        programDto.setDayOfWeek(program.getDayOfWeek());
        programDto.setStartTime(program.getStartTime());
        programDto.setEndTime(program.getEndTime());
        programDto.setMaxCapacity(program.getMaxCapacity());
        programDto.setCenter(toCenterDto(program.getCenter()));
        programDto.setInstructor(toInstructorDto(program.getInstructor()));
        return programDto;
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

    private InstructorDto toInstructorDto(Instructor instructor) {
        if (instructor == null) {
            return null;
        }

        InstructorDto instructorDto = new InstructorDto();
        instructorDto.setId(instructor.getId());
        instructorDto.setName(instructor.getName());
        instructorDto.setHp(instructor.getHp());
        instructorDto.setInfo(instructor.getInfo());
        instructorDto.setCenter(toCenterDto(instructor.getCenter()));
        return instructorDto;
    }
}
