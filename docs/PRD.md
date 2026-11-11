# CineBot – Product Requirements Document

| Item | Value |
| --- | --- |
| Product | CineBot – cinema ticket booking website with (later) a chatbot and a check-in kiosk |
| Document status | v1.1 – active (all v1 decisions confirmed) |
| Last updated | 2026-11-11 |
| Owner | Project owner (portfolio project) |
| Release in scope | **v1 = Web booking + Admin**. Chatbot and Kiosk are planned modules (section 9). |

## Documentation map

| Document | Answers |
| --- | --- |
| `PRD.md` (this file) | What are we building, for whom, and what is in or out of scope? |
| `RULES.md` | Exact business rules (`BR-xx`) and engineering rules (`ER-xx`). **The single source of truth for rules.** |
| `ARCHITECTURE.md` | How the system is built: modules, data model, APIs, concurrency, security, extension points |
| `DESIGN.md` | How the product looks and behaves: design system, screens, components, states |
| `PROGRESS.md` | What is done, what is next, decision log, open questions |
| `IMPLEMENTATION-PLAN.md` | Build plan: confirmed decisions, Redis seat-hold design summary, milestones |
| `AGENT-EXECUTION-PLAN.md` | How the build is split into parallel AI-agent tasks (waves, ownership, gates) |
| `api/openapi.yaml` *(created in Phase 0)* | The API contract |

If the build or agent plans disagree with PRD / RULES / ARCHITECTURE / DESIGN, the latter win.

---

## 1. Product Summary

CineBot is a booking website for **one cinema with five rooms**. Visitors browse movies that are now showing or coming soon, pick a showtime, choose ticket types and seats on a live seat map, add snacks and pay online, either as a guest or as a logged-in member. Members earn points and can reach VIP status, which gives a snack discount. An admin website manages movies, rooms, showtimes, prices, snacks and bookings.

The project is also a **public portfolio demo**. Recruiters must be able to open it at any time and complete a booking with test payment. The catalogue therefore stays fixed while showtimes roll forward automatically, and admin features work without breaking the demo.

Two modules are designed for but **not built in v1**:
- **Chatbot:** movie advice, FAQ and booking inside a chat window.
- **Kiosk + staff check-in:** look up a booking, print tickets, and scan tickets at the door.

v1 must not block them. Section 9 lists their requirements, and `ARCHITECTURE.md` §10 describes the extension points.

## 2. Goals and Non-Goals

### 2.1 Goals (v1)

1. A complete booking journey (movie → showtime → tickets → seats → snacks → checkout → ticket) for guests and members.
2. **Zero double-sold seats**, including under concurrent requests.
3. Correct prices according to the day-of-week pricing rules, always computed on the server.
4. Membership points and a VIP tier that work end to end.
5. A working admin site whose changes cannot destroy the public demo.
6. Full Vietnamese / English support.
7. The demo works unattended for weeks: there are always bookable showtimes in the next 7 days.

### 2.2 Non-goals (v1)

- Chatbot, kiosk, staff check-in (planned, section 9).
- Multiple cinemas in the UI (the data model supports it).
- Customer-initiated cancellation, refund or exchange.
- Real money: payments use VNPay **sandbox** or the internal Demo Pay.
- Vouchers, promo codes, spending points as money, birthday offers.
- Native mobile apps.
- Holiday pricing.

### 2.3 Success metrics

| Metric | Target |
| --- | --- |
| Double-sold seats | 0 (enforced by tests and DB constraints) |
| Days in a row the demo has bookable showtimes | 100% of days after launch |
| Guest booking time with Demo Pay (manual test) | Under 2 minutes |
| p95 latency of business APIs (excluding payment gateway) | Under 500 ms on demo hosting |
| Duplicate payment notifications causing duplicate tickets or points | 0 |

## 3. Users and Roles

| Role | v1? | Description |
| --- | --- | --- |
| Guest | Yes | Browses, books and pays without an account; finds the booking later with code + email/phone. |
| Member (`CUSTOMER`) | Yes | Everything a guest can do, plus saved profile, booking history, points and VIP status. |
| Admin (`ADMIN`) | Yes | Manages catalogue, rooms, showtimes, templates, pricing, snacks and bookings. |
| Staff (`STAFF`) | Planned | Scans tickets at the door (check-in module). |
| Kiosk device (`KIOSK`) | Planned | Public self-service terminal for booking lookup and ticket printing. |

