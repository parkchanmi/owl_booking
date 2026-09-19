package com.owl.booking.model.dto;

import java.util.List;

public record SalesReportDto(
        long grossSales,
        long refundTotal,
        long netSales,
        long saleCount,
        long refundCount,
        List<SalesEntryDto> entries
) {}
