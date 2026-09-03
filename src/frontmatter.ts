// Helpers for reading values out of a Markdown file's YAML frontmatter.
// `gray-matter` parses frontmatter with js-yaml, so unquoted dates come back as
// JS `Date`, block/flow lists as arrays, and nested maps as plain objects — the
// coercers below normalize all of that into the plain strings the templates want.

export function formatDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value ?? "");
}

/** Trimmed string, or `undefined` for null/undefined/empty. */
export function fmString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const str = String(value).trim();
  return str === "" ? undefined : str;
}

/** Like `fmString`, but falls back to `fallback` instead of `undefined`. */
export function fmStringOr(value: unknown, fallback: string): string {
  return fmString(value) ?? fallback;
}

/** Always an array of non-empty strings — accepts a YAML list or a lone scalar. */
export function fmList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  const str = fmString(value);
  return str ? [str] : [];
}
