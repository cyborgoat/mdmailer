import { en } from "./en.js";
import { zh } from "./zh.js";
import type { Locale, MessageKey, Messages } from "./types.js";

export type { Locale, MessageKey, Messages };
export { en, zh };

export const DEFAULT_LOCALE: Locale = "en";

const catalogs: Record<Locale, Messages> = { en, zh };

/**
 * Resolves a required locale value from frontmatter `lang` / `locale` /
 * `language`. The caller reports missing or unsupported values.
 */
export function resolveLocale(raw: unknown): Locale | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.toLowerCase().trim();
  if (normalized === "zh" || normalized === "zh-cn" || normalized === "zh-hans" || normalized === "chinese") {
    return "zh";
  }
  if (normalized === "en" || normalized === "en-us" || normalized === "english") {
    return "en";
  }
  return null;
}

export function t(locale: Locale, key: MessageKey): string {
  return catalogs[locale][key] ?? catalogs[DEFAULT_LOCALE][key];
}
