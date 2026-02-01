package com.owl.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "\"center\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Center {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String bizNo;

    @Column(nullable = false, length=20)
    private String ceoName;

    @Column(nullable = false)
    private String bizName;

    @Column(nullable = true)
    private String addr;

    @Column(nullable = true, length=20)
    private String tel;
}