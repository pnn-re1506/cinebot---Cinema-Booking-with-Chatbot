package com.cinebot.notification.application;

/** Outbox message kinds (ARCHITECTURE §5.2 {@code email_outbox.type}). */
public enum EmailType {
    BOOKING_CONFIRMED,
    VIP_GRANTED,
    VIP_RENEWED,
    VIP_LAPSED
}
