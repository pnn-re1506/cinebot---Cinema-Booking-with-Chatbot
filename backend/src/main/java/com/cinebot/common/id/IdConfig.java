package com.cinebot.common.id;

import java.security.SecureRandom;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IdConfig {

    @Bean
    SecureRandom secureRandom() {
        return new SecureRandom();
    }

    @Bean
    BookingCodeGenerator bookingCodeGenerator(SecureRandom secureRandom) {
        return new BookingCodeGenerator(secureRandom);
    }
}
