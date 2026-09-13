package com.owl.booking.model.repository;

import com.owl.booking.model.entity.CenterMember;
import com.owl.booking.model.entity.type.MemberType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CenterMemberRepository extends JpaRepository<CenterMember, String> {
    boolean existsByCenter_IdAndMember_Id(String centerId, String memberId);

    boolean existsByCenter_IdAndMember_IdAndType(String centerId, String memberId, MemberType type);

    boolean existsByMember_IdAndType(String memberId, MemberType type);

    List<CenterMember> findByMember_Id(String memberId);

    List<CenterMember> findByMember_IdAndType(String memberId, MemberType type);

    void deleteByMember_Id(String memberId);
}
