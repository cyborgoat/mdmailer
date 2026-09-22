import puppeteer from "puppeteer";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { downloadBrowser } from "./browser-setup.js";
import { replaceLinksWithQr } from "./promotion.js";

export async function browserExecutable(): Promise<string> {
  // An explicit override takes precedence, including its launch errors.
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const candidates: string[] = [];
  try {
    candidates.push(await puppeteer.executablePath());
  } catch {
    // A missing managed browser should not prevent using installed Chrome.
  }
  if (process.platform === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      join(homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    );
  } else if (process.platform === "win32") {
    for (const root of [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA]) {
      if (root) candidates.push(join(root, "Google/Chrome/Application/chrome.exe"));
    }
  } else {
    for (const directory of (process.env.PATH ?? "").split(":")) {
      if (!directory) continue;
      for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
        candidates.push(join(directory, name));
      }
    }
  }
  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try the next known browser location.
    }
  }
  return downloadBrowser();
}

/** Reuse the full email layout, replacing URLs with QR codes for the PNG. */
export async function screenshotEmail(html: string, width: number, capturePng = true): Promise<{ html: string; png?: Uint8Array; qrImages: string[] }> {
  const browser = await puppeteer.launch({ headless: true, executablePath: await browserExecutable() });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: Math.ceil(width), height: 600, deviceScaleFactor: 2 });
    await page.setJavaScriptEnabled(false);
    await page.setContent(html, { waitUntil: "load", timeout: 30_000 });
    const qrImages = await replaceLinksWithQr(page);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, async (image) => {
        await image.decode();
      }));
    });
    return { html: await page.content(), png: capturePng ? await page.screenshot({ type: "png", fullPage: true }) : undefined, qrImages };
  } catch (error) {
    throw new Error(`Could not capture the email PNG. Check that all email images are accessible. ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  } finally {
    await browser.close();
  }
}
