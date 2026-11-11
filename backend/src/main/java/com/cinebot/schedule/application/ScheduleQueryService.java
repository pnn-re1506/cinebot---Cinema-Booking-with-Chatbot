package com.cinebot.schedule.application;

import java.util.Optional;

/** Read-only showtime lookup (ER-02). Implemented by task B3. */
public interface ScheduleQueryService {

    /**
     * Showtime used by booking and pricing.
     *
     * @return empty when the showtime does not exist
     */
    Optional<ShowtimeInfo> findShowtime(long showtimeId);
}
