package com.cinebot.cinema.application;

import com.cinebot.common.domain.SeatType;
import java.util.List;

/** A contiguous row of one seat type (BR-07). Couple rows are ignored by the orphan rule (BR-08). */
public record LayoutRow(String label, SeatType seatType, List<LayoutSeat> seats) {
}
