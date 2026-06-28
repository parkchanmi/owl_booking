package com.owl.booking.model.entity;

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
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "start_dat", nullable = false)
    private LocalDateTime startDat;

    @Column(name = "end_dat", nullable = false)
    private LocalDateTime endDat;

    @Column(name = "u_cnt", nullable = true)
    private Long uCnt;

    @Column(name = "h_day", nullable = true)
    private Long hDay;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="member_id", referencedColumnName = "id")
    Member member;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="membership_id", referencedColumnName = "id")
    Membership membership;
}