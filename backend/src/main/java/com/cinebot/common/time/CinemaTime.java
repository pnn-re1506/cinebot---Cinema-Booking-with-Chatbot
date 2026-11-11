package com.cinebot.common.time;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/** Cinema-local calendar. Day type and VIP expiry use this zone (BR-02, BR-17). */
public final class CinemaTime {

    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final Clock clock;
    private final ZoneId zone;

    public CinemaTime(Clock clock, ZoneId zone) {
        this.clock = clock;
        this.zone = zone;
    }

    public Clock clock() {
        return clock;
    }

    public ZoneId zone() {
        return zone;
    }

    public Instant now() {
        return clock.instant();
    }

    public LocalDate today() {
        return LocalDate.now(clock.withZone(zone));
    }

    public ZonedDateTime atCinema(Instant instant) {
        return instant.atZone(zone);
    }
}
