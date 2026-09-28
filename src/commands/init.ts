import { access, mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

import { copyAgentSkill, copyStarterPhotos, copyStarterTemplates } from "../template-assets.js";
import { globalConfigPath } from "../config.js";
import { THEME_PRESET_NAMES, type ThemePresetName } from "../config-schema.js";

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

/** Scaffold a local workspace's config, starter templates, and assets under `rootDir`. */
async function scaffoldLocalWorkspace(rootDir: string, configContents: string) {
  const configPath = resolve(rootDir, "mdmailer.config.json");
  const templatesDir = resolve(rootDir, "templates");
  const assetsDir = resolve(rootDir, "assets");
  const logoPath = resolve(assetsDir, "logo.svg");

  await writeIfMissing(configPath, configContents);
  await copyStarterTemplates(templatesDir);
  await mkdir(assetsDir, { recursive: true });
  await writeIfMissing(logoPath, PLACEHOLDER_LOGO_SVG);
  await copyStarterPhotos(assetsDir);
  await copyAgentSkill(rootDir);
}

function nextStepsMessage(cdStep?: string): string {
  const steps = [
    ...(cdStep ? [cdStep] : []),
    "Replace assets/logo.svg with your real logo (or point logoUrl at a hosted image).",
    "Edit mdmailer.config.json with your organization's branding and footer.",
    "Edit templates/news.md with your update.",
    "Run: mdmailer templates/news.md --output emails",
    "For agent integration, ask your agent to read SKILL.md.",
  ];
  return (
    "\nNext steps:\n" +
    steps.map((step, index) => `  ${index + 1}. ${step}\n`).join("") +
    "\n" +
    "Every Markdown file must declare its layout and language in frontmatter.\n" +
    "English starters use <type>.md; Chinese starters use <type>.zh.md.\n" +
    "Set the required layout with `type:` in frontmatter.\n" +
    "Set the required language with `lang: en` or `lang: zh` (English or Chinese).\n"
  );
}

export function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "mdmailer-project";
}

function buildConfigWithPreset(preset: ThemePresetName): string {
  const parsed = JSON.parse(DEFAULT_CONFIG);
  parsed.theme.preset = preset;
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

export interface InitIO {
  input: NodeJS.ReadableStream & { isTTY?: boolean };
  output: NodeJS.WritableStream & { isTTY?: boolean };
}

const defaultIO = (): InitIO => ({ input: process.stdin, output: process.stdout });

function isInteractive(io: InitIO): boolean {
  return Boolean(io.input.isTTY) && Boolean(io.output.isTTY);
}

async function promptThemePreset(rl: ReturnType<typeof createInterface>, output: InitIO["output"]): Promise<ThemePresetName> {
  const listing = THEME_PRESET_NAMES
    .map((name, index) => `  ${index + 1}) ${name}${index === 0 ? " (default)" : ""}`)
    .join("\n");
  for (;;) {
    const answer = (
      await rl.question(`\nChoose a default theme:\n${listing}\nEnter 1-${THEME_PRESET_NAMES.length} [1]: `)
    ).trim();
    if (!answer) return THEME_PRESET_NAMES[0];
    const asIndex = Number(answer);
    if (Number.isInteger(asIndex) && asIndex >= 1 && asIndex <= THEME_PRESET_NAMES.length) {
      return THEME_PRESET_NAMES[asIndex - 1];
    }
    const byName = THEME_PRESET_NAMES.find((name) => name.toLowerCase() === answer.toLowerCase());
    if (byName) return byName;
    output.write(`Please enter a number from 1 to ${THEME_PRESET_NAMES.length}, or a theme name.\n`);
  }
}

async function runInteractiveInit(io: InitIO) {
  const rl = createInterface({ input: io.input, output: io.output });
  try {
    const cwdBase = basename(resolve(".")) || "mdmailer-project";
    const nameAnswer = (await rl.question(`Project name (${cwdBase}): `)).trim();
    const slug = slugify(nameAnswer || cwdBase);
    const preset = await promptThemePreset(rl, io.output);

    const projectDir = resolve(slug);
    await mkdir(projectDir, { recursive: true });
    await scaffoldLocalWorkspace(projectDir, buildConfigWithPreset(preset));

    io.output.write(`\nCreated project "${slug}" in ./${slug}\n`);
    io.output.write(nextStepsMessage(`cd ${slug}`));
  } finally {
    rl.close();
  }
}

export async function runInit(argv: string[] = [], io: InitIO = defaultIO()) {
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
    console.log(`\nEdit ${configPath} to set your organization, logo, brand color, and footer.\nRelative logo paths are resolved from ${dirname(configPath)}.\nGenerate any Markdown file with: mdmailer <file.md> --output <folder>\nFor agent integration, ask your agent to read ${resolve(dirname(configPath), "SKILL.md")}.`);
    return;
  }

  if (!isInteractive(io)) {
    await scaffoldLocalWorkspace(resolve("."), DEFAULT_CONFIG);
    console.log(nextStepsMessage());
    return;
  }

  await runInteractiveInit(io);
}
