package com.cinebot.common.domain;

/** Showtime status. Cancelled rows are excluded from the room-overlap constraint (BR-22). */
public enum ShowtimeStatus {
    SCHEDULED,
    CANCELLED
}
