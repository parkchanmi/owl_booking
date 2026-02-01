package com.owl.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"member_center\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="member_id", referencedColumnName = "id")
    Member member;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;
}