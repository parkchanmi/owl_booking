package com.owl.booking.model.repository;

import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.type.MemberProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {
    // 추가 쿼리 메서드 정의 가능

    Member findByLoginId(String loginId);

    Member findByProviderAndProviderId(MemberProvider provider, String providerId);
}