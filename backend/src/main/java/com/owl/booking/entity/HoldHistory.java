package com.owl.booking.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"hold_history\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoldHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @Column(nullable = false)
    private LocalDateTime startDat;

    @Column(nullable = false)
    private LocalDateTime endDat;

    @Column(nullable = false)
    private Long hDay;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="id", referencedColumnName = "mm_id")
    MemberMembership mm;
}