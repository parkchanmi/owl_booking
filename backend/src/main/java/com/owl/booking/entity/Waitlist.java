package com.owl.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"waitlists\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Waitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="member_id", referencedColumnName = "id")
    Member member;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="program_id", referencedColumnName = "id")
    RealProgram program;
}