package com.owl.booking.model.repository;

import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.type.MemberStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {
    // 추가 쿼리 메서드 정의 가능

    Member findByLoginId(String loginId);

    @Query("""
            select m
            from Member m
            where m.status <> :excludedStatus
              and (
                lower(m.loginId) like lower(concat('%', :keyword, '%'))
                or lower(m.name) like lower(concat('%', :keyword, '%'))
              )
            order by m.name asc, m.loginId asc
            """)
    List<Member> searchLinkableMembers(
            @Param("excludedStatus") MemberStatus excludedStatus,
            @Param("keyword") String keyword
    );
}
