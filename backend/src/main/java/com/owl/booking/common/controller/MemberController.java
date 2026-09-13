package com.owl.booking.common.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.owl.booking.common.service.KakaoOAuthService;
import com.owl.booking.common.service.MemberService;
import com.owl.booking.model.dto.MemberDto;
import com.owl.booking.model.dto.MemberJoinRequestDto;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.type.MemberType;
import com.owl.booking.model.repository.CenterMemberRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/member")
public class MemberController {
    @Autowired
    private PasswordEncoder passwordEncoder;

    private final MemberService memberService;
    private final CenterMemberRepository centerMemberRepository;
    private final KakaoOAuthService kakaoOAuthService;

    public MemberController(
            MemberService memberService,
            CenterMemberRepository centerMemberRepository,
            KakaoOAuthService kakaoOAuthService
    ) {
        this.memberService = memberService;
        this.centerMemberRepository = centerMemberRepository;
        this.kakaoOAuthService = kakaoOAuthService;
    }

    @GetMapping("/info")
    public ResponseEntity<?> getMemberInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인되지 않은 상태입니다.");
        }

        Map<String, Object> memberInfo = new HashMap<>();
        memberInfo.put("loginId", authentication.getName());
        memberInfo.put("authorities", authentication.getAuthorities());
        Member member = memberService.findByLoginId(authentication.getName());
        if (member != null) {
            boolean hasAdminCenter = hasAdminCenter(member);
            memberInfo.put("id", member.getId());
            memberInfo.put("name", member.getName());
            memberInfo.put("email", member.getEmail());
            memberInfo.put("hp", member.getHp());
            memberInfo.put("type", member.getType());
            memberInfo.put("typeCode", getLoginTypeCode(hasAdminCenter));
            memberInfo.put("hasAdminCenter", hasAdminCenter);
        }

        return ResponseEntity.ok(memberInfo);
    }

    @PostMapping("/join")
    public Member createMember(@RequestBody MemberJoinRequestDto request) {
        return memberService.join(request);
    }

    @GetMapping
    public List<Member> getMembers() {
        return memberService.getAllMembers();
    }

    @GetMapping("/search")
    public List<MemberDto> searchMembers(@RequestParam MemberType type, @RequestParam String keyword) {
        return memberService.searchMembers(type, keyword).stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public Member getMember(@PathVariable String id) {
        return memberService.findById(id);
    }

    @PutMapping("/{id}/contact")
    public Member updateMemberContact(@PathVariable String id, @RequestBody Member member) {
        return memberService.updateContact(id, member);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Member member, HttpServletRequest request) {
        Member foundMember = memberService.findByLoginId(member.getLoginId());

        if (foundMember != null && passwordEncoder.matches(member.getPwd(), foundMember.getPwd())) {
            return ResponseEntity.ok(createSessionAndBuildResult(foundMember, request));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
    }

    @PostMapping("/oauth/kakao")
    public ResponseEntity<?> kakaoLogin(@RequestBody Map<String, String> body, HttpServletRequest request) {
        KakaoOAuthService.KakaoUserInfo userInfo = kakaoOAuthService.getUserInfo(body.get("code"));
        Member member = memberService.findOrCreateByKakao(userInfo);

        return ResponseEntity.ok(createSessionAndBuildResult(member, request));
    }

    private Map<String, Object> createSessionAndBuildResult(Member member, HttpServletRequest request) {
        boolean hasAdminCenter = hasAdminCenter(member);
        String role = hasAdminCenter ? "ROLE_ADMIN" : "ROLE_USER";
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                member.getLoginId(), null, List.of(new SimpleGrantedAuthority(role)));

        SecurityContext context = SecurityContextHolder.getContext();
        context.setAuthentication(token);
        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        Map<String, Object> loginResult = new HashMap<>();
        loginResult.put("loginId", member.getLoginId());
        loginResult.put("name", member.getName());
        loginResult.put("type", member.getType());
        loginResult.put("typeCode", getLoginTypeCode(hasAdminCenter));
        loginResult.put("hasAdminCenter", hasAdminCenter);
        return loginResult;
    }

    private int getLoginTypeCode(boolean hasAdminCenter) {
        return hasAdminCenter ? 1 : 2;
    }

    private boolean hasAdminCenter(Member member) {
        return member != null && member.getId() != null
                && centerMemberRepository.existsByMember_IdAndType(member.getId(), MemberType.ADMIN);
    }

    private MemberDto toDto(Member member) {
        MemberDto dto = new MemberDto();
        dto.setId(member.getId());
        dto.setType(member.getType());
        dto.setLoginId(member.getLoginId());
        dto.setName(member.getName());
        dto.setEmail(member.getEmail());
        dto.setHp(member.getHp());
        dto.setStatus(member.getStatus());
        return dto;
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(true);
    }
}
