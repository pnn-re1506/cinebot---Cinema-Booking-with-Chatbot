package com.cinebot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.entry;

import com.cinebot.booking.application.SeatInventory;
import com.cinebot.booking.application.SeatInventoryUnavailableException;
import com.cinebot.catalog.application.CatalogQueryService;
import com.cinebot.cinema.application.RoomLayoutService;
import com.cinebot.membership.application.MembershipService;
import com.cinebot.notification.application.NotificationService;
import com.cinebot.pricing.application.PricingService;
import com.cinebot.schedule.application.ScheduleQueryService;
import com.cinebot.schedule.application.ShowtimeOccupancy;
import com.cinebot.ticket.application.TicketService;
import com.cinebot.user.application.UserQueryService;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class PortFallbackTest extends IntegrationTestBase {

    @Autowired
    private CatalogQueryService catalog;

    @Autowired
    private RoomLayoutService rooms;

    @Autowired
    private ScheduleQueryService schedule;

    @Autowired
    private ShowtimeOccupancy occupancy;

    @Autowired
    private PricingService pricing;

    @Autowired
    private SeatInventory inventory;

    @Autowired
    private UserQueryService users;

    @Autowired
    private TicketService tickets;

    @Autowired
    private MembershipService membership;

    @Autowired
    private NotificationService notifications;

    @Test
    void everyPortHasANeutralFallback() {
        Instant at = Instant.parse("2020-01-01T00:00:00Z");
        UUID bookingId = UUID.randomUUID();

        assertThat(catalog.findMovie(1L)).isEmpty();
        assertThat(schedule.findShowtime(1L)).isEmpty();
        assertThat(users.findContact(1L)).isEmpty();
        assertThat(occupancy.unavailableUnits(List.of(4L, 5L))).containsExactly(entry(4L, 0), entry(5L, 0));
        assertThat(membership.snackDiscountPct(null, at)).isZero();
        assertThat(inventory.heldCount(9L)).isZero();
        assertThat(inventory.snapshot(9L, Set.of("A"), Set.of(1L)).soldSeatIds()).isEmpty();

        assertThatThrownBy(() -> rooms.getLayout(1L))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessage("RoomLayoutService not implemented yet (task B2)");
        assertThatThrownBy(() -> occupancy.simulateWalkIn(1L, 1L, 20, 1L))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessage("ShowtimeOccupancy not implemented yet (task B3)");
        assertThatThrownBy(() -> pricing.quote(at))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessage("PricingService not implemented yet (task B1)");
        assertThatThrownBy(() -> inventory.commitHold(1L, bookingId, Map.of(), Map.of(), Duration.ofMinutes(10)))
                .isInstanceOf(SeatInventoryUnavailableException.class);
        assertThatThrownBy(() -> tickets.issue(bookingId))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessage("TicketService not implemented yet (task B7)");
        assertThatThrownBy(() -> membership.earn(1L, bookingId, 1000L, at))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessage("MembershipService not implemented yet (task B8)");
        assertThatThrownBy(() -> notifications.enqueue(null))
                .isInstanceOf(UnsupportedOperationException.class)
                .hasMessage("NotificationService not implemented yet (task B7)");
    }
}
