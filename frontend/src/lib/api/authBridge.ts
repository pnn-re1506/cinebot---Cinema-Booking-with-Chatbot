export type AccessTokenProvider = () => string | null;

export type RefreshHandler = () => Promise<string | null>;

export type BookingTokenProvider = (url: string) => string | null;

let accessTokenProvider: AccessTokenProvider = () => null;
let refreshHandler: RefreshHandler | null = null;
let bookingTokenProvider: BookingTokenProvider = () => null;

export function setAccessTokenProvider(provider: AccessTokenProvider): void {
  accessTokenProvider = provider;
}

export function setRefreshHandler(handler: RefreshHandler | null): void {
  refreshHandler = handler;
}

export function setBookingTokenProvider(provider: BookingTokenProvider): void {
  bookingTokenProvider = provider;
}

export function getAccessToken(): string | null {
  return accessTokenProvider();
}

export function getRefreshHandler(): RefreshHandler | null {
  return refreshHandler;
}

export function getBookingToken(url: string): string | null {
  return bookingTokenProvider(url);
}
