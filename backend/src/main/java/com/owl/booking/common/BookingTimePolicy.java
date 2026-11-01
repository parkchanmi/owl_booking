package com.owl.booking.common;

import com.owl.booking.model.entity.RealProgram;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class BookingTimePolicy {
    private BookingTimePolicy() {}

    public static boolean isClosed(LocalDateTime programDat, String startTime, LocalDateTime now) {
        if (programDat == null) return true;
        try {
            LocalDateTime start = startTime == null || startTime.isBlank()
                    ? programDat : programDat.toLocalDate().atTime(LocalTime.parse(startTime));
            return !now.isBefore(start);
        } catch (DateTimeParseException exception) {
            return true;
        }
    }

    public static void requireOpen(RealProgram program) {
        if (isClosed(program.getProgramDat(), program.getStartTime(), LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "수업 시작 시간이 지나 예약이 마감되었습니다.");
        }
    }
}
