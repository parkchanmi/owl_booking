package com.owl.booking.model.repository;

import com.owl.booking.model.entity.CenterMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CenterMemberRepository extends JpaRepository<CenterMember, String> {
}
