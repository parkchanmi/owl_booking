package com.owl.booking.admin.service;

import com.owl.booking.model.dto.RealProgramDetailDto;
import com.owl.booking.model.dto.RealProgramListItemDto;
import com.owl.booking.model.entity.*;
import com.owl.booking.model.dto.RealProgramDto;
import com.owl.booking.model.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class RealProgramService {

    @Autowired
    private RealProgramRepository realProgramRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private CenterRepository centerRepository;

    @Autowired
    private InstructorRepository instructorRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private WaitlistRepository waitlistRepository;

    @Autowired
    private CenterConfigRepository centerConfigRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    public List<RealProgramListItemDto> findAllSummary() {
        List<RealProgram> all = realProgramRepository.findAll();

        Map<String, CenterConfig> configMap = centerConfigRepository.findAll().stream()
                .filter(c -> c.getCenter() != null)
                .collect(Collectors.toMap(c -> c.getCenter().getId(), c -> c));

        return all.stream().map(rp -> {
            List<Booking> bookings = bookingRepository.findByProgram(rp);
            List<Waitlist> waitlists = waitlistRepository.findByProgram(rp);
            CenterConfig config = rp.getCenter() != null ? configMap.get(rp.getCenter().getId()) : null;

            return RealProgramListItemDto.builder()
                    .id(rp.getId())
                    .programDat(rp.getProgramDat())
                    .center(rp.getCenter() != null
                            ? RealProgramListItemDto.CenterInfo.builder()
                                    .id(rp.getCenter().getId())
                                    .name(rp.getCenter().getName())
                                    .build()
                            : null)
                    .program(RealProgramListItemDto.ProgramInfo.builder()
                            .id(rp.getProgramId())
                            .name(rp.getProgramName())
                            .startTime(rp.getStartTime())
                            .endTime(rp.getEndTime())
                            .maxCapacity(rp.getMaxCapacity())
                            .instructor(rp.getInstructorId() != null
                                    ? RealProgramListItemDto.InstructorInfo.builder()
                                            .id(rp.getInstructorId())
                                            .name(rp.getInstructorName())
                                            .build()
                                    : null)
                            .build())
                    .bookingCount(bookings.size())
                    .waitlistCount(waitlists.size())
                    .waitlistCapacity(config != null ? config.getWaitlistCapacity() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    public Optional<RealProgram> findById(String id) {
        return realProgramRepository.findById(id);
    }

    public RealProgram save(RealProgramDto dto) {
        if (dto.getId() != null) {
            // 수정: 기존 스냅샷 보존, 강사만 갱신
            return realProgramRepository.findById(dto.getId()).map(rp -> {
                if (dto.getInstructor() != null && dto.getInstructor().getId() != null) {
                    instructorRepository.findById(dto.getInstructor().getId()).ifPresent(instr -> {
                        rp.setInstructorId(instr.getId());
                        rp.setInstructorName(instr.getName());
                    });
                }
                return realProgramRepository.save(rp);
            }).orElseThrow(() -> new RuntimeException("스케줄을 찾을 수 없습니다."));
        }

        // 신규 생성: Program 정보를 스냅샷으로 저장
        RealProgram rp = new RealProgram();
        rp.setProgramDat(dto.getProgramDat());

        if (dto.getCenter() != null && dto.getCenter().getId() != null) {
            centerRepository.findById(dto.getCenter().getId()).ifPresent(rp::setCenter);
        }

        if (dto.getProgram() != null && dto.getProgram().getId() != null) {
            programRepository.findById(dto.getProgram().getId()).ifPresent(prog -> {
                rp.setProgramId(prog.getId());
                rp.setProgramName(prog.getName());
                rp.setDayOfWeek(prog.getDayOfWeek());
                rp.setStartTime(prog.getStartTime());
                rp.setEndTime(prog.getEndTime());
                rp.setMaxCapacity(prog.getMaxCapacity());
                // 기본 강사: Program의 강사
                if (prog.getInstructor() != null) {
                    rp.setInstructorId(prog.getInstructor().getId());
                    rp.setInstructorName(prog.getInstructor().getName());
                }
            });
        }

        // 강사 오버라이드 (스케줄 생성 시 별도 지정한 경우)
        if (dto.getInstructor() != null && dto.getInstructor().getId() != null) {
            instructorRepository.findById(dto.getInstructor().getId()).ifPresent(instr -> {
                rp.setInstructorId(instr.getId());
                rp.setInstructorName(instr.getName());
            });
        }

        return realProgramRepository.save(rp);
    }

    public void deleteById(String id) {
        RealProgram rp = realProgramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("스케줄을 찾을 수 없습니다."));
        long bookingCount = bookingRepository.findByProgram(rp).size();
        long waitlistCount = waitlistRepository.findByProgram(rp).size();
        if (bookingCount > 0 || waitlistCount > 0) {
            throw new IllegalStateException("예약 " + bookingCount + "명, 대기 " + waitlistCount + "명이 있어 삭제할 수 없습니다.");
        }
        realProgramRepository.deleteById(id);
    }

    public RealProgramDetailDto getDetail(String id) {
        RealProgram rp = realProgramRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("스케줄을 찾을 수 없습니다."));

        List<Booking> bookings = bookingRepository.findByProgram(rp);
        List<Waitlist> waitlists = waitlistRepository.findByProgram(rp);

        Optional<CenterConfig> configOpt = rp.getCenter() != null
                ? centerConfigRepository.findByCenter_Id(rp.getCenter().getId())
                : Optional.empty();

        List<RealProgramDetailDto.BookingMemberInfo> memberInfos = new ArrayList<>();

        for (Booking b : bookings) {
            Member m = b.getMember();
            memberInfos.add(RealProgramDetailDto.BookingMemberInfo.builder()
                    .id(b.getId())
                    .memberName(m != null ? m.getName() : "-")
                    .memberHp(m != null ? m.getHp() : "-")
                    .memberLoginId(m != null ? m.getLoginId() : "-")
                    .status("예약")
                    .build());
        }

        for (Waitlist w : waitlists) {
            Member m = w.getMember();
            memberInfos.add(RealProgramDetailDto.BookingMemberInfo.builder()
                    .id(w.getId())
                    .memberName(m != null ? m.getName() : "-")
                    .memberHp(m != null ? m.getHp() : "-")
                    .memberLoginId(m != null ? m.getLoginId() : "-")
                    .status("대기")
                    .build());
        }

        boolean hasAttendance = !attendanceRepository.findByRealProgram(rp).isEmpty();

        return RealProgramDetailDto.builder()
                .id(rp.getId())
                .programName(rp.getProgramName())
                .instructorId(rp.getInstructorId())
                .instructorName(rp.getInstructorName())
                .programDat(rp.getProgramDat())
                .startTime(rp.getStartTime())
                .endTime(rp.getEndTime())
                .maxCapacity(rp.getMaxCapacity())
                .bookingCount(bookings.size())
                .waitlistCount(waitlists.size())
                .waitlistCapacity(configOpt.map(CenterConfig::getWaitlistCapacity).orElse(null))
                .cancleDeadlineMinutes(configOpt.map(CenterConfig::getCancleDeadlineMinutes).orElse(null))
                .confirmMode(configOpt.map(c -> c.getConfirmMode() != null ? c.getConfirmMode().name() : null).orElse(null))
                .hasAttendance(hasAttendance)
                .bookings(memberInfos)
                .build();
    }

    private static final String[] KOREAN_DOW = {"월", "화", "수", "목", "금", "토", "일"};

    private String koreanDow(LocalDate date) {
        return KOREAN_DOW[date.getDayOfWeek().getValue() - 1];
    }

    // 날짜 범위 내 요일이 일치하는 운영중 수업의 스케줄을 생성 (이미 생성된 건 건너뜀)
    public int generate(String centerId, LocalDate startDate, LocalDate endDate) {
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Center not found"));

        List<Program> programs = programRepository.findByCenter_IdAndActiveTrue(centerId);

        int created = 0;
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            String dow = koreanDow(date);
            for (Program program : programs) {
                if (program.getDayOfWeek() == null || program.getStartTime() == null) continue;
                if (!Arrays.asList(program.getDayOfWeek().split(",")).contains(dow)) continue;

                LocalDateTime programDat = LocalDateTime.of(date, LocalTime.parse(program.getStartTime()));
                if (realProgramRepository.existsByProgramIdAndProgramDat(program.getId(), programDat)) continue;

                RealProgram rp = new RealProgram();
                rp.setProgramDat(programDat);
                rp.setCenter(center);
                rp.setProgramId(program.getId());
                rp.setProgramName(program.getName());
                rp.setDayOfWeek(program.getDayOfWeek());
                rp.setStartTime(program.getStartTime());
                rp.setEndTime(program.getEndTime());
                rp.setMaxCapacity(program.getMaxCapacity());
                if (program.getInstructor() != null) {
                    rp.setInstructorId(program.getInstructor().getId());
                    rp.setInstructorName(program.getInstructor().getName());
                }
                realProgramRepository.save(rp);
                created++;
            }
        }
        return created;
    }
}
