import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import * as React from "react";
import matter from "gray-matter";
import { render } from "@react-email/render";
import { configSchema } from "../config-schema.js";
import OrganizationEmail from "../emails/templates/OrganizationEmail.js";
import { resolveBrandLogo } from "../resolve-logo.js";

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

function buildEml(subject: string, html: string, text: string): string {
  const boundary = `mdmailer-${Date.now()}`;
  return [
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    text,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    html,
    ``,
    `--${boundary}--`,
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
  const { data: frontmatter, content: bodyMarkdown } = matter(rawMarkdown);

  const title = frontmatter.title ?? "Untitled Email";
  const date = formatDate(frontmatter.date);
  const organization = await resolveBrandLogo(config.organization);

  const element = React.createElement(OrganizationEmail, {
    title,
    date,
    bodyMarkdown,
    organization,
    primaryColor: config.theme.primaryColor,
    footerText: config.theme.footerText,
    slogan: config.theme.slogan,
  });

  const html = await render(element);
  const text = await render(element, { plainText: true });

  await mkdir("output", { recursive: true });
  const stem = basename(inputPath, extname(inputPath));

  const htmlPath = resolve("output", `${stem}.html`);
  const emlPath = resolve("output", `${stem}.eml`);

  await writeFile(htmlPath, html, "utf-8");
  await writeFile(emlPath, buildEml(title, html, text), "utf-8");

  console.log(`Generated:\n  ${htmlPath}  (preview in a browser)\n  ${emlPath}  (open to compose in your mail client)`);
}
