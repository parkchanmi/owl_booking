package com.owl.booking.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
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

    @Column(name = "reservation_token", unique = true, length = 64)
    private String reservationToken;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
