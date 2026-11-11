# CineBot – Design

| Item | Value |
| --- | --- |
| Status | v1.0 – based on the existing Figma Make prototype (`frontend/src/app/App.tsx`) |
| Last updated | 2026-11-11 |
| Related | `PRD.md` (features), `RULES.md` (behaviour rules), `ARCHITECTURE.md` (frontend structure) |

---

## 1. Design Principles

1. **Cinematic, calm, premium.** A dark canvas, posters as the hero content, gold used sparingly for action and selection.
2. **The booking path is never ambiguous.** One primary action per screen, a visible step indicator, a persistent summary with the total, and a visible hold countdown.
3. **Rules explain themselves.** When something is not allowed (orphan seat, wrong number of seats, sales closed), the UI says *why* and *how to fix it*, next to where the problem is.
4. **Not colour alone.** Every status uses a label, icon or pattern in addition to colour.
5. **Built for reuse.** Booking components work in three contexts: full page (v1), chat widget (planned) and kiosk (planned) (`ER-17`).
6. **Bilingual by design.** Layouts tolerate English strings and Vietnamese strings with diacritics, which are often 20–30% longer.

## 2. Visual Identity (kept from the prototype)

- Very dark background (`#080808`) with warm off-white text (`#f2ede5`).
- **Gold** (`#d4a843`) for primary actions, selected states and highlights. **Red** (`#c13515`) for destructive actions and alerts.
- Condensed, uppercase display headings (Barlow Condensed) paired with a monospace for labels and metadata (DM Mono). This "ticket stub / cinema marquee" feel is the identity of the product.
- Sharp geometry: radius `0.25rem`, 1 px hairline borders (`rgba(255,255,255,0.08)`), no heavy shadows.
- Full-bleed imagery with gradient scrims (hero, movie detail backdrop).
- Product name in the UI: **CineBot** (replaces the prototype's "LUMIÈRE").

## 3. Design Tokens

All colours come from CSS variables in `frontend/src/styles/theme.css`, exposed to Tailwind via `@theme inline` (`ER-19`).

### 3.1 Existing tokens

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `#080808` | Page background |
| `--foreground` | `#f2ede5` | Main text |
| `--card` | `#111014` | Cards, panels, summary bar |
| `--popover` | `#18161c` | Dialogs, popovers, hover cards |
| `--primary` | `#d4a843` | Primary buttons, selected seat, active tab, focus ring |
| `--primary-foreground` | `#080808` | Text on gold |
| `--secondary` | `#1e1c22` | Secondary buttons |
| `--muted` | `#1a1820` | Inputs, sold seats, skeletons |
| `--muted-foreground` | `#7a7582` | Secondary text (**see 3.3**) |
| `--accent` / `--destructive` | `#c13515` | Destructive actions, alert surfaces |
| `--border` | `rgba(255,255,255,0.08)` | Hairlines |
| `--radius` | `0.25rem` | All corners |

### 3.2 Tokens to add

| Token | Value | Use |
| --- | --- | --- |
| `--success` | `#3fae6a` | Confirmed booking, check-in OK (planned) |
| `--warning` | `#e0a030` | Hold countdown under 2 minutes |
| `--danger-text` | `#ef6a4f` | **Error text on dark backgrounds** (see 3.3) |
| `--seat-available` | `transparent` + `--border` outline | Seat available |
| `--seat-selected` | `--primary` | Seat selected by me |
| `--seat-held` | `#2a2730` + diagonal stripes | Held by someone else |
| `--seat-sold` | `--muted` (filled, no number) | Sold |
| `--seat-blocked` | dashed outline, ⊘ icon | Not for sale |
| `--seat-couple-accent` | `#b0457a` outline | Distinguishes couple seats |
| `--age-p` / `--age-k` / `--age-t13` / `--age-t16` / `--age-t18` | `#3fae6a` / `#3d8bd9` / `#e0c030` / `#e07a30` / `#d64040` | Age rating badges (always with the text label) |

### 3.3 Contrast fixes (WCAG AA)

| Pair | Ratio | Problem | Fix |
| --- | --- | --- | --- |
| `#7a7582` on `#080808` | ≈ 4.5 : 1 | Borderline for small text, and fails on `--card` (#111014) | Change `--muted-foreground` to **`#8c8794`** (≈ 5.4 : 1 on card) |
| `#c13515` text on `#080808` | ≈ 3.6 : 1 | Fails for small text (the prototype uses it for error messages) | Use `--danger-text` `#ef6a4f` (≈ 6.5 : 1) for text. Keep `#c13515` for fills and borders. |

## 4. Typography

### 4.1 Font families

| Role | Prototype | Target | Notes |
| --- | --- | --- | --- |
| Display (headings, buttons, prices) | Barlow Condensed 400–900 | **Keep** | Supports Vietnamese |
| Body | DM Sans | **Be Vietnam Pro** (fallback: DM Sans for EN) | As far as we know, DM Sans has no Vietnamese subset on Google Fonts, so diacritics like "ế, ợ, ữ" would fall back to another font. **Verify in Phase 0** with the test string below. |
| Mono (labels, codes, metadata) | DM Mono | **JetBrains Mono** or **Roboto Mono** | Same Vietnamese issue as DM Sans; both replacements support Vietnamese |

Test string: `ĐẶT VÉ · Phim sắp chiếu · Hồ Chí Minh · Ưu đãi hội viên · Thứ Bảy`.

### 4.2 Type classes (replace inline `style={{ fontFamily }}` from the prototype)

| Class | Definition | Use |
| --- | --- | --- |
| `.font-display` | Barlow Condensed, uppercase, `tracking-[0.04em]` | Page and section titles, movie titles |
| `.font-display-action` | Barlow Condensed 700, uppercase, `tracking-[0.08em]` | Buttons, prices, totals |
| `.font-label` | Mono, 11–12 px, `tracking-wider` | Field labels, metadata, badges, booking codes |
| `.font-body` | Body font | Paragraphs, inputs |

### 4.3 Scale

| Token | Size | Use |
| --- | --- | --- |
| Display XL | 64–96 px (`text-6xl`–`text-8xl`) | Hero movie title |
| Display L | 40–48 px | Page titles ("Now showing") |
| Display M | 24–30 px | Section titles, ticket title |
| Body | 14–16 px | Text |
| Label | 11–12 px | Metadata |

**Vietnamese uppercase rule:** stacked diacritics ("PHIM SẮP CHIẾU") get clipped with `leading-none`, which the prototype hero uses. Use a line-height of at least `1.1` for uppercase display text, and test with the test string above.

## 5. Layout, Spacing, Motion

- **Breakpoints:** Tailwind defaults. Design targets: 360 px (phone), 768 px (tablet), 1280 px (desktop), 1536 px (wide).
- **Page gutters:** `px-6` on mobile, `md:px-16` on desktop (from the prototype).
- **Spacing scale:** 4 px base; sections are separated by `py-12`.
- **Poster grid:** 2 columns (mobile) → 3 (tablet) → 6 (desktop), poster aspect ratio `2:3`.
- **Navbar:** fixed, 64 px, translucent with blur. Content starts with `pt-16`.
- **Icons:** `lucide-react` only, 12–18 px, inheriting colour.
- **Motion** (the `motion` library is available): poster hover scale 1.05 over 500 ms; hover-card slide-up 300 ms; step transitions as a fade or slide of at most 200 ms. Respect `prefers-reduced-motion` (disable scale and slide).

## 6. Components

### 6.1 Base library

Use the 48 shadcn/ui components in `components/ui/` (Button, Dialog, Sheet, Tabs, Select, Input, Form, Tooltip, HoverCard, Skeleton, Sonner toasts, Table, Calendar…). Delete the hand-made `Input`/`Select`/`Textarea`/`Field` from the prototype.

### 6.2 Product components

All of these are presentational (props in, callbacks out, `ER-17`) and accept a `density: "comfortable" | "compact"` prop so the chat widget can reuse them later.

| Component | Description | Key states |
| --- | --- | --- |
| `MovieCard` | Poster, title, age badge, duration; desktop hover overlay with genres, duration, country, audio/subtitle language and a CTA | default, hover, coming-soon (release-date badge, no booking CTA), skeleton |
| `AgeBadge` | `P`, `K`, `T13`, `T16`, `T18` with a colour token and a tooltip explaining it | — |
| `DateStrip` | 7 day buttons ("Hôm nay", "T4 12/11" / "Today", "Wed 12 Nov") | selected, disabled (no showtimes) |
| `ShowtimeList` | Start-time chips grouped by room, each with "xx seats left" | available, almost full (< 10%), sold out, sales closed |
| `TicketCounter` | − / qty / + for Adult, Student and Couple, with unit price and a student/age note | min 0, max limited by `BR-05` |
| `SeatMap` | See 6.3 | |
| `SnackPicker` | Snack cards with image, name, price (struck-through + VIP price), quantity stepper | default, VIP discount, inactive |
| `HoldCountdown` | `mm:ss` with an icon | normal, warning (< 2 min), expired |
| `BookingSummaryBar` | Fixed bottom bar: seats, breakdown, total, primary CTA (from the prototype) | disabled with reason, loading |
| `OrderSummary` | Checkout side panel: movie, room, time, seats with ticket types, snacks, VIP discount, total | |
| `Stepper` | Numbered steps with completed, active and upcoming states | guest 3 steps, member 2 steps |
| `TicketCard` | Ticket-stub card (prototype `ConfirmView`) with a QR code instead of the fake barcode | screen, print |
| `VipProgress` | Progress bar of points to VIP, VIP badge and validity date | member, VIP, expiring soon |
| `LanguageSwitcher` | `VI | EN` toggle in the navbar | |
| `EmptyState`, `ErrorState` | Icon, message and action | |

### 6.3 SeatMap specification

```
                ┌─────────────── SCREEN ───────────────┐      (gold gradient arc + label)

           A  [1][2][3][4][5][6][7][8][9][10][11][12]  A
           B  [1][2][3] ...                             B
           ...
           K  [  1  ][  2  ][  3  ][  4  ][  5  ][  6  ]  K   (couple row, double width)

   Legend: [ ] Available   [■] Selected   [▨] Held   [▪] Sold   [⊘] Blocked   [  ] Couple
```

| Property | Value |
| --- | --- |
| Single seat | 28 × 24 px (prototype `w-7 h-6`), gap 6 px, shows the seat number |
| Couple seat | Width = 2 × 28 + 6 = 62 px, same height, with `--seat-couple-accent` outline and a heart/two-person icon |
| Row labels | On both sides, `.font-label` |
| Available | Hairline outline; hover: gold outline + 10% gold fill |
| Selected | Gold fill, dark check mark |
| Held by others | Striped fill, lock icon on hover/focus, not clickable |
| Sold | Muted fill, no number, not clickable |
| Blocked | Dashed outline with ⊘, not clickable |
| Orphan violation | The seats that would be left alone pulse with a `--danger-text` outline. A message appears above the summary bar: "Please don't leave seat A4 empty on its own" / "Vui lòng không để trống ghế A4 đơn lẻ". |
| Count mismatch | Summary bar CTA disabled, with the reason "Select 1 more single seat" / "Chọn thêm 1 ghế đơn" |
| Mobile | The map scales to fit the width up to a minimum seat size of 22 px, then scrolls horizontally. +/− zoom buttons. The selected-seats chip list stays visible in the summary bar. |
| Refresh | Polling updates seats in place without layout shift. If a selected seat becomes taken, it is deselected and a toast explains it. |
| Inventory unavailable | When the seat-map response has `inventoryAvailable=false` (Redis down, `FR-BKG-06a`): held seats cannot be shown, so a banner says "Seat selection is temporarily unavailable, please try again in a moment" / "Tạm thời chưa thể chọn ghế, vui lòng thử lại sau ít phút", and "Continue" stays disabled. Sold seats are still drawn. |
| Blocked seats | Blocked at room level by admin; shown with ⊘ in every showtime of that room |

## 7. Information Architecture

### 7.1 Sitemap

```
Public
├── /                         Home (tabs: Now showing | Coming soon)
├── /movies/:slug             Movie detail + showtimes
├── /booking/:showtimeId      Tickets → Seats → Snacks
├── /checkout/:bookingId      (Info →) Payment → Ticket
│   └── /result               Payment result
├── /pay/mock/:paymentId      Demo Pay
├── /bookings/lookup          Find my booking
├── /membership               Membership program
├── /cinema                   Our cinema
└── /account                  Profile · My bookings · Points & VIP   (members)

Admin  /admin
├── /login
├── /                         Dashboard
├── /movies  /rooms  /showtimes  /templates  /pricing  /snacks  /bookings  /audit-log

Planned
├── Chat widget               (overlay on public pages)
├── /kiosk/*                  Kiosk mode
└── /staff/*                  Staff check-in
```

### 7.2 Navigation

- **Navbar (public):** logo · Now showing · Coming soon · Our cinema · Membership · *(search icon)* · `VI | EN` · Sign in / account menu. The prototype's location button is removed, and the Admin button moves to the footer as "Admin demo".
- **Footer:** cinema address and hotline, Find my booking, Admin demo, demo disclaimer ("Portfolio demo – test payments only").
- **Admin sidebar:** keeps the prototype layout; items listed in §8.4.

## 8. Screen Specifications

### 8.1 Discovery

**Home (`/`)**
- **Hero** (prototype `BrowseView`): backdrop, tag, age badge, duration, title, director, genres, synopsis (2 lines), "Book tickets" and "Watch trailer" (opens a dialog) buttons, and 3 small posters at the bottom right.
- **Tabs** "Now showing / Coming soon" (`?tab=coming-soon`), plus genre chips (from the prototype).
- **Grid** of `MovieCard`.
  - Desktop hover: an overlay slides up with genres, duration, country, audio/subtitle language and the CTA.
  - Coming-soon cards show a "Release: 28/11" badge instead of the booking CTA.
- States: skeleton grid, empty tab ("No movies in this category").

**Movie detail (`/movies/:slug`)**
1. Backdrop header with a back link (from the prototype `ShowtimesView`).
2. Poster plus an info block: title, age badge, genres, duration, country, audio/subtitle language, **director, cast, release date**.
3. **Synopsis**, collapsible after 5 lines on mobile.
4. **Trailer**: 16:9 thumbnail with a play button. Clicking loads the YouTube iframe. If there is no trailer: "Trailer not available".
5. **Showtimes** (now showing only): `DateStrip` + `ShowtimeList` grouped by room. The prototype's format selector is removed. Coming soon shows "No showtimes yet" with the release date.

### 8.2 Booking (`/booking/:showtimeId`)

Header: movie title, age badge, room, date, start time; a stepper "Tickets · Seats · Snacks"; and the `HoldCountdown` once a hold exists.

| Step | Content | Leaving the step |
| --- | --- | --- |
| Tickets | `TicketCounter` ×3 with that day's prices; student note (`BR-27`); age notice for T16/T18 (`BR-28`) | "Choose seats", enabled when at least 1 ticket is chosen |
| Seats | `SeatMap` + legend; live validation (`BR-07`, `BR-08`) | "Continue" creates the hold (`BR-09`). On `409`: toast + refreshed map. On `422 ORPHAN_SEAT`: highlight the seats. On `503 SEAT_SERVICE_UNAVAILABLE`: inventory-unavailable banner. |
| Snacks | `SnackPicker` grid, VIP prices if applicable | "Book" goes to `/checkout/:bookingId`. "Back" releases the hold after a confirmation dialog (`BR-10`). |

The `BookingSummaryBar` is always visible: selected seats, ticket breakdown, snacks, total.

### 8.3 Checkout (`/checkout/:bookingId`)

Two-column layout on desktop (form left, `OrderSummary` + countdown right); on mobile the summary collapses into an accordion at the top.

| Step | Guest | Member |
| --- | --- | --- |
| 1. Customer info | Full name, phone, email (react-hook-form + zod, inline errors) | — (contact card in the summary with an "Edit" link) |
| 2. Payment | Radio cards: **VNPay (sandbox)** with test card details in a collapsible box, **Demo Pay**. Banner: "Test payment – no real money". | Same |
| 3. Ticket | `TicketCard` per booking (QR, code, seats with types, snacks, total), "Print / Save PDF", "Email sent to …", "Book another movie" | Same + "View in My bookings" |

- **Result page** (`/checkout/:id/result`): spinner "Confirming your payment…" while polling; then success (go to step 3), failure ("Payment failed", retry if the hold is still valid), or expired ("Your seats were released", back to the seat map).
- **Hold expired dialog** (any step): non-dismissible, "Choose seats again".

### 8.4 Account, membership, lookup, cinema

- **Account:** tabs Profile · My bookings (upcoming / past cards linking to the ticket) · Points & VIP (`VipProgress`, ledger table with date, booking, points, expiry).
- **Membership:** explains 5% points on tickets, the VIP threshold, 12-month validity and 15% off snacks; CTA "Create account". Replaces the prototype's paid subscription plans.
- **Find my booking:** code + email-or-phone form; result shows the `TicketCard`; rate-limit message on `429`.
- **Our cinema:** cinema photo, address, map link, hotline, opening hours, and room cards (name, capacity, couple seats). Replaces the prototype's 4-cinema page.
- **Auth:** keep the prototype's sign-in modal (Sign in / Create account tabs). Remove "Continue with Google" for v1.

### 8.5 Admin

Desktop-first, keeps the prototype sidebar and header (title + "ADMIN" badge).

| Page | Layout |
| --- | --- |
| Dashboard | 4 KPI cards (bookings today, revenue today, occupancy today, showtimes today), revenue line chart for 7 days (recharts), today's showtimes table |
| Movies | Table (poster, title, status, age, duration, seed lock 🔒) + form in a sheet with `VI | EN` tabs for title and synopsis |
| Rooms | Room list; detail shows a read-only `SeatMap` preview, the generator form, and click-to-block seats |
| Showtimes | Date picker + **timeline with 5 room lanes** (hours on the x axis, showtime blocks sized by duration + cleanup); click empty space to create; overlap error shown inline |
| Templates | Table per room of movie, start time, weekday toggles (T2–CN / Mon–Sun); "Regenerate next 7 days" button with a result summary |
| Pricing | Form + live preview of the price table for each day type (adult, student, couple) |
| Snacks | Card grid + form with VI/EN names |
| Bookings | Search + filter by status; detail drawer with seats, payments, tickets; "Mark refunded" for `NEEDS_ATTENTION` |
| Audit log | Table: time, actor, action, entity, diff viewer |

The admin login shows the demo credentials. Deleting seed data shows the `SEED_PROTECTED` message: "Seed data is protected in the demo and restored nightly."

### 8.6 Global states

| State | Pattern |
| --- | --- |
| Loading | Skeletons matching the final layout (no spinners for page content) |
| Empty | `EmptyState` with an icon and an action |
| Error | Inline `ErrorState` with "Try again"; API error codes translated (`ER-05`) |
| Toasts | Sonner, bottom-right on desktop and top on mobile; used for non-blocking events (seat taken, saved) |
| Offline | Banner "You are offline" |

## 9. Accessibility

- WCAG 2.1 AA contrast with the fixes in §3.3.
- **Seat map keyboard support:** roving tabindex with arrow-key navigation, `Space`/`Enter` to toggle, `aria-pressed` for selected seats. Each seat has an `aria-label` such as "Row A, seat 5, available, adult 55,000 dong". Unavailable seats are `aria-disabled`.
- Statuses are always conveyed by text or icon as well as colour (legend, badges, seat icons).
- `HoldCountdown` announces through `aria-live="polite"` at 2:00 and 0:30 remaining.
- Focus ring: 2 px `--ring` (gold) on every interactive element. Dialogs trap focus and restore it on close.
- Touch targets ≥ 44 px, except seats, which are compensated by zoom on mobile.
- All images have `alt`, and the poster `alt` is the movie title. The trailer iframe has a title.
- `prefers-reduced-motion` disables scale and slide animations.

## 10. Content and Localisation

- **Default language:** Vietnamese. English is a full translation, not a summary.
- **Tone:** friendly and concise, addressing the customer as "bạn" / "you". Error messages say what happened and what to do.
- **Key naming:** `feature.screen.element`, e.g. `booking.seats.orphanError`, `checkout.payment.testBanner`, and `errors.SEAT_UNAVAILABLE` for API codes.
- **Formatting:**

| Item | VI | EN |
| --- | --- | --- |
| Money | `55.000 ₫` | `55.000 ₫` (VND formatting kept) |
| Date (chip) | `T4 12/11` · `Hôm nay` | `Wed 12 Nov` · `Today` |
| Full date | `Thứ Tư, 12/11/2026` | `Wednesday, 12 Nov 2026` |
| Time | `19:30` (24 h) | `19:30` (24 h) |
| Duration | `2 giờ 42 phút` | `2h 42m` |

- **Glossary:** Suất chiếu = Showtime · Ghế đôi = Couple seat · HSSV-U22 = Student (U22) · Bắp nước = Snacks · Giữ ghế = Seat hold · Mã đặt vé = Booking code.
- Missing content translation: show the Vietnamese text with a small "VI" tag. Never show an empty field.

## 11. Planned Interfaces (design constraints set now)

### 11.1 Chat widget (planned)

- **Launcher:** 56 px round gold button at the bottom right, with a chat icon and an unread dot. On booking pages it sits **above** the `BookingSummaryBar` (offset = bar height + 16 px). v1 must keep that corner free of other floating UI.
- **Panel:** 400 × 640 px on desktop (resizable to full height); full-screen sheet on mobile.
- **Messages:** user bubbles on the right (gold outline), assistant on the left (`--card`). Quick-reply chips sit under assistant messages. A typing indicator is shown while the reply streams.
- **Widgets inside messages:** reuse `MovieCard`, `ShowtimeList`, `TicketCounter`, `SnackPicker` and `HoldCountdown` with `density="compact"`. The seat map shows a compact preview with "Open seat map", which opens the full `SeatMap` in a sheet. The final step is a "Continue to payment" card linking to `/checkout/:bookingId`.
- **Footer note:** "Prices and seats come from the booking system. The assistant may misunderstand questions." Language follows the user's messages (`BR-C-07`).
- **Rule-only mode** (budget exhausted): the chat shows menu chips (Movies today, Showtimes, FAQ, My booking) instead of free text.

### 11.2 Kiosk (planned)

- Full-screen, no navbar, no hover states. Designed for **1080 × 1920 portrait** touch screens (it also adapts to landscape).
- Touch targets ≥ 64 px, body text ≥ 24 px, display text ≥ 48 px, same dark theme with higher contrast.
- **Flow:**
  1. Idle: poster slideshow + "Touch to print tickets".
  2. Enter code: on-screen keypad with Crockford characters, or "Scan QR".
  3. Verify: last 4 digits of the phone.
  4. Booking details: STT, booking code, customer name, masked phone, movie, date, time, room, seats.
  5. Print → "Take your tickets" → back to idle.
- A visible 30-second inactivity countdown before reset (`BR-K-07`).
- **Printed ticket** (80 mm thermal, `@page { size: 80mm auto; margin: 0 }`, 72 mm printable width): cinema name, movie title, age rating, date, time, room, seat, ticket type, price, booking code, QR, and "Student – ID required" when applicable. It reuses the `TicketCard` data model with a `variant="thermal"` layout.

### 11.3 Staff check-in (planned)

- Mobile-first, a camera QR scanner occupies the top half.
- **Result card:** green ✓ "Valid – Row F seat 7 – Adult", or red ✕ with the reason ("Already checked in at 19:02", "Wrong showtime", "Not paid"). Large text, sound and vibration.
- "Check student ID" banner for student tickets (`BR-K-06`).
- Recent scans list, and a manual code entry fallback.

## 12. Prototype → Target Mapping

| Prototype (`App.tsx`) | Target |
| --- | --- |
| `Nav` | `components/layout/Nav` + `LanguageSwitcher`; location button removed |
| `BrowseView` | `HomePage` (hero + tabs + `MovieCard` grid) |
| `ComingSoonView` (list) | "Coming soon" tab in `HomePage` |
| `ShowtimesView` | `MovieDetailPage` (info, synopsis, trailer, showtimes); format selector removed |
| `SeatsView` | `BookingPage` (Tickets → Seats → Snacks), `SeatMap`, `BookingSummaryBar` |
| `ConfirmView` | `TicketCard` in checkout step 3; QR replaces the fake barcode; booking fee removed |
| `CinemasView` | `CinemaPage` (one cinema, 5 rooms) |
| `MembershipsView` | `MembershipPage` (points and VIP) |
| `SignInModal` | `features/auth/AuthModal` (wired to the API; Google button removed) |
| `AdminLoginPage`, `AdminPanel` | `/admin/login`, `AdminLayout` |
| `AdminMovies` / `AdminShows` / `AdminTheatres` / `AdminLocation` | Movies / Showtimes + Templates / Rooms / removed |
| £ prices, UK ratings, London data | VND, P/K/T13/T16/T18, Vietnamese cinema data |
