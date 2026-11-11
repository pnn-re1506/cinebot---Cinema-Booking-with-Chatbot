# CineBot API Contract

`openapi.yaml` is the single API contract (`RULES.md` ER-24). It is **integrator-owned**: agents implement or consume it and report proposed changes as *Contract issue* (`AGENT-EXECUTION-PLAN.md` §4).

| Version | Date | Notes |
| --- | --- | --- |
| 1.0.0 | 2026-11-11 | First frozen contract (Wave 0, task W0-1) |

## Conventions

| Topic | Rule |
| --- | --- |
| Money | Integer VND (`int64`). Never decimals. |
| Time | Instants are ISO-8601 with offset; the backend serialises in `+07:00`. Dates (`YYYY-MM-DD`) are cinema-local. |
| Ids | Bookings use UUIDs. Everything else uses `int64`. |
| Language | `Accept-Language: vi\|en` (default `vi`) selects translated content. Error messages are never sent; clients translate `code`. |
| Errors | `application/problem+json` with `code` (`ErrorCode` enum). Validation errors list `fieldErrors[{field, code}]`. Seat errors list `seatIds`. |
| Pagination | `page` (0-based), `size` (1–100, default 20). Responses include `page`, `size`, `totalItems`, `totalPages`, `items`. |
| Booking access | `X-Booking-Token` (returned once by `createBooking`), or a bearer token of the booking owner or an admin. |
| Guest hold owner | `X-Client-Id` (a UUID persisted in `localStorage`) is required on `createBooking`. |
| Auth endpoints | Require `X-Requested-With: XMLHttpRequest`. The refresh token lives in the `cb_refresh` cookie (`Path=/api/auth`). |

## Tooling

```powershell
# Lint (uses redocly.yaml at the repo root)
npx @redocly/cli lint

# Frontend types (run in frontend/, script `gen:api`)
npx openapi-typescript ../docs/api/openapi.yaml -o src/lib/api/schema.d.ts
```

## Shared fixtures

`shared/fixtures/*.json` turn the business rules into test tables. Both the Java and the TypeScript tests use them (ER-20):

| File | Rules |
| --- | --- |
| `orphan-rule-cases.json` | BR-08 (30 cases, including the 11 reference cases) |
| `pricing-cases.json` | BR-02, BR-03, BR-06, BR-16 (amount), BR-19 (rounding) |
| `membership-cases.json` | BR-16, BR-17, BR-18 (earning, expiry, reversal, VIP grant / renew / lapse) |
