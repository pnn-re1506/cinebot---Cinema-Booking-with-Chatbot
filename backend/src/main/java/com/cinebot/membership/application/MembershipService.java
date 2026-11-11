package com.cinebot.membership.application;

import java.time.Instant;
import java.util.UUID;

/** Points and the VIP snack discount (ER-02). Implemented by task B8. */
public interface MembershipService {

    /**
     * Credits points on the ticket subtotal for a logged-in booking (BR-16). Returns the points earned.
     * Guest bookings are not passed here.
     */
    long earn(long userId, UUID bookingId, long ticketSubtotal, Instant at);

    /** Reverses the points of a refunded booking. The reversal expires with the original entry (BR-17). */
    void reverse(UUID bookingId, Instant at);

    /**
     * VIP snack discount percent at {@code at}, or 0 for guests and non-VIP members (BR-19).
     * A null user id is a guest.
     */
    int snackDiscountPct(Long userIdOrNull, Instant at);
}
