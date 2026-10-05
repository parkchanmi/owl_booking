package com.owl.booking.admin.controller;

import com.owl.booking.admin.service.WaitlistReservationService;
import com.owl.booking.model.dto.BookingCreateRequestDto;
import com.owl.booking.model.dto.MyBookingDto;
import com.owl.booking.model.entity.Booking;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.model.repository.BookingRepository;
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

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RealProgramRepository realProgramRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private WaitlistReservationService waitlistReservationService;

    @Autowired
    private WaitlistRepository waitlistRepository;

    @GetMapping("/mine")
    public List<MyBookingDto> getMyBookings() {
        Member member = currentMember();
        return bookingRepository.findHistoryByMemberAndCenter(member.getId(), null)
                .stream()
                .map(this::toMyBookingDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<MyBookingDto> createBooking(@RequestBody BookingCreateRequestDto request) {
        Member member = currentMember();

        RealProgram program = realProgramRepository.findById(request.getRealProgramId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "수업을 찾을 수 없습니다."));

        long currentBookingCount = bookingRepository.findByProgram(program).size();
        if (program.getMaxCapacity() != null && currentBookingCount >= program.getMaxCapacity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "정원이 마감된 수업입니다.");
        }
        if (waitlistRepository.existsByProgram(program)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "대기자가 있는 수업은 대기자에게 우선권이 있습니다.");
        }

        Booking booking = Booking.builder()
                .center(program.getCenter())
                .program(program)
                .member(member)
                .build();
        bookingRepository.save(booking);

        return ResponseEntity.ok(toMyBookingDto(booking));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable String id) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }
        String programId = booking.getProgram() != null ? booking.getProgram().getId() : null;
        bookingRepository.deleteById(id);
        bookingRepository.flush();
        waitlistReservationService.handleAvailableSeatAsync(programId);
        return ResponseEntity.noContent().build();
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

    private MyBookingDto toMyBookingDto(Booking booking) {
        RealProgram program = booking.getProgram();
        return MyBookingDto.builder()
                .id(booking.getId())
                .realProgramId(program != null ? program.getId() : null)
                .centerName(booking.getCenter() != null ? booking.getCenter().getName() : null)
                .programName(program != null ? program.getProgramName() : null)
                .instructorName(program != null ? program.getInstructorName() : null)
                .programDat(program != null ? program.getProgramDat() : null)
                .startTime(program != null ? program.getStartTime() : null)
                .endTime(program != null ? program.getEndTime() : null)
                .build();
    }
}
