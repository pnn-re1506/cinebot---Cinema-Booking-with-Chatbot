package com.cinebot.pricing.application;

import java.time.Instant;

/** Server-side prices (ER-03). Implemented by task B1. */
public interface PricingService {

    /**
     * Policy in force at {@code startsAt}, using the cinema-local date for the day type (BR-02).
     * A showtime at 00:30 belongs to that local calendar day.
     */
    PriceQuote quote(Instant startsAt);
}
