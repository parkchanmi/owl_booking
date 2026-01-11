package com.owl.booking.entity;

import com.owl.booking.entity.type.MembershipStatus;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Long useCnt;

    @Column(nullable = false)
    private Long durationDays;

    @Column(nullable = true)
    private Long holdDays;

    @Column(nullable = true)
    private Long price;

    @Column(nullable = false)
    private MembershipStatus status;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="id", referencedColumnName = "center_id")
    Center center;
}