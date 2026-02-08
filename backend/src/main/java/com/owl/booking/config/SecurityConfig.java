package com.owl.booking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CSRF 비활성화 (개발 단계나 API 중심일 때 편리함)
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable()) 
                .httpBasic(basic -> basic.disable()) 

                .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )

                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/member/login", "/api/member/join", "/api/member/logout").permitAll()
                    .requestMatchers("/", "/index.html", "/static/**", "/assets/**", "/favicon.ico").permitAll()
                    // 2. 모든 요청을 허용하도록 설정된 상태
                    .anyRequest().permitAll()
                );
                
                //나중에 권한설정할때 다시 추가
        /*http.exceptionHandling(handler -> handler
                .authenticationEntryPoint((request, response, authException) -> {
                    // 인증되지 않은 사용자가 접근하면 로그인 페이지로 리다이렉트 (React 경로)
                    response.sendRedirect("/login");
                }));*/
        return http.build();
    }

    // 비밀번호 암호화 빈 (나중에 회원가입 시 passwordEncoder.encode() 사용 권장)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}