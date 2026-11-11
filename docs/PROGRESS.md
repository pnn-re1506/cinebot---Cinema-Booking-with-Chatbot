# CineBot – Progress

| Item | Value |
| --- | --- |
| Last updated | 2026-11-11 |
| Current phase | **Phase 0 done (G0 passed)** – Wave 1 next |
| Overall v1 progress | Documentation done; backend and frontend skeletons merged; features 0% |

How to use this file (`ER-23`):
- Tick a task only when it is merged to `main` with tests passing.
- Add every decision to the **Decision log**, and every unresolved question to **Open questions**.
- Update *Last updated*, *Current phase* and the **Changelog** at the end of each working session or wave gate.
- Work is executed as parallel agent tasks (`AGENT-EXECUTION-PLAN.md`). Task IDs (W0-1, B5a, F4…) are shown next to each checklist item.

---

## 1. Current State

| Area | State |
| --- | --- |
| Frontend | Skeleton (W0-3): TypeScript strict, every route as a placeholder, API client, i18n `vi`/`en`, MSW, design tokens; 31 tests. Prototype kept in `frontend/prototype/` as reference |
| Backend | Skeleton (W0-2): Spring Boot 3.5.16, module packages, ports with fallbacks, security matrix, ProblemDetail errors, rate limiter, ShedLock; 20 tests |
| Database / cache | `V1__schema.sql` (full v1 schema + initial pricing policy); `docker-compose.yml` with PostgreSQL 16 + Redis 7 |
| Docs | `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`, `PROGRESS.md`, `IMPLEMENTATION-PLAN.md`, `AGENT-EXECUTION-PLAN.md`. Earlier drafts: `PRD-CinemaBooking.md`, `frontend_review.md` |
| Agent rules | `.cursor/rules/*.mdc` (core, backend, Redis seat holds, migrations, frontend, testing) |
| Deployment | None |

## 2. Roadmap

Legend: ⬜ not started · 🟨 in progress · ✅ done · ⏸ deferred

| Phase | Name | Agent wave / tasks | Status |
| --- | --- | --- | --- |
| 0 | Foundations | Wave 0: W0-1, W0-2, W0-3 | ✅ |
| 1 | Catalogue and schedule | Wave 1: B1, B2, B3, F1, F2 | ⬜ |
| 2 | Authentication | Wave 1: B4, F3 | ⬜ |
| 3 | Seat selection and holds (Redis) | Wave 2: B5a, B5b, F4 | ⬜ |
| 4 | Checkout and payment | Wave 3: B6, B7, F5 | ⬜ |
| 5 | Membership | Wave 3: B8, F6 | ⬜ |
| 6 | Admin | Wave 4: B9, B10, F7, F8 | ⬜ |
| 7 | Demo hardening and launch | Wave 4: B11; Wave 5: I1, I2 | ⬜ |
| 8 | Chatbot | — | ⏸ planned |
| 9 | Kiosk and staff check-in | — | ⏸ planned |

### Wave gates

| Gate | Status | Notes |
| --- | --- | --- |
| G0 – contract frozen, skeletons green | ✅ 2026-11-11 | Both branches merged; `mvnw verify` (20 tests) and the frontend checks (31 tests) pass locally and in GitHub Actions |
| G1 – domain, catalogue, auth | ⬜ | |
| G2 – booking core + security review | ⬜ | |
| G3 – payment, tickets, membership + security review | ⬜ | |
| G4 – admin and demo | ⬜ | |
| G5 – release | ⬜ | |

---

## 3. Phase Checklists

### Phase 0 – Foundations ✅

Contract (W0-1) ✅
- [x] `docs/api/openapi.yaml` v1.0.0 covering every v1 endpoint (public, booking, payment, auth, account, admin), with examples and error codes (`ER-24`). Redocly lint clean; `openapi-typescript` generates types.
- [x] `shared/fixtures/orphan-rule-cases.json` (30), `pricing-cases.json` (35), `membership-cases.json` (10 scenarios) (`ER-20`). Cross-checked with a reference implementation: 102/102 checks consistent.
- [x] Owner approved the contract and D-027…D-030; tagged `contract-v1.0.0`

