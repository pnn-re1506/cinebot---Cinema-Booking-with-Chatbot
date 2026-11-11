package com.cinebot.booking.application;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * The only API that may touch seat-hold keys (ER-10, ARCHITECTURE §6). Implemented by task B5a with the Lua scripts.
 * Redis errors are reported as {@link SeatInventoryUnavailableException}.
 */
public interface SeatInventory {

    /**
     * Loads the sold-seat mirror from PostgreSQL when {@code sold:ready} is missing (ARCHITECTURE §6.4).
     */
    void ensureSoldLoaded(long showtimeId, Supplier<Set<Long>> soldFromDb, Instant expireAt);

    /**
     * Reads sold flags, holders and row versions in one step (ARCHITECTURE §6.3 {@code snapshot.lua}).
     */
    InventorySnapshot snapshot(long showtimeId, Set<String> rows, Set<Long> seatIds);

    /**
     * Places a hold when row versions still match. {@code seatRows} maps seat id to row label (ARCHITECTURE §6.4).
     */
    CommitResult commitHold(
            long showtimeId,
            UUID bookingId,
            Map<Long, String> seatRows,
            Map<String, Long> expectedVersions,
            Duration ttl);

    /**
     * Deletes this booking's hold and bumps the touched row versions (ARCHITECTURE §6.3 {@code release_hold.lua}).
     *
     * @return how many seat keys were removed
     */
    int releaseHold(long showtimeId, UUID bookingId, Map<Long, String> seatRows);

    /**
     * Extends the hold TTL at payment start (BR-11). {@code false} means the hold was already lost.
     */
    boolean extendHold(long showtimeId, UUID bookingId, Set<Long> seatIds, Duration ttl);

    /**
     * Claims seats for a paid booking, including seats whose hold TTL already elapsed (ARCHITECTURE §6.6).
     */
    ClaimResult claimForSale(long showtimeId, UUID bookingId, Set<Long> seatIds, Duration ttl);

    /**
     * Mirrors a committed sale into Redis after the database transaction commits (ARCHITECTURE §6.6).
     */
    void markSold(long showtimeId, UUID bookingId, Map<Long, String> seatRows);

    /** Live hold keys for one showtime. Used by occupancy. A Redis outage is not fatal for this read. */
    long heldCount(long showtimeId);

    /** Drops the sold mirror so the next read reloads it from PostgreSQL (refunds, reconcile job, §6.8). */
    void invalidateSold(long showtimeId);
}
