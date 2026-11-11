package com.cinebot.common.ratelimit;

/** Named limits configured under {@code cinebot.rate-limits} (ER-14, BR-21). */
public enum RateLimitPolicy {
    LOGIN,
    REGISTER,
    BOOKING_LOOKUP,
    HOLD_CREATE
}
