package com.owl.booking.model.entity;

import com.owl.booking.model.entity.type.MembershipStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"membership\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "use_cnt", nullable = false)
    private Long useCnt;

    @Column(name = "duration_days", nullable = false)
    private Long durationDays;

    @Column(name = "hold_days", nullable = true)
    private Long holdDays;

    @Column(nullable = true)
    private Long price;

    @Column(nullable = false)
    private MembershipStatus status;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;
}