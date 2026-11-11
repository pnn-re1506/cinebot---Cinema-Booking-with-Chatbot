import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import i18n from "@/i18n";
import { getClientId } from "@/lib/clientId";
import { getAccessToken, getBookingToken, getRefreshHandler } from "./authBridge";

const AUTH_PATH = /\/auth(\/|$)/;
const BOOKING_PATH = /\/bookings\/([^/?]+)/;
const MOCK_PAYMENT_PATH = /\/payments\/mock\/[^/?]+/;

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshInFlight: Promise<string | null> | null = null;

function requestPath(config: Pick<InternalAxiosRequestConfig, "baseURL" | "url">): string {
  const url = config.url ?? "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return new URL(url).pathname;
  }
  const base = config.baseURL ?? "";
  if (base.startsWith("http://") || base.startsWith("https://")) {
    return new URL(url, base.endsWith("/") ? base : `${base}/`).pathname;
  }
  const joined = `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  const path = joined.split("?")[0] ?? joined;
  return path.startsWith("/") ? path : `/${path}`;
}

function isAuthPath(path: string): boolean {
  return AUTH_PATH.test(path);
}

function isBookingScopedPath(path: string): boolean {
  if (MOCK_PAYMENT_PATH.test(path)) {
    return true;
  }
  const id = BOOKING_PATH.exec(path)?.[1];
  return id !== undefined && id !== "lookup";
}

function currentLanguage(): "vi" | "en" {
  const lang = (i18n.resolvedLanguage ?? i18n.language ?? "vi").toLowerCase();
  return lang.startsWith("en") ? "en" : "vi";
}

function refreshOnce(): Promise<string | null> {
  const handler = getRefreshHandler();
  if (!handler) {
    return Promise.resolve(null);
  }
  if (!refreshInFlight) {
    refreshInFlight = Promise.resolve()
      .then(() => handler())
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const path = requestPath(config);
  config.headers.set("Accept-Language", currentLanguage());
  config.headers.set("X-Client-Id", getClientId());
  config.headers.set("X-Requested-With", "XMLHttpRequest");

  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (isBookingScopedPath(path)) {
    const bookingToken = getBookingToken(path);
    if (bookingToken) {
      config.headers.set("X-Booking-Token", bookingToken);
    }
  }

  if (isAuthPath(path)) {
    config.withCredentials = true;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (!config || error.response?.status !== 401 || config._retry) {
      return Promise.reject(error);
    }
    if (isAuthPath(requestPath(config)) || !getRefreshHandler()) {
      return Promise.reject(error);
    }

    config._retry = true;
    const token = await refreshOnce();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return api.request(config);
  },
);
