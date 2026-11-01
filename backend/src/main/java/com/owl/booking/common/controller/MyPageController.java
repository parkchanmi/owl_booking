package com.owl.booking.common.controller;

import com.owl.booking.admin.service.AttendanceService;
import com.owl.booking.admin.service.HoldHistoryService;
import com.owl.booking.admin.service.MembershipRefundService;
import com.owl.booking.common.service.MemberService;
import com.owl.booking.model.dto.*;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.repository.MemberMembershipRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/member")
public class MyPageController {
    private final MemberService members;
    private final AttendanceService attendance;
    private final HoldHistoryService holds;
    private final MembershipRefundService refunds;
    private final MemberMembershipRepository memberships;

    public MyPageController(MemberService members, AttendanceService attendance, HoldHistoryService holds,
                            MembershipRefundService refunds, MemberMembershipRepository memberships) {
        this.members = members;
        this.attendance = attendance;
        this.holds = holds;
        this.refunds = refunds;
        this.memberships = memberships;
    }

    @GetMapping("/attendance")
    public List<AttendanceHistoryDto> getAttendance(Authentication auth) {
        return attendance.getMemberAttendanceHistory(currentMember(auth).getId(), null);
    }

    @GetMapping("/holds")
    public List<HoldHistoryDto> getHolds(Authentication auth) {
        return holds.getByMemberId(currentMember(auth).getId());
    }

    @PostMapping("/holds")
    public HoldHistoryDto createHold(Authentication auth, @RequestBody HoldHistoryCreateRequestDto request) {
        requireOwnMembership(auth, request.getMmId());
        if (request.getStartDat() == null || request.getStartDat().toLocalDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(BAD_REQUEST, "오늘 이후의 일시정지 시작일을 선택해 주세요.");
        }
        return holds.createHoldHistory(request);
    }

    @GetMapping("/memberships/{id}/refund-preview")
    public MembershipRefundPreviewDto previewRefund(Authentication auth, @PathVariable String id) {
        requireOwnMembership(auth, id);
        return refunds.preview(id);
    }

    public record ContactRequest(String email, String hp) {}

    @PutMapping("/contact")
    public Map<String, String> updateContact(Authentication auth, @RequestBody ContactRequest request) {
        Member member = currentMember(auth);
        Member updated = members.updateContact(member.getId(), Member.builder().email(request.email()).hp(request.hp()).build());
        return Map.of("email", updated.getEmail(), "hp", updated.getHp() == null ? "" : updated.getHp());
    }

    private Member currentMember(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new ResponseStatusException(UNAUTHORIZED, "로그인이 필요합니다.");
        }
        Member member = members.findByLoginId(auth.getName());
        if (member == null) throw new ResponseStatusException(UNAUTHORIZED, "회원 정보를 찾을 수 없습니다.");
        return member;
    }

    private void requireOwnMembership(Authentication auth, String id) {
        Member member = currentMember(auth);
        if (id == null || id.isBlank()) throw new ResponseStatusException(BAD_REQUEST, "이용권을 선택해 주세요.");
        var membership = memberships.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "이용권을 찾을 수 없습니다."));
        if (membership.getMember() == null || !member.getId().equals(membership.getMember().getId())) {
            throw new ResponseStatusException(FORBIDDEN, "본인의 이용권만 조회하거나 변경할 수 있습니다.");
        }
    }
}
