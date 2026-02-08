package com.owl.booking.utils;

import com.owl.booking.entity.Member;
import com.owl.booking.entity.type.MemberType;
import com.owl.booking.repository.MemberRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private final MemberRepository memberRepository;

    public DataInitializer(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        String encodedPassword = passwordEncoder.encode("1234");

        memberRepository.save(new Member(null,MemberType.ADMIN,"admin",encodedPassword,"관리자","admin@gmail.com",null));
        memberRepository.save(new Member(null,MemberType.USER,"user",encodedPassword,"사용자","user@gmail.com",null));
    }
}
