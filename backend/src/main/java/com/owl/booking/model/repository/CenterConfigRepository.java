package com.owl.booking.model.repository;

import com.owl.booking.model.entity.CenterConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CenterConfigRepository extends JpaRepository<CenterConfig, String> {
    Optional<CenterConfig> findByCenter_Id(String centerId);
}
