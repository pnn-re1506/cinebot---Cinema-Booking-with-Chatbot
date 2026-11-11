-- CineBot v1 schema (ARCHITECTURE §5.2). Holds live in Redis; there is no showtime_seats table.

CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id                bigserial PRIMARY KEY,
    email             text NOT NULL UNIQUE,
    password_hash     text NOT NULL,
    full_name         text NOT NULL,
    phone             text,
    role              text NOT NULL CHECK (role IN ('CUSTOMER', 'STAFF', 'ADMIN')),
    preferred_locale  text NOT NULL DEFAULT 'vi' CHECK (preferred_locale IN ('vi', 'en')),
    vip_since         timestamptz,
    vip_until         timestamptz,
    is_seed           boolean NOT NULL DEFAULT false,
    created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id              bigserial PRIMARY KEY,
    user_id         bigint NOT NULL REFERENCES users (id),
    token_hash      text NOT NULL UNIQUE,
    family_id       uuid NOT NULL,
    expires_at      timestamptz NOT NULL,
    revoked_at      timestamptz,
    replaced_by_id  bigint REFERENCES refresh_tokens (id),
    created_ip      text,
    user_agent      text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cinemas (
    id        bigserial PRIMARY KEY,
    name      text NOT NULL,
    address   text NOT NULL,
    phone     text,
    timezone  text NOT NULL DEFAULT 'Asia/Ho_Chi_Minh'
);

CREATE TABLE rooms (
    id               bigserial PRIMARY KEY,
    cinema_id        bigint NOT NULL REFERENCES cinemas (id),
    name             text NOT NULL,
    cleanup_minutes  integer NOT NULL DEFAULT 15,
    is_active        boolean NOT NULL DEFAULT true,
    is_seed          boolean NOT NULL DEFAULT false
);

CREATE TABLE seats (
    id           bigserial PRIMARY KEY,
    room_id      bigint NOT NULL REFERENCES rooms (id),
    row_label    text NOT NULL,
    seat_number  integer NOT NULL,
    col_index    integer NOT NULL,
    seat_type    text NOT NULL CHECK (seat_type IN ('SINGLE', 'COUPLE')),
    is_active    boolean NOT NULL DEFAULT true,
    UNIQUE (room_id, row_label, seat_number)
);

CREATE TABLE movies (
    id                   bigserial PRIMARY KEY,
    slug                 text NOT NULL UNIQUE,
    original_title       text NOT NULL,
    duration_min         integer NOT NULL,
    age_rating           text NOT NULL CHECK (age_rating IN ('P', 'K', 'T13', 'T16', 'T18')),
    country_code         text NOT NULL,
    audio_language       text NOT NULL,
    subtitle_language    text,
    release_date         date,
    release_offset_days  integer,
    status               text NOT NULL CHECK (status IN ('NOW_SHOWING', 'COMING_SOON', 'ENDED')),
    poster_url           text,
    backdrop_url         text,
    trailer_youtube_id   text,
    is_seed              boolean NOT NULL DEFAULT false
);

CREATE TABLE movie_translations (
    movie_id  bigint NOT NULL REFERENCES movies (id),
    locale    text NOT NULL CHECK (locale IN ('vi', 'en')),
    title     text NOT NULL,
    synopsis  text NOT NULL,
    PRIMARY KEY (movie_id, locale)
);

CREATE TABLE genres (
    id    bigserial PRIMARY KEY,
    code  text NOT NULL UNIQUE
);

CREATE TABLE genre_translations (
    genre_id  bigint NOT NULL REFERENCES genres (id),
    locale    text NOT NULL CHECK (locale IN ('vi', 'en')),
    name      text NOT NULL,
    PRIMARY KEY (genre_id, locale)
);

