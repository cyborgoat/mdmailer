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
