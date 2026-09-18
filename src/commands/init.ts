import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { copyAgentSkill, copyStarterPhotos, copyStarterTemplates } from "../template-assets.js";
import { globalConfigPath } from "../config.js";

const DEFAULT_CONFIG = `{
  "organization": {
    "name": "Your Organization",
    "logoUrl": "assets/logo.svg"
  },
  "theme": {
    "primaryColor": "#1a73e8",
    "footerText": "© 2026 {{organization}}. Internal use only.",
    "tagline": "Flowing intelligence across the network.",
    "fontFamily": "\\"Microsoft YaHei\\", \\"Helvetica Neue\\", Helvetica, Arial, \\"PingFang SC\\", sans-serif",
    "social": []
  }
}
`;

const PLACEHOLDER_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="100" viewBox="0 0 240 100" role="img" aria-label="Your Organization logo placeholder">
  <rect width="240" height="100" rx="12" fill="#1a73e8"/>
  <text x="120" y="57" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#ffffff">Your Logo</text>
</svg>
`;

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
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

export async function runInit(argv: string[] = []) {
  if (argv.length > 1 || (argv.length === 1 && argv[0] !== "--global")) {
    throw new Error("Usage: mdmailer init [--global]");
  }
  if (argv[0] === "--global") {
    const configPath = globalConfigPath();
    const assetsDir = resolve(dirname(configPath), "assets");
    await mkdir(assetsDir, { recursive: true });
    await writeIfMissing(configPath, DEFAULT_CONFIG);
    await copyAgentSkill(dirname(configPath));
    await writeIfMissing(resolve(assetsDir, "logo.svg"), PLACEHOLDER_LOGO_SVG);
    console.log(`\nEdit ${configPath} to set your organization, logo, brand color, and footer.\nRelative logo paths are resolved from ${dirname(configPath)}.\nGenerate any Markdown file with: mdmailer <file.md>\nFor agent integration, ask your agent to read ${resolve(dirname(configPath), "SKILL.md")}.`);
    return;
  }
  const configPath = resolve("mdmailer.config.json");
  const templatesDir = resolve("templates");
  const assetsDir = resolve("assets");
  const logoPath = resolve(assetsDir, "logo.svg");

  await writeIfMissing(configPath, DEFAULT_CONFIG);
  await copyStarterTemplates(templatesDir);
  await mkdir(assetsDir, { recursive: true });
  await writeIfMissing(logoPath, PLACEHOLDER_LOGO_SVG);
  await copyStarterPhotos(assetsDir);
  await copyAgentSkill(resolve("."));

  console.log(
    "\nNext steps:\n" +
      "  1. Replace assets/logo.svg with your real logo (or point logoUrl at a hosted image).\n" +
      "  2. Edit mdmailer.config.json with your organization's branding and footer.\n" +
      "  3. Edit templates/news.md with your update.\n" +
      "  4. Run: mdmailer templates/news.md\n" +
      "  5. For agent integration, ask your agent to read SKILL.md.\n" +
      "\n" +
      "Every Markdown file must declare its layout and language in frontmatter.\n" +
      "English starters use <type>.md; Chinese starters use <type>.zh.md.\n" +
      "Set the required layout with `type:` in frontmatter.\n" +
      "Set the required language with `lang: en` or `lang: zh` (English or Chinese).\n",
  );
}
