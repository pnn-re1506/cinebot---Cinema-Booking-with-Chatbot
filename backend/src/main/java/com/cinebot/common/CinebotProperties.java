package com.cinebot.common;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Environment-backed settings from ARCHITECTURE §12. Business prices stay in {@code pricing_policies}.
 */
@ConfigurationProperties(prefix = "cinebot")
public record CinebotProperties(
        String jwtSecret,
        String frontendOrigin,
        String apiPublicUrl,
        String cinemaTimezone,
        boolean demoMode,
        String paymentProvidersEnabled,
        String mailFrom,
        Vnpay vnpay) {

    public CinebotProperties {
        if (cinemaTimezone == null || cinemaTimezone.isBlank()) {
            cinemaTimezone = "Asia/Ho_Chi_Minh";
        }
    }

    public record Vnpay(String tmnCode, String hashSecret, String payUrl, String queryUrl) {
    }
}
