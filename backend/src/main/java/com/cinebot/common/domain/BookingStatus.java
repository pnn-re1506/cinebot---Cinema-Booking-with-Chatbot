package com.cinebot.common.domain;

/** Booking state machine (BR-12). */
public enum BookingStatus {
    HOLDING,
    PENDING_PAYMENT,
    CONFIRMED,
    EXPIRED,
    RELEASED,
    NEEDS_ATTENTION,
    REFUNDED
}
