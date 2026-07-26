package com.owl.booking.model.entity;

import com.owl.booking.model.entity.type.MemberType;
import com.owl.booking.model.entity.type.MemberStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length=20)
    private MemberType type;

    @Column(name = "login_id", nullable = false, unique = true)
    private String loginId;

    @Column(nullable = false)
    private String pwd;

    @Column(nullable = false, length=20)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = true, length=20)
    private String hp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MemberStatus status = MemberStatus.ACTIVE;
}