Backend (W0-2) ✅
- [x] Spring Boot 3.5.16 project (Java 21, Maven wrapper) with the module packages from `ARCHITECTURE.md` §4 and every dependency
- [x] `docker-compose.yml` with PostgreSQL 16 and Redis 7 (AOF); profiles `local`, `test`, `demo`, `prod`
- [x] Flyway `V1__schema.sql` with the full v1 schema (`ARCHITECTURE.md` §5.2), including `sold_seats` and the extension columns (`bookings.channel`, `users.role` with `STAFF`, ticket check-in fields)
- [x] `ProblemDetail` error handling with every error code (`ARCHITECTURE.md` §9.2)
- [x] `Clock` bean, `Accept-Language` locale resolver, springdoc Swagger UI, `Instant` serialized with `+07:00`
- [x] `SecurityConfig` with the full authorization matrix (`ARCHITECTURE.md` §7.4)
- [x] Cross-module ports from `AGENT-EXECUTION-PLAN.md` §8, each with a `@Fallback` bean
- [x] Redis config, `LuaScriptRegistry`, Bucket4j (Redis), ShedLock (Redis)
- [x] Testcontainers base class (PostgreSQL + Redis); shared fixture reader
- [x] `.env.example` (`ARCHITECTURE.md` §12), `.gitattributes`

Frontend (W0-3) ✅
- [x] Remove the Figma asset plugin and unused dependencies (`@mui/*`, `@emotion/*`, `react-slick`, `react-dnd`, …); add every needed dependency
- [x] Structure from `ARCHITECTURE.md` §11; every route from `DESIGN.md` §7.1 with placeholder pages; prototype moved to `frontend/prototype/`
- [x] Generated API types; axios client (all headers, single-flight refresh); `X-Client-Id`
- [x] i18n with per-feature namespace files (`ER-16`) and `LanguageSwitcher`; MSW with per-feature handlers
- [x] Apply design-token fixes: contrast (`DESIGN.md` §3.3), new tokens (§3.2), type classes (§4.2)
- [x] Vietnamese fonts: Barlow Condensed (display), Be Vietnam Pro (body), JetBrains Mono, all with the `vietnamese` subset

Repo
- [x] Commit docs and `.cursor/rules` before launching any agent
- [x] GitHub Actions CI green: backend tests (Testcontainers) + frontend lint, typecheck, test, build
- [x] Root `README.md` with how to run locally

*Done when:* `docker compose up`, the backend and `pnpm dev` all run locally; CI is green; contract tagged `contract-v1.0.0`.

### Phase 1 – Catalogue and schedule ⬜

- [ ] B1: `OrphanSeatRule`, `PriceCalculator`, `MembershipPolicy` passing the shared fixtures
- [ ] B2: seed loader: cinema, 5 rooms with layouts (`ARCHITECTURE.md` §5.5), genres, ~6 now-showing + ~6 coming-soon movies (VI/EN), snacks, pricing
- [ ] B2: catalogue APIs: movies list/detail, cinema, snacks (Redis cache)
- [ ] B3: showtimes by date, showtime detail; `RollingShowtimeJob` + startup run + lazy guard; simulated occupancy into `sold_seats` (`BR-25`, `BR-26`)
- [ ] B3: room overlap exclusion constraint + test (`BR-22`)
- [ ] F1: `orphanRule.ts` with the shared fixture, money/date formatters, error mapping, booking store
- [ ] F2: Home (hero, tabs, genre chips, `MovieCard` with hover info), Movie detail (info, synopsis, trailer, `DateStrip`, `ShowtimeList`), Cinema page; `AgeBadge`, skeleton, empty and error states

