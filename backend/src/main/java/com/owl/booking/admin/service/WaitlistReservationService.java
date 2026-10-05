package com.owl.booking.admin.service;

import com.owl.booking.common.service.MailService;
import com.owl.booking.model.dto.CenterConfigDto;
import com.owl.booking.model.dto.MyBookingDto;
import com.owl.booking.model.dto.WaitlistReservationDto;
import com.owl.booking.model.entity.Booking;
import com.owl.booking.model.entity.Member;
import com.owl.booking.model.entity.RealProgram;
import com.owl.booking.model.entity.Waitlist;
import com.owl.booking.model.entity.type.ConfirmMode;
import com.owl.booking.model.repository.BookingRepository;
import com.owl.booking.model.repository.RealProgramRepository;
import com.owl.booking.model.repository.WaitlistRepository;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class WaitlistReservationService {

    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy년 M월 d일 HH:mm");

    private final WaitlistRepository waitlistRepository;
    private final BookingRepository bookingRepository;
    private final RealProgramRepository realProgramRepository;
    private final CenterConfigService centerConfigService;
    private final MailService mailService;
    private final TransactionTemplate tokenTransactionTemplate;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public WaitlistReservationService(
            WaitlistRepository waitlistRepository,
            BookingRepository bookingRepository,
            RealProgramRepository realProgramRepository,
            CenterConfigService centerConfigService,
            MailService mailService,
            PlatformTransactionManager transactionManager
    ) {
        this.waitlistRepository = waitlistRepository;
        this.bookingRepository = bookingRepository;
        this.realProgramRepository = realProgramRepository;
        this.centerConfigService = centerConfigService;
        this.mailService = mailService;
        this.tokenTransactionTemplate = new TransactionTemplate(transactionManager);
        this.tokenTransactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Async
    @Transactional
    public void handleAvailableSeatAsync(String programId) {
        if (programId == null || programId.isBlank()) {
            return;
        }
        try {
            realProgramRepository.findById(programId).ifPresent(program -> {
                CenterConfigDto config = getConfig(program);
                if (config == null) {
                    return;
                }
                if (config.getConfirmMode() == ConfirmMode.AUTO) {
                    int confirmedCount = confirmEarliestWaitlists(program, config);
                    log.info("자동 대기 확정 처리 완료: programId={}, confirmedCount={}", programId, confirmedCount);
                } else {
                    int queuedCount = sendAvailableMails(program, config);
                    log.info("대기 예약 가능 메일 발송 요청 완료: programId={}, queuedCount={}", programId, queuedCount);
                }
            });
        } catch (RuntimeException e) {
            log.error("대기 자리 발생 처리 중 오류: programId={}", programId, e);
        }
    }

    @Transactional
    public int sendAvailableMails(RealProgram program) {
        CenterConfigDto config = getConfig(program);
        if (config == null) {
            return 0;
        }
        return sendAvailableMails(program, config);
    }

    private int sendAvailableMails(RealProgram program, CenterConfigDto config) {
        if (program == null || program.getCenter() == null || program.getCenter().getId() == null) {
            return 0;
        }
        long bookingCount = bookingRepository.findByProgram(program).size();
        if (program.getMaxCapacity() != null && bookingCount >= program.getMaxCapacity()) {
            return 0;
        }

        String subjectTemplate = config.getWaitlistAvailableEmailSubject();
        String bodyTemplate = config.getWaitlistAvailableEmailTemplate();
        if (subjectTemplate == null || subjectTemplate.isBlank()
                || bodyTemplate == null || bodyTemplate.isBlank()) {
            return 0;
        }

        int queuedCount = 0;
        List<Waitlist> waitlists = waitlistRepository.findByProgram(program);
        for (Waitlist waitlist : waitlists) {
            Member member = waitlist.getMember();
            if (member == null || member.getEmail() == null || member.getEmail().isBlank()) {
                continue;
            }
            String reservationToken = ensureReservationToken(waitlist.getId());
            waitlist.setReservationToken(reservationToken);

            queueHtmlMailAfterCommit(
                    member.getEmail(),
                    replaceVariables(subjectTemplate, waitlist),
                    replaceVariables(bodyTemplate, waitlist)
            );
            queuedCount++;
        }
        return queuedCount;
    }

    private int confirmEarliestWaitlists(RealProgram program, CenterConfigDto config) {
        int confirmedCount = 0;
        while (hasAvailableSeat(program)) {
            Waitlist waitlist = waitlistRepository.findFirstByProgramOrderByCreatedAtAscIdAsc(program).orElse(null);
            if (waitlist == null || waitlist.getMember() == null) {
                break;
            }

            Booking booking = Booking.builder()
                    .center(program.getCenter())
                    .program(program)
                    .member(waitlist.getMember())
                    .build();
            bookingRepository.save(booking);
            waitlistRepository.delete(waitlist);
            queueConfirmedMail(config, waitlist, program);
            confirmedCount++;
        }
        return confirmedCount;
    }

    private boolean hasAvailableSeat(RealProgram program) {
        long bookingCount = bookingRepository.findByProgram(program).size();
        return program.getMaxCapacity() == null || bookingCount < program.getMaxCapacity();
    }

    private void queueConfirmedMail(CenterConfigDto config, Waitlist waitlist, RealProgram program) {
        Member member = waitlist.getMember();
        if (member == null || member.getEmail() == null || member.getEmail().isBlank()) {
            return;
        }

        String subjectTemplate = config.getWaitlistConfirmedEmailSubject();
        String bodyTemplate = config.getWaitlistConfirmedEmailTemplate();
        if (subjectTemplate == null || subjectTemplate.isBlank()
                || bodyTemplate == null || bodyTemplate.isBlank()) {
            return;
        }

        queueHtmlMailAfterCommit(
                member.getEmail(),
                replaceVariables(subjectTemplate, waitlist, program),
                replaceVariables(bodyTemplate, waitlist, program)
        );
    }

    private void queueHtmlMailAfterCommit(String email, String subject, String body) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    mailService.sendHtmlMessageAsync(email, subject, body);
                }
            });
            return;
        }
        mailService.sendHtmlMessageAsync(email, subject, body);
    }

    private String ensureReservationToken(String waitlistId) {
        return tokenTransactionTemplate.execute(status -> {
            Waitlist latest = waitlistRepository.findById(waitlistId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "대기 이력을 찾을 수 없습니다."));
            if (latest.getReservationToken() == null || latest.getReservationToken().isBlank()) {
                latest.setReservationToken(UUID.randomUUID().toString().replace("-", ""));
                waitlistRepository.saveAndFlush(latest);
            }
            return latest.getReservationToken();
        });
    }

    @Transactional(readOnly = true)
    public WaitlistReservationDto getReservation(String token, String waitlistId) {
        Waitlist waitlist = findByTokenOrId(token, waitlistId);
        RealProgram program = requireProgram(waitlist);
        return toReservationDto(waitlist, program);
    }

    @Transactional
    public MyBookingDto reserve(String token, String waitlistId) {
        Waitlist waitlist = findByTokenOrId(token, waitlistId);
        RealProgram program = requireProgram(waitlist);
        Member member = waitlist.getMember();
        if (member == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "대기 회원 정보를 찾을 수 없습니다.");
        }

        long bookingCount = bookingRepository.findByProgram(program).size();
        if (program.getMaxCapacity() != null && bookingCount >= program.getMaxCapacity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "예약 정원이 초과되었습니다.");
        }

        Booking booking = Booking.builder()
                .center(program.getCenter())
                .program(program)
                .member(member)
                .build();
        bookingRepository.save(booking);
        waitlistRepository.delete(waitlist);

        return toMyBookingDto(booking);
    }

    private Waitlist findByTokenOrId(String token, String waitlistId) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "예약 링크가 올바르지 않습니다.");
        }
        return waitlistRepository.findByReservationToken(token)
                .or(() -> findByIdAndValidateToken(waitlistId, token))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "대기 이력을 찾을 수 없습니다."));
    }

    private java.util.Optional<Waitlist> findByIdAndValidateToken(String waitlistId, String token) {
        if (waitlistId == null || waitlistId.isBlank()) {
            return java.util.Optional.empty();
        }
        return waitlistRepository.findById(waitlistId)
                .filter(waitlist -> token.equals(waitlist.getReservationToken()));
    }

    private RealProgram requireProgram(Waitlist waitlist) {
        if (waitlist.getProgram() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "수업 정보를 찾을 수 없습니다.");
        }
        return waitlist.getProgram();
    }

    private String replaceVariables(String template, Waitlist waitlist) {
        return replaceVariables(template, waitlist, waitlist.getProgram());
    }

    private String replaceVariables(String template, Waitlist waitlist, RealProgram program) {
        Member member = waitlist.getMember();
        String centerName = program != null && program.getCenter() != null ? program.getCenter().getName() : "";
        String programDateTime = program != null && program.getProgramDat() != null
                ? DATE_TIME_FORMAT.format(program.getProgramDat())
                : "";
        return template
                .replace("{회원명}", member != null ? member.getName() : "")
                .replace("{센터명}", centerName)
                .replace("{수업명}", program != null ? program.getProgramName() : "")
                .replace("{수업일시}", programDateTime)
                .replace("{확정기한}", "선착순 마감 전")
                .replace("{예약링크}", buildReservationUrl(waitlist));
    }

    private CenterConfigDto getConfig(RealProgram program) {
        if (program == null || program.getCenter() == null || program.getCenter().getId() == null) {
            return null;
        }
        return centerConfigService.getByCenterId(program.getCenter().getId());
    }

    private String buildReservationUrl(Waitlist waitlist) {
        String baseUrl = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        return baseUrl + "/waitlist/reserve?token=" + waitlist.getReservationToken()
                + "&waitlistId=" + waitlist.getId();
    }

    private WaitlistReservationDto toReservationDto(Waitlist waitlist, RealProgram program) {
        return WaitlistReservationDto.builder()
                .waitlistId(waitlist.getId())
                .centerName(program.getCenter() != null ? program.getCenter().getName() : null)
                .programName(program.getProgramName())
                .instructorName(program.getInstructorName())
                .programDat(program.getProgramDat())
                .startTime(program.getStartTime())
                .endTime(program.getEndTime())
                .maxCapacity(program.getMaxCapacity())
                .bookingCount(bookingRepository.findByProgram(program).size())
                .build();
    }

    private MyBookingDto toMyBookingDto(Booking booking) {
        RealProgram program = booking.getProgram();
        return MyBookingDto.builder()
                .id(booking.getId())
                .realProgramId(program != null ? program.getId() : null)
                .centerName(booking.getCenter() != null ? booking.getCenter().getName() : null)
                .programName(program != null ? program.getProgramName() : null)
                .instructorName(program != null ? program.getInstructorName() : null)
                .programDat(program != null ? program.getProgramDat() : null)
                .startTime(program != null ? program.getStartTime() : null)
                .endTime(program != null ? program.getEndTime() : null)
                .build();
    }
}