## 4. Scope Overview

| Area | v1 | Planned |
| --- | --- | --- |
| Movie catalogue (now showing / coming soon, detail, trailer) | ✅ | |
| Showtimes by date and room | ✅ | |
| Ticket types, seat map, orphan-seat rule, seat hold | ✅ | |
| Snacks and combos | ✅ | |
| Checkout (guest 3 steps, member 2 steps), test payment, e-ticket with QR, email | ✅ | |
| Accounts with JWT refresh rotation | ✅ | |
| Points and VIP | ✅ | |
| Admin website | ✅ | |
| VI / EN | ✅ | |
| Rolling showtimes and nightly demo reset | ✅ | |
| FAQ page (admin-managed) | Stretch | Feeds the chatbot |
| "Suggest best seats" button | Stretch | Required for the chatbot |
| Live seat updates via Server-Sent Events | Stretch (v1 uses polling) | Required for the chatbot |
| Chatbot | | ✅ |
| Kiosk lookup and printing | | ✅ |
| Staff check-in | | ✅ |

## 5. User Journeys (v1)

### 5.1 Guest books a ticket

1. Opens the home page and switches to **Coming soon** or stays on **Now showing**. Hovering a poster shows genres, duration, country and language/subtitles.
2. Clicks a poster and opens the movie detail page: info, director, cast, release date, synopsis, trailer, showtimes.
3. Picks a date (7-day strip) and a start time (grouped by room).
4. **Tickets step:** sets quantities for Adult, Student (HSSV-U22) and Couple seat, seeing the prices for that day.
5. **Seats step:** selects seats on the seat map. The orphan-seat rule is checked live. Clicking "Continue" **holds the seats for 10 minutes** (`BR-09`).
6. **Snacks step:** optionally adds snacks and combos, then clicks **Book**.
7. **Checkout step 1 – Customer info:** full name, phone, email.
8. **Checkout step 2 – Payment:** VNPay sandbox or Demo Pay.
9. **Checkout step 3 – Ticket:** booking code, QR code, seats, snacks, total. A confirmation email is sent.

### 5.2 Member books a ticket

Same as 5.1, except checkout skips step 1. Contact details come from the profile and stay editable in the order summary. VIP members automatically get the snack discount. Points are credited when payment is confirmed.

### 5.3 Guest finds a booking later

Opens **Find my booking**, enters the booking code + email or phone, and sees the ticket.

### 5.4 Admin publishes next week's schedule

Adds a movie (VI/EN content), adds showtime templates (movie, room, time, days), and clicks **Regenerate next 7 days**. The system creates the showtimes and rejects any that overlap in the same room.

## 6. Functional Requirements (v1)

The rules referenced as `BR-xx` are defined in `RULES.md`.

### 6.1 Catalogue – `FR-CAT`

| ID | Requirement |
| --- | --- |
| FR-CAT-01 | The home page shows a hero movie and tabs **Now showing / Coming soon**, with genre filter chips. |
| FR-CAT-02 | On desktop, hovering a poster shows genres, duration, country, audio/subtitle language and age rating. On touch devices the same info is reachable without hover. |
| FR-CAT-03 | The movie detail page shows the poster/backdrop, title, the hover info, **director, cast, release date**, then **synopsis**, then **trailer** (YouTube, loaded on click), then showtimes. |
| FR-CAT-04 | Coming-soon movies show their release date and "No showtimes yet", and cannot be booked (`BR-23`). |
| FR-CAT-05 | Age ratings use Vietnamese labels P, K, T13, T16, T18. Booking a T16/T18 movie shows an age notice (`BR-28`). |
| FR-CAT-06 | A "Our cinema" page shows the cinema address, contact and its 5 rooms. |

### 6.2 Showtimes – `FR-SHOW`

