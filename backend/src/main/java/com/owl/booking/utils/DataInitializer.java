package com.owl.booking.utils;

import com.owl.booking.entity.User;
import com.owl.booking.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        userRepository.save(new User(null, "testuser3", "test1@example.com"));
        userRepository.save(new User(null, "testuser4", "test2@example.com"));
    }
}
