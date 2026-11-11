import type { Schemas } from "./types";

export const ERROR_CODES = [
  "VALIDATION_FAILED",
  "UNAUTHENTICATED",
  "INVALID_CREDENTIALS",
  "TOKEN_REUSED",
  "FORBIDDEN",
  "BOOKING_TOKEN_INVALID",
  "NOT_FOUND",
  "EMAIL_TAKEN",
  "SEAT_UNAVAILABLE",
  "SHOWTIME_OVERLAP",
  "INVALID_STATE",
  "RESOURCE_IN_USE",
  "HOLD_EXPIRED",
  "ORPHAN_SEAT",
  "TICKET_COUNT_MISMATCH",
  "BOOKING_TOO_LARGE",
  "SALES_CLOSED",
  "NOT_BOOKABLE",
  "CUSTOMER_INFO_REQUIRED",
  "SEED_PROTECTED",
  "RATE_LIMITED",
  "SEAT_SERVICE_UNAVAILABLE",
  "INTERNAL_ERROR",
] as const satisfies readonly Schemas["ErrorCode"][];

type ListedErrorCode = (typeof ERROR_CODES)[number];
type MissingErrorCode = Exclude<Schemas["ErrorCode"], ListedErrorCode>;
type AssertNever<T extends never> = T;

export type ErrorCodesMatchContract = AssertNever<MissingErrorCode>;
