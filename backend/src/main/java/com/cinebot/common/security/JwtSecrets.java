package com.cinebot.common.security;

import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

/** HS256 key material from {@code JWT_SECRET}. Fails fast when the secret is missing or shorter than 32 bytes. */
public final class JwtSecrets {

    public static final int MIN_BYTES = 32;

    private JwtSecrets() {
    }

    public static SecretKey hmacSha256(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET is required and must be at least 32 bytes");
        }
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < MIN_BYTES) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes for HS256");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }
}
