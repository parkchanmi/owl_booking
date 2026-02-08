package com.owl.booking.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.owl.booking.entity.Member;
import com.owl.booking.entity.type.MemberType;
import com.owl.booking.service.MemberService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

@RestController
@RequestMapping("/api/member")
public class MemberController {
    @Autowired
    private PasswordEncoder passwordEncoder; // SecurityConfig에서 등록한 빈(Bean)

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping("/info")
    public ResponseEntity<?> getMemberInfo() {
        // 1. 현재 보안 컨텍스트에서 인증 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 2. 인증 정보가 없거나 익명 사용자인지 확인
        if (authentication == null || !authentication.isAuthenticated() 
            || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인되지 않은 상태입니다.");
        }

        // 3. 사용자 정보 담기 (아이디, 권한 등)
        Map<String, Object> memberInfo = new HashMap<>();
        memberInfo.put("loginId", authentication.getName()); // 로그인 아이디
        memberInfo.put("authorities", authentication.getAuthorities()); // 권한 목록

        return ResponseEntity.ok(memberInfo);
    }

    @PostMapping("/join")
    public Member createMember(@RequestBody Member member) {
        member.setType(MemberType.USER);
        return memberService.createMember(member);
    }

    @GetMapping
    public List<Member> getMembers() {
        return memberService.getAllMembers();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Member member, HttpServletRequest request) {
    
        // 1. DB에서 해당 아이디의 회원 정보 가져오기
        Member foundMember = memberService.findByLoginId(member.getLoginId());

        if (foundMember != null) {
            // 2. 비밀번호 비교: passwordEncoder.matches(평문, 암호문)
            if (passwordEncoder.matches(member.getPwd(), foundMember.getPwd())) {
                
                // 3. 일치하면 인증 토큰 생성 및 세션 저장 (이전 코드 활용)
                UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                        foundMember.getLoginId(), null, List.of(new SimpleGrantedAuthority("ROLE_USER")));

                SecurityContext context = SecurityContextHolder.getContext();
                context.setAuthentication(token);
                HttpSession session = request.getSession(true);
                session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

                return ResponseEntity.ok(true);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate(); // 세션 무효화
        }
        // SecurityContext도 클리어
        SecurityContextHolder.clearContext();
        
        return ResponseEntity.ok(true);
    }
}
