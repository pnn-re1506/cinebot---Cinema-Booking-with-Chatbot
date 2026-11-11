# CineBot – Rules

This file is the **single source of truth** for:
1. **Business rules (`BR-xx`)**: how the cinema works (prices, seats, holds, payment, points…).
2. **Engineering rules (`ER-xx`)**: how the code is written so the system stays correct and extensible.
3. **Rules for planned modules (`BR-C-xx`, `BR-K-xx`)**: drafted now so v1 does not block the chatbot and the kiosk.

Other documents reference these IDs instead of repeating the rules. To change a rule: update this file first, add an entry to the decision log in `PROGRESS.md`, then change the code and tests.

Legend: **[Config]** means admin can change the value without a deployment. All values in this file were confirmed by the owner on 2026-11-11.

---

## 1. Business Rules (v1)

### 1.1 Tickets and prices

**BR-01 – Purchase options**

| Option | Seat type | People | Price |
| --- | --- | --- | --- |
| Adult (regular) | Single | 1 | Adult price of the day type (`BR-02`) |
| Student HSSV-U22 | Single | 1 | Fixed student price, every day |
| Couple seat | Couple | 2 | `BR-03` |

- Only two seat types exist: **single** and **couple**.
- A couple seat always uses the couple formula, even if the occupants are students.
- Student tickets require a student card or ID proving age under 22, checked at the entrance (`BR-27`).

**BR-02 – Day types and adult price** [Config]

The day type comes from the showtime's **local start date** in `Asia/Ho_Chi_Minh`. A showtime starting at 00:30 on Sunday is a Sunday showtime.

| Day type | Days | Adult | Student |
| --- | --- | --- | --- |
| Discount day | Tuesday | 45,000 | 45,000 |
| Weekday | Mon, Wed, Thu, Fri | 55,000 | 45,000 |
| Weekend | Sat, Sun | 65,000 | 45,000 |

- The discount day must be one of Monday–Friday.
- The student price should not exceed the lowest adult price. Admin sees a warning if it does.

**BR-03 – Couple seat price**

`couple price = 2 × adult price of that day type + couple surcharge`, with a surcharge of 10,000 [Config].

| Day type | Couple seat |
| --- | --- |
| Discount day | 100,000 |
| Weekday | 120,000 |
| Weekend | 140,000 |

**BR-04 – Price snapshot.** Unit prices are calculated and stored on the booking when the hold is created. Later pricing changes never modify existing bookings. A pricing change creates a new pricing-policy version with `effective_from`.

**BR-05 – Booking size.** A booking contains 1–8 seat units (one single seat or one couple seat = 1 unit). It contains at least one seat.

**BR-06 – Single-seat ticket type assignment.** The customer chooses quantities, not a type per seat. Selected single seats are sorted by row, then seat number. The first *N* (= student quantity) become Student and the rest Adult.

### 1.2 Seats

**BR-07 – Seat map and inventory**
- The physical layout belongs to a room. **Seat status belongs to a showtime**: seat A5 at 18:00 and seat A5 at 21:00 are independent.
- Rows are contiguous, with no aisles. The back row(s) contain couple seats only; all other rows contain single seats.
- Statuses per showtime: `AVAILABLE`, `HELD`, `SOLD`, `BLOCKED`.
  - `SOLD`: recorded in PostgreSQL.
  - `HELD`: a live hold in Redis; an expired hold counts as `AVAILABLE`.
  - `BLOCKED`: the seat is deactivated in the room layout. This affects new holds only; existing sales stay valid.
- The number of selected single seats must equal Adult + Student. The number of selected couple seats must equal the Couple quantity.

**BR-08 – Orphan-seat rule** ("do not leave one empty seat at the left end, in the middle, or at the right end")

Applies to **single-seat rows only**. It is evaluated per row on the full selection.

- `unavailable` = SOLD, BLOCKED, or HELD by another booking (not expired).
- `after` = `unavailable ∪ selected`.
- An **orphan** is a maximal run of exactly one seat that is not in `after`.

**Rule.** A selection is invalid if any orphan seat has its left or right neighbour in `selected`. Such an orphan was created by this selection; orphans that existed before never block a booking.

