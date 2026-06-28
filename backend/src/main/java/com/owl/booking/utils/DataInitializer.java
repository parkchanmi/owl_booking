package com.owl.booking.utils;

import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.CenterConfig;
import com.owl.booking.model.entity.CenterMember;
import com.owl.booking.model.entity.Instructor;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.Membership;
import com.owl.booking.model.entity.Program;
import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.model.entity.type.ConfirmMode;
import com.owl.booking.model.entity.type.MemberType;
import com.owl.booking.model.entity.type.MembershipStatus;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.CenterMemberRepository;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.InstructorRepository;
import com.owl.booking.model.repository.MemberMembershipRepository;
import com.owl.booking.model.repository.MemberRepository;
import com.owl.booking.model.repository.MembershipRepository;
import com.owl.booking.model.repository.ProgramRepository;
import com.owl.booking.model.repository.RealProgramRepository;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final MemberRepository memberRepository;
    private final CenterRepository centerRepository;
    private final InstructorRepository instructorRepository;
    private final ProgramRepository programRepository;
    private final MembershipRepository membershipRepository;
    private final MemberMembershipRepository memberMembershipRepository;
    private final RealProgramRepository realProgramRepository;
    private final CenterConfigRepository centerConfigRepository;
    private final CenterMemberRepository centerMemberRepository;

    public DataInitializer(MemberRepository memberRepository, CenterRepository centerRepository, InstructorRepository instructorRepository, ProgramRepository programRepository, MembershipRepository membershipRepository, MemberMembershipRepository memberMembershipRepository, RealProgramRepository realProgramRepository, CenterConfigRepository centerConfigRepository, CenterMemberRepository centerMemberRepository) {
        this.memberRepository = memberRepository;
        this.centerRepository = centerRepository;
        this.instructorRepository = instructorRepository;
        this.programRepository = programRepository;
        this.membershipRepository = membershipRepository;
        this.memberMembershipRepository = memberMembershipRepository;
        this.realProgramRepository = realProgramRepository;
        this.centerConfigRepository = centerConfigRepository;
        this.centerMemberRepository = centerMemberRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        String encodedPassword = passwordEncoder.encode("1234");

        memberRepository.save(new Member(null,MemberType.ADMIN,"admin",encodedPassword,"관리자","admin@gmail.com",null));
        Member user = memberRepository.save(new Member(null,MemberType.USER,"user",encodedPassword,"사용자","user@gmail.com",null));

        Center center = centerRepository.save(Center.builder()
                .name("OWL 센터")
                .bizNo("123-45-67890")
                .ceoName("홍길동")
                .bizName("OWL 주식회사")
                .addr("서울특별시 강남구 테헤란로 123")
                .addrDetail("4층")
                .tel("02-1234-5678")
                .build());

        centerMemberRepository.save(CenterMember.builder()
                .center(center)
                .member(user)
                .build());

        centerConfigRepository.save(CenterConfig.builder()
                .confirmMode(ConfirmMode.AUTO)
                .waitlistCapacity(5L)
                .cancleDeadlineMinutes(60L)
                .bookingOpenDays(7L)
                .generationStartDat(1L)
                .center(center)
                .build());

        Instructor instructor1 = instructorRepository.save(Instructor.builder()
                .name("김강사")
                .hp("010-1234-5678")
                .info("필라테스 전문 강사, 경력 5년")
                .center(center)
                .build());

        Instructor instructor2 = instructorRepository.save(Instructor.builder()
                .name("이강사")
                .hp("010-9876-5432")
                .info("요가 전문 강사, 경력 3년")
                .center(center)
                .build());

        Program program1 = programRepository.save(Program.builder()
                .name("필라테스 기초반")
                .dayOfWeek("월,수,금")
                .startTime("10:00")
                .endTime("11:00")
                .maxCapacity(10L)
                .center(center)
                .instructor(instructor1)
                .build());

        Program program2 = programRepository.save(Program.builder()
                .name("요가 힐링반")
                .dayOfWeek("화,목")
                .startTime("14:00")
                .endTime("15:00")
                .maxCapacity(8L)
                .center(center)
                .instructor(instructor2)
                .build());

        membershipRepository.save(Membership.builder()
                .name("1개월 기본권")
                .useCnt(30L)
                .durationDays(30L)
                .holdDays(7L)
                .price(100000L)
                .status(MembershipStatus.ACTIVE)
                .center(center)
                .build());

        membershipRepository.save(Membership.builder()
                .name("3개월 정기권")
                .useCnt(90L)
                .durationDays(90L)
                .holdDays(14L)
                .price(270000L)
                .status(MembershipStatus.ACTIVE)
                .center(center)
                .build());

        Membership membership10 = membershipRepository.save(Membership.builder()
                .name("10회 이용권")
                .useCnt(10L)
                .durationDays(60L)
                .holdDays(null)
                .price(80000L)
                .status(MembershipStatus.ACTIVE)
                .center(center)
                .build());

        LocalDateTime now = LocalDateTime.now();

        realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(10).withMinute(0).withSecond(0).withNano(0))
                .center(center)
                .program(program1)
                .build());

        realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(10).withMinute(0).withSecond(0).withNano(0).plusDays(2))
                .center(center)
                .program(program1)
                .build());

        realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(14).withMinute(0).withSecond(0).withNano(0).plusDays(1))
                .center(center)
                .program(program2)
                .build());

        memberMembershipRepository.save(MemberMembership.builder()
                .startDat(now)
                .endDat(now.plusDays(membership10.getDurationDays()))
                .uCnt(membership10.getUseCnt())
                .hDay(membership10.getHoldDays())
                .center(center)
                .member(user)
                .membership(membership10)
                .build());
    }
}
