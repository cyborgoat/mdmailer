import { access, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_CONFIG = `{
  "organization": {
    "name": "Your Organization",
    "logoUrl": "assets/logo.svg"
  },
  "theme": {
    "primaryColor": "#1a73e8",
    "footerText": "© 2026 {{organization}}. Internal use only.",
    "slogan": "Flowing intelligence across the network",
    "fontFamily": "\\"Helvetica Neue\\", Helvetica, Arial, \\"PingFang SC\\", \\"Microsoft YaHei\\", sans-serif"
  }
}
`;

const PLACEHOLDER_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="100" viewBox="0 0 240 100" role="img" aria-label="Your Organization logo placeholder">
  <rect width="240" height="100" rx="12" fill="#1a73e8"/>
  <text x="120" y="57" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#ffffff">Your Logo</text>
</svg>
`;

const EXAMPLE_CONTENT = `---
title: "Example Update"
date: 2026-01-01
---

# Headline

Write your update here using regular Markdown. This example touches every element mdmailer knows how to style — replace it with your own content.

## Text formatting

You get **bold**, *italic*, ~~strikethrough~~, and \`inline code\`, plus [links](https://example.com).

## Lists

- Unordered items
- Support nesting:
  - Like this
  - And this
1. Ordered items
2. Work too

## Task list

- [x] Draft the update
- [x] Get it reviewed
- [ ] Send it out

## Table

| Metric | Before | After |
| --- | --- | --- |
| Deploy time | 22 min | 13 min |
| Latency | 800ms | 220ms |

## Blockquote

> Heads up: this is what a callout looks like.

## Code block

\`\`\`bash
npx mdmailer generate --input content/example.md
\`\`\`

---

Questions? Reply to this email.
`;

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeIfMissing(path: string, contents: string) {
  if (await exists(path)) {
    console.log(`Skipped (already exists): ${path}`);
    return;
  }
  await writeFile(path, contents, "utf-8");
  console.log(`Created: ${path}`);
}

export async function runInit() {
  const configPath = resolve("mdmailer.config.json");
  const contentDir = resolve("content");
  const examplePath = resolve(contentDir, "example.md");
  const assetsDir = resolve("assets");
  const logoPath = resolve(assetsDir, "logo.svg");

  await writeIfMissing(configPath, DEFAULT_CONFIG);
  await mkdir(contentDir, { recursive: true });
  await writeIfMissing(examplePath, EXAMPLE_CONTENT);
  await mkdir(assetsDir, { recursive: true });
  await writeIfMissing(logoPath, PLACEHOLDER_LOGO_SVG);

  console.log(
    "\nNext steps:\n" +
      "  1. Replace assets/logo.svg with your real logo (or point logoUrl at a hosted image).\n" +
      "  2. Edit mdmailer.config.json with your organization's name, theme, and slogan.\n" +
      "  3. Edit content/example.md with your update.\n" +
      "  4. Run: npx mdmailer generate --input content/example.md\n",
  );
}
