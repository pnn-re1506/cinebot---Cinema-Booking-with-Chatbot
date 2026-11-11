# CineBot – Progress

| Item | Value |
| --- | --- |
| Last updated | 2026-11-11 |
| Current phase | **Phase 0 – Foundations** (not started) |
| Overall v1 progress | Documentation done; implementation 0% |

How to use this file (`ER-23`):
- Tick a task only when it is merged to `main` with tests passing.
- Add every decision to the **Decision log**, and every unresolved question to **Open questions**.
- Update *Last updated*, *Current phase* and the **Changelog** at the end of each working session.

---

## 1. Current State

| Area | State |
| --- | --- |
| Frontend | Figma Make prototype: Vite + React 18 + Tailwind v4 + shadcn/ui; everything in `src/app/App.tsx` (~1,500 lines), mock data, London/£ theme, no routing or API |
| Backend | Empty (`backend/.gitkeep`) |
| Database | None |
| Docs | `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`, `PROGRESS.md` written; `IMPLEMENTATION-PLAN.md` kept as reference; `PRD-CinemaBooking.md` and `frontend_review.md` are earlier drafts |
| Deployment | None |

## 2. Roadmap

Legend: ⬜ not started · 🟨 in progress · ✅ done · ⏸ deferred

| Phase | Name | Estimate (part-time) | Status |
| --- | --- | --- | --- |
| 0 | Foundations | 1 week | ⬜ |
| 1 | Catalogue and schedule | 1.5 weeks | ⬜ |
| 2 | Authentication | 1 week | ⬜ |
| 3 | Seat selection and holds | 2 weeks | ⬜ |
| 4 | Checkout and payment | 2 weeks | ⬜ |
| 5 | Membership | 0.5 week | ⬜ |
| 6 | Admin | 2 weeks | ⬜ |
| 7 | Demo hardening and launch | 1 week | ⬜ |
| 8 | Chatbot | — | ⏸ planned |
| 9 | Kiosk and staff check-in | — | ⏸ planned |

---

## 3. Phase Checklists

### Phase 0 – Foundations ⬜

Backend
- [ ] Spring Boot project (Java 21, Maven) with the module packages from `ARCHITECTURE.md` §4
- [ ] `docker-compose.yml` with PostgreSQL 16; profiles `local`, `test`, `prod`
- [ ] Flyway `V1__init.sql` with the full v1 schema (`ARCHITECTURE.md` §5.2), including the extension columns (`bookings.channel`, `users.role` with `STAFF`, ticket check-in fields)
- [ ] `ProblemDetail` error handling with error codes (`ARCHITECTURE.md` §9.2)
- [ ] `Clock` bean, `Accept-Language` locale resolver, springdoc Swagger UI
- [ ] `.env.example` (`ARCHITECTURE.md` §12)

Frontend
- [ ] Remove the Figma asset plugin and unused dependencies (`@mui/*`, `@emotion/*`, `react-slick`, `react-dnd`, …)
- [ ] Split `App.tsx` into the structure from `ARCHITECTURE.md` §11; React Router routes from `DESIGN.md` §7.1
- [ ] TanStack Query, axios client (headers, refresh interceptor stub), Zustand booking store
- [ ] i18n setup (`vi.json`, `en.json`) with `LanguageSwitcher`
- [ ] Apply design-token fixes: contrast (`DESIGN.md` §3.3), new tokens (§3.2), type classes (§4.2)
- [ ] Verify Vietnamese font support; switch the body/mono fonts if needed (`DESIGN.md` §4.1)

Repo
- [ ] GitHub Actions CI: backend tests (Testcontainers) + frontend lint, typecheck, test, build
- [ ] Root `README.md` with how to run locally

*Done when:* `docker compose up`, the backend and `pnpm dev` all run locally; CI is green.

### Phase 1 – Catalogue and schedule ⬜

