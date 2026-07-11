package com.owl.booking.model.repository;

import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.model.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, String> {
    List<Waitlist> findByProgram(RealProgram program);

    void deleteByProgram(RealProgram program);
}
