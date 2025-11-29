package com.owl.booking.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.stereotype.Controller;

@Controller
public class HomeController {

    @GetMapping({"/", "/home", "/table", "/user/**"})
    public String index() {
        return "index.html"; // static/index.html 반환
    }
}
