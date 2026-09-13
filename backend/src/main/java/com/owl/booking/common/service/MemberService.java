package com.owl.booking.common.service;

import com.owl.booking.model.dto.MemberJoinRequestDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.CenterConfig;
import com.owl.booking.model.entity.CenterMember;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.type.MemberProvider;
import com.owl.booking.model.entity.type.MemberType;
import com.owl.booking.model.entity.type.MemberStatus;
import com.owl.booking.model.entity.type.ConfirmMode;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.CenterMemberRepository;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.MemberRepository;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;

@Service
public class MemberService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0\\d{1,2}-\\d{3,4}-\\d{4}$");

    @Autowired
    private PasswordEncoder passwordEncoder; // SecurityConfig에서 등록한 빈(Bean)
    private final MemberRepository memberRepository;
    private final CenterRepository centerRepository;
    private final CenterMemberRepository centerMemberRepository;
    private final CenterConfigRepository centerConfigRepository;

    private static final String DEFAULT_ROLE_LABELS_JSON =
            "{\"OWNER\":\"총관리자\",\"MANAGER\":\"매니저\",\"INSTRUCTOR\":\"강사\"}";
    private static final String DEFAULT_ROLE_MENU_PERMISSIONS_JSON =
            "{\"OWNER\":[\"center-list\",\"instructor-list\",\"instructor-attendance\",\"class-list\",\"booking-index\",\"booking-schedule\",\"ticket-list\",\"member-list\",\"permission-list\"],\"MANAGER\":[\"instructor-list\",\"class-list\",\"booking-index\",\"booking-schedule\",\"ticket-list\",\"member-list\"],\"INSTRUCTOR\":[\"instructor-attendance\"]}";

    public MemberService(
            MemberRepository memberRepository,
            CenterRepository centerRepository,
            CenterMemberRepository centerMemberRepository,
            CenterConfigRepository centerConfigRepository
    ) {
        this.memberRepository = memberRepository;
        this.centerRepository = centerRepository;
        this.centerMemberRepository = centerMemberRepository;
        this.centerConfigRepository = centerConfigRepository;
    }

    public Member createMember(Member member) {

        // 1. 비밀번호 암호화 (예: "1234" -> "$2a$10$vIu...")
        String encodedPassword = passwordEncoder.encode(member.getPwd());
        
        // 2. 암호화된 비밀번호로 셋팅
        member.setPwd(encodedPassword);

        return memberRepository.save(member);
    }

    @Transactional
    public Member join(MemberJoinRequestDto request) {
        if (memberRepository.findByLoginId(request.getLoginId()) != null) {
            throw new ResponseStatusException(CONFLICT, "이미 사용중인 아이디입니다.");
        }

        Member member = Member.builder()
                .type(MemberType.USER)
                .status(MemberStatus.ACTIVE)
                .loginId(request.getLoginId())
                .pwd(passwordEncoder.encode(request.getPwd()))
                .name(request.getName())
                .email(request.getEmail())
                .hp(request.getHp())
                .build();
        memberRepository.save(member);

        if ("admin".equalsIgnoreCase(request.getUserType())) {
            Center center = Center.builder()
                    .name(request.getCompanyName())
                    .bizNo(request.getBusinessNo())
                    .ceoName(request.getCeoName())
                    .bizName(request.getCompanyName())
                    .addr(request.getAddress1())
                    .addrDetail(request.getAddress2())
                    .tel(request.getTel() != null && !request.getTel().isBlank() ? request.getTel() : request.getHp())
                    .build();
            centerRepository.save(center);

            centerMemberRepository.save(CenterMember.builder()
                    .center(center)
                    .member(member)
                    .type(MemberType.ADMIN)
                    .build());

            createDefaultCenterConfig(center, member);
        }

        return member;
    }

    public Member findByLoginId(String loginId) {
        Member member = memberRepository.findByLoginId(loginId);
        return member;
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public List<Member> searchMembers(MemberType type, String keyword) {
        if (type == null || keyword == null || keyword.isBlank()) {
            return List.of();
        }

        return memberRepository.searchLinkableMembers(MemberStatus.WITHDRAWN, keyword.trim());
    }

    public Member findById(String id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Member not found"));
    }

    public Member findOrCreateByKakao(KakaoOAuthService.KakaoUserInfo kakaoUserInfo) {
        Member existing = memberRepository.findByProviderAndProviderId(MemberProvider.KAKAO, kakaoUserInfo.providerId());
        if (existing != null) {
            return existing;
        }

        Member newMember = Member.builder()
                .type(MemberType.USER)
                .provider(MemberProvider.KAKAO)
                .providerId(kakaoUserInfo.providerId())
                .loginId("kakao_" + kakaoUserInfo.providerId())
                .pwd(passwordEncoder.encode(UUID.randomUUID().toString()))
                .name(kakaoUserInfo.nickname())
                .email("")
                .build();

        return memberRepository.save(newMember);
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

    private void createDefaultCenterConfig(Center center, Member owner) {
        String ownerMappingJson = "{\"OWNER\":[\"" + owner.getId() + "\"],\"MANAGER\":[],\"INSTRUCTOR\":[]}";

        CenterConfig config = CenterConfig.builder()
                .confirmMode(ConfirmMode.AUTO)
                .bookingOpenDays(7L)
                .generationStartDat(14L)
                .autoGenerateEnabled(true)
                .generationDaysOfWeek("월,화,수,목,금,토,일")
                .roleLabelsJson(DEFAULT_ROLE_LABELS_JSON)
                .roleMenuPermissionsJson(DEFAULT_ROLE_MENU_PERMISSIONS_JSON)
                .roleMemberMappingsJson(ownerMappingJson)
                .center(center)
                .build();
        centerConfigRepository.save(config);
    }
}
