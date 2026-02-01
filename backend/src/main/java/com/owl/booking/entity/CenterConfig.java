package com.owl.booking.entity;

import com.owl.booking.entity.type.ConfirmMode;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"center_config\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CenterConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private ConfirmMode confirmMode;

    @Column(nullable = true)
    private Long waitlistCapacity;

    @Column(nullable = true)
    private Long cancleDeadlineMinutes;

    @Column(nullable = true)
    private Long bookingOpenDays;

    @Column(nullable = true)
    private Long generationStartDat;

    @OneToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;
}