*Done when:* moving the clock forward still gives 7 days of showtimes; coming-soon movies cannot be booked; VI/EN switches movie content.

### Phase 2 – Authentication ⬜

- [ ] B4: register, login, refresh rotation with reuse detection and grace window, logout (`ARCHITECTURE.md` §7)
- [ ] B4: `/api/me` GET/PUT; rate limit on login; demo users
- [ ] Same-site cookie setup documented for deployment
- [ ] F3: auth modal wired to the API, silent refresh on load, single-flight refresh, account menu, protected `/account` and `/admin`
- [ ] Tests: reuse detection revokes the family; expired access token refreshes transparently

### Phase 3 – Seat selection and holds (Redis) ⬜

- [ ] B5a: Lua scripts `load_sold`, `snapshot`, `commit_hold`, `release_hold`, `extend_hold`, `claim_for_sale`, `mark_sold` (`ARCHITECTURE.md` §6.3)
- [ ] B5a: `RedisSeatInventory` + `SeatHoldCoordinator` (optimistic row versions, 3 retries, orphan rule in Java) (`ARCHITECTURE.md` §6.4)
- [ ] B5a: sold mirror + `SoldSetReconcileJob`; pub/sub seat events; Redis health indicator
- [ ] B5b: seat-map endpoint (PG sold + Redis holds, `inventoryAvailable`, `HELD_BY_YOU`)
- [ ] B5b: `POST /bookings` (one active hold per owner, booking token, price snapshot), release, `HoldExpiryJob`
- [ ] B5b: `PUT /bookings/{id}/snacks` with the VIP discount (`BR-19`), `PUT /customer`; `503 SEAT_SERVICE_UNAVAILABLE`
- [ ] F4: Booking page (Tickets → Seats → Snacks), `SeatMap` per `DESIGN.md` §6.3, `TicketCounter`, `SnackPicker`, `HoldCountdown`, `BookingSummaryBar`, polling, 409/410/422/503 handling
- [ ] Tests: 20 concurrent holds → 1 winner; A3/A5 race never leaves an orphan; version-conflict retry; Redis flushed → mirror rebuilt; Redis down → 503 and read-only seat map

### Phase 4 – Checkout and payment ⬜

- [ ] B6: `POST /payments` (extends the hold by 2 minutes), `PaymentGateway` with Mock and VNPay sandbox
- [ ] B6: VNPay IPN (idempotent), return URL, `PaymentReconciliationJob`
- [ ] B6: `confirmPaid` per `ARCHITECTURE.md` §6.6: claim in Redis, insert `sold_seats` (PK backstop), tickets, points, email outbox, then `mark_sold`
- [ ] B6: late payment handling (`BR-14`), `NEEDS_ATTENTION` path
- [ ] B7: tickets with QR tokens; email templates VI/EN + `EmailOutboxJob`; guest lookup with rate limit (`BR-21`)
- [ ] F5: checkout stepper (guest 3 steps / member 2 steps), payment options with test banner, result page polling, `TicketCard` with print CSS, Demo Pay page, lookup page, hold-expired dialog
- [ ] Tests: duplicate IPN; late IPN (both branches); expired hold cannot pay; confirm while Redis is down sells exactly once

### Phase 5 – Membership ⬜

- [ ] B8: point ledger EARN on confirmation; REVERSAL on admin refund (`BR-16`, `BR-17`)
- [ ] B8: VIP grant on confirmation + `VipEvaluationJob` for renewal and lapse (`BR-18`)
- [ ] B8: `/api/me/membership`, `/api/me/bookings`
- [ ] F6: account tabs (Profile, My bookings, Points & VIP with `VipProgress`), Membership page
- [ ] Tests with a fixed `Clock`: threshold crossing, 12-month expiry, renewal

### Phase 6 – Admin ⬜

