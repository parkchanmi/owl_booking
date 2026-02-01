package com.owl.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"booking\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="program_id", referencedColumnName = "id")
    RealProgram program;
}