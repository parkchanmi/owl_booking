package com.owl.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"center_member\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CenterMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="member_id", referencedColumnName = "id")
    Member member;
}