package com.owl.booking.model.repository;

import com.owl.booking.model.entity.Attendance;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.RealProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    List<Attendance> findByRealProgram(RealProgram realProgram);
    Optional<Attendance> findByRealProgramAndMember(RealProgram realProgram, Member member);
}
