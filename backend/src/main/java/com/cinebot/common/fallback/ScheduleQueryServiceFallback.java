package com.cinebot.common.fallback;

import com.cinebot.schedule.application.ScheduleQueryService;
import com.cinebot.schedule.application.ShowtimeInfo;
import java.util.Optional;
import org.springframework.context.annotation.Fallback;
import org.springframework.stereotype.Component;

@Component
@Fallback
public class ScheduleQueryServiceFallback implements ScheduleQueryService {

    @Override
    public Optional<ShowtimeInfo> findShowtime(long showtimeId) {
        return Optional.empty();
    }
}
