package com.cinebot.common.domain;

/** Catalogue status. Coming-soon movies are not bookable (BR-23). */
public enum MovieStatus {
    NOW_SHOWING,
    COMING_SOON,
    ENDED
}
