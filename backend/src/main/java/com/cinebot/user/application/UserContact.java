package com.cinebot.user.application;

import java.util.Locale;

/** Contact details copied onto a member booking (BR-20). */
public record UserContact(String fullName, String phone, String email, Locale preferredLocale) {
}
