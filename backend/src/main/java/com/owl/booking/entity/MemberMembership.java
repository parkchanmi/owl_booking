package com.owl.booking.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"member_membership\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @Column(nullable = false)
    private LocalDateTime startDat;

    @Column(nullable = false)
    private LocalDateTime endDat;

    @Column(nullable = true)
    private Long uCnt;

    @Column(nullable = true)
    private Long hDay;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="id", referencedColumnName = "center_id")
    Center center;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="id", referencedColumnName = "member_id")
    Member member;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="id", referencedColumnName = "membership_id")
    Membership membership;
}