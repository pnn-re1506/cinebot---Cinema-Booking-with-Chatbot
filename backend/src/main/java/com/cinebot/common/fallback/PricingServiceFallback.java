package com.cinebot.common.fallback;

import com.cinebot.pricing.application.PriceQuote;
import com.cinebot.pricing.application.PricingService;
import java.time.Instant;
import org.springframework.context.annotation.Fallback;
import org.springframework.stereotype.Component;

@Component
@Fallback
public class PricingServiceFallback implements PricingService {

    @Override
    public PriceQuote quote(Instant startsAt) {
        throw new UnsupportedOperationException("PricingService not implemented yet (task B1)");
    }
}
