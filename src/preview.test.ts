import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import puppeteer from "puppeteer";
import { browserExecutable } from "./screenshot.js";
import { parsePreviewArgs, startPreview } from "./commands/preview.js";

async function eventually<T>(read: () => Promise<T>, matches: (value: T) => boolean): Promise<T> {
  for (let i = 0; i < 1000; i++) {
    const value = await read();
    if (matches(value)) return value;
    await delay(20);
  }
  throw new Error("Timed out waiting for preview update");
}

test("preview parses one file and validates options", () => {
  assert.equal(parsePreviewArgs(["mail.md"]).port, 3000);
  assert.equal(parsePreviewArgs(["--input", "mail.md", "--port", "0"]).port, 0);
  assert.equal(parsePreviewArgs(["mail.md", "--theme", "NAVY-GOLD"]).theme, "navy-gold");
  for (const args of [[], ["a.md", "b.md"], ["a.md", "--output", "out"], ["a.md", "--port"],
    ["a.md", "--theme", "bad"], ["a.md", "--port", "3000.5"], ["a.md", "--port", "65536"],
    ["a.md", "--port", ""], ["a.md", "--port", "-1"], ["a.md", "--port", "1", "--port", "2"]]) {
    assert.throws(() => parsePreviewArgs(args));
  }
});

test("live preview updates Markdown and config, recovers from errors, and serializes renders", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "mdmailer-preview-"));
  const inputPath = join(cwd, "mail.md");
  const configPath = join(cwd, "config.json");
  const config = { organization: { name: "Example", logoUrl: "logo.svg" }, theme: { primaryColor: "#1A73E8", footerText: "Footer" } };
  await writeFile(inputPath, "First");
  await writeFile(configPath, JSON.stringify(config));
  let running = 0;
  let maxRunning = 0;
  let renderCount = 0;
  const preview = await startPreview({ inputPath, configPath, port: 0, intervalMs: 10,
    render: async (markdown, branding) => {
      running++;
      renderCount++;
      maxRunning = Math.max(maxRunning, running);
      try {
        await delay(30);
        if (markdown === "broken") throw new Error("Invalid Markdown");
        return { html: `<p>${markdown} · ${branding.organization.name}</p>` };
      } finally { running--; }
    },
  });
  const state = async () => (await fetch(`${preview.url}/state`)).json();
  try {
    const page = await (await fetch(preview.url)).text();
    assert.match(page, /sandbox=""/);
    assert.match(page, /Mobile/);
    assert.match(page, /frame.srcdoc=state.html/);
    const first = await eventually(state, s => s.html.includes("First"));
    const unchanged = await (await fetch(`${preview.url}/state?version=${first.version}`)).json();
    assert.equal(unchanged.html, undefined);
    assert.equal((await fetch(`${preview.url}/mail.md`)).status, 404);
    assert.equal((await fetch(preview.url, { method: "POST" })).status, 405);
    const before = renderCount;
    await delay(60);
    assert.equal(renderCount, before, "unchanged files do not trigger another render");
    await writeFile(inputPath, "Second");
    const second = await eventually(state, s => s.html.includes("Second"));
    assert.ok(second.version > first.version);
    await writeFile(inputPath, "broken");
    const broken = await eventually(state, s => s.error === "Invalid Markdown");
    assert.equal(broken.html, second.html);
    await writeFile(inputPath, "Recovered");
    await eventually(state, s => !s.error && s.html.includes("Recovered"));
    await writeFile(configPath, "{");
    await eventually(state, s => s.error.includes("Cannot load configuration"));
    config.organization.name = "New branding";
    await writeFile(configPath, JSON.stringify(config));
    await eventually(state, s => !s.error && s.html.includes("New branding"));
    await writeFile(inputPath, "Fast edit 1");
    await eventually(state, s => s.updating);
    await writeFile(inputPath, "Fast edit 2");
    await eventually(state, s => s.html.includes("Fast edit 2"));
    assert.equal(maxRunning, 1);
    assert.deepEqual((await readdir(cwd)).sort(), ["config.json", "mail.md"]);
  } finally {
    await preview.close();
    await rm(cwd, { recursive: true, force: true });
  }
  await assert.rejects(fetch(preview.url));
});

test("preview rejects folders and starts with recoverable config errors", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "mdmailer-preview-invalid-"));
  const inputPath = join(cwd, "mail.md");
  const configPath = join(cwd, "config.json");
  await writeFile(inputPath, "Hello");
  try {
    await assert.rejects(startPreview({ inputPath: cwd, configPath, port: 0 }), /not a folder/);
    const preview = await startPreview({ inputPath, configPath, port: 0, intervalMs: 10, render: async () => ({ html: "Recovered" }) });
    const state = async () => (await fetch(`${preview.url}/state`)).json();
    try {
      await eventually(state, s => s.error.includes("Cannot load configuration"));
      await writeFile(configPath, JSON.stringify({ organization: { name: "Brand", logoUrl: "logo.svg" }, theme: { primaryColor: "#1A73E8", footerText: "Footer" } }));
      await eventually(state, s => !s.error && s.html === "Recovered");
    } finally { await preview.close(); }
  } finally { await rm(cwd, { recursive: true, force: true }); }
});

test("browser preview renders the real email and syncs saved edits without refreshing", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "mdmailer-preview-browser-"));
  const inputPath = join(cwd, "mail.md");
  const configPath = join(cwd, "config.json");
  const markdown = (body: string) => `---\ntype: news\nlang: en\ntitle: Live preview\n---\n${body}\n\n[Website](https://example.com)`;
  await writeFile(inputPath, markdown("Original message"));
  await writeFile(join(cwd, "logo.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#1A73E8"/></svg>');
  await writeFile(configPath, JSON.stringify({ organization: { name: "Example", logoUrl: "logo.svg" }, theme: { primaryColor: "#1A73E8", footerText: "Footer" } }));
  const preview = await startPreview({ inputPath, configPath, port: 0, intervalMs: 50 });
  const browser = await puppeteer.launch({ headless: true, executablePath: await browserExecutable() });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 900 });
    await page.goto(preview.url);
    const email = async () => {
      const frame = page.frames().find(frame => frame.url() === "about:srcdoc");
      return frame ? frame.evaluate(() => document.body.textContent) : "";
    };
    await eventually(email, text => !!text?.includes("Original message"));
    const frame = page.frames().find(frame => frame.url() === "about:srcdoc")!;
    assert.ok(await frame.$("[data-qr-section]"), "uses the exported QR layout");
    await page.click('[data-width="375px"]');
    assert.equal(await page.$eval("iframe", el => el.getBoundingClientRect().width), 375);
    await writeFile(inputPath, markdown("Updated after saving"));
    await eventually(email, text => !!text?.includes("Updated after saving"));
    await page.screenshot({ path: "/private/tmp/mdmailer-live-preview.png", fullPage: true });
    await writeFile(inputPath, "---\ntype: invalid\nlang: en\n---\nOops");
    await eventually(() => page.$eval("#error", el => el.textContent), text => !!text?.includes("Unknown frontmatter type"));
    assert.match((await email())!, /Updated after saving/);
    await writeFile(inputPath, markdown("Fixed message"));
    await eventually(email, text => !!text?.includes("Fixed message"));
  } finally {
    await browser.close();
    await preview.close();
    await rm(cwd, { recursive: true, force: true });
  }
});
