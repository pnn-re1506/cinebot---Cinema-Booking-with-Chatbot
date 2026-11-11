package com.cinebot.schedule.application;

import com.cinebot.common.domain.ShowtimeStatus;
import java.time.Instant;

/** Showtime facts a hold needs. Sales close at {@code startsAt} (BR-24). */
public record ShowtimeInfo(
        long id,
        long movieId,
        long roomId,
        Instant startsAt,
        Instant endsAt,
        ShowtimeStatus status) {
}
