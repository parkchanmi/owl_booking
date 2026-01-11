package com.owl.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"program\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 20)
    private String dayOfWeek;

    @Column(nullable = false, length = 20)
    private String startTime;

    @Column(nullable = false, length = 20)
    private String endTime;

    @Column(nullable = false)
    private Long maxCapacity;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="id", referencedColumnName = "center_id")
    Center center;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="id", referencedColumnName = "instructor_id")
    Instructor instructor;
}