- [ ] Seed loader: cinema, 5 rooms with layouts (`ARCHITECTURE.md` §5.5), genres, ~6 now-showing + ~6 coming-soon movies (VI/EN), templates, snacks, pricing
- [ ] Catalogue APIs: movies list/detail, showtimes by date, showtime detail, seat map, cinema
- [ ] `RollingShowtimeJob` + startup run + lazy guard; simulated occupancy (`BR-25`, `BR-26`)
- [ ] Room overlap exclusion constraint + test (`BR-22`)
- [ ] FE: Home (hero, tabs, genre chips, `MovieCard` with hover info), Movie detail (info, synopsis, trailer, `DateStrip`, `ShowtimeList`), Cinema page
- [ ] FE: `AgeBadge`, skeleton, empty and error states

*Done when:* moving the clock forward still gives 7 days of showtimes; coming-soon movies cannot be booked; VI/EN switches movie content.

### Phase 2 – Authentication ⬜

- [ ] Register, login, refresh rotation with reuse detection and grace window, logout (`ARCHITECTURE.md` §7)
- [ ] `/api/me` GET/PUT; rate limit on login
- [ ] Same-site cookie setup documented for deployment
- [ ] FE: auth modal wired to the API, silent refresh on load, single-flight refresh, account menu, protected `/account`
- [ ] Tests: reuse detection revokes the family; expired access token refreshes transparently

### Phase 3 – Seat selection and holds ⬜

- [ ] `PriceCalculator` + pricing policy versions (`BR-01`…`BR-04`)
- [ ] `OrphanSeatRule` in Java and TypeScript using the shared fixture (`BR-08`, `ER-20`)
- [ ] `createHold` with row locks (`ARCHITECTURE.md` §6.1), release, one active hold, booking token
- [ ] `HoldExpiryJob` + lazy expiry; domain events `SeatsHeld/Released/Sold`
- [ ] Snack API + `PUT /bookings/{id}/snacks` with the VIP discount (`BR-19`)
- [ ] FE: Booking page (Tickets → Seats → Snacks), `SeatMap` per `DESIGN.md` §6.3, `TicketCounter`, `SnackPicker`, `HoldCountdown`, `BookingSummaryBar`, seat map polling, 409/422 handling
- [ ] Tests: 20 concurrent holds → 1 winner; A3/A5 race; prices for Tue/Wed/Sat

### Phase 4 – Checkout and payment ⬜

- [ ] `PUT /customer`, `POST /payments`, `PaymentGateway` with Mock and VNPay sandbox
- [ ] VNPay IPN (idempotent), return URL, `PaymentReconciliationJob`
- [ ] `confirmPaid` transaction: seats SOLD, tickets with QR, points, email outbox (`ARCHITECTURE.md` §6.2)
- [ ] Late payment handling (`BR-14`)
- [ ] Email templates VI/EN + `EmailOutboxJob`
- [ ] Guest lookup with rate limit (`BR-21`)
- [ ] FE: checkout stepper (guest 3 steps / member 2 steps), payment options with test banner, result page polling, `TicketCard` with print CSS, Demo Pay page, lookup page, hold-expired dialog
- [ ] Tests: duplicate IPN; late IPN (both branches); expired hold cannot pay

### Phase 5 – Membership ⬜

- [ ] Point ledger EARN on confirmation; REVERSAL on admin refund (`BR-16`, `BR-17`)
- [ ] VIP grant on confirmation + `VipEvaluationJob` for renewal and lapse (`BR-18`)
- [ ] `/api/me/membership`, `/api/me/bookings`
- [ ] FE: account tabs (Profile, My bookings, Points & VIP with `VipProgress`), Membership page
- [ ] Tests with a fixed `Clock`: threshold crossing, 12-month expiry, renewal

### Phase 6 – Admin ⬜

- [ ] Admin APIs: dashboard, movies, rooms (generator, block seats), showtimes, templates + regenerate, pricing, snacks, bookings (mark refunded), audit log
- [ ] Seed protection (`SEED_PROTECTED`)
- [ ] FE: admin layout (from the prototype) and pages per `DESIGN.md` §8.5, including the showtime timeline with 5 room lanes
- [ ] Tests: role protection; overlap rejection; pricing change does not affect existing bookings