**Exception.** For each run of empty seats computed *before* the selection: if the customer selected all seats of that run except one, **and the selected seats inside that run are contiguous**, the resulting orphan (necessarily at one end of the run) is allowed. This prevents dead ends when a showtime is nearly full, and does not allow splitting a group around one empty seat (`S _ S S` in a run of 4 is still invalid).

**Reference test table.** Both implementations (Java and TypeScript) must pass exactly these cases. `X` = unavailable, `S` = selected, `_` = empty.

| # | Row after selection (seats 1–10) | Expected | Reason |
| --- | --- | --- | --- |
| 1 | `S S _ _ _ _ _ _ _ _` | Valid | No orphan |
| 2 | `_ S S _ _ _ _ _ _ _` | Invalid | Seat 1 orphaned at the left end |
| 3 | `_ _ _ _ _ _ _ _ S _` | Invalid | Seat 10 orphaned at the right end |
| 4 | `_ _ S _ S _ _ _ _ _` | Invalid | Seat 4 orphaned in the middle |
| 5 | `X X _ S S X _ _ _ _` | Valid | Run of 3, 2 selected (exception) |
| 6 | `X _ X S S _ _ _ _ _` | Valid | Seat 2 was already an orphan |
| 7 | `X S _ X _ _ _ _ _ _` | Valid | Run of 2, 1 selected (exception) |
| 8 | `_ _ S S S S S S S S` | Valid | Run of 10, 8 selected, 2 left together |
| 9 | `_ S S S S S S S S _` | Invalid | Seats 1 and 10 orphaned; run of 10 with 8 selected leaves 2 seats, not 1, so the exception does not apply |
| 10 | `S _ S _ _ _ _ _ _ _` | Invalid | Seat 2 orphaned in the middle |
| 11 | `X S _ S S X _ _ _ _` | Invalid | Run of 4 with 3 selected, but the selection is not contiguous |

> Case 7 is valid under the confirmed exception (a run of 2 with 1 selected). An earlier draft listed it as invalid.

**BR-09 – When seats are held.** Seats are held **when the customer confirms the selection** (Continue on the seat map), not on each click and not at payment. The hold lasts **10 minutes** [Config]. Holds are stored in Redis with a TTL; sales are stored in PostgreSQL (`ARCHITECTURE.md` §6).

**BR-10 – One active hold.** A member account, or a guest browser (identified by its client id), has at most one active hold. Creating a new hold releases the previous one. Going back from snacks to seats releases the current hold.

**BR-11 – Hold expiry**
- An expired hold releases its seats. The booking becomes `EXPIRED` and can no longer be paid.
- Bookings in `PENDING_PAYMENT` get a **2-minute grace period** after the expiry before their seats are released, because a payment completed just before the deadline may be reported late.
- The payment gateway session expires at the hold expiry time.

### 1.3 Booking and payment

**BR-12 – Booking states**

| State | Meaning |
| --- | --- |
| `HOLDING` | Seats held; customer is choosing snacks or entering info. |
| `PENDING_PAYMENT` | A payment attempt has started. |
| `CONFIRMED` | Paid; tickets issued. |
| `EXPIRED` | The hold ran out without payment. |
| `RELEASED` | The customer went back and gave up the seats. |
| `NEEDS_ATTENTION` | Payment succeeded but the seats were no longer available (`BR-14`). |
| `REFUNDED` | Refunded manually by admin. |

Allowed transitions: HOLDING→PENDING_PAYMENT, PENDING_PAYMENT→HOLDING (payment failed), PENDING_PAYMENT→CONFIRMED, HOLDING/PENDING_PAYMENT→EXPIRED, HOLDING→RELEASED, EXPIRED→CONFIRMED or NEEDS_ATTENTION (late success), CONFIRMED/NEEDS_ATTENTION→REFUNDED (admin only). Any other transition is a bug.

**BR-13 – Payment confirmation**
- A booking becomes `CONFIRMED` **only** from a verified server-to-server payment notification (VNPay IPN), a successful reconciliation query, or the Demo Pay completion endpoint. The browser return URL alone never confirms.
- Confirmation is **idempotent**: processing the same notification twice changes nothing the second time.
- The paid amount must equal the booking total, otherwise the notification is rejected and logged.
- A failed payment returns the booking to `HOLDING`, so it can be retried while the hold is valid. Each attempt has a new transaction reference.

