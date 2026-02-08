package com.owl.booking.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingDto {

    private String id;

    private CenterDto centerlist;

    private RealProgramDto programlist;
}
