package com.owl.booking.common.controller;

import com.owl.booking.admin.controller.BookingController;
import com.owl.booking.admin.controller.WaitlistController;
import com.owl.booking.admin.service.WaitlistReservationService;
import com.owl.booking.model.entity.*;
import com.owl.booking.model.repository.*;
import java.lang.reflect.Proxy;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

class MyPageCancellationTest {
    private final Member self = Member.builder().id("self").build();

    @SuppressWarnings("unchecked")
    private <T> T stub(Class<T> type, BiFunction<String, Object[], Object> handler) {
        return (T) Proxy.newProxyInstance(getClass().getClassLoader(), new Class<?>[]{type}, (proxy, method, args) -> handler.apply(method.getName(), args));
    }

    private void authenticate(Object controller) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("login", null, List.of()));
        ReflectionTestUtils.setField(controller, "memberRepository", stub(MemberRepository.class, (method, args) -> self));
    }

    @AfterEach void clearSession() { SecurityContextHolder.clearContext(); }

    @Test void memberCannotCancelAnotherMembersBookingOrWaitlist() {
        Member other = Member.builder().id("other").build();
        BookingController bookings = new BookingController();
        authenticate(bookings);
        ReflectionTestUtils.setField(bookings, "bookingRepository", stub(BookingRepository.class, (method, args) -> {
            assertEquals("findById", method);
            return Optional.of(Booking.builder().id("booking").member(other).build());
        }));
        assertEquals(403, assertThrows(ResponseStatusException.class, () -> bookings.cancelBooking("booking")).getStatusCode().value());
        WaitlistController waits = new WaitlistController();
        authenticate(waits);
        ReflectionTestUtils.setField(waits, "waitlistRepository", stub(WaitlistRepository.class, (method, args) -> {
            assertEquals("findById", method);
            return Optional.of(Waitlist.builder().id("wait").member(other).build());
        }));
        assertEquals(403, assertThrows(ResponseStatusException.class, () -> waits.cancelMyWaitlist("wait")).getStatusCode().value());
    }

    private BookingController bookingsAt(LocalDateTime start, boolean[] deleted) {
        BookingController controller = new BookingController();
        authenticate(controller);
        Center center = Center.builder().id("center").build();
        RealProgram program = RealProgram.builder().id("class").programDat(start.toLocalDate().atStartOfDay())
                .startTime(start.format(DateTimeFormatter.ofPattern("HH:mm"))).build();
        Booking booking = Booking.builder().id("booking").member(self).center(center).program(program).build();
        ReflectionTestUtils.setField(controller, "bookingRepository", stub(BookingRepository.class, (method, args) -> {
            if (method.equals("findById")) return Optional.of(booking);
            if (method.equals("deleteById")) deleted[0] = true;
            return null;
        }));
        CenterConfig config = CenterConfig.builder().center(center).build();
        config.setCancleDeadlineMinutes(60L);
        ReflectionTestUtils.setField(controller, "centerConfigRepository", stub(CenterConfigRepository.class, (method, args) -> Optional.of(config)));
        ReflectionTestUtils.setField(controller, "waitlistReservationService", new WaitlistReservationService(null, null, null, null, null, null) {
            @Override public void handleAvailableSeatAsync(String programId) { assertEquals("class", programId); }
        });
        return controller;
    }

    @Test void centerDeadlinePreventsLateCancellationWithoutDeletingBooking() {
        boolean[] deleted = {false};
        var controller = bookingsAt(LocalDateTime.now().plusMinutes(30), deleted);
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> controller.cancelBooking("booking")).getStatusCode().value());
        assertFalse(deleted[0]);
    }

    @Test void ownedBookingBeforeDeadlineCanBeCancelledAndNotifiesWaitlistService() {
        boolean[] deleted = {false};
        var controller = bookingsAt(LocalDateTime.now().plusDays(2), deleted);
        assertEquals(204, controller.cancelBooking("booking").getStatusCode().value());
        assertTrue(deleted[0]);
    }
}
