package com.owl.booking.common.controller;

import com.owl.booking.admin.service.HoldHistoryService;
import com.owl.booking.admin.service.MembershipRefundService;
import com.owl.booking.common.service.MemberService;
import com.owl.booking.model.dto.*;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.repository.MemberMembershipRepository;
import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;

class MyPageControllerTest {
    private final Member self = Member.builder().id("self").loginId("login").build();
    private final UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("login", null, List.of());
    private final MemberService members = new MemberService(null, null, null, null) {
        @Override public Member findByLoginId(String loginId) { return self; }
        @Override public Member updateContact(String id, Member request) {
            assertEquals("self", id);
            return request;
        }
    };

    private MemberMembershipRepository repository(String ownerId) {
        return (MemberMembershipRepository) Proxy.newProxyInstance(getClass().getClassLoader(), new Class<?>[]{MemberMembershipRepository.class}, (proxy, method, args) -> {
            if (method.getName().equals("findById")) return Optional.of(MemberMembership.builder().id((String) args[0]).member(Member.builder().id(ownerId).build()).build());
            throw new UnsupportedOperationException(method.getName());
        });
    }

    @Test void unauthenticatedMemberCannotReadOrWriteProfileData() {
        var controller = new MyPageController(members, null, null, null, repository("self"));
        assertEquals(401, assertThrows(ResponseStatusException.class, () -> controller.getAttendance(null)).getStatusCode().value());
        assertEquals(401, assertThrows(ResponseStatusException.class, () -> controller.updateContact(null, new MyPageController.ContactRequest("me@example.com", ""))).getStatusCode().value());
    }

    @Test void refundPreviewIsRestrictedToOwnedMembership() {
        var preview = new MembershipRefundPreviewDto();
        preview.setRefundAmount(70000L);
        var refunds = new MembershipRefundService(null, null, null, null) {
            @Override public MembershipRefundPreviewDto preview(String id) { return preview; }
        };
        var own = new MyPageController(members, null, null, refunds, repository("self"));
        assertSame(preview, own.previewRefund(auth, "pass"));
        var foreign = new MyPageController(members, null, null, refunds, repository("other"));
        assertEquals(403, assertThrows(ResponseStatusException.class, () -> foreign.previewRefund(auth, "pass")).getStatusCode().value());
    }

    @Test void holdsRejectForeignMembershipAndPastStartDates() {
        var request = new HoldHistoryCreateRequestDto();
        request.setMmId("pass");
        request.setStartDat(LocalDate.now().minusDays(1).atStartOfDay());
        var controller = new MyPageController(members, null, null, null, repository("self"));
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> controller.createHold(auth, request)).getStatusCode().value());
        var foreign = new MyPageController(members, null, null, null, repository("other"));
        assertEquals(403, assertThrows(ResponseStatusException.class, () -> foreign.createHold(auth, request)).getStatusCode().value());
    }

    @Test void ownedHoldUsesExistingValidationServiceAndContactReturnsNoCredentials() {
        var request = new HoldHistoryCreateRequestDto();
        request.setMmId("pass");
        request.setStartDat(LocalDate.now().plusDays(1).atStartOfDay());
        request.setEndDat(LocalDate.now().plusDays(2).atStartOfDay());
        var saved = new HoldHistoryDto();
        var holds = new HoldHistoryService(null, null) {
            @Override public HoldHistoryDto createHoldHistory(HoldHistoryCreateRequestDto actual) {
                assertSame(request, actual);
                return saved;
            }
        };
        var controller = new MyPageController(members, null, holds, null, repository("self"));
        assertSame(saved, controller.createHold(auth, request));
        var response = controller.updateContact(auth, new MyPageController.ContactRequest("me@example.com", null));
        assertEquals("me@example.com", response.get("email"));
        assertEquals("", response.get("hp"));
        assertEquals(2, response.size());
    }
}
