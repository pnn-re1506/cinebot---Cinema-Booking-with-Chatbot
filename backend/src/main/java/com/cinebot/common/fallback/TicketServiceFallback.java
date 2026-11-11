package com.cinebot.common.fallback;

import com.cinebot.ticket.application.IssuedTicket;
import com.cinebot.ticket.application.TicketService;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Fallback;
import org.springframework.stereotype.Component;

@Component
@Fallback
public class TicketServiceFallback implements TicketService {

    @Override
    public List<IssuedTicket> issue(UUID bookingId) {
        throw new UnsupportedOperationException("TicketService not implemented yet (task B7)");
    }

    @Override
    public void voidTickets(UUID bookingId) {
        throw new UnsupportedOperationException("TicketService not implemented yet (task B7)");
    }
}
