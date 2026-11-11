package com.cinebot.booking.application;

/**
 * Redis cannot serve holds (ARCHITECTURE §6.8). The API maps this to 503 {@code SEAT_SERVICE_UNAVAILABLE}.
 * Payment confirmation does not use this path; it relies on the {@code sold_seats} primary key.
 */
public class SeatInventoryUnavailableException extends RuntimeException {

    public SeatInventoryUnavailableException() {
        super();
    }

    public SeatInventoryUnavailableException(Throwable cause) {
        super(cause);
    }
}
