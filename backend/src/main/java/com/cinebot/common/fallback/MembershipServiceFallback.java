package com.cinebot.common.fallback;

import com.cinebot.membership.application.MembershipService;
import java.time.Instant;
import java.util.UUID;
import org.springframework.context.annotation.Fallback;
import org.springframework.stereotype.Component;

@Component
@Fallback
public class MembershipServiceFallback implements MembershipService {

    @Override
    public long earn(long userId, UUID bookingId, long ticketSubtotal, Instant at) {
        throw new UnsupportedOperationException("MembershipService not implemented yet (task B8)");
    }

    @Override
    public void reverse(UUID bookingId, Instant at) {
        throw new UnsupportedOperationException("MembershipService not implemented yet (task B8)");
    }

    @Override
    public int snackDiscountPct(Long userIdOrNull, Instant at) {
        return 0;
    }
}
