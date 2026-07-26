package com.owl.booking.model.repository;

import com.owl.booking.model.entity.Attendance;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.model.entity.type.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    List<Attendance> findByRealProgram(RealProgram realProgram);
    Optional<Attendance> findByRealProgramAndMember(RealProgram realProgram, Member member);

    long countByMember_IdAndStatusAndRealProgram_ProgramDatBetween(
            String memberId, AttendanceStatus status, LocalDateTime start, LocalDateTime end
    );

    boolean existsByMember_Id(String memberId);

    @Query("""
            select distinct a.realProgram.id
            from Attendance a
            where a.member.id = :memberId
              and a.realProgram.center.id = :centerId
              and a.realProgram.programDat between :startDat and :endDat
            """)
    List<String> findAttendanceProgramIdsByMemberAndCenterAndDateRange(
            @Param("memberId") String memberId,
            @Param("centerId") String centerId,
            @Param("startDat") LocalDateTime startDat,
            @Param("endDat") LocalDateTime endDat
    );

    @Query("""
            select a
            from Attendance a
            left join fetch a.realProgram rp
            left join fetch rp.center
            where a.member.id = :memberId
              and (:centerId is null or rp.center.id = :centerId)
            order by rp.programDat desc, rp.startTime desc
            """)
    List<Attendance> findHistoryByMemberAndCenter(
            @Param("memberId") String memberId,
            @Param("centerId") String centerId
    );
}
