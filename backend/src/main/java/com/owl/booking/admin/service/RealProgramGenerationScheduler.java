package com.owl.booking.admin.service;

import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.CenterConfig;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.CenterRepository;
import java.time.LocalDate;
import java.util.Arrays;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

// 매일 새벽 1시에 실행되어, 센터별로 설정된 '실행 요일'이 오늘과 일치하면
// '스케줄 생성 기준일'만큼 앞선 기간까지 자동생성 대상 수업의 스케줄을 생성
@Component
public class RealProgramGenerationScheduler {

    private static final long DEFAULT_GENERATION_DAYS = 14L;
    private static final String DEFAULT_GENERATION_DAYS_OF_WEEK = "월,화,수,목,금,토,일";
    private static final String[] KOREAN_DOW = {"월", "화", "수", "목", "금", "토", "일"};

    private final CenterRepository centerRepository;
    private final CenterConfigRepository centerConfigRepository;
    private final RealProgramService realProgramService;

    public RealProgramGenerationScheduler(
            CenterRepository centerRepository,
            CenterConfigRepository centerConfigRepository,
            RealProgramService realProgramService
    ) {
        this.centerRepository = centerRepository;
        this.centerConfigRepository = centerConfigRepository;
        this.realProgramService = realProgramService;
    }

    @Scheduled(cron = "0 0 1 * * *")
    public void generateUpcomingSchedules() {
        LocalDate today = LocalDate.now();
        String todayDow = KOREAN_DOW[today.getDayOfWeek().getValue() - 1];

        for (Center center : centerRepository.findAll()) {
            CenterConfig config = centerConfigRepository.findByCenter_Id(center.getId()).orElse(null);

            boolean enabled = config == null || config.getAutoGenerateEnabled() == null || config.getAutoGenerateEnabled();
            if (!enabled) continue;

            String daysOfWeek = config != null && config.getGenerationDaysOfWeek() != null
                    ? config.getGenerationDaysOfWeek()
                    : DEFAULT_GENERATION_DAYS_OF_WEEK;
            if (!Arrays.asList(daysOfWeek.split(",")).contains(todayDow)) continue;

            long generationDays = config != null && config.getGenerationStartDat() != null
                    ? config.getGenerationStartDat()
                    : DEFAULT_GENERATION_DAYS;

            realProgramService.generate(center.getId(), today, today.plusDays(generationDays));
        }
    }
}
