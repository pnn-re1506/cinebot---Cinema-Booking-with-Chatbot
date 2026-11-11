import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { CLIENT_ID_STORAGE_KEY, getClientId } from "@/lib/clientId";
import { server } from "@/mocks/server";
import { setAccessTokenProvider, setBookingTokenProvider, setRefreshHandler } from "./authBridge";
import { api } from "./client";

interface Captured {
  url: string;
  acceptLanguage: string | null;
  clientId: string | null;
  requestedWith: string | null;
  authorization: string | null;
  bookingToken: string | null;
}

function capture(method: "get" | "post", path: string): { requests: Captured[] } {
  const requests: Captured[] = [];
  const handler = ({ request }: { request: Request }) => {
    requests.push({
      url: new URL(request.url).pathname,
      acceptLanguage: request.headers.get("accept-language"),
      clientId: request.headers.get("x-client-id"),
      requestedWith: request.headers.get("x-requested-with"),
      authorization: request.headers.get("authorization"),
      bookingToken: request.headers.get("x-booking-token"),
    });
    return HttpResponse.json({ ok: true });
  };
  server.use(method === "get" ? http.get(path, handler) : http.post(path, handler));
  return { requests };
}

describe("api client", () => {
  it("adds the common headers, the access token, and the booking token only on booking URLs", async () => {
    await i18n.changeLanguage("en");
    setAccessTokenProvider(() => "access-token");
    setBookingTokenProvider(() => "booking-token");

    const movies = capture("get", "/api/movies");
    const create = capture("post", "/api/bookings");
    const lookup = capture("post", "/api/bookings/lookup");
    const booking = capture("get", "/api/bookings/:bookingId");
    const payment = capture("post", "/api/payments/mock/:paymentId");

    await api.get("/movies");
    await api.post("/bookings", {});
    await api.post("/bookings/lookup", {});
    await api.get("/bookings/11111111-1111-4111-8111-111111111111");
    await api.post("/payments/mock/7", {});

    const all = [
      ...movies.requests,
      ...create.requests,
      ...lookup.requests,
      ...booking.requests,
      ...payment.requests,
    ];
    expect(all).toHaveLength(5);
    const clientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    expect(clientId).toBeTruthy();

    for (const request of all) {
      expect(request.acceptLanguage).toBe("en");
      expect(request.clientId).toBe(clientId);
      expect(request.requestedWith).toBe("XMLHttpRequest");
      expect(request.authorization).toBe("Bearer access-token");
    }

    expect(movies.requests[0]?.bookingToken).toBeNull();
    expect(create.requests[0]?.bookingToken).toBeNull();
    expect(lookup.requests[0]?.bookingToken).toBeNull();
    expect(booking.requests[0]?.bookingToken).toBe("booking-token");
    expect(payment.requests[0]?.bookingToken).toBe("booking-token");
  });

  it("omits Authorization when no access token is available", async () => {
    const movies = capture("get", "/api/movies");
    await api.get("/movies");
    expect(movies.requests[0]?.authorization).toBeNull();
  });

  it("sends cookies on auth requests only", async () => {
    server.use(
      http.post("/api/auth/login", () => HttpResponse.json({ ok: true })),
      http.get("/api/movies", () => HttpResponse.json({ ok: true })),
    );

    const auth = await api.post("/auth/login", {});
    const movies = await api.get("/movies");

    expect(auth.config.withCredentials).toBe(true);
    expect(movies.config.withCredentials).not.toBe(true);
  });

  it("runs one refresh for concurrent 401 responses and retries each request once", async () => {
    let refreshes = 0;
    let release: (token: string) => void = () => undefined;
    const gate = new Promise<string>((resolve) => {
      release = resolve;
    });
    setRefreshHandler(() => {
      refreshes += 1;
      return gate;
    });

    let hits = 0;
    server.use(
      http.get("*/api/secure", ({ request }) => {
        hits += 1;
        if (request.headers.get("authorization") === "Bearer fresh") {
          return HttpResponse.json({ ok: true });
        }
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const pending = Promise.all([api.get("/secure"), api.get("/secure")]);
    await vi.waitFor(() => {
      expect(refreshes).toBe(1);
    });
    setAccessTokenProvider(() => "fresh");
    release("fresh");

    const [first, second] = await pending;
    expect(first.data).toEqual({ ok: true });
    expect(second.data).toEqual({ ok: true });
    expect(refreshes).toBe(1);
    expect(hits).toBe(4);
  });

  it("does not refresh when an auth endpoint returns 401", async () => {
    let refreshes = 0;
    setRefreshHandler(() => {
      refreshes += 1;
      return Promise.resolve("fresh");
    });
    server.use(http.post("*/api/auth/login", () => new HttpResponse(null, { status: 401 })));

    await expect(api.post("/auth/login", {})).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(refreshes).toBe(0);
  });
});

describe("client id", () => {
  it("persists one id in localStorage", () => {
    const first = getClientId();
    const second = getClientId();
    expect(second).toBe(first);
    expect(localStorage.getItem(CLIENT_ID_STORAGE_KEY)).toBe(first);
  });
});
