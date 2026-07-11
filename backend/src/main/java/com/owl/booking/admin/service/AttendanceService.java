package com.owl.booking.admin.service;

import com.owl.booking.model.dto.AttendanceListDto;
import com.owl.booking.model.dto.AttendanceSaveDto;
import com.owl.booking.model.entity.*;
import com.owl.booking.model.entity.type.AttendanceStatus;
import com.owl.booking.model.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private RealProgramRepository realProgramRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private WaitlistRepository waitlistRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MemberRepository memberRepository;

    // 예약자(확정)만 반환, 대기자 제외
    public List<AttendanceListDto> getAttendanceList(String realProgramId) {
        RealProgram rp = realProgramRepository.findById(realProgramId)
                .orElseThrow(() -> new RuntimeException("스케줄을 찾을 수 없습니다."));

        List<Booking> bookings = bookingRepository.findByProgram(rp);
        List<Attendance> attendances = attendanceRepository.findByRealProgram(rp);

        Map<String, Attendance> attendanceMap = attendances.stream()
                .filter(a -> a.getMember() != null)
                .collect(Collectors.toMap(a -> a.getMember().getId(), a -> a));

        List<AttendanceListDto> result = new ArrayList<>();

        for (Booking b : bookings) {
            Member m = b.getMember();
            if (m == null) continue;
            Attendance att = attendanceMap.get(m.getId());
            result.add(AttendanceListDto.builder()
                    .memberId(m.getId())
                    .memberName(m.getName())
                    .memberHp(m.getHp())
                    .memberLoginId(m.getLoginId())
                    .bookingStatus("예약")
                    .attendanceStatus(att != null ? att.getStatus().name() : null)
                    .attendanceId(att != null ? att.getId() : null)
                    .build());
        }

        return result;
    }

    // 출석 저장 후 해당 수업의 대기자 목록 전체 삭제
    @Transactional
    public List<AttendanceListDto> saveAttendance(String realProgramId, List<AttendanceSaveDto> records) {
        RealProgram rp = realProgramRepository.findById(realProgramId)
                .orElseThrow(() -> new RuntimeException("스케줄을 찾을 수 없습니다."));

        for (AttendanceSaveDto dto : records) {
            if (dto.getMemberId() == null || dto.getStatus() == null) continue;

            Member member = memberRepository.findById(dto.getMemberId()).orElse(null);
            if (member == null) continue;

            AttendanceStatus status;
            try {
                status = AttendanceStatus.valueOf(dto.getStatus());
            } catch (IllegalArgumentException e) {
                continue;
            }

            Attendance att = attendanceRepository.findByRealProgramAndMember(rp, member)
                    .orElse(Attendance.builder()
                            .realProgram(rp)
                            .member(member)
                            .build());
            att.setStatus(status);
            att.setRecordedAt(LocalDateTime.now());
            attendanceRepository.save(att);
        }

        // 출석 저장 완료 후 대기자 전체 삭제
        waitlistRepository.deleteByProgram(rp);

        return getAttendanceList(realProgramId);
    }
}
