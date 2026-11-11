import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enAccount from "./locales/en/account.json";
import enAdminContent from "./locales/en/admin-content.json";
import enAdminOps from "./locales/en/admin-ops.json";
import enAuth from "./locales/en/auth.json";
import enBooking from "./locales/en/booking.json";
import enCatalog from "./locales/en/catalog.json";
import enCheckout from "./locales/en/checkout.json";
import enCommon from "./locales/en/common.json";
import enErrors from "./locales/en/errors.json";
import viAccount from "./locales/vi/account.json";
import viAdminContent from "./locales/vi/admin-content.json";
import viAdminOps from "./locales/vi/admin-ops.json";
import viAuth from "./locales/vi/auth.json";
import viBooking from "./locales/vi/booking.json";
import viCatalog from "./locales/vi/catalog.json";
import viCheckout from "./locales/vi/checkout.json";
import viCommon from "./locales/vi/common.json";
import viErrors from "./locales/vi/errors.json";

export const LANGUAGE_STORAGE_KEY = "cb_lang";

export const NAMESPACES = [
  "common",
  "errors",
  "catalog",
  "auth",
  "booking",
  "checkout",
  "account",
  "admin-content",
  "admin-ops",
] as const;

export type AppLanguage = "vi" | "en";

export function readStoredLanguage(): AppLanguage {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "vi";
  } catch {
    return "vi";
  }
}

export function applyDocumentLanguage(language: string): void {
  document.documentElement.lang = language.toLowerCase().startsWith("en") ? "en" : "vi";
}

void i18n.use(initReactI18next).init({
  resources: {
    vi: {
      common: viCommon,
      errors: viErrors,
      catalog: viCatalog,
      auth: viAuth,
      booking: viBooking,
      checkout: viCheckout,
      account: viAccount,
      "admin-content": viAdminContent,
      "admin-ops": viAdminOps,
    },
    en: {
      common: enCommon,
      errors: enErrors,
      catalog: enCatalog,
      auth: enAuth,
      booking: enBooking,
      checkout: enCheckout,
      account: enAccount,
      "admin-content": enAdminContent,
      "admin-ops": enAdminOps,
    },
  },
  lng: readStoredLanguage(),
  fallbackLng: "vi",
  defaultNS: "common",
  ns: [...NAMESPACES],
  interpolation: { escapeValue: false },
  returnNull: false,
});

i18n.on("languageChanged", (language) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Storage can be unavailable in private mode; the in-memory language still applies.
  }
  applyDocumentLanguage(language);
});

applyDocumentLanguage(i18n.language);

export default i18n;
