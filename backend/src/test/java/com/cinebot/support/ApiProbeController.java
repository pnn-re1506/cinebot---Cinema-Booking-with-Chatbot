package com.cinebot.support;

import com.cinebot.booking.application.SeatInventoryUnavailableException;
import com.cinebot.common.error.ApiException;
import com.cinebot.common.error.ErrorCode;
import com.cinebot.common.ratelimit.RateLimitExceededException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Test-only routes under paths the security matrix already permits. */
@RestController
class ApiProbeController {

    @GetMapping("/api/movies/__probe/boom")
    void boom() {
        throw new RuntimeException("sql-password-should-not-leak");
    }

    @GetMapping("/api/movies/__probe/problem")
    void problem() {
        throw new ApiException(ErrorCode.SEAT_UNAVAILABLE, null, Map.of("seatIds", List.of(11L, 12L)));
    }

    @GetMapping("/api/movies/__probe/seat-down")
    void seatDown() {
        throw new SeatInventoryUnavailableException();
    }

    @GetMapping("/api/movies/__probe/limited")
    void limited() {
        throw new RateLimitExceededException(7);
    }

    @GetMapping("/api/movies/__probe/instant")
    ProbeInstant instant() {
        return new ProbeInstant(Instant.parse("2026-11-11T03:30:00Z"), LocalDate.parse("2026-11-11"));
    }

    @PostMapping("/api/bookings/__probe/validate")
    void validate(@Valid @RequestBody ProbeRequest request) {
        if (request == null) {
            throw new IllegalStateException("missing body");
        }
    }

    record ProbeRequest(@NotBlank String name, @Min(1) Integer count) {
    }

    record ProbeInstant(Instant at, LocalDate day) {
    }
}
