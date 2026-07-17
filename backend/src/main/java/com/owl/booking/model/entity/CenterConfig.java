package com.owl.booking.model.entity;

import com.owl.booking.model.entity.type.ConfirmMode;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "center_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CenterConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "confirm_mode", nullable = false)
    private ConfirmMode confirmMode;

    @Column(name = "waitlist_capacity", nullable = true)
    private Long waitlistCapacity;

    @Column(name = "cancle_deadline_minutes", nullable = true)
    private Long cancleDeadlineMinutes;

    @Column(name = "booking_open_days", nullable = true)
    private Long bookingOpenDays;

    @Column(name = "generation_start_dat", nullable = true)
    private Long generationStartDat;

    // 스케줄 자동생성 스케줄러 사용 여부 (센터 단일 설정)
    @Builder.Default
    @Column(name = "auto_generate_enabled", nullable = false)
    private Boolean autoGenerateEnabled = true;

    // 자동생성 스케줄러 실행 요일 (콤마구분, 예: "월,수,금") — 실행 시각은 매일 새벽 1시로 고정
    @Column(name = "generation_days_of_week", length = 20)
    private String generationDaysOfWeek;

    @OneToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name="center_id", referencedColumnName = "id")
    Center center;
}