| ID | Requirement |
| --- | --- |
| FR-SHOW-01 | The detail page shows a 7-day date strip. For the chosen date it lists start times grouped by room, with seats left. |
| FR-SHOW-02 | Only showtimes that have not started yet are bookable (`BR-24`). |
| FR-SHOW-03 | Each showtime has its own seat inventory: seat A5 at 18:00 and seat A5 at 21:00 are independent (`BR-07`). |

### 6.3 Booking – `FR-BKG`

| ID | Requirement |
| --- | --- |
| FR-BKG-01 | The customer chooses quantities of Adult, Student and Couple seat, with prices for that showtime (`BR-01`…`BR-03`). Max 8 seat units (`BR-05`). |
| FR-BKG-02 | The seat map shows single rows and a couple row at the back, with statuses available / selected / held / sold / blocked, labelled rather than shown by colour only. |
| FR-BKG-03 | The orphan-seat rule (`BR-08`) is checked live in the browser and again on the server. |
| FR-BKG-04 | "Continue" is enabled only when the selected seats match the ticket quantities and the rule passes. Clicking it creates a **hold** (`BR-09`, `BR-10`). |
| FR-BKG-05 | A countdown shows the remaining hold time from the snacks step to the end of payment. When the hold expires, the customer is sent back to the seat map (`BR-11`). |
| FR-BKG-06 | If a seat was taken meanwhile, the customer sees a clear message and the refreshed seat map. |
| FR-BKG-06a | If seat holding is temporarily unavailable, the seat map still shows sold seats, explains the problem, and disables "Continue". |
| FR-BKG-07 | The customer can add snacks/combos with quantities. VIP members see discounted prices (`BR-19`). |
| FR-BKG-08 | Going back from snacks to seats releases the hold. |

### 6.4 Checkout and payment – `FR-PAY`

| ID | Requirement |
| --- | --- |
| FR-PAY-01 | Guests go through **Customer info → Payment → Ticket**. Members go through **Payment → Ticket** (`BR-20`). |
| FR-PAY-02 | Customer info validates full name, a Vietnamese phone number, and email. |
| FR-PAY-03 | Payment offers **VNPay sandbox** and **Demo Pay**. A banner says "Test payment – no real money". |
| FR-PAY-04 | A booking is confirmed only after a verified server-side payment notification (`BR-13`). The return page waits for that confirmation. |
| FR-PAY-05 | The ticket page shows the booking code, QR code, movie, room, date/time, seats with ticket types, snacks and total, with a print/save-as-PDF option. |
| FR-PAY-06 | A confirmation email is sent in the booking's language. If email sending fails, the booking stays valid. |
| FR-PAY-07 | Guests can look up a booking with code + email or phone (`BR-21`). |
| FR-PAY-08 | Customers cannot cancel a paid booking (`BR-15`). |

### 6.5 Accounts – `FR-ACC`

| ID | Requirement |
| --- | --- |
| FR-ACC-01 | Register, log in and log out. The session survives page reloads (silent refresh). |
| FR-ACC-02 | Profile: full name, phone, email (read-only), preferred language. |
| FR-ACC-03 | My bookings: upcoming and past bookings, each opening its ticket. |

### 6.6 Membership – `FR-MEM`

| ID | Requirement |
| --- | --- |
| FR-MEM-01 | Members earn points on paid bookings (`BR-16`). Points expire after 12 months (`BR-17`). |
| FR-MEM-02 | Members reach VIP at the threshold, and VIP lasts 12 months (`BR-18`). |
| FR-MEM-03 | The account page shows points in the last 12 months, progress to VIP, VIP validity, and the points history. |
| FR-MEM-04 | A Membership page explains the program in VI/EN. |

### 6.7 Admin – `FR-ADM`