### Phase 7 – Demo hardening and launch ⬜

- [ ] `DemoResetJob` (`BR-26`); demo accounts (VIP, almost-VIP, admin)
- [ ] "Test payment" banners, footer disclaimer, admin demo credentials on the login page
- [ ] Deploy: frontend (with `/api` rewrite), backend container, managed PostgreSQL, SMTP, VNPay sandbox IPN URL
- [ ] Uptime monitor; README with architecture diagram, state machine, concurrency explanation, screenshots, demo credentials
- [ ] *Done when:* the site has worked unattended for 3 consecutive days with bookable showtimes every day

### Phase 8 – Chatbot ⏸ (planned)

Prerequisites already in v1: `ER-01`, `ER-05`, `ER-17`, booking token, domain events, `bookings.channel`.

- [ ] FAQ content: `faq_entries` + translations + admin page (can be pulled forward as a v1 stretch goal)
- [ ] `SeatSuggestionService` (can be pulled forward as a v1 "Suggest best seats" button)
- [ ] SSE seat stream `/api/showtimes/{id}/seat-events`
- [ ] `chat` module: guardrails (rate limit, budget, scope), `IntentRouter`, rule handlers, answer cache, FAQ retrieval (pgvector), `LlmClient`, `ChatToolRegistry` (`ARCHITECTURE.md` §10.1)
- [ ] `chat_sessions`, `chat_messages`, `llm_usage_daily` migration; usage dashboard in admin
- [ ] FE: chat widget per `DESIGN.md` §11.1, reusing booking components in compact mode; checkout handoff
- [ ] Tests: the LLM never answers prices without a tool call; budget cap switches to rule-only mode; chat bookings obey `BR-08`

### Phase 9 – Kiosk and staff check-in ⏸ (planned)

Prerequisites already in v1: ticket `qr_token`/`status`/`checked_in_at`/`admits`, `STAFF` role value, booking token.

- [ ] Migration: `kiosk_devices`, `ticket_events` (`ARCHITECTURE.md` §10.2)
- [ ] Kiosk device registration in admin; device-token authentication
- [ ] Kiosk lookup + print endpoints (`BR-K-01`…`BR-K-03`)
- [ ] Staff check-in endpoint with row lock and re-scan rejection (`BR-K-05`)
- [ ] FE: `/kiosk/*` per `DESIGN.md` §11.2 (thermal print layout), `/staff/*` per §11.3
- [ ] Decide: split couple-seat tickets into 2 entries? (see open question Q4)

---

## 4. Decision Log

