import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { build } from "esbuild";
import puppeteer from "puppeteer";
import { renderEmail, parseConfig, type ImageIO } from "./index.js";

// 1x1 PNG
const PNG = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));
const markdown = "---\ntype: news\nlang: en\ntitle: Smoke\n---\nHello **world** https://example.com\n\n![pic](pic.png)\n";
const config = parseConfig({ organization: { name: "Example", logoUrl: "logo.png" }, theme: { primaryColor: "#1A73E8", footerText: "Footer" } });
const io: ImageIO = { read: async () => ({ bytes: PNG, mime: "image/png" }), measure: async () => ({ width: 1, height: 1 }) };

// Dev-only: the managed browser may not be downloaded, so fall back to an installed Chrome.
async function chromePath(): Promise<string> {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH, await puppeteer.executablePath(),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium",
  ];
  return candidates.find((path): path is string => !!path && existsSync(path)) ?? (await puppeteer.executablePath());
}

// Randomized CIDs are the only expected difference between runs.
const normalize = (html: string) => html.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g, "UUID");

test("core renders in headless Chrome identically to Node, and post-processes a real Document", async () => {
  const bundle = await build({
    entryPoints: [new URL("./index.ts", import.meta.url).pathname],
    bundle: true, platform: "browser", format: "iife", globalName: "core", write: false,
    jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' },
  });
  const nodeHtml = (await renderEmail(markdown, { config, images: io })).html;
  const browser = await puppeteer.launch({ headless: true, executablePath: await chromePath() });
  try {
    const page = await browser.newPage();
    page.on("pageerror", (error) => { throw error; });
    await page.setContent("<html><body></body></html>");
    await page.evaluate("globalThis.__name = (target) => target"); // tsx injects __name into evaluate callbacks
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const result = await page.evaluate(async (md, cfg, png) => {
      const c = (globalThis as any).core;
      const bytes = Uint8Array.from(atob(png), (ch) => ch.charCodeAt(0));
      const rendered = await c.renderEmail(md, { config: cfg, images: { read: async () => ({ bytes, mime: "image/png" }), measure: async () => ({ width: 1, height: 1 }) } });
      const frame = document.createElement("iframe");
      frame.style.width = "700px";
      document.body.append(frame);
      frame.srcdoc = rendered.html;
      await new Promise((resolve) => (frame.onload = resolve));
      const { qrImages } = await c.postProcessDocument(frame.contentDocument);
      return { html: rendered.html, qr: qrImages.length, final: c.serializeDocument(frame.contentDocument) };
    }, markdown, config, Buffer.from(PNG).toString("base64"));
    assert.equal(normalize(result.html), normalize(nodeHtml));
    assert.ok(result.qr >= 1);
    assert.match(result.final, /data-qr-section/);
    assert.match(result.final, /<img[^>]*width="/);
    assert.match(result.final, /^<!DOCTYPE html/i);
  } finally {
    await browser.close();
  }
});