- [ ] B9: movies, snacks, rooms (generator, block seats at room level), seed protection (`SEED_PROTECTED`), audit log
- [ ] B10: dashboard, showtimes, templates + regenerate, pricing, bookings (refund: delete `sold_seats`, refresh the Redis sold mirror)
- [ ] F7 / F8: admin layout (from the prototype) and pages per `DESIGN.md` §8.5, including the showtime timeline with 5 room lanes
- [ ] Tests: role protection; overlap rejection; pricing change does not affect existing bookings; refund frees the seats

### Phase 7 – Demo hardening and launch ⬜

- [ ] B11: `DemoResetJob` (`BR-26`) including Redis cleanup; demo accounts (VIP, almost-VIP, admin)
- [ ] "Test payment" banners, footer disclaimer, admin demo credentials on the login page
- [ ] I1: frontend against the real backend; Playwright E2E; contract diff check in CI
- [ ] I2: deploy: frontend (with `/api` rewrite), backend container, managed PostgreSQL, Upstash Redis, SMTP, VNPay sandbox IPN URL
- [ ] I2: uptime monitor; README with architecture diagram, state machine, concurrency explanation, screenshots, demo credentials
- [ ] *Done when:* the site has worked unattended for 3 consecutive days with bookable showtimes every day

### Phase 8 – Chatbot ⏸ (planned)

Prerequisites already in v1: `ER-01`, `ER-05`, `ER-17`, booking token, domain events, `bookings.channel`, Redis pub/sub seat events.

