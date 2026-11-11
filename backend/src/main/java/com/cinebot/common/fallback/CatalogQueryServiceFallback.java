package com.cinebot.common.fallback;

import com.cinebot.catalog.application.CatalogQueryService;
import com.cinebot.catalog.application.MovieSchedulingInfo;
import java.util.Optional;
import org.springframework.context.annotation.Fallback;
import org.springframework.stereotype.Component;

@Component
@Fallback
public class CatalogQueryServiceFallback implements CatalogQueryService {

    @Override
    public Optional<MovieSchedulingInfo> findMovie(long movieId) {
        return Optional.empty();
    }
}
