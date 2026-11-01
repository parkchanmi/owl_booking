package com.owl.booking.model.repository;

import com.owl.booking.model.entity.RealProgram;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface RealProgramRepository extends JpaRepository<RealProgram, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select rp from RealProgram rp where rp.id = :id")
    Optional<RealProgram> findByIdForUpdate(@Param("id") String id);
    boolean existsByProgramId(String programId);

    boolean existsByProgramIdAndProgramDat(String programId, LocalDateTime programDat);
}
