package com.cinebot.common.id;

import java.security.SecureRandom;

/**
 * 8-character booking codes in Crockford base32 (ARCHITECTURE §5.2 {@code bookings.code}).
 * The alphabet omits I, L, O and U.
 */
public final class BookingCodeGenerator {

    public static final String ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    public static final int LENGTH = 8;

    private final SecureRandom random;

    public BookingCodeGenerator(SecureRandom random) {
        this.random = random;
    }

    public String next() {
        char[] chars = new char[LENGTH];
        for (int i = 0; i < LENGTH; i++) {
            chars[i] = ALPHABET.charAt(random.nextInt(ALPHABET.length()));
        }
        return new String(chars);
    }
}
