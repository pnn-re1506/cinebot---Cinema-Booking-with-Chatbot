package com.cinebot.notification.application;

import java.util.Locale;
import java.util.Map;

/** Email to enqueue. The address is not logged (ER-15). Templates use {@code bookings.locale}. */
public record EmailMessage(EmailType type, String to, Locale locale, Map<String, Object> model) {
}
