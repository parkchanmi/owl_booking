package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.WaitlistReservationService;
import com.owl.booking.model.dto.BookingCreateRequestDto;
import com.owl.booking.model.entity.Booking;
import com.owl.booking.model.entity.CenterConfig;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.model.entity.Waitlist;
import com.owl.booking.model.repository.BookingRepository;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.MemberRepository;
import com.owl.booking.model.repository.RealProgramRepository;
import com.owl.booking.model.repository.WaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/waitlists")
public class WaitlistController {

    @Autowired
    private WaitlistRepository waitlistRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RealProgramRepository realProgramRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private CenterConfigRepository centerConfigRepository;

    @Autowired
    private WaitlistReservationService waitlistReservationService;

    @PostMapping
    public ResponseEntity<?> createWaitlist(@RequestBody BookingCreateRequestDto request) {
        Member member = currentMember();
        RealProgram program = realProgramRepository.findById(request.getRealProgramId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "수업을 찾을 수 없습니다."));

        if (waitlistRepository.existsByProgramAndMember_Id(program, member.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "이미 대기 신청한 수업입니다."));
        }

        long bookingCount = bookingRepository.findByProgram(program).size();
        boolean hasWaitlist = waitlistRepository.existsByProgram(program);
        boolean hasBookingSeat = program.getMaxCapacity() == null || bookingCount < program.getMaxCapacity();
        if (hasBookingSeat && !hasWaitlist) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "예약 가능한 수업입니다."));
        }

        long waitlistCount = waitlistRepository.findByProgram(program).size();
        Long waitlistCapacity = program.getCenter() != null
                ? centerConfigRepository.findByCenter_Id(program.getCenter().getId())
                        .map(CenterConfig::getWaitlistCapacity)
                        .orElse(null)
                : null;
        if (waitlistCapacity != null && waitlistCount >= waitlistCapacity) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "대기 정원이 초과되었습니다."));
        }

        Waitlist waitlist = waitlistRepository.save(Waitlist.builder()
                .program(program)
                .member(member)
                .reservationToken(UUID.randomUUID().toString().replace("-", ""))
                .build());

        return ResponseEntity.ok(Map.of("id", waitlist.getId()));
    }

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

    @GetMapping("/reservation")
    public ResponseEntity<?> getReservation(
            @RequestParam String token,
            @RequestParam(required = false) String waitlistId
    ) {
        try {
            return ResponseEntity.ok(waitlistReservationService.getReservation(token, waitlistId));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        }
    }

    @PostMapping("/reservation")
    public ResponseEntity<?> reserve(
            @RequestParam String token,
            @RequestParam(required = false) String waitlistId
    ) {
        try {
            return ResponseEntity.ok(waitlistReservationService.reserve(token, waitlistId));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        }
    }

    private Member currentMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Member member = memberRepository.findByLoginId(authentication.getName());
        if (member == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "회원 정보를 찾을 수 없습니다.");
        }
        return member;
    }
}
