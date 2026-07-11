package com.owl.booking.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "program")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "day_of_week", nullable = false, length = 20)
    private String dayOfWeek;

    @Column(name = "start_time", nullable = false, length = 20)
    private String startTime;

    @Column(name = "end_time", nullable = false, length = 20)
    private String endTime;

    @Column(name = "max_capacity", nullable = false)
    private Long maxCapacity;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @ManyToOne
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;

    @ManyToOne
    @JoinColumn(name="instructor_id", referencedColumnName = "id")
    Instructor instructor;
}