- [ ] FAQ content: `faq_entries` + translations + admin page (can be pulled forward as a v1 stretch goal)
- [ ] `SeatSuggestionService` (can be pulled forward as a v1 "Suggest best seats" button)
- [ ] SSE seat stream `/api/showtimes/{id}/seat-events` (fed by Redis pub/sub)
- [ ] `chat` module: guardrails (rate limit, budget, scope), `IntentRouter`, rule handlers, answer cache (Redis), FAQ retrieval (pgvector), `LlmClient`, `ChatToolRegistry` (`ARCHITECTURE.md` §10.1)
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
| D-006 | 2026-11-11 | Student price = 45,000 | Confirmed by owner |
| D-007 | 2026-11-11 | Seat rows contiguous, no aisles; couple seats in the back row(s) | Confirmed by owner |
| D-008 | 2026-11-11 | Orphan-seat rule with the "all but one, contiguous" exception (`BR-08`) | Confirmed by owner |
| D-009 | 2026-11-11 | Hold seats on seat confirmation (not per click, not at payment) | Confirmed by owner |
| D-010 | 2026-11-11 | Hold duration 10 minutes (earlier PRD draft: 15) | Confirmed by owner |
| D-011 | 2026-11-11 | Payment: VNPay sandbox + Demo Pay; IPN-only confirmation | Confirmed by owner |
| D-012 | 2026-11-11 | No customer cancellation; admin-only manual refund | Confirmed by owner |
| D-013 | 2026-11-11 | Points: 5% of the ticket subtotal, snacks excluded, members only | Confirmed by owner |
| D-014 | 2026-11-11 | One tier (VIP) with 12-month validity | Confirmed by owner |
| D-015 | 2026-11-11 | VIP threshold 50,000 points / 12 months; benefit 15% off snacks (rounded down to 1,000 VND) | Confirmed by owner (rounding chosen for the owner) |
| D-016 | 2026-11-11 | JWT access token + rotating refresh token with reuse detection | Confirmed by owner |
| D-017 | 2026-11-11 | Rolling showtimes (7-day window) + nightly demo reset | Confirmed by owner |
| D-018 | 2026-11-11 | Chatbot and kiosk deferred; v1 includes extension hooks (`ARCHITECTURE.md` §10) | Confirmed by owner |
| D-019 | 2026-11-11 | Couple seat = 1 ticket with `admits = 2` until check-in exists | Confirmed by owner |
| D-020 | 2026-11-11 | **Redis holds the seats (TTL + Lua), PostgreSQL records sales (`sold_seats`)**; `showtime_seats` table dropped; PG primary key is the final double-sale guarantee (`ARCHITECTURE.md` §6) | Confirmed by owner (replaces "no Redis in v1") |
| D-021 | 2026-11-11 | Docs language: English | Assumed (CV audience) |
| D-022 | 2026-11-11 | Concurrency in Redis via optimistic row versions + retries, not a distributed lock; orphan rule runs only in Java | Proposed by design, accepted with D-020 |
| D-023 | 2026-11-11 | Redis outage: holds return `503 SEAT_SERVICE_UNAVAILABLE`, seat map read-only; confirmations still work via the PG primary key | Proposed by design, accepted with D-020 |
| D-024 | 2026-11-11 | Contract-first API (`docs/api/openapi.yaml`), generated TS types, MSW mocks (`ER-24`) | Accepted |
| D-025 | 2026-11-11 | Build executed by parallel Grok 4.7 high fast agents in waves with file ownership and integrator gates (`AGENT-EXECUTION-PLAN.md`) | Accepted |
| D-026 | 2026-11-11 | Blocked seats are room-level (`seats.is_active=false`), not per showtime | Accepted with D-020 |
| D-027 | 2026-11-11 | Membership details: reversal expires with its earn; renewal extends from the old expiry; earning while VIP does not extend; lapse clears `vip_since`; 01:00 evaluation gap accepted (`BR-17`, `BR-18`) | Confirmed by owner |
| D-028 | 2026-11-11 | Snack quantity 1–10 per line, max 20 lines (`BR-19a`); password 8–72 chars with a letter and a digit; VN mobile phone pattern | Confirmed by owner |
| D-029 | 2026-11-11 | New error codes `INVALID_CREDENTIALS`, `EMAIL_TAKEN`, `RESOURCE_IN_USE`, `CUSTOMER_INFO_REQUIRED`, `INTERNAL_ERROR`; payment start returns 503 when Redis is down | Accepted (W0-1) |
| D-030 | 2026-11-11 | A `PENDING_PAYMENT` booking cannot start a second payment (409); it returns to `HOLDING` only via a failed IPN, reconciliation, or a Demo Pay failure | Accepted (W0-1) |
| D-031 | 2026-11-11 | Rate limits (operational, `cinebot.rate-limits.*`): login 10/min per IP, register 5/min per IP, booking lookup 5/min per IP (`BR-21`), hold creation 20/min per owner | Proposed by integrator; owner may change |
| D-032 | 2026-11-11 | Spring Boot 3.5.x (not 4.x) for library compatibility (springdoc, ShedLock, Bucket4j); pnpm 12.4.2, Node 22 | Accepted (W0-2, W0-3) |
| D-033 | 2026-11-11 | Schema details beyond §5.2: CHECKs on booking code length 8, `tickets.admits` in (1, 2), email types, discount day Mon–Fri, locales `vi`/`en`; `booking_snacks` PK `(booking_id, snack_id)`; FK lookup indexes | Accepted at G0 |

## 5. Open Questions

| ID | Question | Needed by |
| --- | --- | --- |
| ~~Q1~~ | ~~Confirm the assumed values D-006, D-008, D-010, D-015, D-019~~ — resolved 2026-11-11, all confirmed | — |
| Q2 | Is VNPay sandbox registration done? (Needs a merchant sandbox account: TMN code + hash secret.) | Phase 4 / Wave 3 |
| Q3 | Which seed movies and posters to use, and their image licensing (TMDB with attribution, or self-made posters)? | Phase 1 / Wave 1 (B2) |
| Q4 | Kiosk: what does "STT" mean (print sequence, ticket index in a booking, or queue number)? Should couple-seat tickets print as 1 or 2 tickets? | Phase 9 |
| Q5 | Kiosk verification: last 4 digits of phone (assumed) or OTP? | Phase 9 |
| Q6 | Chatbot LLM provider and monthly budget | Phase 8 |
| Q7 | Hosting choice (sleep vs paid always-on), Redis provider (Upstash or host add-on) and domain name | Phase 7 / Wave 5 |
| Q8 | Delete or archive the earlier drafts `PRD-CinemaBooking.md` and `frontend_review.md`? | Any time |
| Q9 | Cinema name, street address and hotline for the seed `cinemas` row (shown in the footer and on `/cinema`); real or fictional demo values? | Wave 1 (B2) |

