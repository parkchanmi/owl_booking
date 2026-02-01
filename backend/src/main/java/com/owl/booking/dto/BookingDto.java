package com.owl.booking.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingDto {

    private String id;

    private List<CenterDto> centerlist;

    private List<RealProgramDto> programlist;
}
