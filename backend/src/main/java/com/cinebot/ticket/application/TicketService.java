package com.cinebot.ticket.application;

import java.util.List;
import java.util.UUID;

/** Ticket issuing inside the payment confirmation transaction (ER-02). Implemented by task B7. */
public interface TicketService {

    /** Issues one ticket per booking seat. Idempotent for an already confirmed booking (BR-13). */
    List<IssuedTicket> issue(UUID bookingId);

    /** Voids every ticket of a refunded booking (BR-15). */
    void voidTickets(UUID bookingId);
}
