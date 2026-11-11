import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import i18n, { LANGUAGE_STORAGE_KEY, readStoredLanguage } from "@/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("toggles Vietnamese and English and persists the choice", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(i18n.resolvedLanguage).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Tiếng Việt" })).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Tiếng Việt" }));

    expect(i18n.resolvedLanguage).toBe("vi");
    expect(document.documentElement.lang).toBe("vi");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("vi");
    expect(readStoredLanguage()).toBe("vi");
  });

  it("reads the language stored for the next visit", () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
    expect(readStoredLanguage()).toBe("en");
    localStorage.setItem(LANGUAGE_STORAGE_KEY, "fr");
    expect(readStoredLanguage()).toBe("vi");
  });
});
