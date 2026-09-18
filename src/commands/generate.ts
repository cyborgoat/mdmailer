import { randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import * as React from "react";
import matter from "gray-matter";
import { render } from "@react-email/render";
import { frontmatterThemeSchema, THEME_PRESET_NAMES, type ThemePresetName, type Config } from "../config-schema.js";
import { templates, TEMPLATE_NAMES, resolveTemplateName, type TemplateEntry } from "../emails/registry.js";
import type { TemplateContext } from "../emails/template-context.js";
import { formatDate } from "../frontmatter.js";
import { resolveLocale, t } from "../i18n/index.js";
import { resolveBrandLogo } from "../resolve-logo.js";
import { resolveContentImages } from "../resolve-content-images.js";
import { resolveHosts } from "../resolve-hosts.js";
import { normalizeThemeSelection, resolveEmailTheme, selectLogoUrl } from "../emails/theme.js";
import { loadConfig } from "../config.js";
import { parseGenerateArgs, resolveGenerateInputs } from "../generate-input.js";

interface EmlAttachment {
  cid: string;
  mime: string;
  buffer: Buffer;
  // The string to find-and-replace in the rendered HTML with `cid:<cid>` —
  // either the org logo's resolved src, or a content image's data URI.
  renderedSrc: string;
}

function extensionForMime(mime: string): string {
  const subtype = mime.split("/")[1] ?? "png";
  return subtype === "jpeg" ? "jpg" : subtype;
}

// RFC 2045 caps base64 body lines at 76 characters.
function wrapBase64(base64: string): string {
  return base64.match(/.{1,76}/g)?.join("\r\n") ?? base64;
}

function buildEml(subject: string, html: string, text: string, attachments: EmlAttachment[]): string {
  const altBoundary = `mdmailer-alt-${randomUUID()}`;
  const alternativePart = [
    `--${altBoundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    text,
    ``,
    `--${altBoundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    html,
    ``,
    `--${altBoundary}--`,
  ].join("\r\n");

  if (attachments.length === 0) {
    return [
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
      ``,
      alternativePart,
      ``,
    ].join("\r\n");
  }

  // Outlook doesn't render `data:` URI images in <img src>, so local images travel
  // as proper inline attachments referenced by Content-ID (`cid:...`) instead,
  // wrapped in multipart/related around the text/html + text/plain alternative.
  const relatedBoundary = `mdmailer-rel-${randomUUID()}`;
  const attachmentParts = attachments
    .map((attachment) =>
      [
        `--${relatedBoundary}`,
        `Content-Type: ${attachment.mime}`,
        `Content-Transfer-Encoding: base64`,
        `Content-ID: <${attachment.cid}>`,
        `Content-Disposition: inline; filename="${attachment.cid}.${extensionForMime(attachment.mime)}"`,
        ``,
        wrapBase64(attachment.buffer.toString("base64")),
        ``,
      ].join("\r\n"),
    )
    .join("");

  return [
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/related; boundary="${relatedBoundary}"`,
    ``,
    `--${relatedBoundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    ``,
    alternativePart,
    ``,
    attachmentParts,
    `--${relatedBoundary}--`,
    ``,
  ].join("\r\n");
}

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

  const inputs = await resolveGenerateInputs(input);
  const config = await loadConfig(args.get("config"));
  const themeFlag = args.get("theme")?.toLowerCase().trim();
  if (themeFlag && !THEME_PRESET_NAMES.includes(themeFlag as ThemePresetName)) {
    throw new Error(`Unknown theme "${themeFlag}". Valid themes: ${THEME_PRESET_NAMES.join(", ")}`);
  }
  const outputDir = resolve(args.get("output") ?? ".");
  for (const inputPath of inputs) {
    await generateFile(inputPath, config, outputDir, themeFlag);
  }
}

async function generateFile(inputPath: string, config: Config, outputDir: string, themeFlag?: string) {
  const rawMarkdown = await readFile(resolve(inputPath), "utf-8");
  const { data: frontmatter, content: rawBodyMarkdown } = matter(rawMarkdown);
  const rawTemplateName = frontmatter.type;
  if (typeof rawTemplateName !== "string" || !rawTemplateName.trim()) {
    throw new Error(`Missing required frontmatter field "type". Valid types: ${TEMPLATE_NAMES.join(", ")}`);
  }
  const templateName = resolveTemplateName(rawTemplateName);
  if (!templateName) {
    throw new Error(`Unknown frontmatter type "${String(rawTemplateName)}". Valid types: ${TEMPLATE_NAMES.join(", ")}`);
  }

  const rawLocale = frontmatter.lang ?? frontmatter.locale ?? frontmatter.language;
  if (typeof rawLocale !== "string" || !rawLocale.trim()) {
    throw new Error('Missing required frontmatter field "lang". Available languages: English (en) and Chinese (zh).');
  }
  const locale = resolveLocale(rawLocale);
  if (!locale) {
    throw new Error(`Unsupported frontmatter language "${String(rawLocale)}". Available languages: English (en) and Chinese (zh).`);
  }

  const frontmatterTheme = normalizeThemeSelection(frontmatterThemeSchema.parse(frontmatter.theme));
  const themeSelection = themeFlag
    ? normalizeThemeSelection(frontmatterThemeSchema.parse({ ...frontmatterTheme, preset: themeFlag }))
    : frontmatterTheme;
  const { markdown: bodyMarkdown, attachments: contentImages } = await resolveContentImages(rawBodyMarkdown);
  const { profiles: hostProfiles, attachments: hostImages } = await resolveHosts(
    frontmatter.hosts ?? frontmatter.speakers,
  );

  const title = typeof frontmatter.title === "string" && frontmatter.title.trim()
    ? frontmatter.title
    : t(locale, "fallback.untitled");
  const date = formatDate(frontmatter.date);
  const theme = resolveEmailTheme(config.theme, themeSelection);
  const selectedLogoUrl = selectLogoUrl(config.organization, theme.appearance);
  const { brand: organization, logoAttachment } = await resolveBrandLogo({
    ...config.organization,
    logoUrl: selectedLogoUrl,
  });

  const ctx: TemplateContext = {
    frontmatter,
    bodyMarkdown,
    config,
    theme,
    organization,
    title,
    date,
    locale,
    hostProfiles,
  };
  const { component, buildProps }: TemplateEntry = templates[templateName];
  const element = React.createElement(component, buildProps(ctx));

  const html = await render(element);
  const text = await render(element, { plainText: true });

  await mkdir(outputDir, { recursive: true });
  const stem = basename(inputPath, extname(inputPath));

  const htmlPath = resolve(outputDir, `${stem}.html`);
  const emlPath = resolve(outputDir, `${stem}.eml`);

  // The .html preview keeps every local image as a data: URI (browsers render
  // those fine); the .eml swaps each one for a cid: reference matching its
  // attached part below, since Outlook doesn't render data: URIs in <img src>.
  const attachments: EmlAttachment[] = [
    ...(logoAttachment ? [{ ...logoAttachment, renderedSrc: organization.logoUrl }] : []),
    ...contentImages.map((image): EmlAttachment => ({ ...image, renderedSrc: image.dataUri })),
    ...hostImages.map((image): EmlAttachment => ({ ...image, renderedSrc: image.dataUri })),
  ];
  const emlHtml = attachments.reduce((acc, att) => acc.split(att.renderedSrc).join(`cid:${att.cid}`), html);

  await writeFile(htmlPath, html, "utf-8");
  await writeFile(emlPath, buildEml(title, emlHtml, text, attachments), "utf-8");

  console.log(`Generated:\n  ${htmlPath}  (preview in a browser)\n  ${emlPath}  (open to compose in your mail client)`);
}
