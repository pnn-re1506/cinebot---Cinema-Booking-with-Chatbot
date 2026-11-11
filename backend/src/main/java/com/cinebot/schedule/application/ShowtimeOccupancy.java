package com.cinebot.schedule.application;

import java.util.Collection;
import java.util.Map;

/**
 * Sold plus held seat units per showtime. Defined here so schedule does not depend on booking repositories
 * (ER-02). Implemented by task B3 inside {@code booking/infra/occupancy}.
 */
public interface ShowtimeOccupancy {

    /**
     * Seat units that are sold or held, keyed by showtime id. Used for catalogue badges.
     */
    Map<Long, Integer> unavailableUnits(Collection<Long> showtimeIds);

    /**
     * Pre-sells a deterministic share of seats to a walk-in booking without creating orphan seats (BR-26).
     *
     * @param percent target occupancy, 15–35 for generated showtimes
     * @param seed    stable per showtime so the nightly reset repeats the same seats
     */
    void simulateWalkIn(long showtimeId, long roomId, int percent, long seed);
}
