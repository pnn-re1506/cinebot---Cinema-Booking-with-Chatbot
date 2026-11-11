package com.cinebot.common.domain;

/** Payment attempt status (ARCHITECTURE §5.2 {@code payments.status}). */
public enum PaymentStatus {
    INITIATED,
    SUCCEEDED,
    FAILED,
    EXPIRED
}
