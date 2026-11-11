package com.cinebot.common.error;

import org.springframework.http.HttpStatus;

/**
 * Stable API error codes (ARCHITECTURE §9.2, contract {@code ErrorCode}). Clients translate them.
 */
public enum ErrorCode {
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED),
    TOKEN_REUSED(HttpStatus.UNAUTHORIZED),
    FORBIDDEN(HttpStatus.FORBIDDEN),
    BOOKING_TOKEN_INVALID(HttpStatus.FORBIDDEN),
    NOT_FOUND(HttpStatus.NOT_FOUND),
    EMAIL_TAKEN(HttpStatus.CONFLICT),
    SEAT_UNAVAILABLE(HttpStatus.CONFLICT),
    SHOWTIME_OVERLAP(HttpStatus.CONFLICT),
    INVALID_STATE(HttpStatus.CONFLICT),
    RESOURCE_IN_USE(HttpStatus.CONFLICT),
    HOLD_EXPIRED(HttpStatus.GONE),
    ORPHAN_SEAT(HttpStatus.UNPROCESSABLE_ENTITY),
    TICKET_COUNT_MISMATCH(HttpStatus.UNPROCESSABLE_ENTITY),
    BOOKING_TOO_LARGE(HttpStatus.UNPROCESSABLE_ENTITY),
    SALES_CLOSED(HttpStatus.UNPROCESSABLE_ENTITY),
    NOT_BOOKABLE(HttpStatus.UNPROCESSABLE_ENTITY),
    CUSTOMER_INFO_REQUIRED(HttpStatus.UNPROCESSABLE_ENTITY),
    SEED_PROTECTED(HttpStatus.UNPROCESSABLE_ENTITY),
    RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR),
    SEAT_SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE);

    private final HttpStatus status;

    ErrorCode(HttpStatus status) {
        this.status = status;
    }

    public HttpStatus status() {
        return status;
    }
}
