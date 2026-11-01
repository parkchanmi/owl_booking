package com.owl.booking.common;

import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BookingTimePolicyTest {
    @Test void scheduleUsesStartTimeAndClosesAtExactStart() {
        LocalDateTime date = LocalDateTime.of(2026, 11, 1, 0, 0);
        assertFalse(BookingTimePolicy.isClosed(date, "10:00", LocalDateTime.of(2026, 11, 1, 9, 59, 59)));
        assertTrue(BookingTimePolicy.isClosed(date, "10:00", LocalDateTime.of(2026, 11, 1, 10, 0)));
        assertTrue(BookingTimePolicy.isClosed(date, "10:00", LocalDateTime.of(2026, 11, 1, 15, 0)));
        assertFalse(BookingTimePolicy.isClosed(date.plusDays(1), "10:00", LocalDateTime.of(2026, 11, 1, 15, 0)));
    }

    @Test void invalidOrMissingScheduleCannotAcceptReservations() {
        LocalDateTime now = LocalDateTime.of(2026, 11, 1, 15, 0);
        assertTrue(BookingTimePolicy.isClosed(null, "10:00", now));
        assertTrue(BookingTimePolicy.isClosed(now, "invalid", now));
    }
}
