package com.owl.booking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET","POST","PUT","DELETE")
                        .allowCredentials(true);
            }

            @Override
            public void addViewControllers(ViewControllerRegistry registry) {
                // API 요청(/api/**)을 제외한 모든 클라이언트 사이드 경로를 
                // index.html로 포워딩합니다.
                registry.addViewController("/{path:[^\\.]*}")
                        .setViewName("forward:/index.html");
                registry.addViewController("/**/{path:[^\\.]*}")
                        .setViewName("forward:/index.html");
            }
        };
    }
}