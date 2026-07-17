package com.owl.booking.model.repository;

import com.owl.booking.model.entity.Program;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgramRepository extends JpaRepository<Program, String> {
    List<Program> findByCenter_IdAndActiveTrue(String centerId);
}
