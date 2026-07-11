package com.owl.booking.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "center_id", referencedColumnName = "id")
    Center center;

    @ManyToOne
    @JoinColumn(name = "real_program_id", referencedColumnName = "id")
    RealProgram program;

    @ManyToOne
    @JoinColumn(name = "member_id", referencedColumnName = "id")
    Member member;
}
