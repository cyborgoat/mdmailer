import { access, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_CONFIG = `{
  "organization": {
    "name": "Your Organization",
    "logoUrl": "https://placehold.co/240x100?text=Your+Logo"
  },
  "theme": {
    "primaryColor": "#1a73e8",
    "footerText": "© 2026 {{organization}}. Internal use only.",
    "slogan": "Flowing intelligence across the network"
  }
}
`;

const EXAMPLE_CONTENT = `---
title: "Example Update"
date: 2026-01-01
---

# Headline

Write your update here using regular Markdown — headings, lists, links, tables, task lists, etc.
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

  await writeIfMissing(configPath, DEFAULT_CONFIG);
  await mkdir(contentDir, { recursive: true });
  await writeIfMissing(examplePath, EXAMPLE_CONTENT);

  console.log(
    "\nNext steps:\n" +
      "  1. Edit mdmailer.config.json with your organization's logo, theme, and slogan.\n" +
      "  2. Edit content/example.md with your update.\n" +
      "  3. Run: npx mdmailer generate --input content/example.md\n",
  );
}
