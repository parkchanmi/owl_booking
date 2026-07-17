package com.owl.booking.model.repository;

import com.owl.booking.model.entity.MemberMembership;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberMembershipRepository extends JpaRepository<MemberMembership, String> {
    List<MemberMembership> findByMember_Id(String memberId);
}
