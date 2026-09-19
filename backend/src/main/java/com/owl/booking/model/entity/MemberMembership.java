package com.owl.booking.model.entity;

import java.time.LocalDateTime;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member_membership")
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

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "u_cnt", nullable = true)
    private Long uCnt;

    @Column(name = "h_day", nullable = true)
    private Long hDay;

    @Column(name = "purchase_price")
    private Long purchasePrice;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @ManyToOne
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;

    @ManyToOne
    @JoinColumn(name="member_id", referencedColumnName = "id")
    Member member;

    @ManyToOne
    @JoinColumn(name="membership_id", referencedColumnName = "id")
    Membership membership;
}