**BR-14 – Late payment success.** If a success notification arrives for an `EXPIRED` booking:
- If all its seats are still available (or still held by it), take them and confirm.
- Otherwise set `NEEDS_ATTENTION`, issue no tickets, and show the booking in admin for a manual refund.

**BR-15 – No customer cancellation.** A paid booking cannot be cancelled, refunded or changed by the customer. Admin may mark a booking `REFUNDED` in exceptional cases (cinema cancelled the showtime, `NEEDS_ATTENTION`). This voids its tickets and reverses its points.

### 1.4 Membership

**BR-16 – Earning points**
- Only bookings made while logged in earn points. Guest bookings never earn points, including retroactively.
- Points = **5% of the ticket subtotal** in VND, as an integer (1 point = 1 VND of value) [Config]. Example: 2 weekend adult tickets = 130,000 → 6,500 points.
- Snacks earn no points.
- Points are credited in the same transaction that confirms the payment.

**BR-17 – Point expiry.** Each point-earning entry expires **12 months** after it was earned. "Qualifying points" = the sum of non-expired points earned in the last 12 months, minus reversals.

**BR-18 – VIP tier**
- One milestone: **Member → VIP** when qualifying points reach **50,000** [Config]. This equals 1,000,000 VND of tickets in 12 months.
- VIP is granted immediately when the threshold is reached and lasts **12 months**.
- On the VIP expiry date it renews for another 12 months only if qualifying points are still ≥ the threshold. Otherwise it lapses.
- Refund reversals can drop qualifying points below the threshold. An already granted VIP period is **not** revoked by that.

**BR-19 – VIP benefit.** VIP members get **15% off every snack and combo** [Config], applied automatically. The discount is evaluated at hold time and snapshotted on the booking. It never applies to tickets.
- **Rounding:** the discounted unit price is `price × (100 − pct) / 100`, **rounded down to the nearest 1,000 VND**. Example: 79,000 → 67,150 → **67,000**. Line total = discounted unit price × quantity.

### 1.5 Checkout and access

**BR-20 – Checkout steps**
- Guest: **Customer info → Payment → Ticket**. Full name, phone (Vietnamese format) and email are required.
- Member: **Payment → Ticket**. Contact details are prefilled from the profile and can be changed for this booking only.

**BR-21 – Guest lookup.** A booking can be retrieved with its booking code plus the email **or** phone used for it. At most 5 attempts per minute per IP.

### 1.6 Schedule and catalogue

**BR-22 – Showtime scheduling**
- A showtime occupies its room from `starts_at` until `starts_at + movie duration + room cleanup time` (default 15 minutes [Config]).
- Two non-cancelled showtimes in the same room may not overlap. This is enforced by the database.
- Cancelling a showtime with confirmed bookings requires admin to handle those bookings (`BR-15`). Showtimes with sales cannot be moved or edited; cancel them and create new ones instead.

**BR-23 – Coming soon.** Coming-soon movies show a release date and "No showtimes yet". They never get showtimes and cannot be booked.

**BR-24 – Sales window.** Online sales for a showtime close at its start time [Config]. Past showtimes are hidden from customers.

**BR-25 – Rolling window.** Showtimes generated from templates always cover **today through today + 6 days** (7 days) [Config]. Generation is idempotent and runs daily, on startup, and on the first catalogue request of a new day.

**BR-26 – Demo protection**
- Seed rows (`is_seed = true`) can be edited but not deleted.
- Nightly at 03:00:
  - restore seed content (movies, rooms, templates, snacks, pricing, demo accounts);
  - delete non-seed admin content;
  - purge bookings older than 7 days;
  - recompute coming-soon release dates (`today + release_offset_days`);
  - regenerate the rolling window.
- Generated showtimes get 15–35% of seats pre-sold to a system "walk-in" booking, chosen deterministically per showtime.

**BR-27 – Student verification.** The student requirement is shown when choosing tickets, at checkout and on the ticket. Verification happens at the entrance (later shown to staff by the check-in module).

**BR-28 – Age rating notice.** For T16/T18 movies, the tickets step shows a notice that ID may be checked and that underage viewers will be refused entry.

---

## 2. Engineering Rules

### 2.1 Architecture

