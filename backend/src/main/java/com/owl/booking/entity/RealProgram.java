package com.owl.booking.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"real_program\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RealProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private LocalDateTime programDat;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="program_id", referencedColumnName = "id")
    Program program;
}