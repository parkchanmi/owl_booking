package com.owl.booking.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "center_member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CenterMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;

    @ManyToOne
    @JoinColumn(name="member_id", referencedColumnName = "id")
    Member member;
}