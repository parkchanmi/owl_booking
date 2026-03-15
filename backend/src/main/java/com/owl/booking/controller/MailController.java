package com.owl.booking.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.owl.booking.service.MailService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/mail")
public class MailController {

    private MailService mailService;

    public MailController(MailService mailService){
        this.mailService = mailService;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<String> sendMail(@RequestBody Map<String, String> request, HttpSession session){
        String email = request.get("email");
        String code = mailService.sendMimeMessage(email);
        session.setAttribute("AUTH_CODE", code);
        session.setMaxInactiveInterval(3 * 60); // 180초(3분) 후 세션 만료
        System.out.println("[" + email + "] 님에게 보낼 인증번호: " + code);
        return ResponseEntity.ok("인증 메일이 발송되었습니다.");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyCode(@RequestBody Map<String, String> request, HttpSession session) {
        String userCode = request.get("userCode");
        
        // 4. 세션에서 저장된 코드 꺼내기
        String savedCode = (String) session.getAttribute("AUTH_CODE");

        if (savedCode == null) {
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).body("인증 시간이 만료되었습니다.");
        }

        if (savedCode.equals(userCode)) {
            session.removeAttribute("AUTH_CODE"); // 인증 성공 시 코드 삭제
            return ResponseEntity.ok("인증에 성공했습니다!");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증번호가 일치하지 않습니다.");
        }
    }
}
