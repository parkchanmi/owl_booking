package com.owl.booking.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "member_membership_refund")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberMembershipRefund {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "member_membership_id", nullable = false, unique = true)
    private String memberMembershipId;

    @Column(name = "center_id", nullable = false)
    private String centerId;

    @Column(name = "member_id", nullable = false)
    private String memberId;

    @Column(name = "membership_name", nullable = false)
    private String membershipName;

    @Column(name = "start_dat", nullable = false)
    private LocalDateTime startDat;

    @Column(name = "end_dat", nullable = false)
    private LocalDateTime endDat;

    @Column(name = "refunded_at", nullable = false)
    private LocalDateTime refundedAt;

    @Column(name = "total_days", nullable = false)
    private Long totalDays;

    @Column(name = "total_count")
    private Long totalCount;

    @Column(name = "remaining_days", nullable = false)
    private Long remainingDays;

    @Column(name = "remaining_count")
    private Long remainingCount;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(name = "refund_amount", nullable = false)
    private Long refundAmount;
}
