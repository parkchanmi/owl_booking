package com.owl.booking.model.repository;

import com.owl.booking.model.entity.HoldHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HoldHistoryRepository extends JpaRepository<HoldHistory, String> {
    List<HoldHistory> findByMm_Id(String mmId);

    List<HoldHistory> findByMm_Member_Id(String memberId);

    @Query("select coalesce(sum(h.hDay), 0) from HoldHistory h where h.mm.id = :mmId")
    Long sumHDayByMmId(@Param("mmId") String mmId);
}
