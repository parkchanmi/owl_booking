package com.owl.booking.service;

import com.owl.booking.entity.Member;
import com.owl.booking.repository.MemberRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberService {

    @Autowired
    private PasswordEncoder passwordEncoder; // SecurityConfig에서 등록한 빈(Bean)
    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public Member createMember(Member member) {

        // 1. 비밀번호 암호화 (예: "1234" -> "$2a$10$vIu...")
        String encodedPassword = passwordEncoder.encode(member.getPwd());
        
        // 2. 암호화된 비밀번호로 셋팅
        member.setPwd(encodedPassword);

        return memberRepository.save(member);
    }

    public Member findByLoginId(String loginId) {
        Member member = memberRepository.findByLoginId(loginId);
        return member;
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }
}