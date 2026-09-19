package com.owl.booking.model.dto;

import java.time.LocalDate;

public record SalesEntryDto(
        String id,
        String type,
        LocalDate date,
        String centerId,
        String centerName,
        String memberId,
        String memberName,
        String membershipName,
        long amount
) {}
