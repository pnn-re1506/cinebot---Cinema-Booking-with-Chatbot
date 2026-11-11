package com.cinebot.booking.application;

import java.util.Set;

/**
 * Result of {@code commit_hold.lua} (ARCHITECTURE §6.3, §6.4). {@code VersionChanged} is retried; sold or held
 * seats become 409 {@code SEAT_UNAVAILABLE}.
 */
public sealed interface CommitResult
        permits CommitResult.Ok, CommitResult.VersionChanged, CommitResult.SeatSold, CommitResult.SeatHeld {

    record Ok() implements CommitResult {
    }

    record VersionChanged() implements CommitResult {
    }

    record SeatSold(Set<Long> seatIds) implements CommitResult {
    }

    record SeatHeld(Set<Long> seatIds) implements CommitResult {
    }
}
