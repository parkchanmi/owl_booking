package com.owl.booking.model.repository;

import com.owl.booking.model.entity.MemberMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberMembershipRepository extends JpaRepository<MemberMembership, String> {
}
