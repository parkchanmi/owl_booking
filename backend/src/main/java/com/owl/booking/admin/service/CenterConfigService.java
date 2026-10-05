package com.owl.booking.admin.service;

import com.owl.booking.model.dto.CenterConfigDto;
import com.owl.booking.model.entity.Center;
import com.owl.booking.model.entity.CenterConfig;
import com.owl.booking.model.entity.type.ConfirmMode;
import com.owl.booking.model.repository.CenterConfigRepository;
import com.owl.booking.model.repository.CenterRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CenterConfigService {

    private static final String DEFAULT_ROLE_LABELS_JSON =
            "{\"OWNER\":\"총관리자\",\"MANAGER\":\"매니저\",\"INSTRUCTOR\":\"강사\"}";
    private static final String DEFAULT_ROLE_MENU_PERMISSIONS_JSON =
            "{\"OWNER\":[\"center-list\",\"member-list\",\"instructor-list\",\"class-list\",\"booking-schedule\",\"instructor-attendance\",\"ticket-list\",\"sales\",\"permission-list\",\"booking-index\"],\"MANAGER\":[\"member-list\",\"instructor-list\",\"class-list\",\"booking-schedule\",\"instructor-attendance\",\"ticket-list\",\"sales\",\"booking-index\"],\"INSTRUCTOR\":[\"instructor-attendance\"]}";
    private static final String DEFAULT_ROLE_MEMBER_MAPPINGS_JSON =
            "{\"OWNER\":[],\"MANAGER\":[],\"INSTRUCTOR\":[]}";
    private static final String DEFAULT_MEMBERSHIP_EXPIRY_EMAIL_SUBJECT =
            "[{센터명}] 이용권 만료 임박 안내";
    private static final String LEGACY_MEMBERSHIP_EXPIRY_EMAIL_TEMPLATE =
            "<h2>{회원명}님, 이용권 만료가 임박했습니다.</h2>"
            + "<p>안녕하세요, {센터명}입니다.</p>"
            + "<p>이용 중인 <strong>{이용권명}</strong>의 만료가 가까워 안내드립니다.</p>"
            + "<p>잔여 횟수: <strong>{잔여횟수}회</strong><br>만료일: <strong>{만료일}</strong></p>"
            + "<p>남은 이용 기간을 확인하시고 이용에 참고해 주세요.</p>"
            + "<p>감사합니다.<br>{센터명} 드림</p>";
    private static final String DEFAULT_MEMBERSHIP_EXPIRY_EMAIL_TEMPLATE =
            buildEmailTemplate(
                    "이용권 안내",
                    "{회원명}님, 이용권 만료가 임박했습니다.",
                    "이용 중인 <strong style=\"color:#20252b;\">{이용권명}</strong>의 만료가 가까워 안내드립니다.",
                    detailRow("잔여 횟수", "{잔여횟수}회", true)
                            + detailRow("만료일", "{만료일}", false),
                    "남은 이용 기간과 횟수를 확인하시고 이용에 참고해 주세요.");
    private static final String DEFAULT_WAITLIST_AVAILABLE_EMAIL_SUBJECT =
            "[{센터명}] 예약 가능한 자리가 생겼습니다";
    private static final String LEGACY_WAITLIST_AVAILABLE_EMAIL_TEMPLATE =
            "<h2>{회원명}님, 예약 가능한 자리가 생겼습니다.</h2>"
            + "<p>대기 중이던 <strong>{수업명}</strong> 수업에 자리가 발생했습니다.</p>"
            + "<p>수업 일시: <strong>{수업일시}</strong><br>예약 확정 기한: <strong>{확정기한}</strong></p>"
            + "<p>기한 내 예약을 확정해 주세요.</p>"
            + "<p>감사합니다.<br>{센터명} 드림</p>";
    private static final String PREVIOUS_WAITLIST_AVAILABLE_EMAIL_TEMPLATE =
            buildEmailTemplate(
                    "예약 가능 안내",
                    "{회원명}님, 예약 가능한 자리가 생겼습니다.",
                    "대기 중이던 <strong style=\"color:#20252b;\">{수업명}</strong> 수업에 자리가 발생했습니다.",
                    detailRow("수업 일시", "{수업일시}", true)
                            + detailRow("예약 확정 기한", "{확정기한}", false),
                    "예약 확정 기한이 지나면 다음 대기 회원에게 기회가 넘어갈 수 있으니 기한 내 확정해 주세요.");
    private static final String DEFAULT_WAITLIST_AVAILABLE_EMAIL_TEMPLATE =
            buildEmailTemplate(
                    "예약 가능 안내",
                    "{회원명}님, 예약 가능한 자리가 생겼습니다.",
                    "대기 중이던 <strong style=\"color:#20252b;\">{수업명}</strong> 수업에 자리가 발생했습니다.",
                    detailRow("수업 일시", "{수업일시}", true)
                            + detailRow("예약 확정 기한", "{확정기한}", false),
                    actionButton("{예약링크}", "예약하기"),
                    "예약 확정 기한이 지나면 다음 대기 회원에게 기회가 넘어갈 수 있으니 기한 내 확정해 주세요.");
    private static final String DEFAULT_WAITLIST_CONFIRMED_EMAIL_SUBJECT =
            "[{센터명}] 대기 예약이 확정되었습니다";
    private static final String LEGACY_WAITLIST_CONFIRMED_EMAIL_TEMPLATE =
            "<h2>{회원명}님, 예약이 확정되었습니다.</h2>"
            + "<p>대기 중이던 <strong>{수업명}</strong> 수업의 예약이 확정되었습니다.</p>"
            + "<p>수업 일시: <strong>{수업일시}</strong></p>"
            + "<p>수업 시간에 맞춰 방문해 주세요.</p>"
            + "<p>감사합니다.<br>{센터명} 드림</p>";
    private static final String DEFAULT_WAITLIST_CONFIRMED_EMAIL_TEMPLATE =
            buildEmailTemplate(
                    "예약 확정",
                    "{회원명}님, 예약이 확정되었습니다.",
                    "대기 중이던 <strong style=\"color:#20252b;\">{수업명}</strong> 수업의 예약이 최종 확정되었습니다.",
                    detailRow("수업명", "{수업명}", true)
                            + detailRow("수업 일시", "{수업일시}", false),
                    "원활한 수업 진행을 위해 시작 시간에 맞춰 방문해 주세요.");

    private final CenterConfigRepository centerConfigRepository;
    private final CenterRepository centerRepository;

    public CenterConfigService(CenterConfigRepository centerConfigRepository, CenterRepository centerRepository) {
        this.centerConfigRepository = centerConfigRepository;
        this.centerRepository = centerRepository;
    }

    public CenterConfigDto getByCenterId(String centerId) {
        CenterConfig config = centerConfigRepository.findByCenter_Id(centerId)
                .orElseGet(() -> createDefault(centerId));
        if (upgradeLegacyEmailTemplates(config)) {
            config = centerConfigRepository.save(config);
        }
        return toDto(config);
    }

    public List<CenterConfigDto> getAll() {
        return centerConfigRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public CenterConfigDto updateByCenterId(String centerId, CenterConfigDto dto) {
        CenterConfig config = centerConfigRepository.findByCenter_Id(centerId)
                .orElseGet(() -> createDefault(centerId));

        if (dto.getConfirmMode() != null) config.setConfirmMode(dto.getConfirmMode());
        if (dto.getWaitlistCapacity() != null) config.setWaitlistCapacity(dto.getWaitlistCapacity());
        if (dto.getCancleDeadlineMinutes() != null) config.setCancleDeadlineMinutes(dto.getCancleDeadlineMinutes());
        if (dto.getBookingOpenDays() != null) config.setBookingOpenDays(dto.getBookingOpenDays());
        if (dto.getGenerationStartDat() != null) config.setGenerationStartDat(dto.getGenerationStartDat());
        if (dto.getRefundCountThresholdPercent() != null) {
            validatePercent(dto.getRefundCountThresholdPercent());
            config.setRefundCountThresholdPercent(dto.getRefundCountThresholdPercent());
        }
        if (dto.getRefundPeriodThresholdPercent() != null) {
            validatePercent(dto.getRefundPeriodThresholdPercent());
            config.setRefundPeriodThresholdPercent(dto.getRefundPeriodThresholdPercent());
        }
        if (dto.getMembershipExpiryCountThreshold() != null) {
            validatePositive(dto.getMembershipExpiryCountThreshold(), "Membership expiry count threshold");
            config.setMembershipExpiryCountThreshold(dto.getMembershipExpiryCountThreshold());
        }
        if (dto.getMembershipExpiryDaysThreshold() != null) {
            validatePositive(dto.getMembershipExpiryDaysThreshold(), "Membership expiry days threshold");
            config.setMembershipExpiryDaysThreshold(dto.getMembershipExpiryDaysThreshold());
        }
        if (dto.getMembershipExpiryEmailSubject() != null) {
            config.setMembershipExpiryEmailSubject(dto.getMembershipExpiryEmailSubject());
        }
        if (dto.getMembershipExpiryEmailTemplate() != null) {
            config.setMembershipExpiryEmailTemplate(dto.getMembershipExpiryEmailTemplate());
        }
        if (dto.getWaitlistAvailableEmailSubject() != null) {
            config.setWaitlistAvailableEmailSubject(dto.getWaitlistAvailableEmailSubject());
        }
        if (dto.getWaitlistAvailableEmailTemplate() != null) {
            config.setWaitlistAvailableEmailTemplate(dto.getWaitlistAvailableEmailTemplate());
        }
        if (dto.getWaitlistConfirmedEmailSubject() != null) {
            config.setWaitlistConfirmedEmailSubject(dto.getWaitlistConfirmedEmailSubject());
        }
        if (dto.getWaitlistConfirmedEmailTemplate() != null) {
            config.setWaitlistConfirmedEmailTemplate(dto.getWaitlistConfirmedEmailTemplate());
        }
        if (dto.getAutoGenerateEnabled() != null) config.setAutoGenerateEnabled(dto.getAutoGenerateEnabled());
        if (dto.getGenerationDaysOfWeek() != null) config.setGenerationDaysOfWeek(dto.getGenerationDaysOfWeek());
        if (dto.getRoleLabelsJson() != null) config.setRoleLabelsJson(dto.getRoleLabelsJson());
        if (dto.getRoleMenuPermissionsJson() != null) config.setRoleMenuPermissionsJson(dto.getRoleMenuPermissionsJson());
        if (dto.getRoleMemberMappingsJson() != null) config.setRoleMemberMappingsJson(dto.getRoleMemberMappingsJson());

        return toDto(centerConfigRepository.save(config));
    }

    private CenterConfig createDefault(String centerId) {
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Center not found"));
        CenterConfig config = CenterConfig.builder().center(center).build();
        config.setConfirmMode(ConfirmMode.MANUAL);
        config.setBookingOpenDays(7L);
        config.setGenerationStartDat(14L);
        config.setRefundCountThresholdPercent(0);
        config.setRefundPeriodThresholdPercent(0);
        config.setMembershipExpiryCountThreshold(3);
        config.setMembershipExpiryDaysThreshold(7);
        config.setMembershipExpiryEmailSubject(DEFAULT_MEMBERSHIP_EXPIRY_EMAIL_SUBJECT);
        config.setMembershipExpiryEmailTemplate(DEFAULT_MEMBERSHIP_EXPIRY_EMAIL_TEMPLATE);
        config.setWaitlistAvailableEmailSubject(DEFAULT_WAITLIST_AVAILABLE_EMAIL_SUBJECT);
        config.setWaitlistAvailableEmailTemplate(DEFAULT_WAITLIST_AVAILABLE_EMAIL_TEMPLATE);
        config.setWaitlistConfirmedEmailSubject(DEFAULT_WAITLIST_CONFIRMED_EMAIL_SUBJECT);
        config.setWaitlistConfirmedEmailTemplate(DEFAULT_WAITLIST_CONFIRMED_EMAIL_TEMPLATE);
        config.setAutoGenerateEnabled(true);
        config.setGenerationDaysOfWeek("월,화,수,목,금,토,일");
        config.setRoleLabelsJson(DEFAULT_ROLE_LABELS_JSON);
        config.setRoleMenuPermissionsJson(DEFAULT_ROLE_MENU_PERMISSIONS_JSON);
        config.setRoleMemberMappingsJson(DEFAULT_ROLE_MEMBER_MAPPINGS_JSON);
        return centerConfigRepository.save(config);
    }

    private CenterConfigDto toDto(CenterConfig config) {
        CenterConfigDto dto = new CenterConfigDto();
        dto.setId(config.getId());
        dto.setConfirmMode(config.getConfirmMode());
        dto.setWaitlistCapacity(config.getWaitlistCapacity());
        dto.setCancleDeadlineMinutes(config.getCancleDeadlineMinutes());
        dto.setBookingOpenDays(config.getBookingOpenDays());
        dto.setGenerationStartDat(config.getGenerationStartDat());
        dto.setRefundCountThresholdPercent(config.getRefundCountThresholdPercent() != null ? config.getRefundCountThresholdPercent() : 0);
        dto.setRefundPeriodThresholdPercent(config.getRefundPeriodThresholdPercent() != null ? config.getRefundPeriodThresholdPercent() : 0);
        dto.setMembershipExpiryCountThreshold(config.getMembershipExpiryCountThreshold() != null ? config.getMembershipExpiryCountThreshold() : 3);
        dto.setMembershipExpiryDaysThreshold(config.getMembershipExpiryDaysThreshold() != null ? config.getMembershipExpiryDaysThreshold() : 7);
        dto.setMembershipExpiryEmailSubject(config.getMembershipExpiryEmailSubject() != null
                ? config.getMembershipExpiryEmailSubject()
                : DEFAULT_MEMBERSHIP_EXPIRY_EMAIL_SUBJECT);
        dto.setMembershipExpiryEmailTemplate(config.getMembershipExpiryEmailTemplate() != null
                ? config.getMembershipExpiryEmailTemplate()
                : DEFAULT_MEMBERSHIP_EXPIRY_EMAIL_TEMPLATE);
        dto.setWaitlistAvailableEmailSubject(config.getWaitlistAvailableEmailSubject() != null
                ? config.getWaitlistAvailableEmailSubject()
                : DEFAULT_WAITLIST_AVAILABLE_EMAIL_SUBJECT);
        dto.setWaitlistAvailableEmailTemplate(config.getWaitlistAvailableEmailTemplate() != null
                ? config.getWaitlistAvailableEmailTemplate()
                : DEFAULT_WAITLIST_AVAILABLE_EMAIL_TEMPLATE);
        dto.setWaitlistConfirmedEmailSubject(config.getWaitlistConfirmedEmailSubject() != null
                ? config.getWaitlistConfirmedEmailSubject()
                : DEFAULT_WAITLIST_CONFIRMED_EMAIL_SUBJECT);
        dto.setWaitlistConfirmedEmailTemplate(config.getWaitlistConfirmedEmailTemplate() != null
                ? config.getWaitlistConfirmedEmailTemplate()
                : DEFAULT_WAITLIST_CONFIRMED_EMAIL_TEMPLATE);
        dto.setAutoGenerateEnabled(config.getAutoGenerateEnabled());
        dto.setGenerationDaysOfWeek(config.getGenerationDaysOfWeek());
        dto.setRoleLabelsJson(config.getRoleLabelsJson() != null ? config.getRoleLabelsJson() : DEFAULT_ROLE_LABELS_JSON);
        dto.setRoleMenuPermissionsJson(config.getRoleMenuPermissionsJson() != null ? config.getRoleMenuPermissionsJson() : DEFAULT_ROLE_MENU_PERMISSIONS_JSON);
        dto.setRoleMemberMappingsJson(config.getRoleMemberMappingsJson() != null ? config.getRoleMemberMappingsJson() : DEFAULT_ROLE_MEMBER_MAPPINGS_JSON);
        return dto;
    }

    private void validatePercent(int percent) {
        if (percent < 0 || percent > 100) {
            throw new ResponseStatusException(BAD_REQUEST, "Refund threshold percent must be between 0 and 100");
        }
    }

    private void validatePositive(int value, String fieldName) {
        if (value < 1) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " must be at least 1");
        }
    }

    private boolean upgradeLegacyEmailTemplates(CenterConfig config) {
        boolean changed = false;
        if (LEGACY_MEMBERSHIP_EXPIRY_EMAIL_TEMPLATE.equals(config.getMembershipExpiryEmailTemplate())) {
            config.setMembershipExpiryEmailTemplate(DEFAULT_MEMBERSHIP_EXPIRY_EMAIL_TEMPLATE);
            changed = true;
        }
        if (LEGACY_WAITLIST_AVAILABLE_EMAIL_TEMPLATE.equals(config.getWaitlistAvailableEmailTemplate())
                || PREVIOUS_WAITLIST_AVAILABLE_EMAIL_TEMPLATE.equals(config.getWaitlistAvailableEmailTemplate())) {
            config.setWaitlistAvailableEmailTemplate(DEFAULT_WAITLIST_AVAILABLE_EMAIL_TEMPLATE);
            changed = true;
        }
        if (LEGACY_WAITLIST_CONFIRMED_EMAIL_TEMPLATE.equals(config.getWaitlistConfirmedEmailTemplate())) {
            config.setWaitlistConfirmedEmailTemplate(DEFAULT_WAITLIST_CONFIRMED_EMAIL_TEMPLATE);
            changed = true;
        }
        return changed;
    }

    private static String detailRow(String label, String value, boolean withBorder) {
        String border = withBorder ? "border-bottom:1px solid #e7ebef;" : "";
        return "<tr>"
                + "<td style=\"width:34%;padding:14px 18px;" + border
                + "color:#7a8590;font-size:13px;line-height:1.5;\">" + label + "</td>"
                + "<td style=\"padding:14px 18px;" + border
                + "color:#20252b;font-size:14px;font-weight:700;line-height:1.5;\">" + value + "</td>"
                + "</tr>";
    }

    private static String buildEmailTemplate(
            String badge, String title, String intro, String details, String notice) {
        return buildEmailTemplate(badge, title, intro, details, "", notice);
    }

    private static String actionButton(String href, String label) {
        return "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;margin:0 0 22px;\">"
                + "<tr><td style=\"border-radius:4px;background-color:#17212b;\">"
                + "<a href=\"" + href + "\" target=\"_blank\" rel=\"noopener\" style=\"display:inline-block;padding:13px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;line-height:1;\">"
                + label
                + "</a></td></tr></table>";
    }

    private static String buildEmailTemplate(
            String badge, String title, String intro, String details, String action, String notice) {
        return """
                <div data-owl-email-template="v1" style="margin:0;padding:32px 16px;background-color:#f4f6f8;font-family:Arial,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#20252b;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
                    <tr><td align="center">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-collapse:separate;background-color:#ffffff;border:1px solid #e5e9ee;border-radius:8px;overflow:hidden;">
                        <tr><td style="padding:22px 32px;background-color:#17212b;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr>
                            <td style="color:#ffffff;font-size:20px;font-weight:700;line-height:1.2;">OWL</td>
                            <td align="right" style="color:#b8c5d1;font-size:12px;line-height:1.4;">{센터명}</td>
                          </tr></table>
                        </td></tr>
                        <tr><td style="padding:36px 32px 18px;">
                          <span style="display:inline-block;padding:6px 10px;background-color:#eaf4ff;color:#1268b3;font-size:12px;font-weight:700;line-height:1;border-radius:4px;">{{BADGE}}</span>
                          <h1 style="margin:16px 0 12px;color:#17212b;font-size:26px;font-weight:700;line-height:1.4;letter-spacing:0;">{{TITLE}}</h1>
                          <p style="margin:0;color:#56616d;font-size:15px;line-height:1.8;">{{INTRO}}</p>
                        </td></tr>
                        <tr><td style="padding:10px 32px 24px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:separate;background-color:#f7f9fb;border:1px solid #e7ebef;border-radius:6px;">{{DETAILS}}</table>
                        </td></tr>
                        <tr><td style="padding:0 32px 36px;">
                          {{ACTION}}
                          <p style="margin:0;padding:16px 18px;border-left:4px solid #2f80c9;background-color:#f1f7fc;color:#34414e;font-size:14px;line-height:1.7;">{{NOTICE}}</p>
                          <p style="margin:26px 0 0;color:#56616d;font-size:14px;line-height:1.8;">감사합니다.<br><strong style="color:#20252b;">{센터명}</strong> 드림</p>
                        </td></tr>
                        <tr><td style="padding:18px 32px;background-color:#f7f9fb;border-top:1px solid #e7ebef;color:#89939e;font-size:11px;line-height:1.6;text-align:center;">
                          본 메일은 {센터명}의 서비스 이용 안내를 위해 발송되었습니다.
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </div>
                """
                .replace("{{BADGE}}", badge)
                .replace("{{TITLE}}", title)
                .replace("{{INTRO}}", intro)
                .replace("{{DETAILS}}", details)
                .replace("{{ACTION}}", action)
                .replace("{{NOTICE}}", notice)
                .trim();
    }
}
