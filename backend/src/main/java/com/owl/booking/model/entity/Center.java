package com.owl.booking.model.entity;

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

    @Column(name = "biz_no", nullable = false)
    private String bizNo;

    @Column(name = "ceo_name", nullable = false, length=20)
    private String ceoName;

    @Column(name = "biz_name", nullable = false)
    private String bizName;

    @Column(nullable = true)
    private String addr;

    @Column(name = "addr_detail", nullable = true)
    private String addrDetail;

    @Column(nullable = true, length=20)
    private String tel;
}