package com.owl.booking.model.repository;

import com.owl.booking.model.entity.RealProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RealProgramRepository extends JpaRepository<RealProgram, String> {
}