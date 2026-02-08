package com.owl.booking.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InstructorDto {

    String id;

    String name;

    String hp;

    String info;

    CenterDto center;
}