- **ER-01 – Channel-agnostic use cases.** All business logic lives in application services, such as `BookingService.createHold(command)`. Controllers only map HTTP to commands and results. The website, the future chatbot tools and the future kiosk must call **the same services**. No business rule may exist only in a controller, the frontend, or a chat prompt.
- **ER-02 – Package by feature.** Backend packages are feature modules (`catalog`, `booking`, `payment`, …). A module accesses another module only through its public service interfaces, never through its repositories.
- **ER-03 – Server-side authority.** Prices, totals, discounts, points, seat availability and rule checks are computed on the server. Client-side checks are for UX only.
- **ER-04 – Every booking records its channel.** `bookings.channel` is `WEB | CHAT | KIOSK | ADMIN`. v1 writes `WEB`.
- **ER-05 – Errors are codes.** APIs return RFC 7807 `ProblemDetail` with a stable `code` (e.g. `SEAT_UNAVAILABLE`, `ORPHAN_SEAT`, `HOLD_EXPIRED`). Clients translate codes. The backend never returns user-facing sentences, so web, chat and kiosk can each word messages appropriately.
- **ER-06 – Inject time.** Use an injected `java.time.Clock`. Never call `LocalDateTime.now()` or `Instant.now()` directly in business code.

### 2.2 Data

- **ER-07 – Flyway only.** The schema changes only through versioned Flyway migrations. `spring.jpa.hibernate.ddl-auto=validate`. Never edit an applied migration.
- **ER-08 – Types.** Money is `BIGINT` VND (`long` in Java, `number` in TS, formatted only at display time). Instants are `timestamptz`. Enums are `text` with `CHECK` constraints.
- **ER-09 – Integrity in the database.** Invariants are enforced by constraints where possible: the `sold_seats (showtime_id, seat_id)` primary key (final anti-double-sale guarantee), the room-overlap exclusion constraint, unique booking codes and transaction references.
- **ER-10 – Seat inventory protocol.** Seat holds are read and written **only** through the `SeatInventory` interface and its Lua scripts (`ARCHITECTURE.md` §6). In particular:
  - No other code touches the `cb:{st:*}` keys.
  - Every hold or release increments the row versions.
  - Sales are written only by `BookingService.confirmPaid` into `sold_seats`, followed by `mark_sold` after commit.
  - The orphan rule is never re-implemented in Lua.
- **ER-10a – Redis conventions.**
  - Keys start with `cb:`. Per-showtime keys use the hash tag `{st:<id>}`.
  - Every key has a TTL or an `EXPIREAT`; no key lives forever.
  - Lua scripts live in `src/main/resources/redis/`, are loaded via `EVALSHA`, and each has an integration test.
  - Redis is never the only copy of data that must survive a restart.
- **ER-11 – Translations in tables.** Translatable content uses `*_translations(entity_id, locale, …)` tables, never `title_vi`/`title_en` columns.

### 2.3 API and security

- **ER-12 – DTOs only.** Controllers never expose JPA entities. Request DTOs are validated with Bean Validation.
- **ER-13 – Secrets** (JWT, VNPay, SMTP, future LLM keys) come from environment variables. `.env` files are git-ignored. `.env.example` lists every variable.
- **ER-14 – Rate limits** (Bucket4j with Redis) on login, booking lookup, hold creation and (later) chat messages and kiosk lookups.
- **ER-15 – Personal data.** Phone numbers are masked everywhere except the owner's own views and admin. Personal data never goes into logs, and (later) never into LLM prompts beyond what the user typed.

### 2.4 Frontend

- **ER-16 – No hard-coded user-facing strings.** Every string goes through i18n keys, in per-feature namespace files `src/i18n/locales/{vi,en}/<namespace>.json`. A key must exist in both languages.
- **ER-17 – Reusable booking components.** `SeatMap`, `TicketCounter`, `SnackPicker`, `ShowtimeList`, `MovieCard` and `HoldCountdown` are presentational: data comes in through props, events go out through callbacks, with no routing and no data fetching inside. They will be embedded in the chat widget and the kiosk.
- **ER-18 – State.** Server data uses TanStack Query. Booking flow state uses a Zustand store persisted to `sessionStorage`. Authentication state lives in the auth store (access token in memory only).
- **ER-19 – Design tokens only.** Use theme tokens and shared typography classes (`DESIGN.md`). No inline `style={{ fontFamily }}` as in the prototype.

