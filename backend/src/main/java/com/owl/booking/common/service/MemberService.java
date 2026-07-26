package com.owl.booking.common.service;

import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.type.MemberStatus;
import com.owl.booking.model.repository.MemberRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.regex.Pattern;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class MemberService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0\\d{1,2}-\\d{3,4}-\\d{4}$");

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

    public Member findById(String id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Member not found"));
    }

    public Member updateContact(String id, Member request) {
        Member member = findById(id);
        if (member.getStatus() == MemberStatus.WITHDRAWN) {
            throw new ResponseStatusException(BAD_REQUEST, "Withdrawn member cannot be changed");
        }
        validateContact(request);
        member.setEmail(request.getEmail());
        member.setHp(request.getHp());
        return memberRepository.save(member);
    }

    private void validateContact(Member request) {
        String email = request.getEmail();
        if (email == null || email.isBlank() || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid email format");
        }

        String hp = request.getHp();
        if (hp != null && !hp.isBlank() && !PHONE_PATTERN.matcher(hp).matches()) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid phone number format");
        }
    }
}
