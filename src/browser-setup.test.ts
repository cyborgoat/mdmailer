import assert from "node:assert/strict";
import test from "node:test";
import puppeteer from "puppeteer";
import { downloadBrowser } from "./browser-setup.js";

test("automatic setup resolves the installed browser after running the installer", async (t) => {
  t.mock.method(puppeteer, "configuration", async () => ({}));
  let installed = false;
  t.mock.method(puppeteer, "executablePath", async () => {
    assert.ok(installed);
    return "/test/browser-cache/chrome";
  });
  assert.equal(await downloadBrowser(async () => { installed = true; }), "/test/browser-cache/chrome");
});

test("automatic setup respects disabled downloads", async (t) => {
  for (const configuration of [{ skipDownload: true }, { chrome: { skipDownload: true } }]) {
    t.mock.method(puppeteer, "configuration", async () => configuration);
    await assert.rejects(downloadBrowser(async () => {
      assert.fail("must not download when disabled");
    }), /automatic downloads are disabled/);
    t.mock.restoreAll();
  }
});

test("failed downloads explain retry", async (t) => {
  t.mock.method(puppeteer, "configuration", async () => ({}));
  await assert.rejects(downloadBrowser(async () => { throw new Error("Network unavailable"); }),
    /Automatic Chrome setup failed.*rerun mdmailer.*Network unavailable/);
});