CREATE TABLE movie_genres (
    movie_id  bigint NOT NULL REFERENCES movies (id),
    genre_id  bigint NOT NULL REFERENCES genres (id),
    PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE movie_credits (
    id           bigserial PRIMARY KEY,
    movie_id     bigint NOT NULL REFERENCES movies (id),
    role         text NOT NULL CHECK (role IN ('DIRECTOR', 'CAST')),
    person_name  text NOT NULL,
    sort_order   integer NOT NULL
);

CREATE TABLE showtime_templates (
    id            bigserial PRIMARY KEY,
    movie_id      bigint NOT NULL REFERENCES movies (id),
    room_id       bigint NOT NULL REFERENCES rooms (id),
    start_time    time NOT NULL,
    days_of_week  smallint NOT NULL,
    active        boolean NOT NULL DEFAULT true,
    is_seed       boolean NOT NULL DEFAULT false
);

CREATE TABLE showtimes (
    id             bigserial PRIMARY KEY,
    movie_id       bigint NOT NULL REFERENCES movies (id),
    room_id        bigint NOT NULL REFERENCES rooms (id),
    starts_at      timestamptz NOT NULL,
    ends_at        timestamptz NOT NULL,
    blocked_until  timestamptz NOT NULL,
    status         text NOT NULL CHECK (status IN ('SCHEDULED', 'CANCELLED')),
    source         text NOT NULL CHECK (source IN ('TEMPLATE', 'MANUAL')),
    template_id    bigint REFERENCES showtime_templates (id),
    UNIQUE (room_id, starts_at),
    CONSTRAINT showtimes_no_overlap EXCLUDE USING gist (
        room_id WITH =,
        tstzrange(starts_at, blocked_until) WITH &&
    ) WHERE (status <> 'CANCELLED')
);

CREATE TABLE pricing_policies (
    id                       bigserial PRIMARY KEY,
    effective_from           timestamptz NOT NULL,
    discount_day_of_week     text NOT NULL CHECK (discount_day_of_week IN ('MON', 'TUE', 'WED', 'THU', 'FRI')),
    adult_discount_day       bigint NOT NULL,
    adult_weekday            bigint NOT NULL,
    adult_weekend            bigint NOT NULL,
    student_price            bigint NOT NULL,
    couple_surcharge         bigint NOT NULL,
    points_rate_pct          integer NOT NULL,
    vip_threshold_points     bigint NOT NULL,
    vip_snack_discount_pct   integer NOT NULL,
    hold_minutes             integer NOT NULL,
    created_by               bigint REFERENCES users (id)
);

CREATE TABLE snacks (
    id          bigserial PRIMARY KEY,
    code        text NOT NULL UNIQUE,
    price       bigint NOT NULL,
    image_url   text,
    is_combo    boolean NOT NULL DEFAULT false,
    active      boolean NOT NULL DEFAULT true,
    sort_order  integer NOT NULL DEFAULT 0,
    is_seed     boolean NOT NULL DEFAULT false
);

CREATE TABLE snack_translations (
    snack_id     bigint NOT NULL REFERENCES snacks (id),
    locale       text NOT NULL CHECK (locale IN ('vi', 'en')),
    name         text NOT NULL,
    description  text,
    PRIMARY KEY (snack_id, locale)
);

CREATE TABLE bookings (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code                text NOT NULL UNIQUE CHECK (char_length(code) = 8),
    showtime_id         bigint NOT NULL REFERENCES showtimes (id),
    user_id             bigint REFERENCES users (id),
    channel             text NOT NULL DEFAULT 'WEB' CHECK (channel IN ('WEB', 'CHAT', 'KIOSK', 'ADMIN')),
    access_token_hash   text NOT NULL,
    status              text NOT NULL CHECK (status IN (
                            'HOLDING', 'PENDING_PAYMENT', 'CONFIRMED', 'EXPIRED',
                            'RELEASED', 'NEEDS_ATTENTION', 'REFUNDED')),
    hold_expires_at     timestamptz,
    customer_name       text,
    customer_phone      text,
    customer_email      text,
    locale              text NOT NULL DEFAULT 'vi' CHECK (locale IN ('vi', 'en')),
    ticket_subtotal     bigint NOT NULL,
    snack_subtotal      bigint NOT NULL DEFAULT 0,
    snack_discount      bigint NOT NULL DEFAULT 0,
    total               bigint NOT NULL,
    points_earned       bigint NOT NULL DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now(),
    confirmed_at        timestamptz
);

CREATE TABLE sold_seats (
    showtime_id  bigint NOT NULL REFERENCES showtimes (id),
    seat_id      bigint NOT NULL REFERENCES seats (id),
    booking_id   uuid NOT NULL REFERENCES bookings (id),
    sold_at      timestamptz NOT NULL,
    PRIMARY KEY (showtime_id, seat_id)
);

CREATE TABLE booking_seats (
    booking_id   uuid NOT NULL REFERENCES bookings (id),
    seat_id      bigint NOT NULL REFERENCES seats (id),
    ticket_type  text NOT NULL CHECK (ticket_type IN ('ADULT', 'STUDENT', 'COUPLE')),
    unit_price   bigint NOT NULL,
    PRIMARY KEY (booking_id, seat_id)
);

CREATE TABLE booking_snacks (
    booking_id     uuid NOT NULL REFERENCES bookings (id),
    snack_id       bigint NOT NULL REFERENCES snacks (id),
    quantity       integer NOT NULL,
    unit_price     bigint NOT NULL,
    discount_pct   integer NOT NULL DEFAULT 0,
    PRIMARY KEY (booking_id, snack_id)
);

CREATE TABLE payments (
    id                bigserial PRIMARY KEY,
    booking_id        uuid NOT NULL REFERENCES bookings (id),
    provider          text NOT NULL CHECK (provider IN ('VNPAY', 'MOCK')),
    txn_ref           text NOT NULL UNIQUE,
    amount            bigint NOT NULL,
    status            text NOT NULL CHECK (status IN ('INITIATED', 'SUCCEEDED', 'FAILED', 'EXPIRED')),
    provider_txn_no   text,
    raw_response      jsonb,
    created_at        timestamptz NOT NULL DEFAULT now(),
    completed_at      timestamptz
);

CREATE TABLE tickets (
    id             bigserial PRIMARY KEY,
    booking_id     uuid NOT NULL REFERENCES bookings (id),
    seat_id        bigint NOT NULL REFERENCES seats (id),
    ticket_type    text NOT NULL CHECK (ticket_type IN ('ADULT', 'STUDENT', 'COUPLE')),
    admits         smallint NOT NULL CHECK (admits IN (1, 2)),
    qr_token       text NOT NULL UNIQUE,
    status         text NOT NULL CHECK (status IN ('VALID', 'CHECKED_IN', 'VOID')),
    checked_in_at  timestamptz
);

CREATE TABLE point_ledger (
    id          bigserial PRIMARY KEY,
    user_id     bigint NOT NULL REFERENCES users (id),
    booking_id  uuid REFERENCES bookings (id),
    points      bigint NOT NULL,
    type        text NOT NULL CHECK (type IN ('EARN', 'REVERSAL', 'ADJUST')),
    earned_at   timestamptz NOT NULL,
    expires_at  timestamptz NOT NULL
);

CREATE TABLE email_outbox (
    id               bigserial PRIMARY KEY,
    type             text NOT NULL CHECK (type IN ('BOOKING_CONFIRMED', 'VIP_GRANTED', 'VIP_RENEWED', 'VIP_LAPSED')),
    payload          jsonb NOT NULL,
    status           text NOT NULL CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    attempts         integer NOT NULL DEFAULT 0,
    next_attempt_at  timestamptz,
    last_error       text
);

CREATE TABLE audit_log (
    id             bigserial PRIMARY KEY,
    actor_user_id  bigint REFERENCES users (id),
    action         text NOT NULL,
    entity_type    text NOT NULL,
    entity_id      text NOT NULL,
    changes        jsonb,
    created_at     timestamptz NOT NULL DEFAULT now()
);

-- ARCHITECTURE §5.3
CREATE INDEX showtimes_movie_starts_idx ON showtimes (movie_id, starts_at);
CREATE INDEX showtimes_room_starts_idx ON showtimes (room_id, starts_at);
CREATE INDEX sold_seats_booking_idx ON sold_seats (booking_id);
CREATE INDEX bookings_user_created_idx ON bookings (user_id, created_at DESC);
CREATE INDEX bookings_status_hold_idx ON bookings (status, hold_expires_at);
CREATE INDEX point_ledger_user_earned_idx ON point_ledger (user_id, earned_at);
CREATE INDEX payments_status_created_idx ON payments (status, created_at);

-- FK lookup indexes (database-migrations rule). PKs and the indexes above already cover the rest.
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id);
CREATE INDEX rooms_cinema_idx ON rooms (cinema_id);
CREATE INDEX seats_room_idx ON seats (room_id);
CREATE INDEX movie_credits_movie_idx ON movie_credits (movie_id);
CREATE INDEX showtime_templates_movie_idx ON showtime_templates (movie_id);
CREATE INDEX showtime_templates_room_idx ON showtime_templates (room_id);
CREATE INDEX showtimes_template_idx ON showtimes (template_id);
CREATE INDEX pricing_policies_created_by_idx ON pricing_policies (created_by);
CREATE INDEX bookings_showtime_idx ON bookings (showtime_id);
CREATE INDEX sold_seats_seat_idx ON sold_seats (seat_id);
CREATE INDEX booking_seats_seat_idx ON booking_seats (seat_id);
CREATE INDEX booking_snacks_snack_idx ON booking_snacks (snack_id);
CREATE INDEX payments_booking_idx ON payments (booking_id);
CREATE INDEX tickets_booking_idx ON tickets (booking_id);
CREATE INDEX tickets_seat_idx ON tickets (seat_id);
CREATE INDEX point_ledger_booking_idx ON point_ledger (booking_id);
CREATE INDEX audit_log_actor_idx ON audit_log (actor_user_id);

-- Initial pricing policy (BR-02, BR-03, BR-09, BR-16, BR-18, BR-19). created_by stays null.
INSERT INTO pricing_policies (
    effective_from,
    discount_day_of_week,
    adult_discount_day,
    adult_weekday,
    adult_weekend,
    student_price,
    couple_surcharge,
    points_rate_pct,
    vip_threshold_points,
    vip_snack_discount_pct,
    hold_minutes,
    created_by
) VALUES (
    '2020-01-01T00:00:00+07:00',
    'TUE',
    45000,
    55000,
    65000,
    45000,
    10000,
    5,
    50000,
    15,
    10,
    NULL
);
