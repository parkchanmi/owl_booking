package com.owl.booking.common.controller;

import com.owl.booking.common.service.KakaoOAuthService;
import com.owl.booking.common.service.MemberService;
import com.owl.booking.model.dto.MemberLoginRequestDto;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.type.MemberType;
import com.owl.booking.model.repository.CenterMemberRepository;
import java.lang.reflect.Proxy;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;

class MemberLoginTypeTest {
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);

    private MemberController controller(boolean admin) {
        Member account = Member.builder().id("account").loginId("login").name("회원")
                .type(admin ? MemberType.ADMIN : MemberType.USER).pwd(encoder.encode("test-password")).build();
        MemberService members = new MemberService(null, null, null, null) {
            @Override public Member findByLoginId(String loginId) { return "login".equals(loginId) ? account : null; }
            @Override public Member findOrCreateByKakao(KakaoOAuthService.KakaoUserInfo info) { return account; }
        };
        CenterMemberRepository centers = (CenterMemberRepository) Proxy.newProxyInstance(getClass().getClassLoader(), new Class<?>[]{CenterMemberRepository.class}, (proxy, method, args) -> {
            assertEquals("existsByMember_IdAndType", method.getName());
            assertEquals("account", args[0]);
            assertEquals(MemberType.ADMIN, args[1]);
            return admin;
        });
        KakaoOAuthService kakao = new KakaoOAuthService() {
            @Override public KakaoUserInfo getUserInfo(String code) { return new KakaoUserInfo("test-user", "회원"); }
        };
        MemberController controller = new MemberController(members, centers, kakao);
        ReflectionTestUtils.setField(controller, "passwordEncoder", encoder);
        return controller;
    }

    @AfterEach void clearContext() { SecurityContextHolder.clearContext(); }

    @Test void selectedTypeMustMatchActualAdminRightsInAllFourCombinations() {
        for (boolean admin : new boolean[]{false, true}) {
            for (MemberType selected : MemberType.values()) {
                SecurityContextHolder.clearContext();
                var request = new MockHttpServletRequest();
                var response = controller(admin).login(new MemberLoginRequestDto("login", "test-password", selected), request);
                boolean matches = (selected == MemberType.ADMIN) == admin;
                assertEquals(matches ? 200 : 401, response.getStatusCode().value());
                if (matches) {
                    assertNotNull(request.getSession(false));
                    SecurityContext context = (SecurityContext) request.getSession(false)
                            .getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
                    assertEquals(admin ? "ROLE_ADMIN" : "ROLE_USER", context.getAuthentication().getAuthorities().iterator().next().getAuthority());
                    assertEquals(admin ? 1 : 2, ((Map<?, ?>) response.getBody()).get("typeCode"));
                } else {
                    assertNull(request.getSession(false), "Wrong login type must not create an authenticated session");
                    assertNull(SecurityContextHolder.getContext().getAuthentication());
                }
            }
        }
    }

    @Test void missingTypeInvalidCredentialsAndUnknownAccountCannotCreateSession() {
        var controller = controller(false);
        for (var input : new MemberLoginRequestDto[]{
                new MemberLoginRequestDto("login", "test-password", null),
                new MemberLoginRequestDto("login", "incorrect", MemberType.USER),
                new MemberLoginRequestDto("unknown", "test-password", MemberType.USER),
                new MemberLoginRequestDto("login", null, MemberType.USER)}) {
            var request = new MockHttpServletRequest();
            assertEquals(401, controller.login(input, request).getStatusCode().value());
            assertNull(request.getSession(false));
            assertNull(SecurityContextHolder.getContext().getAuthentication());
        }
    }

    @Test void memberOnlyKakaoLoginRejectsAdminBeforeCreatingSession() {
        var request = new MockHttpServletRequest();
        assertEquals(401, controller(true).kakaoLogin(Map.of("code", "test-code"), request).getStatusCode().value());
        assertNull(request.getSession(false));
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test void ordinaryMemberCanUseKakaoLogin() {
        var request = new MockHttpServletRequest();
        assertEquals(200, controller(false).kakaoLogin(Map.of("code", "test-code"), request).getStatusCode().value());
        assertNotNull(request.getSession(false));
        assertEquals("ROLE_USER", SecurityContextHolder.getContext().getAuthentication().getAuthorities().iterator().next().getAuthority());
    }
}