### 2.5 Testing and workflow

- **ER-20 – Mirrored rule tests.** Shared fixtures in `shared/fixtures/` are used by both the Java and the TypeScript tests:
  - `orphan-rule-cases.json` (`BR-08`);
  - `pricing-cases.json` (`BR-02`, `BR-03`, `BR-19`);
  - `membership-cases.json` (`BR-16`…`BR-18`).
- **ER-21 – Must-have tests:**
  - concurrent holds (Redis), the neighbouring-seat race, version-conflict retry;
  - idempotent payment confirmation, late payment (both branches);
  - Redis-down behaviour;
  - pricing per day type, VIP evaluation with a fixed clock;
  - refresh-token reuse detection.
- **ER-22 – Git.** Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`), short-lived feature branches, and green CI before merging to `main`.
- **ER-23 – Docs stay current.** A task is done only when `PROGRESS.md` is updated. A rule change updates `RULES.md` and the decision log in the same commit.
- **ER-24 – Contract first.** `docs/api/openapi.yaml` is the API contract.
  - The backend implements it exactly.
  - The frontend uses types generated from it (`openapi-typescript`), with no hand-written API types.
  - Changing an endpoint, schema or error code means changing the contract first, which is integrator-owned (`AGENT-EXECUTION-PLAN.md`).
- **ER-25 – File ownership.** In parallel work, each task may edit only the paths it owns (`AGENT-EXECUTION-PLAN.md` §4). Shared files (`pom.xml`, `package.json`, lockfiles, `SecurityConfig`, `ErrorCode`, `router.tsx`, the contract, Flyway `V1`) change only through the integrator.

---

## 3. Draft Rules for Planned Modules

These are drafts. They are fixed now only so that v1 does not contradict them.

### 3.1 Chatbot

- **BR-C-01 – Grounded answers only.** Prices, showtimes, seat availability, booking and payment status come **only** from tool calls to backend services (`ER-01`). The LLM never states them from memory or invents them.
- **BR-C-02 – Explicit confirmation.** Creating a hold, changing seats or starting payment requires an explicit user action: a button click in a widget, not free-text inference.
- **BR-C-03 – Same rules.** Chat bookings obey every `BR-xx` (orphan rule, holds, pricing). Seat suggestions only return combinations that pass `BR-08`.
- **BR-C-04 – Payment stays on the website.** The chat hands off to `/checkout/:bookingId` with the booking token. Card data never passes through the chat.
- **BR-C-05 – Cost control.** Answer with rules or buttons first, then cache, then FAQ retrieval with a small model, then the full LLM with tools. Apply per-session, per-IP and per-user limits and a daily budget cap [Config]. When the budget is exhausted, the chat keeps working in rule-only mode.
- **BR-C-06 – Scope guard.** Off-topic requests are declined politely without calling the LLM. Tools have no admin capabilities and cannot confirm payments.
- **BR-C-07 – Language.** Reply in the language of the user's message, falling back to the site language.

### 3.2 Kiosk and check-in

- **BR-K-01 – Lookup.** The kiosk requires a booking code (or QR) **and** the last 4 digits of the phone number. At most 5 failed attempts per device per minute.
- **BR-K-02 – What is shown.** Only `CONFIRMED` bookings. The phone is masked (`090****123`) and email is never shown.
- **BR-K-03 – Printing.** One printed ticket per seat. Reprints are allowed and logged (`ticket_events`). Printing is allowed from 24 h before the start time until the start time + 15 minutes [Config].
- **BR-K-04 – Printing is not check-in.** Only a staff scan checks a ticket in.
- **BR-K-05 – Check-in window.** Check-in is allowed from 30 minutes before the start until the end of the showtime [Config]. A ticket checks in once. Re-scans are rejected with the time of the original check-in. A couple-seat ticket (`admits = 2`) checks in both people at once in v1 data.
- **BR-K-06 – Student tickets** show "Check student ID" to staff on scan.
- **BR-K-07 – Idle reset.** The kiosk clears the session after 30 s without interaction.
- **BR-K-08 – Device trust.** Kiosk endpoints require a device token issued by admin, not a user login.
