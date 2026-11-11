package com.cinebot.booking.application;

import java.util.Map;
import java.util.Set;

/**
 * One atomic read from {@code snapshot.lua} (ARCHITECTURE §6.3): sold seat ids, holder booking ids, and the row
 * versions used by {@code commit_hold}.
 */
public record InventorySnapshot(Set<Long> soldSeatIds, Map<Long, String> holders, Map<String, Long> rowVersions) {
}
