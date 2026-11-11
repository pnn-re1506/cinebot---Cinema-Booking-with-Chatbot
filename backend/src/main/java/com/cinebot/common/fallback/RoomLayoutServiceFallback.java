package com.cinebot.common.fallback;

import com.cinebot.cinema.application.RoomLayout;
import com.cinebot.cinema.application.RoomLayoutService;
import org.springframework.context.annotation.Fallback;
import org.springframework.stereotype.Component;

@Component
@Fallback
public class RoomLayoutServiceFallback implements RoomLayoutService {

    @Override
    public RoomLayout getLayout(long roomId) {
        throw new UnsupportedOperationException("RoomLayoutService not implemented yet (task B2)");
    }
}
