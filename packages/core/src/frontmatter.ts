import { load } from "js-yaml";

// Helpers for reading values out of a Markdown file's YAML frontmatter.
// js-yaml parses it, so unquoted dates come back as JS `Date`, block/flow lists
// as arrays, and nested maps as plain objects — the coercers below normalize all
// of that into the plain strings the templates want.

export interface ParsedMarkdown {
  data: Record<string, any>;
  content: string;
}

/**
 * Splits `---`-fenced YAML frontmatter from the Markdown body. Mirrors what
 * `gray-matter` did (BOM stripping, comment-only frontmatter = empty, an
 * unterminated block swallows the rest of the file) without its Node-only
 * dependencies, so it also runs in browsers.
 */
export function parseFrontmatter(input: string): ParsedMarkdown {
  const str = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  // `----` is a thematic break, not a frontmatter fence.
  if (!str.startsWith("---") || str.charAt(3) === "-") return { data: {}, content: str };

  const rest = str.slice(3);
  const closeIndex = rest.indexOf("\n---");
  const end = closeIndex === -1 ? rest.length : closeIndex;
  const matter = rest.slice(0, end);
  const isEmpty = matter.replace(/^\s*#[^\n]+/gm, "").trim() === "";
  const loaded = isEmpty ? {} : load(matter);
  const data = loaded && typeof loaded === "object" && !Array.isArray(loaded) ? (loaded as Record<string, any>) : {};

  if (closeIndex === -1) return { data, content: "" };
  let content = rest.slice(closeIndex + "\n---".length);
  if (content[0] === "\r") content = content.slice(1);
  if (content[0] === "\n") content = content.slice(1);
  return { data, content };
}

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
