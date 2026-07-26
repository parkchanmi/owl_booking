package com.owl.booking.model.repository;

import com.owl.booking.model.entity.Booking;
import com.owl.booking.model.entity.RealProgram;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByProgram(RealProgram program);

    void deleteByMember_Id(String memberId);

    @Query("""
            select distinct b.program.id
            from Booking b
            where b.member.id = :memberId
              and b.center.id = :centerId
              and b.program.programDat between :startDat and :endDat
            """)
    List<String> findBookedProgramIdsByMemberAndCenterAndDateRange(
            @Param("memberId") String memberId,
            @Param("centerId") String centerId,
            @Param("startDat") LocalDateTime startDat,
            @Param("endDat") LocalDateTime endDat
    );

    @Query("""
            select b
            from Booking b
            left join fetch b.program rp
            left join fetch rp.center
            where b.member.id = :memberId
              and (:centerId is null or b.center.id = :centerId)
            order by rp.programDat desc, rp.startTime desc
            """)
    List<Booking> findHistoryByMemberAndCenter(
            @Param("memberId") String memberId,
            @Param("centerId") String centerId
    );
}
