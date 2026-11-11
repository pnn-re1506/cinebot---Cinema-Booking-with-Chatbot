package com.cinebot.common.ratelimit;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cinebot.rate-limits")
public record RateLimitProperties(Limit login, Limit register, Limit bookingLookup, Limit holdCreate) {

    public record Limit(int capacity, Duration period) {
    }

    public Limit forPolicy(RateLimitPolicy policy) {
        return switch (policy) {
            case LOGIN -> login;
            case REGISTER -> register;
            case BOOKING_LOOKUP -> bookingLookup;
            case HOLD_CREATE -> holdCreate;
        };
    }
}
