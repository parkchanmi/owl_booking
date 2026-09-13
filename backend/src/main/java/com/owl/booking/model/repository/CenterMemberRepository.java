package com.owl.booking.model.repository;

import com.owl.booking.model.entity.CenterMember;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CenterMemberRepository extends JpaRepository<CenterMember, String> {
    boolean existsByCenter_IdAndMember_Id(String centerId, String memberId);

    List<CenterMember> findByMember_Id(String memberId);

    void deleteByMember_Id(String memberId);
}
