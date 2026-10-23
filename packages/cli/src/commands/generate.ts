import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import {
  buildEml, collectEmlAttachments, renderEmail as renderEmailCore, THEME_PRESET_NAMES,
  type Config, type ThemePresetName,
} from "@goatcheese/mdmailer-core";
import { loadConfig } from "../config.js";
import { parseGenerateArgs, parseOutputFormats, resolveGenerateInputs, type OutputFormat } from "../generate-input.js";
import { nodeImageIO } from "../node-image-io.js";
import { screenshotEmail } from "../screenshot.js";

export async function runGenerate(argv: string[]) {
  const args = parseGenerateArgs(argv);
  const input = args.get("input");
  if (!input) {
    throw new Error("Provide a Markdown file or folder: mdmailer <file.md | folder/>.");
  }
  if (args.has("template") || args.has("type")) {
    throw new Error('Email type cannot be set from the CLI. Add it to Markdown frontmatter, for example: type: meeting');
  }

  if (args.has("lang") || args.has("locale") || args.has("language")) {
    throw new Error('Email language cannot be set from the CLI. Add it to Markdown frontmatter as lang: en or lang: zh.');
  }

  const output = args.get("output");
  if (!output?.trim()) throw new Error("Required option --output <folder> is missing. Use --output . to write to the current directory.");
  const formats = parseOutputFormats(args.get("format"));
  const inputs = await resolveGenerateInputs(input);
  const config = await loadConfig(args.get("config"));
  const themeFlag = args.get("theme")?.toLowerCase().trim();
  if (themeFlag && !THEME_PRESET_NAMES.includes(themeFlag as ThemePresetName)) {
    throw new Error(`Unknown theme "${themeFlag}". Valid themes: ${THEME_PRESET_NAMES.join(", ")}`);
  }
  const outputDir = resolve(output);
  for (const inputPath of inputs) {
    await generateFile(inputPath, config, outputDir, formats, themeFlag);
  }
}

export async function renderEmail(rawMarkdown: string, config: Config, themeFlag?: string, formats = new Set<OutputFormat>(["html"])) {
  const rendered = await renderEmailCore(rawMarkdown, {
    config,
    images: nodeImageIO,
    theme: themeFlag as ThemePresetName | undefined,
    plainText: formats.has("eml"),
  });
  const preview = await screenshotEmail(rendered.html, rendered.contentWidth, formats.has("png"));
  return { ...preview, ...rendered, html: preview.html };
}

async function generateFile(inputPath: string, config: Config, outputDir: string, formats: Set<OutputFormat>, themeFlag?: string) {
  const preview = await renderEmail(await readFile(resolve(inputPath), "utf-8"), config, themeFlag, formats);
  const { html, title, text } = preview;
  await mkdir(outputDir, { recursive: true });
  const stem = basename(inputPath, extname(inputPath));

  const htmlPath = resolve(outputDir, `${stem}.html`);
  const emlPath = resolve(outputDir, `${stem}.eml`);
  const pngPath = resolve(outputDir, `${stem}.png`);

  // The .html preview keeps every local image as a data: URI (browsers render
  // those fine); the .eml swaps each one for a cid: reference matching its
  // attached part, since Outlook doesn't render data: URIs in <img src>.
  const attachments = collectEmlAttachments(preview, preview.qrImages);

  const generated: string[] = [];
  if (formats.has("html")) {
    await writeFile(htmlPath, html, "utf-8");
    generated.push(`${htmlPath}  (preview in a browser)`);
  }
  if (formats.has("eml")) {
    await writeFile(emlPath, buildEml({ subject: title, html, text, attachments }), "utf-8");
    generated.push(`${emlPath}  (open to compose in your mail client)`);
  }
  if (preview.png) {
    await writeFile(pngPath, preview.png);
    generated.push(`${pngPath}  (promotional card)`);
  }
  console.log(`Generated:\n  ${generated.join("\n  ")}`);
}
