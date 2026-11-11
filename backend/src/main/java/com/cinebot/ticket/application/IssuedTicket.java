package com.cinebot.ticket.application;

import com.cinebot.common.domain.TicketStatus;
import com.cinebot.common.domain.TicketType;
import java.util.UUID;

/**
 * One ticket row created with a confirmed booking (ARCHITECTURE §5.2 {@code tickets}).
 * {@code admits} is 1 for a single seat and 2 for a couple seat (BR-01).
 */
public record IssuedTicket(
        long id,
        UUID bookingId,
        long seatId,
        TicketType ticketType,
        int admits,
        String qrToken,
        TicketStatus status) {
}
