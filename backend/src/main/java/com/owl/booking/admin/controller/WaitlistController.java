package com.owl.booking.admin.controller;

import com.owl.booking.model.entity.Booking;
import com.owl.booking.model.entity.Waitlist;
import com.owl.booking.model.repository.BookingRepository;
import com.owl.booking.model.repository.WaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/waitlists")
public class WaitlistController {

    @Autowired
    private WaitlistRepository waitlistRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Void> confirmWaitlist(@PathVariable String id) {
        Waitlist waitlist = waitlistRepository.findById(id).orElse(null);
        if (waitlist == null) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = Booking.builder()
                .center(waitlist.getProgram() != null ? waitlist.getProgram().getCenter() : null)
                .program(waitlist.getProgram())
                .member(waitlist.getMember())
                .build();
        bookingRepository.save(booking);
        waitlistRepository.deleteById(id);

        return ResponseEntity.ok().build();
    }
}
