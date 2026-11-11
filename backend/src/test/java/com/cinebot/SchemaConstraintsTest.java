package com.cinebot;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

class SchemaConstraintsTest extends IntegrationTestBase {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void flywayAppliesSeedAndExtensions() {
        Integer extensions = jdbc.queryForObject(
                "SELECT count(*) FROM pg_extension WHERE extname IN ('btree_gist', 'pgcrypto')", Integer.class);
        assertThat(extensions).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT to_regclass('public.showtime_seats')", String.class)).isNull();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM pricing_policies", Integer.class)).isEqualTo(1);

        var row = jdbc.queryForMap("""
                SELECT discount_day_of_week, adult_discount_day, adult_weekday, adult_weekend,
                       student_price, couple_surcharge, points_rate_pct, vip_threshold_points,
                       vip_snack_discount_pct, hold_minutes, created_by, effective_from
                FROM pricing_policies
                """);
        assertThat(row.get("discount_day_of_week")).isEqualTo("TUE");
        assertThat(((Number) row.get("adult_discount_day")).longValue()).isEqualTo(45_000L);
        assertThat(((Number) row.get("adult_weekday")).longValue()).isEqualTo(55_000L);
        assertThat(((Number) row.get("adult_weekend")).longValue()).isEqualTo(65_000L);
        assertThat(((Number) row.get("student_price")).longValue()).isEqualTo(45_000L);
        assertThat(((Number) row.get("couple_surcharge")).longValue()).isEqualTo(10_000L);
        assertThat(((Number) row.get("points_rate_pct")).intValue()).isEqualTo(5);
        assertThat(((Number) row.get("vip_threshold_points")).longValue()).isEqualTo(50_000L);
        assertThat(((Number) row.get("vip_snack_discount_pct")).intValue()).isEqualTo(15);
        assertThat(((Number) row.get("hold_minutes")).intValue()).isEqualTo(10);
        assertThat(row.get("created_by")).isNull();
        assertThat(toInstant(row.get("effective_from"))).isEqualTo(OffsetDateTime.parse("2020-01-01T00:00:00+07:00").toInstant());
    }

    @Test
    void overlappingShowtimesInOneRoomAreRejected() {
        long roomId = room();
        long movieId = movie("overlap-" + UUID.randomUUID());
        Instant start = Instant.parse("2035-01-01T03:00:00Z").plus(Duration.ofMinutes(uniqueMinutes()));
        insertShowtime(movieId, roomId, start, start.plus(Duration.ofMinutes(135)));
        DataAccessException failure = insertShowtimeFailing(
                movieId, roomId, start.plus(Duration.ofMinutes(60)), start.plus(Duration.ofMinutes(195)));
        assertThat(sqlState(failure)).isEqualTo("23P01");
    }

    @Test
    void duplicateSoldSeatIsRejected() {
        long roomId = room();
        long movieId = movie("sold-" + UUID.randomUUID());
        Instant start = Instant.parse("2036-01-01T03:00:00Z").plus(Duration.ofMinutes(uniqueMinutes()));
        long showtimeId = insertShowtime(movieId, roomId, start, start.plus(Duration.ofMinutes(135)));
        long seatId = jdbc.queryForObject(
                "INSERT INTO seats (room_id, row_label, seat_number, col_index, seat_type) VALUES (?, 'A', 1, 1, 'SINGLE') RETURNING id",
                Long.class,
                roomId);
        UUID bookingId = booking(showtimeId, "HOLDING");
        jdbc.update(
                "INSERT INTO sold_seats (showtime_id, seat_id, booking_id, sold_at) VALUES (?, ?, ?, now())",
                showtimeId,
                seatId,
                bookingId);
        DataAccessException failure = catchFailure(() -> jdbc.update(
                "INSERT INTO sold_seats (showtime_id, seat_id, booking_id, sold_at) VALUES (?, ?, ?, now())",
                showtimeId,
                seatId,
                bookingId));
        assertThat(sqlState(failure)).isEqualTo("23505");
    }

    @Test
    void invalidBookingStatusIsRejected() {
        long roomId = room();
        long movieId = movie("status-" + UUID.randomUUID());
        Instant start = Instant.parse("2037-01-01T03:00:00Z").plus(Duration.ofMinutes(uniqueMinutes()));
        long showtimeId = insertShowtime(movieId, roomId, start, start.plus(Duration.ofMinutes(135)));
        DataAccessException failure = catchFailure(() -> booking(showtimeId, "NOT_A_STATUS"));
        assertThat(sqlState(failure)).isEqualTo("23514");
    }

    private long room() {
        Long cinemaId = jdbc.queryForObject(
                "INSERT INTO cinemas (name, address, timezone) VALUES ('CineBot', '1 Test', 'Asia/Ho_Chi_Minh') RETURNING id",
                Long.class);
        return jdbc.queryForObject(
                "INSERT INTO rooms (cinema_id, name) VALUES (?, 'Room') RETURNING id", Long.class, cinemaId);
    }

    private long movie(String slug) {
        return jdbc.queryForObject(
                """
                INSERT INTO movies (slug, original_title, duration_min, age_rating, country_code, audio_language, status)
                VALUES (?, 'Probe', 120, 'P', 'VN', 'vi', 'NOW_SHOWING') RETURNING id
                """,
                Long.class,
                slug);
    }

    private long insertShowtime(long movieId, long roomId, Instant start, Instant blockedUntil) {
        return jdbc.queryForObject(
                """
                INSERT INTO showtimes (movie_id, room_id, starts_at, ends_at, blocked_until, status, source)
                VALUES (?, ?, ?, ?, ?, 'SCHEDULED', 'MANUAL') RETURNING id
                """,
                Long.class,
                movieId,
                roomId,
                Timestamp.from(start),
                Timestamp.from(start.plus(Duration.ofHours(2))),
                Timestamp.from(blockedUntil));
    }

    private DataAccessException insertShowtimeFailing(long movieId, long roomId, Instant start, Instant blockedUntil) {
        return catchFailure(() -> insertShowtime(movieId, roomId, start, blockedUntil));
    }

    private UUID booking(long showtimeId, String status) {
        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return jdbc.queryForObject(
                """
                INSERT INTO bookings (
                    code, showtime_id, channel, access_token_hash, status, locale,
                    ticket_subtotal, snack_subtotal, snack_discount, total, points_earned)
                VALUES (?, ?, 'WEB', 'hash', ?, 'vi', 45000, 0, 0, 45000, 0) RETURNING id
                """,
                UUID.class,
                code,
                showtimeId,
                status);
    }

    private static DataAccessException catchFailure(Runnable action) {
        try {
            action.run();
        } catch (DataAccessException ex) {
            return ex;
        }
        throw new AssertionError("expected a constraint violation");
    }

    private static String sqlState(Throwable failure) {
        Throwable current = failure;
        while (current != null) {
            if (current instanceof SQLException sql) {
                return sql.getSQLState();
            }
            current = current.getCause();
        }
        return null;
    }

    private static Instant toInstant(Object value) {
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value instanceof OffsetDateTime offset) {
            return offset.toInstant();
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toInstant();
        }
        throw new IllegalStateException("Unexpected timestamp type " + value.getClass());
    }

    private static int uniqueMinutes() {
        return Math.floorMod(UUID.randomUUID().hashCode(), 200_000);
    }
}
