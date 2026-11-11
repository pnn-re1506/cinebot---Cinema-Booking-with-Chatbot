package com.cinebot.common.ratelimit;

/**
 * Distributed request budget (ER-14). Implementations must not keep counters in process memory.
 */
public interface RateLimiter {

    /**
     * Consumes one token for {@code policy} and {@code key} (an IP or a hold owner).
     *
     * @throws RateLimitExceededException when the bucket is empty
     */
    void consume(RateLimitPolicy policy, String key);
}
