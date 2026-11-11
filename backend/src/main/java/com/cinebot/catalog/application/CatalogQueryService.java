package com.cinebot.catalog.application;

import java.util.Optional;

/** Read-only catalogue facts for other modules (ER-02). Implemented by task B2. */
public interface CatalogQueryService {

    /**
     * Movie used when generating or validating a showtime (BR-22, BR-23).
     *
     * @return empty when the movie does not exist
     */
    Optional<MovieSchedulingInfo> findMovie(long movieId);
}
