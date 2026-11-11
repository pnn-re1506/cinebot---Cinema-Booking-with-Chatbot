package com.cinebot.common.security;

import java.time.Duration;

/**
 * Refresh cookie attributes (ARCHITECTURE §7.1). Name matches the contract scheme {@code cb_refresh}.
 * The cookie is issued by the auth module (task B4).
 */
public record RefreshCookieSettings(
        String name,
        String path,
        Duration maxAge,
        boolean httpOnly,
        boolean secure,
        String sameSite) {

    public static RefreshCookieSettings contract() {
        return new RefreshCookieSettings("cb_refresh", "/api/auth", Duration.ofDays(7), true, true, "Strict");
    }
}
