package com.owl.booking.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "waitlists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Waitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "member_id", referencedColumnName = "id")
    Member member;

    @ManyToOne
    @JoinColumn(name = "real_program_id", referencedColumnName = "id")
    RealProgram program;
}
