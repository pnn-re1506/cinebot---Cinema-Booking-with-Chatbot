package com.cinebot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.cinebot.common.ratelimit.RateLimitExceededException;
import com.cinebot.common.ratelimit.RateLimitPolicy;
import com.cinebot.common.ratelimit.RateLimiter;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class RateLimiterTest extends IntegrationTestBase {

    @Autowired
    private RateLimiter rateLimiter;

    @Test
    void loginBucketAllowsItsCapacityThenRejects() {
        String key = "ip-" + UUID.randomUUID();
        for (int i = 0; i < 10; i++) {
            rateLimiter.consume(RateLimitPolicy.LOGIN, key);
        }
        assertThatThrownBy(() -> rateLimiter.consume(RateLimitPolicy.LOGIN, key))
                .isInstanceOf(RateLimitExceededException.class)
                .satisfies(ex -> assertThat(((RateLimitExceededException) ex).retryAfterSeconds()).isPositive());
    }
}