| ID | Requirement |
| --- | --- |
| FR-ADM-01 | Admin login with role `ADMIN`. Demo credentials are shown on the admin login page. |
| FR-ADM-02 | Dashboard: today's showtimes, bookings today, revenue for the last 7 days, occupancy. |
| FR-ADM-03 | Movies: create, edit and delete; VI/EN title and synopsis; status (Now showing / Coming soon / Ended); poster, backdrop, trailer; genres, credits, country, languages, age rating, duration, release date. |
| FR-ADM-04 | Rooms: view the layout, regenerate it with a generator form, block or unblock seats. A layout cannot change while the room has future holds or sales. |
| FR-ADM-05 | Showtimes: a day view with one lane per room; create a manual showtime (overlap rejected, `BR-22`); cancel a showtime. |
| FR-ADM-06 | Showtime templates: weekly patterns, plus "Regenerate next 7 days" (`BR-25`). |
| FR-ADM-07 | Pricing: discount day, three adult prices, student price, couple surcharge, VIP snack %, points rate, VIP threshold. Changes apply to new bookings only (`BR-04`). |
| FR-ADM-08 | Snacks: create, edit, delete, activate/deactivate; VI/EN names. |
| FR-ADM-09 | Bookings: search by code, phone, email or date; view seats, payments and tickets; mark `NEEDS_ATTENTION` bookings as refunded (`BR-14`, `BR-15`). |
| FR-ADM-10 | All admin write actions are recorded in an audit log. |
| FR-ADM-11 | Seed data cannot be deleted (but can be edited) and is restored nightly (`BR-26`). |

### 6.8 Internationalisation – `FR-I18N`

| ID | Requirement |
| --- | --- |
| FR-I18N-01 | Every screen, message, error and email exists in Vietnamese (default) and English. |
| FR-I18N-02 | Movie, genre and snack content is stored in both languages. Missing translations fall back to Vietnamese. |
| FR-I18N-03 | Switching language never loses the current booking. |
| FR-I18N-04 | Prices are always shown in VND with Vietnamese formatting (e.g. `55.000 ₫`). |

### 6.9 Demo stability – `FR-DEMO`

| ID | Requirement |
| --- | --- |
| FR-DEMO-01 | Showtimes always exist for today through the next 6 days (`BR-25`). |
| FR-DEMO-02 | Coming-soon release dates always lie in the future. |
| FR-DEMO-03 | A nightly reset restores seed content and purges old demo bookings (`BR-26`). |
| FR-DEMO-04 | Demo accounts (VIP member, almost-VIP member, admin) always exist. |
| FR-DEMO-05 | Newly generated showtimes show realistic occupancy (some seats already sold). |

## 7. Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| Correctness | Seat holds (Redis, atomic) and payment confirmation (PostgreSQL, idempotent) can never double-sell a seat, including when Redis is unavailable or loses data (`ARCHITECTURE.md` §6). |
| Availability | If the seat-hold service is down, browsing still works and the UI explains that seat selection is temporarily unavailable. |
| Security | Server-side pricing, hashed passwords, rotating refresh tokens, rate limits on login/lookup/hold, no card data stored, secrets in environment variables. |
| Privacy | Collect only name, phone and email. Mask phone numbers on any shared or public screen. |
| Accessibility | Keyboard-operable seat map, labelled statuses, WCAG AA contrast (`DESIGN.md` §9). |
| Responsiveness | Works from 360 px phones to desktop. Admin is desktop-first but usable on tablets. |
| Time | All times are stored in UTC (`timestamptz`) and shown in `Asia/Ho_Chi_Minh`. |
| Observability | Health endpoint, structured logs, logged payment notifications, failed-email tracking. |

## 8. Acceptance Criteria (v1 release)

1. Two concurrent requests for the same seat: exactly one succeeds and the other gets a "seat unavailable" error.
2. Two concurrent requests for A3 and A5 in an otherwise empty row: they cannot both succeed, because together they would leave A4 empty on its own.
3. Prices for a Tuesday, a Wednesday and a Saturday showtime match the table in `BR-02`/`BR-03`.
4. A guest completes 3 checkout steps; a member completes 2. Both receive tickets with QR codes and emails.
5. A duplicate payment notification creates no extra tickets or points.
6. A payment attempted after the hold expired is rejected, and a late success follows `BR-14`.
7. A member crossing the VIP threshold sees VIP status and discounted snacks on the next booking.
8. Admin can add a movie and a template, regenerate showtimes, and see overlaps rejected.
9. After the server date moves forward 3 days, the demo still has bookable showtimes for 7 days.
10. Switching VI ↔ EN in the middle of a booking keeps the booking state.

