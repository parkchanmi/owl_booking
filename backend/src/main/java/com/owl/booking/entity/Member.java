package com.owl.booking.entity;

import com.owl.booking.entity.type.MemberType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"member\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @Column(nullable = false, length=20)
    private MemberType type;

    @Column(nullable = false)
    private String loginId;

    @Column(nullable = false)
    private String pwd;

    @Column(nullable = false, length=20)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = true, length=20)
    private String hp;
}