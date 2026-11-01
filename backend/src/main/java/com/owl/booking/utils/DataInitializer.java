package com.owl.booking.utils;

import com.owl.booking.admin.service.MembershipRefundService;
import com.owl.booking.model.entity.Attendance;
import com.owl.booking.model.entity.Booking;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.CenterConfig;
import com.owl.booking.model.entity.CenterMember;
import com.owl.booking.model.entity.Instructor;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.MemberMembership;
import com.owl.booking.model.entity.Membership;
import com.owl.booking.model.entity.Program;
import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.model.entity.Waitlist;
import com.owl.booking.model.entity.type.AttendanceStatus;
import com.owl.booking.model.entity.type.ConfirmMode;
import com.owl.booking.model.entity.type.MemberProvider;
import com.owl.booking.model.entity.type.MemberStatus;
import com.owl.booking.model.entity.type.MemberType;
import com.owl.booking.model.entity.type.MembershipStatus;
import com.owl.booking.model.repository.AttendanceRepository;
import com.owl.booking.model.repository.BookingRepository;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.CenterMemberRepository;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.InstructorRepository;
import com.owl.booking.model.repository.MemberMembershipRepository;
import com.owl.booking.model.repository.MemberRepository;
import com.owl.booking.model.repository.MembershipRepository;
import com.owl.booking.model.repository.ProgramRepository;
import com.owl.booking.model.repository.RealProgramRepository;
import com.owl.booking.model.repository.WaitlistRepository;

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
    private final MembershipRefundService membershipRefundService;
    private final RealProgramRepository realProgramRepository;
    private final CenterConfigRepository centerConfigRepository;
    private final CenterMemberRepository centerMemberRepository;
    private final BookingRepository bookingRepository;
    private final WaitlistRepository waitlistRepository;
    private final AttendanceRepository attendanceRepository;

    public DataInitializer(MemberRepository memberRepository, CenterRepository centerRepository,
            InstructorRepository instructorRepository, ProgramRepository programRepository,
            MembershipRepository membershipRepository, MemberMembershipRepository memberMembershipRepository,
            MembershipRefundService membershipRefundService,
            RealProgramRepository realProgramRepository, CenterConfigRepository centerConfigRepository,
            CenterMemberRepository centerMemberRepository, BookingRepository bookingRepository,
            WaitlistRepository waitlistRepository, AttendanceRepository attendanceRepository) {
        this.memberRepository = memberRepository;
        this.centerRepository = centerRepository;
        this.instructorRepository = instructorRepository;
        this.programRepository = programRepository;
        this.membershipRepository = membershipRepository;
        this.memberMembershipRepository = memberMembershipRepository;
        this.membershipRefundService = membershipRefundService;
        this.realProgramRepository = realProgramRepository;
        this.centerConfigRepository = centerConfigRepository;
        this.centerMemberRepository = centerMemberRepository;
        this.bookingRepository = bookingRepository;
        this.waitlistRepository = waitlistRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (memberRepository.count() > 0) {
            return;
        }

        String encodedPassword = passwordEncoder.encode("1234");

        // =========================================================================
        // 1. 기존 기초 회원 (100% 보존)
        // =========================================================================
        Member admin = memberRepository.save(new Member(null, MemberType.ADMIN, "admin", encodedPassword, "관리자", "admin@gmail.com", null, MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member instructorMember1 = memberRepository.save(new Member(null, MemberType.USER, "instructor1", encodedPassword, "김강사", "instructor1@gmail.com", "010-1234-5678", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member instructorMember2 = memberRepository.save(new Member(null, MemberType.USER, "instructor2", encodedPassword, "이강사", "instructor2@gmail.com", "010-9876-5432", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member user1 = memberRepository.save(new Member(null, MemberType.USER, "user", encodedPassword, "사용자", "user@gmail.com", "010-1111-2222", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member user2 = memberRepository.save(new Member(null, MemberType.USER, "user2", encodedPassword, "김회원", "user2@gmail.com", "010-3333-4444", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member user3 = memberRepository.save(new Member(null, MemberType.USER, "user3", encodedPassword, "이회원", "mimi226kr@gmail.com", "010-5555-6666", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));

        // =========================================================================
        // 2. 신규 강사 계정 (프론트엔드 목업 연동: 김유라, 박민준, 이서연, 정태호)
        // =========================================================================
        Member instructorMemberYura = memberRepository.save(new Member(null, MemberType.USER, "yura_kim", encodedPassword, "김유라", "yura@owl.com", "010-1234-7701", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member instructorMemberMinjun = memberRepository.save(new Member(null, MemberType.USER, "minjun_park", encodedPassword, "박민준", "minjun@owl.com", "010-2345-7702", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member instructorMemberSeoyeon = memberRepository.save(new Member(null, MemberType.USER, "seoyeon_lee", encodedPassword, "이서연", "seoyeon@owl.com", "010-3456-7703", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member instructorMemberTaeho = memberRepository.save(new Member(null, MemberType.USER, "taeho_jung", encodedPassword, "정태호", "taeho@owl.com", "010-4567-7704", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));

        // =========================================================================
        // 3. 센터 데이터 (기존 OWL 센터 보존 및 강남/서초/역삼 지점 추가)
        // =========================================================================
        Center center = centerRepository.save(Center.builder()
                .name("OWL 센터")
                .bizNo("123-45-67890")
                .ceoName("홍길동")
                .bizName("OWL 주식회사")
                .addr("서울특별시 강남구 테헤란로 123")
                .addrDetail("4층")
                .tel("02-1234-5678")
                .build());

        Center centerGangnam = centerRepository.save(Center.builder()
                .name("강남 시그니처점")
                .bizNo("123-45-67891")
                .ceoName("홍길동")
                .bizName("OWL 강남 시그니처점")
                .addr("서울특별시 강남구 테헤란로 123")
                .addrDetail("4층")
                .tel("02-1234-5678")
                .build());

        Center centerSeocho = centerRepository.save(Center.builder()
                .name("서초역점")
                .bizNo("123-45-67892")
                .ceoName("홍길동")
                .bizName("OWL 서초점")
                .addr("서울특별시 서초구 서초대로 250")
                .addrDetail("2층")
                .tel("02-581-2244")
                .build());

        Center centerYeoksam = centerRepository.save(Center.builder()
                .name("역삼 테헤란점")
                .bizNo("123-45-67893")
                .ceoName("홍길동")
                .bizName("OWL 역삼점")
                .addr("서울특별시 강남구 테헤란로 208")
                .addrDetail("3층")
                .tel("02-555-8890")
                .build());

        // 기존 센터 회원 연동
        centerMemberRepository.save(CenterMember.builder().center(center).member(user1).type(MemberType.USER).build());
        centerMemberRepository.save(CenterMember.builder().center(center).member(user2).type(MemberType.USER).build());
        centerMemberRepository.save(CenterMember.builder().center(center).member(user3).type(MemberType.USER).build());
        centerMemberRepository.save(CenterMember.builder().center(center).member(admin).type(MemberType.ADMIN).build());
        centerMemberRepository.save(CenterMember.builder().center(center).member(instructorMember1).type(MemberType.ADMIN).build());
        centerMemberRepository.save(CenterMember.builder().center(center).member(instructorMember2).type(MemberType.ADMIN).build());

        // 신규 강사 및 관리자 지점 연동
        centerMemberRepository.save(CenterMember.builder().center(center).member(instructorMemberYura).type(MemberType.ADMIN).build());
        centerMemberRepository.save(CenterMember.builder().center(center).member(instructorMemberMinjun).type(MemberType.ADMIN).build());
        centerMemberRepository.save(CenterMember.builder().center(center).member(instructorMemberSeoyeon).type(MemberType.ADMIN).build());
        centerMemberRepository.save(CenterMember.builder().center(center).member(instructorMemberTaeho).type(MemberType.ADMIN).build());

        centerMemberRepository.save(CenterMember.builder().center(centerGangnam).member(admin).type(MemberType.ADMIN).build());
        centerMemberRepository.save(CenterMember.builder().center(centerGangnam).member(instructorMemberYura).type(MemberType.ADMIN).build());
        centerMemberRepository.save(CenterMember.builder().center(centerGangnam).member(instructorMemberMinjun).type(MemberType.ADMIN).build());
        centerMemberRepository.save(CenterMember.builder().center(centerGangnam).member(instructorMemberSeoyeon).type(MemberType.ADMIN).build());
        centerMemberRepository.save(CenterMember.builder().center(centerGangnam).member(instructorMemberTaeho).type(MemberType.ADMIN).build());

        centerMemberRepository.save(CenterMember.builder().center(centerSeocho).member(admin).type(MemberType.ADMIN).build());
        centerMemberRepository.save(CenterMember.builder().center(centerYeoksam).member(admin).type(MemberType.ADMIN).build());

        // CenterConfig 생성
        String instructorIdsJson = String.format("[\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"]",
                instructorMember1.getId(), instructorMember2.getId(),
                instructorMemberYura.getId(), instructorMemberMinjun.getId(),
                instructorMemberSeoyeon.getId(), instructorMemberTaeho.getId());

        CenterConfig centerConfig = CenterConfig.builder().center(center).build();
        centerConfig.setConfirmMode(ConfirmMode.MANUAL);
        centerConfig.setWaitlistCapacity(5L);
        centerConfig.setCancleDeadlineMinutes(60L);
        centerConfig.setBookingOpenDays(7L);
        centerConfig.setGenerationStartDat(1L);
        centerConfig.setAutoGenerateEnabled(true);
        centerConfig.setGenerationDaysOfWeek("월,화,수,목,금,토,일");
        centerConfig.setRoleLabelsJson("{\"OWNER\":\"총관리자\",\"MANAGER\":\"매니저\",\"INSTRUCTOR\":\"강사\"}");
        centerConfig.setRoleMenuPermissionsJson("{\"OWNER\":[\"center-list\",\"member-list\",\"instructor-list\",\"class-list\",\"booking-schedule\",\"instructor-attendance\",\"ticket-list\",\"sales\",\"permission-list\",\"booking-index\"],\"MANAGER\":[\"member-list\",\"instructor-list\",\"class-list\",\"booking-schedule\",\"instructor-attendance\",\"ticket-list\",\"sales\",\"booking-index\"],\"INSTRUCTOR\":[\"instructor-attendance\"]}");
        centerConfig.setRoleMemberMappingsJson("{\"OWNER\":[\"" + admin.getId() + "\"],\"MANAGER\":[],\"INSTRUCTOR\":" + instructorIdsJson + "}");
        centerConfigRepository.save(centerConfig);

        CenterConfig configGangnam = CenterConfig.builder().center(centerGangnam).build();
        configGangnam.setConfirmMode(ConfirmMode.MANUAL);
        configGangnam.setWaitlistCapacity(5L);
        configGangnam.setCancleDeadlineMinutes(60L);
        configGangnam.setBookingOpenDays(7L);
        configGangnam.setGenerationStartDat(1L);
        configGangnam.setAutoGenerateEnabled(true);
        configGangnam.setGenerationDaysOfWeek("월,화,수,목,금,토,일");
        configGangnam.setRoleLabelsJson("{\"OWNER\":\"총관리자\",\"MANAGER\":\"매니저\",\"INSTRUCTOR\":\"강사\"}");
        configGangnam.setRoleMenuPermissionsJson(centerConfig.getRoleMenuPermissionsJson());
        configGangnam.setRoleMemberMappingsJson("{\"OWNER\":[\"" + admin.getId() + "\"],\"MANAGER\":[],\"INSTRUCTOR\":" + instructorIdsJson + "}");
        centerConfigRepository.save(configGangnam);

        // =========================================================================
        // 4. 강사 엔티티 (Instructor) 등록
        // =========================================================================
        Instructor instructor1 = instructorRepository.save(Instructor.builder()
                .name(instructorMember1.getName())
                .hp("010-1234-5678")
                .info("필라테스 전문 강사, 경력 5년")
                .member(instructorMember1)
                .center(center)
                .build());

        Instructor instructor2 = instructorRepository.save(Instructor.builder()
                .name(instructorMember2.getName())
                .hp("010-9876-5432")
                .info("요가 전문 강사, 경력 3년")
                .member(instructorMember2)
                .center(center)
                .build());

        Instructor instructorYura = instructorRepository.save(Instructor.builder()
                .name(instructorMemberYura.getName())
                .hp(instructorMemberYura.getHp())
                .info("요가 전문 강사, 경력 7년, 빈야사/하타 지도자 과정 수료")
                .member(instructorMemberYura)
                .center(center)
                .build());

        Instructor instructorMinjun = instructorRepository.save(Instructor.builder()
                .name(instructorMemberMinjun.getName())
                .hp(instructorMemberMinjun.getHp())
                .info("기구 필라테스 전문 강사, 리포머/체어/바렐 지도자")
                .member(instructorMemberMinjun)
                .center(center)
                .build());

        Instructor instructorSeoyeon = instructorRepository.save(Instructor.builder()
                .name(instructorMemberSeoyeon.getName())
                .hp(instructorMemberSeoyeon.getHp())
                .info("스피닝 & 인터벌 트레이닝 전문 강사")
                .member(instructorMemberSeoyeon)
                .center(center)
                .build());

        Instructor instructorTaeho = instructorRepository.save(Instructor.builder()
                .name(instructorMemberTaeho.getName())
                .hp(instructorMemberTaeho.getHp())
                .info("1:1 퍼스널 트레이닝 (PT) 체형 교정 전문 트레이너")
                .member(instructorMemberTaeho)
                .center(center)
                .build());

        // =========================================================================
        // 5. 수업 템플릿 (Program) 등록
        // =========================================================================
        Program program1 = programRepository.save(Program.builder()
                .name("필라테스 기초반")
                .dayOfWeek("월,수,금")
                .startTime("10:00")
                .endTime("11:00")
                .maxCapacity(2L)
                .active(true)
                .center(center)
                .instructor(instructor1)
                .build());

        Program program2 = programRepository.save(Program.builder()
                .name("요가 힐링반")
                .dayOfWeek("화,목")
                .startTime("14:00")
                .endTime("15:00")
                .maxCapacity(8L)
                .active(true)
                .center(center)
                .instructor(instructor2)
                .build());

        Program programYogaMorning = programRepository.save(Program.builder()
                .name("오전 비까 요가")
                .dayOfWeek("월,수,금")
                .startTime("07:00")
                .endTime("08:00")
                .maxCapacity(8L)
                .active(true)
                .center(center)
                .instructor(instructorYura)
                .build());

        Program programPilatesReformer = programRepository.save(Program.builder()
                .name("리포머 필라테스")
                .dayOfWeek("월,화,수,목,금")
                .startTime("09:00")
                .endTime("10:00")
                .maxCapacity(8L)
                .active(true)
                .center(center)
                .instructor(instructorMinjun)
                .build());

        Program programSpinning = programRepository.save(Program.builder()
                .name("스피닝 인터벌")
                .dayOfWeek("화,목,토")
                .startTime("11:00")
                .endTime("12:00")
                .maxCapacity(12L)
                .active(true)
                .center(center)
                .instructor(instructorSeoyeon)
                .build());

        Program programPt = programRepository.save(Program.builder()
                .name("프라이빗 PT")
                .dayOfWeek("월,수,금")
                .startTime("12:00")
                .endTime("13:00")
                .maxCapacity(1L)
                .active(true)
                .center(center)
                .instructor(instructorTaeho)
                .build());

        Program programPtWeight = programRepository.save(Program.builder()
                .name("체형교정 1:1 PT")
                .dayOfWeek("월,화,수,목,금")
                .startTime("12:00")
                .endTime("13:00")
                .maxCapacity(1L)
                .active(true)
                .center(center)
                .instructor(instructorMinjun)
                .build());

        Program programYogaRelax = programRepository.save(Program.builder()
                .name("오후 릴랙스 요가")
                .dayOfWeek("월,화,수,목,금")
                .startTime("14:00")
                .endTime("15:00")
                .maxCapacity(10L)
                .active(true)
                .center(center)
                .instructor(instructorYura)
                .build());

        // =========================================================================
        // 6. 이용권 마스터 (Membership) 등록
        // =========================================================================
        Membership membership30 = membershipRepository.save(Membership.builder()
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

        Membership ticketYoga10 = membershipRepository.save(Membership.builder()
                .name("요가 10회권")
                .useCnt(10L)
                .durationDays(60L)
                .holdDays(7L)
                .price(90000L)
                .status(MembershipStatus.ACTIVE)
                .center(center)
                .build());

        Membership ticketPilates20 = membershipRepository.save(Membership.builder()
                .name("필라테스 20회권")
                .useCnt(20L)
                .durationDays(90L)
                .holdDays(14L)
                .price(180000L)
                .status(MembershipStatus.ACTIVE)
                .center(center)
                .build());

        Membership ticketSpinning30 = membershipRepository.save(Membership.builder()
                .name("스피닝 30회권")
                .useCnt(30L)
                .durationDays(90L)
                .holdDays(14L)
                .price(240000L)
                .status(MembershipStatus.ACTIVE)
                .center(center)
                .build());

        Membership ticketPt20 = membershipRepository.save(Membership.builder()
                .name("1:1 개인 PT 20회권")
                .useCnt(20L)
                .durationDays(90L)
                .holdDays(14L)
                .price(600000L)
                .status(MembershipStatus.ACTIVE)
                .center(center)
                .build());

        // =========================================================================
        // 7. 실 회원 계정 등록 (프론트엔드 출결 및 스케줄 목업 회원 전수 이관)
        // =========================================================================
        Member mSeoa = memberRepository.save(new Member(null, MemberType.USER, "user_seoa", encodedPassword, "윤서아", "seoa@owl.com", "010-1234-5678", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mDoyun = memberRepository.save(new Member(null, MemberType.USER, "user_doyun", encodedPassword, "강도윤", "doyun@owl.com", "010-2345-6789", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mJiho = memberRepository.save(new Member(null, MemberType.USER, "user_jiho", encodedPassword, "임지호", "jiho@owl.com", "010-3456-7890", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mHaneul = memberRepository.save(new Member(null, MemberType.USER, "user_haneul", encodedPassword, "조하늘", "haneul@owl.com", "010-4567-8901", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mSujin = memberRepository.save(new Member(null, MemberType.USER, "user_sujin", encodedPassword, "배수진", "sujin@owl.com", "010-5678-9012", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mMinjae = memberRepository.save(new Member(null, MemberType.USER, "user_minjae", encodedPassword, "권민재", "minjae@owl.com", "010-6789-0123", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mYeeun = memberRepository.save(new Member(null, MemberType.USER, "user_yeeun", encodedPassword, "서예은", "yeeun@owl.com", "010-7890-1234", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mTaeyang = memberRepository.save(new Member(null, MemberType.USER, "user_taeyang", encodedPassword, "신태양", "taeyang@owl.com", "010-8901-2345", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));

        Member mYujin = memberRepository.save(new Member(null, MemberType.USER, "user_yujin", encodedPassword, "최유진", "yujin@owl.com", "010-3321-4455", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mDohyun = memberRepository.save(new Member(null, MemberType.USER, "user_dohyun", encodedPassword, "이도현", "dohyun@owl.com", "010-5544-6677", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mJeonghaneul = memberRepository.save(new Member(null, MemberType.USER, "user_jeonghaneul", encodedPassword, "정하늘", "jeonghaneul@owl.com", "010-7766-8899", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mSohee = memberRepository.save(new Member(null, MemberType.USER, "user_sohee", encodedPassword, "한소희", "sohee@owl.com", "010-9988-1122", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mSongkang = memberRepository.save(new Member(null, MemberType.USER, "user_songkang", encodedPassword, "송강", "songkang@owl.com", "010-2211-3344", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mEunbin = memberRepository.save(new Member(null, MemberType.USER, "user_eunbin", encodedPassword, "박은빈", "eunbin@owl.com", "010-4433-5566", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mJuhyuk = memberRepository.save(new Member(null, MemberType.USER, "user_juhyuk", encodedPassword, "남주혁", "juhyuk@owl.com", "010-6655-7788", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mTaeri = memberRepository.save(new Member(null, MemberType.USER, "user_taeri", encodedPassword, "김태리", "taeri@owl.com", "010-8877-9900", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));

        Member mMinsu = memberRepository.save(new Member(null, MemberType.USER, "user_minsu", encodedPassword, "김민수", "minsu@owl.com", "010-1111-3333", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mYounghee = memberRepository.save(new Member(null, MemberType.USER, "user_younghee", encodedPassword, "이영희", "younghee@owl.com", "010-2222-3333", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mCheolsu = memberRepository.save(new Member(null, MemberType.USER, "user_cheolsu", encodedPassword, "박철수", "cheolsu@owl.com", "010-3333-5555", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mJinwoo = memberRepository.save(new Member(null, MemberType.USER, "user_jinwoo", encodedPassword, "최진우", "jinwoo@owl.com", "010-4444-5555", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mDaeun = memberRepository.save(new Member(null, MemberType.USER, "user_daeun", encodedPassword, "정다은", "daeun@owl.com", "010-5555-7777", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mTaepung = memberRepository.save(new Member(null, MemberType.USER, "user_taepung", encodedPassword, "강태풍", "taepung@owl.com", "010-6666-7777", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mGaeul = memberRepository.save(new Member(null, MemberType.USER, "user_gaeul", encodedPassword, "윤가을", "gaeul@owl.com", "010-7777-8888", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));

        Member mSimok = memberRepository.save(new Member(null, MemberType.USER, "user_simok", encodedPassword, "황시목", "simok@owl.com", "010-9999-0000", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));

        Member mJimin = memberRepository.save(new Member(null, MemberType.USER, "user_jimin", encodedPassword, "한지민", "jimin@owl.com", "010-1357-2468", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mAhra = memberRepository.save(new Member(null, MemberType.USER, "user_ahra", encodedPassword, "고아라", "ahra@owl.com", "010-2468-1357", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mAin = memberRepository.save(new Member(null, MemberType.USER, "user_ain", encodedPassword, "유아인", "ain@owl.com", "010-3579-2468", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));
        Member mEunwoo = memberRepository.save(new Member(null, MemberType.USER, "user_eunwoo", encodedPassword, "차은우", "eunwoo@owl.com", "010-4680-1357", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));

        Member mSumin = memberRepository.save(new Member(null, MemberType.USER, "user_sumin", encodedPassword, "이수민", "sumin@owl.com", "010-8888-1111", MemberProvider.LOCAL, null, MemberStatus.ACTIVE));

        // 모든 신규 회원을 센터와 매핑
        Member[] newMembers = {
                mSeoa, mDoyun, mJiho, mHaneul, mSujin, mMinjae, mYeeun, mTaeyang,
                mYujin, mDohyun, mJeonghaneul, mSohee, mSongkang, mEunbin, mJuhyuk, mTaeri,
                mMinsu, mYounghee, mCheolsu, mJinwoo, mDaeun, mTaepung, mGaeul,
                mSimok, mJimin, mAhra, mAin, mEunwoo, mSumin
        };
        for (Member m : newMembers) {
            centerMemberRepository.save(CenterMember.builder().center(center).member(m).type(MemberType.USER).build());
        }

        // =========================================================================
        // 8. 기존 및 신규 실스케줄 (RealProgram) 등록
        // =========================================================================
        LocalDateTime now = LocalDateTime.now();

        // 기존 스케줄 보존
        RealProgram rp1 = realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(10).withMinute(0).withSecond(0).withNano(0))
                .center(center)
                .programId(program1.getId())
                .programName(program1.getName())
                .dayOfWeek(program1.getDayOfWeek())
                .startTime(program1.getStartTime())
                .endTime(program1.getEndTime())
                .maxCapacity(program1.getMaxCapacity())
                .instructorId(instructor1.getId())
                .instructorName(instructor1.getName())
                .build());

        RealProgram rp2 = realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(10).withMinute(0).withSecond(0).withNano(0).plusDays(2))
                .center(center)
                .programId(program1.getId())
                .programName(program1.getName())
                .dayOfWeek(program1.getDayOfWeek())
                .startTime(program1.getStartTime())
                .endTime(program1.getEndTime())
                .maxCapacity(program1.getMaxCapacity())
                .instructorId(instructor1.getId())
                .instructorName(instructor1.getName())
                .build());

        RealProgram rp3 = realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(14).withMinute(0).withSecond(0).withNano(0).plusDays(1))
                .center(center)
                .programId(program2.getId())
                .programName(program2.getName())
                .dayOfWeek(program2.getDayOfWeek())
                .startTime(program2.getStartTime())
                .endTime(program2.getEndTime())
                .maxCapacity(program2.getMaxCapacity())
                .instructorId(instructor2.getId())
                .instructorName(instructor2.getName())
                .build());

        // 오늘 날짜 기준 신규 5개 수업 스케줄 생성 (프론트엔드 출결 및 타임라인 직결)
        RealProgram rpYogaMorningToday = realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(7).withMinute(0).withSecond(0).withNano(0))
                .center(center)
                .programId(programYogaMorning.getId())
                .programName(programYogaMorning.getName())
                .dayOfWeek(programYogaMorning.getDayOfWeek())
                .startTime(programYogaMorning.getStartTime())
                .endTime(programYogaMorning.getEndTime())
                .maxCapacity(programYogaMorning.getMaxCapacity())
                .instructorId(instructorYura.getId())
                .instructorName(instructorYura.getName())
                .build());

        RealProgram rpPilatesToday = realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(9).withMinute(0).withSecond(0).withNano(0))
                .center(center)
                .programId(programPilatesReformer.getId())
                .programName(programPilatesReformer.getName())
                .dayOfWeek(programPilatesReformer.getDayOfWeek())
                .startTime(programPilatesReformer.getStartTime())
                .endTime(programPilatesReformer.getEndTime())
                .maxCapacity(programPilatesReformer.getMaxCapacity())
                .instructorId(instructorMinjun.getId())
                .instructorName(instructorMinjun.getName())
                .build());

        RealProgram rpSpinningToday = realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(11).withMinute(0).withSecond(0).withNano(0))
                .center(center)
                .programId(programSpinning.getId())
                .programName(programSpinning.getName())
                .dayOfWeek(programSpinning.getDayOfWeek())
                .startTime(programSpinning.getStartTime())
                .endTime(programSpinning.getEndTime())
                .maxCapacity(programSpinning.getMaxCapacity())
                .instructorId(instructorSeoyeon.getId())
                .instructorName(instructorSeoyeon.getName())
                .build());

        RealProgram rpPtToday = realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(12).withMinute(0).withSecond(0).withNano(0))
                .center(center)
                .programId(programPt.getId())
                .programName(programPt.getName())
                .dayOfWeek(programPt.getDayOfWeek())
                .startTime(programPt.getStartTime())
                .endTime(programPt.getEndTime())
                .maxCapacity(programPt.getMaxCapacity())
                .instructorId(instructorTaeho.getId())
                .instructorName(instructorTaeho.getName())
                .build());

        // 피트니스존 동시 중복 진행 1:1 PT 수업 (전체 공간 공유 활용)
        RealProgram rpPtWeightToday = realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(12).withMinute(0).withSecond(0).withNano(0))
                .center(center)
                .programId(programPtWeight.getId())
                .programName(programPtWeight.getName())
                .dayOfWeek(programPtWeight.getDayOfWeek())
                .startTime(programPtWeight.getStartTime())
                .endTime(programPtWeight.getEndTime())
                .maxCapacity(programPtWeight.getMaxCapacity())
                .instructorId(instructorMinjun.getId())
                .instructorName(instructorMinjun.getName())
                .build());

        RealProgram rpYogaRelaxToday = realProgramRepository.save(RealProgram.builder()
                .programDat(now.withHour(14).withMinute(0).withSecond(0).withNano(0))
                .center(center)
                .programId(programYogaRelax.getId())
                .programName(programYogaRelax.getName())
                .dayOfWeek(programYogaRelax.getDayOfWeek())
                .startTime(programYogaRelax.getStartTime())
                .endTime(programYogaRelax.getEndTime())
                .maxCapacity(programYogaRelax.getMaxCapacity())
                .instructorId(instructorYura.getId())
                .instructorName(instructorYura.getName())
                .build());

        // =========================================================================
        // 9. 예약 기초 데이터 (Booking) 등록
        // =========================================================================
        // 기존 예약 데이터 보존
        bookingRepository.save(Booking.builder().center(center).program(rp1).member(user1).build());
        bookingRepository.save(Booking.builder().center(center).program(rp1).member(user2).build());
        bookingRepository.save(Booking.builder().center(center).program(rp2).member(user1).build());
        bookingRepository.save(Booking.builder().center(center).program(rp3).member(user2).build());
        bookingRepository.save(Booking.builder().center(center).program(rp3).member(user3).build());

        // 수업 1: 오전 비까 요가 예약 (8명)
        bookingRepository.save(Booking.builder().center(center).program(rpYogaMorningToday).member(mSeoa).build());
        bookingRepository.save(Booking.builder().center(center).program(rpYogaMorningToday).member(mDoyun).build());
        bookingRepository.save(Booking.builder().center(center).program(rpYogaMorningToday).member(mJiho).build());
        bookingRepository.save(Booking.builder().center(center).program(rpYogaMorningToday).member(mHaneul).build());
        bookingRepository.save(Booking.builder().center(center).program(rpYogaMorningToday).member(mSujin).build());
        bookingRepository.save(Booking.builder().center(center).program(rpYogaMorningToday).member(mMinjae).build());
        bookingRepository.save(Booking.builder().center(center).program(rpYogaMorningToday).member(mYeeun).build());
        bookingRepository.save(Booking.builder().center(center).program(rpYogaMorningToday).member(mTaeyang).build());

        // 수업 2: 리포머 필라테스 예약 (8명)
        bookingRepository.save(Booking.builder().center(center).program(rpPilatesToday).member(mYujin).build());
        bookingRepository.save(Booking.builder().center(center).program(rpPilatesToday).member(mDohyun).build());
        bookingRepository.save(Booking.builder().center(center).program(rpPilatesToday).member(mJeonghaneul).build());
        bookingRepository.save(Booking.builder().center(center).program(rpPilatesToday).member(mSohee).build());
        bookingRepository.save(Booking.builder().center(center).program(rpPilatesToday).member(mSongkang).build());
        bookingRepository.save(Booking.builder().center(center).program(rpPilatesToday).member(mEunbin).build());
        bookingRepository.save(Booking.builder().center(center).program(rpPilatesToday).member(mJuhyuk).build());
        bookingRepository.save(Booking.builder().center(center).program(rpPilatesToday).member(mTaeri).build());

        // 수업 3: 스피닝 인터벌 예약 (7명)
        bookingRepository.save(Booking.builder().center(center).program(rpSpinningToday).member(mMinsu).build());
        bookingRepository.save(Booking.builder().center(center).program(rpSpinningToday).member(mYounghee).build());
        bookingRepository.save(Booking.builder().center(center).program(rpSpinningToday).member(mCheolsu).build());
        bookingRepository.save(Booking.builder().center(center).program(rpSpinningToday).member(mJinwoo).build());
        bookingRepository.save(Booking.builder().center(center).program(rpSpinningToday).member(mDaeun).build());
        bookingRepository.save(Booking.builder().center(center).program(rpSpinningToday).member(mTaepung).build());
        bookingRepository.save(Booking.builder().center(center).program(rpSpinningToday).member(mGaeul).build());

        // 수업 4: 프라이빗 PT 예약 (1명)
        bookingRepository.save(Booking.builder().center(center).program(rpPtToday).member(mSimok).build());

        // 수업 5: 체형교정 1:1 PT 예약 (1명 - 피트니스존 동시 중복 진행)
        bookingRepository.save(Booking.builder().center(center).program(rpPtWeightToday).member(user2).build());

        // 수업 6: 오후 릴랙스 요가 예약 (4명)
        bookingRepository.save(Booking.builder().center(center).program(rpYogaRelaxToday).member(mJimin).build());
        bookingRepository.save(Booking.builder().center(center).program(rpYogaRelaxToday).member(mAhra).build());
        bookingRepository.save(Booking.builder().center(center).program(rpYogaRelaxToday).member(mAin).build());
        bookingRepository.save(Booking.builder().center(center).program(rpYogaRelaxToday).member(mEunwoo).build());

        // =========================================================================
        // 10. 대기 기초 데이터 (Waitlist) 등록
        // =========================================================================
        // 기존 대기 데이터 보존
        waitlistRepository.save(Waitlist.builder().program(rp1).member(user3).build());
        waitlistRepository.save(Waitlist.builder().program(rp3).member(user1).build());

        // 신규 대기 데이터 (오전 비까 요가 대기 1명)
        waitlistRepository.save(Waitlist.builder().program(rpYogaMorningToday).member(mSumin).build());

        // =========================================================================
        // 11. 출결 기초 데이터 (Attendance) 등록
        // =========================================================================
        // 수업 1: 오전 비까 요가 출결
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaMorningToday).member(mSeoa).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(7).withMinute(5)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaMorningToday).member(mDoyun).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(7).withMinute(6)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaMorningToday).member(mJiho).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(7).withMinute(7)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaMorningToday).member(mHaneul).status(AttendanceStatus.ABSENT).recordedAt(now.withHour(7).withMinute(10)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaMorningToday).member(mSujin).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(7).withMinute(8)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaMorningToday).member(mMinjae).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(7).withMinute(9)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaMorningToday).member(mYeeun).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(7).withMinute(9)).build());
        // (mTaeyang 은 출결 레코드가 없어 미체크/대기 상태로 노출)

        // 수업 2: 리포머 필라테스 출결
        attendanceRepository.save(Attendance.builder().realProgram(rpPilatesToday).member(mYujin).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(8).withMinute(52)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpPilatesToday).member(mDohyun).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(8).withMinute(55)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpPilatesToday).member(mJeonghaneul).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(8).withMinute(58)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpPilatesToday).member(mSohee).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(8).withMinute(59)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpPilatesToday).member(mSongkang).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(9).withMinute(0)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpPilatesToday).member(mEunbin).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(9).withMinute(1)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpPilatesToday).member(mJuhyuk).status(AttendanceStatus.ABSENT).recordedAt(now.withHour(9).withMinute(5)).build());
        // (mTaeri 는 미체크)

        // 수업 3: 스피닝 인터벌 출결
        attendanceRepository.save(Attendance.builder().realProgram(rpSpinningToday).member(mMinsu).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(10).withMinute(55)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpSpinningToday).member(mYounghee).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(10).withMinute(58)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpSpinningToday).member(mCheolsu).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(11).withMinute(1)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpSpinningToday).member(mJinwoo).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(11).withMinute(2)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpSpinningToday).member(mDaeun).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(11).withMinute(3)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpSpinningToday).member(mTaepung).status(AttendanceStatus.ABSENT).recordedAt(now.withHour(11).withMinute(5)).build());
        // (mGaeul 은 미체크)

        // 수업 4: 프라이빗 PT 출결
        attendanceRepository.save(Attendance.builder().realProgram(rpPtToday).member(mSimok).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(11).withMinute(58)).build());

        // 수업 5: 체형교정 1:1 PT 출결
        attendanceRepository.save(Attendance.builder().realProgram(rpPtWeightToday).member(user2).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(12).withMinute(2)).build());

        // 수업 6: 오후 릴랙스 요가 출결
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaRelaxToday).member(mJimin).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(13).withMinute(50)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaRelaxToday).member(mAhra).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(13).withMinute(55)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaRelaxToday).member(mAin).status(AttendanceStatus.PRESENT).recordedAt(now.withHour(13).withMinute(58)).build());
        attendanceRepository.save(Attendance.builder().realProgram(rpYogaRelaxToday).member(mEunwoo).status(AttendanceStatus.ABSENT).recordedAt(now.withHour(14).withMinute(5)).build());

        // =========================================================================
        // 12. 회원 보유 이용권 매핑 (MemberMembership) 등록
        // =========================================================================
        // 기존 이용권 보유 내역 보존
        memberMembershipRepository.save(MemberMembership.builder()
                .startDat(now)
                .endDat(now.plusDays(membership10.getDurationDays()))
                .paymentDate(now.toLocalDate())
                .uCnt(membership10.getUseCnt())
                .purchasePrice(membership10.getPrice())
                .hDay(membership10.getHoldDays())
                .center(center)
                .member(user1)
                .membership(membership10)
                .build());

        memberMembershipRepository.save(MemberMembership.builder()
                .startDat(now)
                .endDat(now.plusDays(membership10.getDurationDays()))
                .paymentDate(now.toLocalDate())
                .uCnt(membership10.getUseCnt())
                .purchasePrice(membership10.getPrice())
                .hDay(membership10.getHoldDays())
                .center(center)
                .member(user2)
                .membership(membership10)
                .build());

        memberMembershipRepository.save(MemberMembership.builder()
                .startDat(now)
                .endDat(now.plusDays(membership10.getDurationDays()))
                .paymentDate(now.toLocalDate())
                .uCnt(membership10.getUseCnt())
                .purchasePrice(membership10.getPrice())
                .hDay(membership10.getHoldDays())
                .center(center)
                .member(user3)
                .membership(membership10)
                .build());

        MemberMembership refundedMembership = memberMembershipRepository.save(MemberMembership.builder()
                .startDat(now.minusDays(10))
                .endDat(now.plusDays(20))
                .paymentDate(now.minusDays(10).toLocalDate())
                .uCnt(membership30.getUseCnt())
                .purchasePrice(membership30.getPrice())
                .hDay(membership30.getHoldDays())
                .center(center)
                .member(user1)
                .membership(membership30)
                .build());
        membershipRefundService.refund(refundedMembership.getId());

        // 신규 회원들에게 이용권 부여 (각 수업 종목에 알맞은 이용권 매핑)
        Member[] yogaMembers = { mSeoa, mDoyun, mJiho, mHaneul, mSujin, mMinjae, mYeeun, mTaeyang, mJimin, mAhra, mAin, mEunwoo, mSumin };
        for (Member m : yogaMembers) {
            memberMembershipRepository.save(MemberMembership.builder()
                    .startDat(now.minusDays(5))
                    .endDat(now.plusDays(ticketYoga10.getDurationDays()))
                    .paymentDate(now.minusDays(5).toLocalDate())
                    .uCnt(ticketYoga10.getUseCnt())
                    .purchasePrice(ticketYoga10.getPrice())
                    .hDay(ticketYoga10.getHoldDays())
                    .center(center)
                    .member(m)
                    .membership(ticketYoga10)
                    .build());
        }

        Member[] pilatesMembers = { mYujin, mDohyun, mJeonghaneul, mSohee, mSongkang, mEunbin, mJuhyuk, mTaeri };
        for (Member m : pilatesMembers) {
            memberMembershipRepository.save(MemberMembership.builder()
                    .startDat(now.minusDays(10))
                    .endDat(now.plusDays(ticketPilates20.getDurationDays()))
                    .paymentDate(now.minusDays(10).toLocalDate())
                    .uCnt(ticketPilates20.getUseCnt())
                    .purchasePrice(ticketPilates20.getPrice())
                    .hDay(ticketPilates20.getHoldDays())
                    .center(center)
                    .member(m)
                    .membership(ticketPilates20)
                    .build());
        }

        Member[] spinningMembers = { mMinsu, mYounghee, mCheolsu, mJinwoo, mDaeun, mTaepung, mGaeul };
        for (Member m : spinningMembers) {
            memberMembershipRepository.save(MemberMembership.builder()
                    .startDat(now.minusDays(3))
                    .endDat(now.plusDays(ticketSpinning30.getDurationDays()))
                    .paymentDate(now.minusDays(3).toLocalDate())
                    .uCnt(ticketSpinning30.getUseCnt())
                    .purchasePrice(ticketSpinning30.getPrice())
                    .hDay(ticketSpinning30.getHoldDays())
                    .center(center)
                    .member(m)
                    .membership(ticketSpinning30)
                    .build());
        }

        memberMembershipRepository.save(MemberMembership.builder()
                .startDat(now.minusDays(1))
                .endDat(now.plusDays(ticketPt20.getDurationDays()))
                .paymentDate(now.minusDays(1).toLocalDate())
                .uCnt(ticketPt20.getUseCnt())
                .purchasePrice(ticketPt20.getPrice())
                .hDay(ticketPt20.getHoldDays())
                .center(center)
                .member(mSimok)
                .membership(ticketPt20)
                .build());

        memberMembershipRepository.save(MemberMembership.builder()
                .startDat(now.minusDays(2))
                .endDat(now.plusDays(ticketPt20.getDurationDays()))
                .paymentDate(now.minusDays(2).toLocalDate())
                .uCnt(ticketPt20.getUseCnt())
                .purchasePrice(ticketPt20.getPrice())
                .hDay(ticketPt20.getHoldDays())
                .center(center)
                .member(user2)
                .membership(ticketPt20)
                .build());
    }
}
