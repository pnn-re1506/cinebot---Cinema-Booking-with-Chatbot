package com.cinebot.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/** Loads integrator-owned fixtures from {@code ../shared/fixtures} relative to {@code backend/} (ER-20). */
public final class SharedFixtures {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private SharedFixtures() {
    }

    public static Path fixturesDirectory() {
        Path cwd = Path.of("").toAbsolutePath().normalize();
        Path besideModule = cwd.resolve("..").resolve("shared").resolve("fixtures").normalize();
        if (Files.isDirectory(besideModule)) {
            return besideModule;
        }
        Path fromRepoRoot = cwd.resolve("shared").resolve("fixtures");
        if (Files.isDirectory(fromRepoRoot)) {
            return fromRepoRoot;
        }
        throw new IllegalStateException("shared/fixtures not found from " + cwd);
    }

    public static JsonNode readTree(String fileName) throws IOException {
        return MAPPER.readTree(fixturesDirectory().resolve(fileName).toFile());
    }
}
