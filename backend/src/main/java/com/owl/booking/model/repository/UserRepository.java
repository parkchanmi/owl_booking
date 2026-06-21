package com.owl.booking.model.repository;

import com.owl.booking.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // 추가 쿼리 메서드 정의 가능
}