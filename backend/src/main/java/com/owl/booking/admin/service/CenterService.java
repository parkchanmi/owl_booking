package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.CenterConfig;
import com.owl.booking.model.entity.CenterMember;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.type.ConfirmMode;
import com.owl.booking.model.entity.type.MemberType;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.CenterMemberRepository;
import com.owl.booking.model.repository.CenterRepository;
import com.owl.booking.model.repository.MemberRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Objects;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CenterService {

    private final CenterRepository centerRepository;
    private final CenterMemberRepository centerMemberRepository;
    private final MemberRepository memberRepository;
    private final CenterConfigRepository centerConfigRepository;

    private static final String DEFAULT_ROLE_LABELS_JSON =
            "{\"OWNER\":\"총관리자\",\"MANAGER\":\"매니저\",\"INSTRUCTOR\":\"강사\"}";
    private static final String DEFAULT_ROLE_MENU_PERMISSIONS_JSON =
            "{\"OWNER\":[\"center-list\",\"instructor-list\",\"instructor-attendance\",\"class-list\",\"booking-index\",\"booking-schedule\",\"ticket-list\",\"member-list\",\"permission-list\"],\"MANAGER\":[\"instructor-list\",\"class-list\",\"booking-index\",\"booking-schedule\",\"ticket-list\",\"member-list\"],\"INSTRUCTOR\":[\"instructor-attendance\"]}";

    public CenterService(
            CenterRepository centerRepository,
            CenterMemberRepository centerMemberRepository,
            MemberRepository memberRepository,
            CenterConfigRepository centerConfigRepository
    ) {
        this.centerRepository = centerRepository;
        this.centerMemberRepository = centerMemberRepository;
        this.memberRepository = memberRepository;
        this.centerConfigRepository = centerConfigRepository;
    }

    public List<CenterDto> getAllCenters() {
        Member currentMember = getCurrentMember();
        if (currentMember == null) {
            return List.of();
        }

        return centerMemberRepository.findByMember_IdAndType(currentMember.getId(), MemberType.ADMIN).stream()
                .map(CenterMember::getCenter)
                .filter(Objects::nonNull)
                .distinct()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CenterDto createCenter(CenterDto centerDto) {
        Member currentMember = requireCurrentMember();

        Center center = Center.builder()
                .name(centerDto.getName())
                .bizNo(centerDto.getBizNo())
                .ceoName(centerDto.getCeoName())
                .bizName(centerDto.getBizName())
                .addr(centerDto.getAddr())
                .addrDetail(centerDto.getAddrDetail())
                .tel(centerDto.getTel())
                .build();
        centerRepository.save(center);

        centerMemberRepository.save(CenterMember.builder()
                .center(center)
                .member(currentMember)
                .type(MemberType.ADMIN)
                .build());

        createDefaultCenterConfig(center, currentMember);

        return toDto(center);
    }

    public CenterDto updateCenter(String id, CenterDto centerDto) {
        Center center = centerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Center not found"));

        center.setName(centerDto.getName());
        center.setBizNo(centerDto.getBizNo());
        center.setCeoName(centerDto.getCeoName());
        center.setBizName(centerDto.getBizName());
        center.setAddr(centerDto.getAddr());
        center.setAddrDetail(centerDto.getAddrDetail());
        center.setTel(centerDto.getTel());

        return toDto(centerRepository.save(center));
    }

    public void deleteCenter(String id) {
        if (!centerRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Center not found");
        }

        centerRepository.deleteById(id);
    }

    private CenterDto toDto(Center center) {
        CenterDto centerDto = new CenterDto();
        centerDto.setId(center.getId());
        centerDto.setName(center.getName());
        centerDto.setBizNo(center.getBizNo());
        centerDto.setCeoName(center.getCeoName());
        centerDto.setBizName(center.getBizName());
        centerDto.setAddr(center.getAddr());
        centerDto.setAddrDetail(center.getAddrDetail());
        centerDto.setTel(center.getTel());
        return centerDto;
    }

    private Member getCurrentMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        return memberRepository.findByLoginId(authentication.getName());
    }

    private Member requireCurrentMember() {
        Member member = getCurrentMember();
        if (member == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return member;
    }

    private void createDefaultCenterConfig(Center center, Member owner) {
        if (centerConfigRepository.findByCenter_Id(center.getId()).isPresent()) {
            return;
        }

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
