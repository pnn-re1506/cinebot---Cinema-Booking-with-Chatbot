package com.cinebot.booking.application;

import java.util.Set;

/**
 * Result of {@code claim_for_sale.lua} (ARCHITECTURE §6.6). {@code Taken} means the payment succeeded but the seats
 * are gone, so the booking becomes {@code NEEDS_ATTENTION} (BR-14).
 */
public sealed interface ClaimResult permits ClaimResult.Ok, ClaimResult.Taken {

    record Ok() implements ClaimResult {
    }

    record Taken(Set<Long> seatIds) implements ClaimResult {
    }
}
