package com.owl.booking.model.entity;

import com.owl.booking.model.entity.type.ConfirmMode;

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

    @Column(name = "confirm_mode", nullable = false)
    private ConfirmMode confirmMode;

    @Column(name = "waitlist_capacity", nullable = true)
    private Long waitlistCapacity;

    @Column(name = "cancle_deadline_minutes", nullable = true)
    private Long cancleDeadlineMinutes;

    @Column(name = "booking_open_days", nullable = true)
    private Long bookingOpenDays;

    @Column(name = "generation_start_dat", nullable = true)
    private Long generationStartDat;

    @OneToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;
}