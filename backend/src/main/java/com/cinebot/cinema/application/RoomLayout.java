package com.cinebot.cinema.application;

import java.util.List;

/**
 * Room geometry used by holds and the rolling schedule. {@code cleanupMinutes} extends the room block past the
 * movie end (BR-22).
 */
public record RoomLayout(long roomId, String roomName, int cleanupMinutes, int columns, List<LayoutRow> rows) {
}
