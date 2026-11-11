package com.cinebot.common.fallback;

import com.cinebot.booking.application.ClaimResult;
import com.cinebot.booking.application.CommitResult;
import com.cinebot.booking.application.InventorySnapshot;
import com.cinebot.booking.application.SeatInventory;
import com.cinebot.booking.application.SeatInventoryUnavailableException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.context.annotation.Fallback;
import org.springframework.stereotype.Component;

@Component
@Fallback
public class SeatInventoryFallback implements SeatInventory {

    @Override
    public void ensureSoldLoaded(long showtimeId, Supplier<Set<Long>> soldFromDb, Instant expireAt) {
        throw new SeatInventoryUnavailableException();
    }

    @Override
    public InventorySnapshot snapshot(long showtimeId, Set<String> rows, Set<Long> seatIds) {
        return new InventorySnapshot(Set.of(), Map.of(), Map.of());
    }

    @Override
    public CommitResult commitHold(
            long showtimeId,
            UUID bookingId,
            Map<Long, String> seatRows,
            Map<String, Long> expectedVersions,
            Duration ttl) {
        throw new SeatInventoryUnavailableException();
    }

    @Override
    public int releaseHold(long showtimeId, UUID bookingId, Map<Long, String> seatRows) {
        throw new SeatInventoryUnavailableException();
    }

    @Override
    public boolean extendHold(long showtimeId, UUID bookingId, Set<Long> seatIds, Duration ttl) {
        throw new SeatInventoryUnavailableException();
    }

    @Override
    public ClaimResult claimForSale(long showtimeId, UUID bookingId, Set<Long> seatIds, Duration ttl) {
        throw new SeatInventoryUnavailableException();
    }

    @Override
    public void markSold(long showtimeId, UUID bookingId, Map<Long, String> seatRows) {
        throw new SeatInventoryUnavailableException();
    }

    @Override
    public long heldCount(long showtimeId) {
        return 0;
    }

    @Override
    public void invalidateSold(long showtimeId) {
        throw new SeatInventoryUnavailableException();
    }
}
