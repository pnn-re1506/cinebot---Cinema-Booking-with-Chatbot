package com.cinebot.pricing.application;

import com.cinebot.common.domain.DayType;

/**
 * Prices in VND for one showtime start, snapshotted onto the booking (BR-02, BR-03, BR-04).
 * {@code couple} is the couple-seat price, not the surcharge.
 */
public record PriceQuote(
        long policyId,
        DayType dayType,
        long adult,
        long student,
        long couple,
        int holdMinutes,
        int pointsRatePct,
        long vipThresholdPoints,
        int vipSnackDiscountPct) {
}
