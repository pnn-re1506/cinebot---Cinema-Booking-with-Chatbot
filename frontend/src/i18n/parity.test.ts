import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ERROR_CODES } from "@/lib/api/errorCodes";

const localesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "locales");

function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) {
    return prefix ? [prefix] : [];
  }
  return entries.flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

describe("i18n catalogues", () => {
  it("has the same keys in Vietnamese and English", () => {
    const viFiles = readdirSync(path.join(localesDir, "vi")).sort();
    const enFiles = readdirSync(path.join(localesDir, "en")).sort();
    expect(enFiles).toEqual(viFiles);

    for (const file of viFiles) {
      const vi = JSON.parse(readFileSync(path.join(localesDir, "vi", file), "utf8")) as unknown;
      const en = JSON.parse(readFileSync(path.join(localesDir, "en", file), "utf8")) as unknown;
      expect(keyPaths(en).sort(), file).toEqual(keyPaths(vi).sort());
    }
  });

  it("translates every contract error code in both languages", () => {
    const vi = JSON.parse(readFileSync(path.join(localesDir, "vi", "errors.json"), "utf8")) as Record<
      string,
      string
    >;
    const en = JSON.parse(readFileSync(path.join(localesDir, "en", "errors.json"), "utf8")) as Record<
      string,
      string
    >;
    const codes = [...ERROR_CODES].sort();
    expect(Object.keys(vi).sort()).toEqual(codes);
    expect(Object.keys(en).sort()).toEqual(codes);
    for (const code of ERROR_CODES) {
      expect(vi[code]?.length).toBeGreaterThan(0);
      expect(en[code]?.length).toBeGreaterThan(0);
    }
  });
});
