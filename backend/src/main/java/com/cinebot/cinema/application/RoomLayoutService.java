package com.cinebot.cinema.application;

/** Room layout for seat maps and scheduling (ER-02). Implemented by task B2. */
public interface RoomLayoutService {

    /** Full layout of one room, including inactive seats (BR-07). */
    RoomLayout getLayout(long roomId);
}
