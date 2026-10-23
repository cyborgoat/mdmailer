import puppeteer from "puppeteer";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

function runInstaller(): Promise<void> {
  const cli = fileURLToPath(import.meta.resolve("puppeteer/internal/node/cli.js"));
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, "browsers", "install", "chrome"], { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Browser installer exited with ${signal ?? code}`));
    });
  });
}

export async function downloadBrowser(installer: () => Promise<void> = runInstaller): Promise<string> {
  const configuration = await puppeteer.configuration();
  if (configuration.skipDownload || configuration.chrome?.skipDownload) {
    throw new Error("Chrome is missing and automatic downloads are disabled in Puppeteer configuration. Install Chrome or set PUPPETEER_EXECUTABLE_PATH, or enable browser downloads and retry.");
  }
  console.error("Setting up Chrome for PNG generation (one-time download). This may take a few minutes…");
  try {
    // Puppeteer's own CLI selects its compatible version and configured cache.
    await installer();
    return await puppeteer.executablePath();
  } catch (error) {
    throw new Error(`Automatic Chrome setup failed. Check your internet/proxy connection and rerun mdmailer to retry, or set PUPPETEER_EXECUTABLE_PATH to an installed Chrome browser. ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}
