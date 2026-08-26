import { randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import * as React from "react";
import matter from "gray-matter";
import { render } from "@react-email/render";
import { configSchema } from "../config-schema.js";
import OrganizationEmail from "../emails/templates/OrganizationEmail.js";
import { resolveBrandLogo } from "../resolve-logo.js";
import { resolveContentImages } from "../resolve-content-images.js";

interface EmlAttachment {
  cid: string;
  mime: string;
  buffer: Buffer;
  // The string to find-and-replace in the rendered HTML with `cid:<cid>` —
  // either the org logo's resolved src, or a content image's data URI.
  renderedSrc: string;
}

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      args.set(arg.slice(2), argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

function formatDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value ?? "");
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
  const args = parseArgs(argv);
  const inputPath = args.get("input");
  const configPath = args.get("config") ?? "mdmailer.config.json";

  if (!inputPath) {
    console.error("Usage: mdmailer generate --input content/<file>.md [--config mdmailer.config.json]");
    process.exitCode = 1;
    return;
  }

  const rawConfig = JSON.parse(await readFile(resolve(configPath), "utf-8"));
  const config = configSchema.parse(rawConfig);

  const rawMarkdown = await readFile(resolve(inputPath), "utf-8");
  const { data: frontmatter, content: rawBodyMarkdown } = matter(rawMarkdown);
  const { markdown: bodyMarkdown, attachments: contentImages } = await resolveContentImages(rawBodyMarkdown);

  const title = frontmatter.title ?? "Untitled Email";
  const date = formatDate(frontmatter.date);
  const { brand: organization, logoAttachment } = await resolveBrandLogo(config.organization);

  const element = React.createElement(OrganizationEmail, {
    title,
    date,
    bodyMarkdown,
    organization,
    primaryColor: config.theme.primaryColor,
    footerText: config.theme.footerText,
    slogan: config.theme.slogan,
    fontFamily: config.theme.fontFamily,
  });

  const html = await render(element);
  const text = await render(element, { plainText: true });

  await mkdir("output", { recursive: true });
  const stem = basename(inputPath, extname(inputPath));

  const htmlPath = resolve("output", `${stem}.html`);
  const emlPath = resolve("output", `${stem}.eml`);

  // The .html preview keeps every local image as a data: URI (browsers render
  // those fine); the .eml swaps each one for a cid: reference matching its
  // attached part below, since Outlook doesn't render data: URIs in <img src>.
  const attachments: EmlAttachment[] = [
    ...(logoAttachment ? [{ ...logoAttachment, renderedSrc: organization.logoUrl }] : []),
    ...contentImages.map((image): EmlAttachment => ({ ...image, renderedSrc: image.dataUri })),
  ];
  const emlHtml = attachments.reduce((acc, att) => acc.split(att.renderedSrc).join(`cid:${att.cid}`), html);

  await writeFile(htmlPath, html, "utf-8");
  await writeFile(emlPath, buildEml(title, emlHtml, text, attachments), "utf-8");

  console.log(`Generated:\n  ${htmlPath}  (preview in a browser)\n  ${emlPath}  (open to compose in your mail client)`);
}
