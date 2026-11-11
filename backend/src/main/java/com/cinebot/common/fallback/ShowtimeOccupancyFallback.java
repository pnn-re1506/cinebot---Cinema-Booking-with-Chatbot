package com.cinebot.common.fallback;

import com.cinebot.schedule.application.ShowtimeOccupancy;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.context.annotation.Fallback;
import org.springframework.stereotype.Component;

@Component
@Fallback
public class ShowtimeOccupancyFallback implements ShowtimeOccupancy {

    @Override
    public Map<Long, Integer> unavailableUnits(Collection<Long> showtimeIds) {
        Map<Long, Integer> units = new LinkedHashMap<>();
        for (Long showtimeId : showtimeIds) {
            units.put(showtimeId, 0);
        }
        return units;
    }

    @Override
    public void simulateWalkIn(long showtimeId, long roomId, int percent, long seed) {
        throw new UnsupportedOperationException("ShowtimeOccupancy not implemented yet (task B3)");
    }
}
