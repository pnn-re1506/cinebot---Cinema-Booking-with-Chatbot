import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import i18n from "../i18n";
import { setAccessTokenProvider, setBookingTokenProvider, setRefreshHandler } from "../lib/api/authBridge";
import { server } from "../mocks/server";
import "@testing-library/jest-dom/vitest";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  setAccessTokenProvider(() => null);
  setBookingTokenProvider(() => null);
  setRefreshHandler(null);
  localStorage.clear();
  await i18n.changeLanguage("vi");
});

afterAll(() => {
  server.close();
});
