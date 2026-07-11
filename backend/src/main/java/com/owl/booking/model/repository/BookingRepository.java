package com.owl.booking.model.repository;

import com.owl.booking.model.entity.Booking;
import com.owl.booking.model.entity.RealProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByProgram(RealProgram program);
}
