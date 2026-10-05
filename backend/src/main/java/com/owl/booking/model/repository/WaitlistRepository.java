package com.owl.booking.model.repository;

import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.model.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, String> {
    List<Waitlist> findByProgram(RealProgram program);

    Optional<Waitlist> findFirstByProgramOrderByCreatedAtAscIdAsc(RealProgram program);

    boolean existsByProgram(RealProgram program);

    boolean existsByProgramAndMember_Id(RealProgram program, String memberId);

    Optional<Waitlist> findByReservationToken(String reservationToken);

    void deleteByProgram(RealProgram program);

    void deleteByMember_Id(String memberId);
}
