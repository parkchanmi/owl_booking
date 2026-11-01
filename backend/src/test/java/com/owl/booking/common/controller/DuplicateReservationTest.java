package com.owl.booking.common.controller;

import com.owl.booking.admin.controller.BookingController;
import com.owl.booking.admin.controller.WaitlistController;
import com.owl.booking.model.dto.BookingCreateRequestDto;
import com.owl.booking.model.entity.*;
import com.owl.booking.model.repository.*;
import java.lang.reflect.Proxy;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.function.BiFunction;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

class DuplicateReservationTest {
    private final RealProgram program = RealProgram.builder().id("schedule").programDat(LocalDateTime.now().plusDays(1)).startTime("10:00").build();

    @SuppressWarnings("unchecked")
    private <T> T stub(Class<T> type, BiFunction<String, Object[], Object> handler) {
        return (T) Proxy.newProxyInstance(getClass().getClassLoader(), new Class<?>[]{type}, (proxy, method, args) -> handler.apply(method.getName(), args));
    }

    private void configure(Object controller, boolean booked, boolean waiting) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("login", null, List.of()));
        ReflectionTestUtils.setField(controller, "memberRepository", stub(MemberRepository.class, (method, args) -> Member.builder().id("self").build()));
        ReflectionTestUtils.setField(controller, "realProgramRepository", stub(RealProgramRepository.class, (method, args) -> {
            assertEquals("findByIdForUpdate", method);
            assertEquals("schedule", args[0]);
            return Optional.of(program);
        }));
        ReflectionTestUtils.setField(controller, "bookingRepository", stub(BookingRepository.class, (method, args) -> {
            if (method.equals("existsByProgramAndMember_Id")) { assertEquals("self", args[1]); return booked; }
            throw new AssertionError("Duplicate request must not save a booking: " + method);
        }));
        ReflectionTestUtils.setField(controller, "waitlistRepository", stub(WaitlistRepository.class, (method, args) -> {
            if (method.equals("existsByProgramAndMember_Id")) { assertEquals("self", args[1]); return waiting; }
            throw new AssertionError("Duplicate request must not save a waitlist: " + method);
        }));
    }

    private BookingCreateRequestDto request() {
        var request = new BookingCreateRequestDto();
        request.setRealProgramId("schedule");
        return request;
    }

    @AfterEach void clearContext() { SecurityContextHolder.clearContext(); }

    @Test void pastClassesRejectBookingAndWaitlistBeforeAnyInsertion() {
        program.setProgramDat(LocalDateTime.now().minusDays(1));
        var bookings = new BookingController();
        configure(bookings, false, false);
        var bookingError = assertThrows(ResponseStatusException.class, () -> bookings.createBooking(request()));
        assertEquals(409, bookingError.getStatusCode().value());
        assertTrue(bookingError.getReason().contains("마감"));
        var waits = new WaitlistController();
        configure(waits, false, false);
        var waitError = assertThrows(ResponseStatusException.class, () -> waits.createWaitlist(request()));
        assertEquals(409, waitError.getStatusCode().value());
        assertTrue(waitError.getReason().contains("마감"));
    }

    @Test void existingBookingBlocksBothBookingAndWaitlistCreation() {
        var bookings = new BookingController();
        configure(bookings, true, false);
        assertEquals(409, assertThrows(ResponseStatusException.class, () -> bookings.createBooking(request())).getStatusCode().value());
        var waits = new WaitlistController();
        configure(waits, true, false);
        assertEquals(409, waits.createWaitlist(request()).getStatusCode().value());
    }

    @Test void existingWaitlistBlocksBothBookingAndRepeatedWaitlistCreation() {
        var bookings = new BookingController();
        configure(bookings, false, true);
        assertEquals(409, assertThrows(ResponseStatusException.class, () -> bookings.createBooking(request())).getStatusCode().value());
        var waits = new WaitlistController();
        configure(waits, false, true);
        assertEquals(409, waits.createWaitlist(request()).getStatusCode().value());
    }
}