| ID | Date | Decision | Status |
| --- | --- | --- | --- |
| D-001 | 2026-11-11 | Backend Java 21 + Spring Boot (Maven); PostgreSQL | Confirmed by owner |
| D-002 | 2026-11-11 | Frontend builds on the existing prototype stack (Vite, React, Tailwind v4, shadcn/ui) | Confirmed by owner |
| D-003 | 2026-11-11 | One cinema, 5 rooms; schema supports multiple cinemas | Confirmed by owner |
| D-004 | 2026-11-11 | Ticket options: Adult, Student HSSV-U22, Couple seat; seat types single and couple only | Confirmed by owner |
| D-005 | 2026-11-11 | Adult price by day type: discount day (Tue) 45k / weekday 55k / weekend 65k; student fixed; couple = 2 × adult + 10k | Confirmed by owner |
| D-006 | 2026-11-11 | Student price = 45,000 | **Assumed – confirm** |
| D-007 | 2026-11-11 | Seat rows contiguous, no aisles; couple seats in the back row(s) | Confirmed by owner |
| D-008 | 2026-11-11 | Orphan-seat rule with the "all but one, contiguous" exception (`BR-08`) | **Assumed – confirm** |
| D-009 | 2026-11-11 | Hold seats on seat confirmation (not per click, not at payment) | Proposed; owner asked, answer given |
| D-010 | 2026-11-11 | Hold duration 10 minutes (earlier PRD draft: 15) | **Assumed – confirm** |
| D-011 | 2026-11-11 | Payment: VNPay sandbox + Demo Pay; IPN-only confirmation | Proposed |
| D-012 | 2026-11-11 | No customer cancellation; admin-only manual refund | Confirmed by owner |
| D-013 | 2026-11-11 | Points: 5% of the ticket subtotal, snacks excluded, members only | Confirmed by owner |
| D-014 | 2026-11-11 | One tier (VIP) with 12-month validity | Confirmed by owner |
| D-015 | 2026-11-11 | VIP threshold 50,000 points / 12 months; benefit 15% off snacks | **Chosen for the owner – confirm** |
| D-016 | 2026-11-11 | JWT access token + rotating refresh token with reuse detection | Confirmed by owner |
| D-017 | 2026-11-11 | Rolling showtimes (7-day window) + nightly demo reset | Confirmed by owner (window length assumed) |
| D-018 | 2026-11-11 | Chatbot and kiosk deferred; v1 includes extension hooks (`ARCHITECTURE.md` §10) | Confirmed by owner |
| D-019 | 2026-11-11 | Couple seat = 1 ticket with `admits = 2` until check-in exists | **Assumed – confirm** |
| D-020 | 2026-11-11 | No Redis in v1; PostgreSQL row locks for holds | Proposed |
| D-021 | 2026-11-11 | Docs language: English | Assumed (CV audience) |

## 5. Open Questions

| ID | Question | Needed by |
| --- | --- | --- |
| Q1 | Confirm the assumed values D-006, D-008, D-010, D-015, D-019 | Phase 3 |
| Q2 | Is VNPay sandbox registration done? (Needs a merchant sandbox account: TMN code + hash secret.) | Phase 4 |
| Q3 | Which seed movies and posters to use, and their image licensing (TMDB with attribution, or self-made posters)? | Phase 1 |
| Q4 | Kiosk: what does "STT" mean (print sequence, ticket index in a booking, or queue number)? Should couple-seat tickets print as 1 or 2 tickets? | Phase 9 |
| Q5 | Kiosk verification: last 4 digits of phone (assumed) or OTP? | Phase 9 |
| Q6 | Chatbot LLM provider and monthly budget | Phase 8 |
| Q7 | Hosting choice (sleep vs paid always-on) and domain name | Phase 7 |
| Q8 | Delete or archive the earlier drafts `PRD-CinemaBooking.md` and `IMPLEMENTATION-PLAN.md`? | Any time |

## 6. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Free hosting sleeps, so scheduled jobs are skipped and the first load is slow | Recruiters see a broken or slow demo | Lazy generation guard; always-on plan or uptime pinger |
| VNPay sandbox downtime or IPN not reachable | Payments stuck | Demo Pay always available; reconciliation job |
| Third-party cookie blocking | Users logged out on every reload | Same-site `/api` proxy (`ARCHITECTURE.md` §7.2) |
| Scope creep from chatbot/kiosk ideas | v1 never ships | Strict phase gates; planned modules stay ⏸ until Phase 7 is done |
| Vietnamese diacritics unsupported by the prototype fonts | Broken typography in VI | Verify in Phase 0; swap fonts (`DESIGN.md` §4.1) |

## 7. Changelog

| Date | Change |
| --- | --- |
| 2026-11-11 | Created `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`, `PROGRESS.md` from the planning discussion. Tightened the `BR-08` exception (contiguous selection) and corrected orphan test case 7 compared with `IMPLEMENTATION-PLAN.md`. |
| 2026-11-11 | Created `IMPLEMENTATION-PLAN.md` (detailed v1 plan). |
| 2026-09-26 | `PRD-CinemaBooking.md` (first Vietnamese PRD draft). |
