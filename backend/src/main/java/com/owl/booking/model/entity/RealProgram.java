package com.owl.booking.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "real_program")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RealProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "program_dat", nullable = false)
    private LocalDateTime programDat;

    @ManyToOne
    @JoinColumn(name = "center_id", referencedColumnName = "id")
    Center center;

    // 수업 템플릿 소프트 참조 (FK 없음, 출처 추적용)
    @Column(name = "program_id")
    private String programId;

    // 개설 시점 스냅샷 — Program 변경에 영향받지 않음
    @Column(name = "program_name")
    private String programName;

    @Column(name = "day_of_week", length = 20)
    private String dayOfWeek;

    @Column(name = "start_time", length = 20)
    private String startTime;

    @Column(name = "end_time", length = 20)
    private String endTime;

    @Column(name = "max_capacity")
    private Long maxCapacity;

    // 강사 스냅샷 (개설 후 변경 가능)
    @Column(name = "instructor_id")
    private String instructorId;

    @Column(name = "instructor_name")
    private String instructorName;
}
