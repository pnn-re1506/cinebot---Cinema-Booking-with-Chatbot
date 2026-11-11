package com.cinebot.common.ratelimit;

import com.cinebot.common.error.ErrorCode;

/** Raised when a bucket is empty. The HTTP layer maps it to 429 {@code RATE_LIMITED} with {@code Retry-After}. */
public class RateLimitExceededException extends RuntimeException {

    private final long retryAfterSeconds;

    public RateLimitExceededException(long retryAfterSeconds) {
        super(ErrorCode.RATE_LIMITED.name());
        if (retryAfterSeconds < 1) {
            throw new IllegalArgumentException("retryAfterSeconds must be positive");
        }
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long retryAfterSeconds() {
        return retryAfterSeconds;
    }
}
