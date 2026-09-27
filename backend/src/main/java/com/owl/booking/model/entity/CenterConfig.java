package com.owl.booking.model.entity;

import com.owl.booking.model.entity.type.ConfirmMode;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.HashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "center_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CenterConfig {

    private static final String CONFIRM_MODE = "booking.confirmMode";
    private static final String WAITLIST_CAPACITY = "booking.waitlistCapacity";
    private static final String CANCEL_DEADLINE_MINUTES = "booking.cancelDeadlineMinutes";
    private static final String BOOKING_OPEN_DAYS = "booking.openDays";
    private static final String GENERATION_START_DAT = "schedule.generationStartDays";
    private static final String REFUND_COUNT_THRESHOLD = "refund.countThresholdPercent";
    private static final String REFUND_PERIOD_THRESHOLD = "refund.periodThresholdPercent";
    private static final String AUTO_GENERATE_ENABLED = "schedule.autoGenerateEnabled";
    private static final String GENERATION_DAYS_OF_WEEK = "schedule.generationDaysOfWeek";
    private static final String ROLE_LABELS_JSON = "permission.roleLabelsJson";
    private static final String ROLE_MENU_PERMISSIONS_JSON = "permission.roleMenuPermissionsJson";
    private static final String ROLE_MEMBER_MAPPINGS_JSON = "permission.roleMemberMappingsJson";
    private static final String MEMBERSHIP_EXPIRY_COUNT_THRESHOLD = "notification.membershipExpiry.countThreshold";
    private static final String MEMBERSHIP_EXPIRY_DAYS_THRESHOLD = "notification.membershipExpiry.daysThreshold";
    private static final String MEMBERSHIP_EXPIRY_EMAIL_SUBJECT = "notification.membershipExpiry.emailSubject";
    private static final String MEMBERSHIP_EXPIRY_EMAIL_TEMPLATE = "notification.membershipExpiry.emailTemplate";
    private static final String WAITLIST_AVAILABLE_EMAIL_SUBJECT = "notification.waitlistAvailable.emailSubject";
    private static final String WAITLIST_AVAILABLE_EMAIL_TEMPLATE = "notification.waitlistAvailable.emailTemplate";
    private static final String WAITLIST_CONFIRMED_EMAIL_SUBJECT = "notification.waitlistConfirmed.emailSubject";
    private static final String WAITLIST_CONFIRMED_EMAIL_TEMPLATE = "notification.waitlistConfirmed.emailTemplate";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "center_config_property",
            joinColumns = @JoinColumn(name = "center_config_id")
    )
    @MapKeyColumn(name = "property_name", length = 120)
    @Column(name = "property_value", columnDefinition = "LONGTEXT", nullable = false)
    private Map<String, String> properties = new HashMap<>();

    @OneToOne
    @JoinColumn(name = "center_id", referencedColumnName = "id")
    private Center center;

    public ConfirmMode getConfirmMode() {
        String value = getProperty(CONFIRM_MODE);
        return value == null ? null : ConfirmMode.valueOf(value);
    }

    public void setConfirmMode(ConfirmMode value) {
        setProperty(CONFIRM_MODE, value == null ? null : value.name());
    }

    public Long getWaitlistCapacity() { return getLongProperty(WAITLIST_CAPACITY); }
    public void setWaitlistCapacity(Long value) { setProperty(WAITLIST_CAPACITY, value); }

    public Long getCancleDeadlineMinutes() { return getLongProperty(CANCEL_DEADLINE_MINUTES); }
    public void setCancleDeadlineMinutes(Long value) { setProperty(CANCEL_DEADLINE_MINUTES, value); }

    public Long getBookingOpenDays() { return getLongProperty(BOOKING_OPEN_DAYS); }
    public void setBookingOpenDays(Long value) { setProperty(BOOKING_OPEN_DAYS, value); }

    public Long getGenerationStartDat() { return getLongProperty(GENERATION_START_DAT); }
    public void setGenerationStartDat(Long value) { setProperty(GENERATION_START_DAT, value); }

    public Integer getRefundCountThresholdPercent() { return getIntegerProperty(REFUND_COUNT_THRESHOLD); }
    public void setRefundCountThresholdPercent(Integer value) { setProperty(REFUND_COUNT_THRESHOLD, value); }

    public Integer getRefundPeriodThresholdPercent() { return getIntegerProperty(REFUND_PERIOD_THRESHOLD); }
    public void setRefundPeriodThresholdPercent(Integer value) { setProperty(REFUND_PERIOD_THRESHOLD, value); }

    public Boolean getAutoGenerateEnabled() { return getBooleanProperty(AUTO_GENERATE_ENABLED); }
    public void setAutoGenerateEnabled(Boolean value) { setProperty(AUTO_GENERATE_ENABLED, value); }

    public String getGenerationDaysOfWeek() { return getProperty(GENERATION_DAYS_OF_WEEK); }
    public void setGenerationDaysOfWeek(String value) { setProperty(GENERATION_DAYS_OF_WEEK, value); }

    public String getRoleLabelsJson() { return getProperty(ROLE_LABELS_JSON); }
    public void setRoleLabelsJson(String value) { setProperty(ROLE_LABELS_JSON, value); }

    public String getRoleMenuPermissionsJson() { return getProperty(ROLE_MENU_PERMISSIONS_JSON); }
    public void setRoleMenuPermissionsJson(String value) { setProperty(ROLE_MENU_PERMISSIONS_JSON, value); }

    public String getRoleMemberMappingsJson() { return getProperty(ROLE_MEMBER_MAPPINGS_JSON); }
    public void setRoleMemberMappingsJson(String value) { setProperty(ROLE_MEMBER_MAPPINGS_JSON, value); }

    public Integer getMembershipExpiryCountThreshold() { return getIntegerProperty(MEMBERSHIP_EXPIRY_COUNT_THRESHOLD); }
    public void setMembershipExpiryCountThreshold(Integer value) { setProperty(MEMBERSHIP_EXPIRY_COUNT_THRESHOLD, value); }

    public Integer getMembershipExpiryDaysThreshold() { return getIntegerProperty(MEMBERSHIP_EXPIRY_DAYS_THRESHOLD); }
    public void setMembershipExpiryDaysThreshold(Integer value) { setProperty(MEMBERSHIP_EXPIRY_DAYS_THRESHOLD, value); }

    public String getMembershipExpiryEmailSubject() { return getProperty(MEMBERSHIP_EXPIRY_EMAIL_SUBJECT); }
    public void setMembershipExpiryEmailSubject(String value) { setProperty(MEMBERSHIP_EXPIRY_EMAIL_SUBJECT, value); }

    public String getMembershipExpiryEmailTemplate() { return getProperty(MEMBERSHIP_EXPIRY_EMAIL_TEMPLATE); }
    public void setMembershipExpiryEmailTemplate(String value) { setProperty(MEMBERSHIP_EXPIRY_EMAIL_TEMPLATE, value); }

    public String getWaitlistAvailableEmailSubject() { return getProperty(WAITLIST_AVAILABLE_EMAIL_SUBJECT); }
    public void setWaitlistAvailableEmailSubject(String value) { setProperty(WAITLIST_AVAILABLE_EMAIL_SUBJECT, value); }

    public String getWaitlistAvailableEmailTemplate() { return getProperty(WAITLIST_AVAILABLE_EMAIL_TEMPLATE); }
    public void setWaitlistAvailableEmailTemplate(String value) { setProperty(WAITLIST_AVAILABLE_EMAIL_TEMPLATE, value); }

    public String getWaitlistConfirmedEmailSubject() { return getProperty(WAITLIST_CONFIRMED_EMAIL_SUBJECT); }
    public void setWaitlistConfirmedEmailSubject(String value) { setProperty(WAITLIST_CONFIRMED_EMAIL_SUBJECT, value); }

    public String getWaitlistConfirmedEmailTemplate() { return getProperty(WAITLIST_CONFIRMED_EMAIL_TEMPLATE); }
    public void setWaitlistConfirmedEmailTemplate(String value) { setProperty(WAITLIST_CONFIRMED_EMAIL_TEMPLATE, value); }

    public String getProperty(String name) {
        return properties == null ? null : properties.get(name);
    }

    public void setProperty(String name, Object value) {
        if (properties == null) properties = new HashMap<>();
        if (value == null) {
            properties.remove(name);
        } else {
            properties.put(name, String.valueOf(value));
        }
    }

    private Long getLongProperty(String name) {
        String value = getProperty(name);
        return value == null ? null : Long.valueOf(value);
    }

    private Integer getIntegerProperty(String name) {
        String value = getProperty(name);
        return value == null ? null : Integer.valueOf(value);
    }

    private Boolean getBooleanProperty(String name) {
        String value = getProperty(name);
        return value == null ? null : Boolean.valueOf(value);
    }
}