## 6. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Free hosting sleeps, so scheduled jobs are skipped and the first load is slow | Recruiters see a broken or slow demo | Lazy generation guard; always-on plan or uptime pinger |
| Redis restart or eviction loses holds | Customers mid-checkout lose their seats | AOF persistence; `noeviction` policy; `extend_hold` returns `LOST` → clear message; PG primary key prevents double sale |
| Redis provider limits (free tier commands/day) | Holds fail under load spikes | Lua keeps round trips low; 503 path keeps browsing alive; paid tier if needed |
| VNPay sandbox downtime or IPN not reachable | Payments stuck | Demo Pay always available; reconciliation job |
| Third-party cookie blocking | Users logged out on every reload | Same-site `/api` proxy (`ARCHITECTURE.md` §7.2) |
| Parallel agents diverge or conflict | Rework, broken merges | Contract first, ports first, shared fixtures, file ownership, wave gates (`AGENT-EXECUTION-PLAN.md`) |
| Scope creep from chatbot/kiosk ideas | v1 never ships | Strict phase gates; planned modules stay ⏸ until Phase 7 is done |
| Vietnamese diacritics unsupported by the prototype fonts | Broken typography in VI | Verify in Phase 0; swap fonts (`DESIGN.md` §4.1) |

## 7. Changelog

| Date | Change |
| --- | --- |
| 2026-11-11 | **W0-2 and W0-3 merged.** Backend skeleton (Spring Boot 3.5.16, V1 schema, ports with fallbacks, security, Redis infrastructure, 20 tests) and frontend skeleton (TypeScript, routes, API client, i18n, MSW, tokens and fonts, 31 tests). Added root `README.md`. Doc updates: `AGENT-EXECUTION-PLAN.md` §1.2 (pnpm 12, Node 22), W0-2 card, §8 record fields and fallback values; `ARCHITECTURE.md` §6.2 (rate-limit and ShedLock keys), §12 (profiles). D-031…D-033, Q9. |
| 2026-11-11 | **W0-1 done.** Added `docs/api/openapi.yaml` (v1.0.0), `docs/api/README.md`, `redocly.yaml`, and the three shared fixture files. Clarified `BR-17`, `BR-18`, `BR-19a`, `BR-20`; added error codes to `ARCHITECTURE.md` §9.2 (D-027…D-030). |
| 2026-11-11 | **Redis seat holds.** Owner confirmed all v1 decisions and chose Redis for holds. Updated `IMPLEMENTATION-PLAN.md` (rewritten), `ARCHITECTURE.md` (§6 rewritten, `sold_seats`, Redis everywhere, ADR 002/003/003a/010), `RULES.md` (BR-07, BR-09–BR-11, BR-19 rounding, ER-09, ER-10, ER-10a, ER-14, ER-16, ER-20, ER-21, ER-24, ER-25), `PRD.md` (confirmed values, FR-BKG-06a, NFRs), `DESIGN.md` (inventory-unavailable state, room-level blocked seats). Added `AGENT-EXECUTION-PLAN.md` and `.cursor/rules/*.mdc`. |
| 2026-11-11 | Created `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`, `PROGRESS.md` from the planning discussion. Tightened the `BR-08` exception (contiguous selection) and corrected orphan test case 7. |
| 2026-11-11 | Created `IMPLEMENTATION-PLAN.md` (detailed v1 plan). |
| 2026-09-26 | `PRD-CinemaBooking.md` (first Vietnamese PRD draft). |
