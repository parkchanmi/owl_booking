package com.owl.booking.model.repository;

import com.owl.booking.model.entity.MemberMembership;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberMembershipRepository extends JpaRepository<MemberMembership, String> {
    List<MemberMembership> findByMember_Id(String memberId);

    boolean existsByMember_Id(String memberId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select mm from MemberMembership mm where mm.id = :id")
    Optional<MemberMembership> findByIdForUpdate(@Param("id") String id);
}
