package com.owl.booking.model.repository;

import com.owl.booking.model.entity.MemberMembershipRefund;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberMembershipRefundRepository extends JpaRepository<MemberMembershipRefund, String> {
    List<MemberMembershipRefund> findByMemberIdOrderByRefundedAtDesc(String memberId);
}
