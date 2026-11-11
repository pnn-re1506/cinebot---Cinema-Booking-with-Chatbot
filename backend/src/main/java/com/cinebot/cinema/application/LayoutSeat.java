package com.cinebot.cinema.application;

import com.cinebot.common.domain.SeatType;

/** One physical seat. {@code active == false} means blocked for new holds (BR-07). */
public record LayoutSeat(long id, String label, int number, int col, SeatType seatType, boolean active) {
}