## 9. Planned Modules (not in v1)

These requirements are recorded now so the v1 design supports them. Their rules are drafted in `RULES.md` §3, and their extension points in `ARCHITECTURE.md` §10.

### 9.1 Chatbot – `FR-CHAT` (planned)

| ID | Requirement |
| --- | --- |
| FR-CHAT-01 | A chat widget on all public pages, in VI/EN, answering in the user's language. |
| FR-CHAT-02 | Recommends now-showing and coming-soon movies by genre, date, time of day and age rating. |
| FR-CHAT-03 | Answers movie questions (synopsis, cast, director, duration, age rating, trailer) **from catalogue data only**. |
| FR-CHAT-04 | Compares showtimes across rooms and times (one cinema), including seats left and price per day type. |
| FR-CHAT-05 | Books inside the chat with interactive widgets (movie cards, showtime chips, ticket counters, seat map, snack picker) using **the same booking API** as the website, then hands off to `/checkout/:bookingId` for payment. |
| FR-CHAT-06 | Checks seat availability in real time and suggests the best available seats, respecting `BR-08`. |
| FR-CHAT-07 | Answers FAQ (booking, payment, student ID, tickets, policies) from admin-managed FAQ content. |
| FR-CHAT-08 | Uses a tiered engine: rules/buttons → cache → FAQ retrieval with a small model → LLM with tool calling. It degrades to rule-only mode when the daily LLM budget is used up. |
| FR-CHAT-09 | Rate limits per session/IP/user, a daily budget cap, and usage logging per intent. |

### 9.2 Kiosk – `FR-KIOSK` (planned)

| ID | Requirement |
| --- | --- |
| FR-KIOSK-01 | A full-screen kiosk mode (`/kiosk`) on a registered device. |
| FR-KIOSK-02 | The customer enters a booking code (or scans the QR) plus a verification factor (last 4 digits of phone). |
| FR-KIOSK-03 | Shows: number (STT – meaning to be confirmed), booking code, customer name, **masked** phone, movie, date, time, room, seats. |
| FR-KIOSK-04 | Prints one ticket per seat (80 mm thermal layout via browser print), and allows reprints, which are logged. |
| FR-KIOSK-05 | Resets to the idle screen after 30 s of inactivity. |
| FR-KIOSK-06 | Only `CONFIRMED` bookings within the printing window are printable. |

### 9.3 Staff check-in – `FR-CHECKIN` (planned)

| ID | Requirement |
| --- | --- |
| FR-CHECKIN-01 | Staff log in (`STAFF` role) and scan the ticket QR or type the code. |
| FR-CHECKIN-02 | The system validates: paid, correct showtime, within the check-in window, not voided, not already checked in. |
| FR-CHECKIN-03 | Re-scanning a used ticket shows "Already checked in at hh:mm" and is rejected. |
| FR-CHECKIN-04 | Student tickets show "Check student ID" to staff. |
| FR-CHECKIN-05 | Printing never implies check-in. |

## 10. Assumptions and Open Questions

See `PROGRESS.md` → *Decision log* and *Open questions* for the live list.

All v1 business values were **confirmed on 2026-11-11**:
- student price 45,000;
- hold of 10 minutes (Redis);
- orphan-rule exception;
- VIP at 50,000 points with 15% off snacks;
- couple seat = 1 ticket admitting 2;
- VNPay sandbox + Demo Pay.

Still open: what "STT" on the kiosk means (print sequence, ticket index, or queue number).

## 11. Glossary

| Term | Meaning |
| --- | --- |
| Showtime | One movie in one room at one start time. |
| Seat unit | One single seat or one couple seat. |
| Hold | Temporary reservation of seats for one booking, with an expiry time. |
| Orphan seat | A single empty seat left alone between unavailable seats or a row edge (`BR-08`). |
| Day type | Discount day / Weekday / Weekend, which determines the adult price. |
| Rolling window | The always-moving range "today + 6 days" for which showtimes exist. |
| Seed data | Curated demo content flagged `is_seed`, restored every night. |
| IPN | Instant Payment Notification: VNPay's server-to-server payment result. |
