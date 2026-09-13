package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterDto;
import com.owl.booking.model.dto.InstructorDto;
import com.owl.booking.model.dto.MemberDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.Instructor;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.type.MemberType;
import com.owl.booking.model.repository.CenterMemberRepository;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.InstructorRepository;
import com.owl.booking.model.repository.MemberRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class InstructorService {

    private final InstructorRepository instructorRepository;
    private final CenterRepository centerRepository;
    private final CenterMemberRepository centerMemberRepository;
    private final MemberRepository memberRepository;

    public InstructorService(
            InstructorRepository instructorRepository,
            CenterRepository centerRepository,
            CenterMemberRepository centerMemberRepository,
            MemberRepository memberRepository
    ) {
        this.instructorRepository = instructorRepository;
        this.centerRepository = centerRepository;
        this.centerMemberRepository = centerMemberRepository;
        this.memberRepository = memberRepository;
    }

    public List<InstructorDto> getAllInstructors() {
        return instructorRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public InstructorDto createInstructor(InstructorDto instructorDto) {
        Center center = findRequiredCenter(instructorDto.getCenter());
        Member member = findMember(instructorDto.getMember());
        validateCenterAdmin(center, member);

        Instructor instructor = Instructor.builder()
                .name(instructorDto.getName())
                .hp(instructorDto.getHp())
                .info(instructorDto.getInfo())
                .member(member)
                .center(center)
                .build();

        return toDto(instructorRepository.save(instructor));
    }

    public InstructorDto updateInstructor(String id, InstructorDto instructorDto) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Instructor not found"));
        Center center = findRequiredCenter(instructorDto.getCenter());
        Member member = findMember(instructorDto.getMember());
        validateCenterAdmin(center, member);

        instructor.setName(instructorDto.getName());
        instructor.setHp(instructorDto.getHp());
        instructor.setInfo(instructorDto.getInfo());
        instructor.setMember(member);
        instructor.setCenter(center);

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

    private Center findRequiredCenter(CenterDto centerDto) {
        Center center = findCenter(centerDto);
        if (center == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Instructor center is required");
        }
        return center;
    }

    private Member findMember(MemberDto memberDto) {
        if (memberDto == null || memberDto.getId() == null) {
            return null;
        }

        Member member = memberRepository.findById(memberDto.getId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Member not found"));
        if (member.getType() != MemberType.ADMIN) {
            throw new ResponseStatusException(BAD_REQUEST, "Instructor must be linked to admin user");
        }
        return member;
    }

    private void validateCenterAdmin(Center center, Member member) {
        if (member == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Instructor must be linked to admin user");
        }
        if (!centerMemberRepository.existsByCenter_IdAndMember_Id(center.getId(), member.getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Admin user must be linked to selected center");
        }
    }

    private InstructorDto toDto(Instructor instructor) {
        InstructorDto instructorDto = new InstructorDto();
        instructorDto.setId(instructor.getId());
        instructorDto.setName(instructor.getName());
        instructorDto.setHp(instructor.getHp());
        instructorDto.setInfo(instructor.getInfo());
        instructorDto.setMember(toMemberDto(instructor.getMember()));
        instructorDto.setCenter(toCenterDto(instructor.getCenter()));
        return instructorDto;
    }

    private MemberDto toMemberDto(Member member) {
        if (member == null) {
            return null;
        }

        MemberDto memberDto = new MemberDto();
        memberDto.setId(member.getId());
        memberDto.setType(member.getType());
        memberDto.setLoginId(member.getLoginId());
        memberDto.setName(member.getName());
        memberDto.setEmail(member.getEmail());
        memberDto.setHp(member.getHp());
        memberDto.setStatus(member.getStatus());
        return memberDto;
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
