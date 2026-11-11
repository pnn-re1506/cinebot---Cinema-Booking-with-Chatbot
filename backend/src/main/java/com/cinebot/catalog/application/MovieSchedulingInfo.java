package com.cinebot.catalog.application;

import com.cinebot.common.domain.AgeRating;
import com.cinebot.common.domain.MovieStatus;

/** Movie facts the schedule module needs. Coming-soon titles are not bookable (BR-23). */
public record MovieSchedulingInfo(
        long id, String slug, int durationMin, MovieStatus status, AgeRating ageRating) {
}
