import assert from "node:assert/strict";
import test from "node:test";
import puppeteer from "puppeteer";
import { browserExecutable } from "./screenshot.js";
import { replaceLinksWithQr } from "./promotion.js";

test("PNG transformation preserves full content and converts links and bare URLs to QR images", async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: await browserExecutable() });
  try {
    const page = await browser.newPage();
    await page.setContent(`<html><body>
      <h1>Full title</h1><p>Opening paragraph.</p>
      <a href="https://example.com/register?a=1&amp;b=2"><strong>Register here</strong></a>
      <p>Visit https://example.com/details. Also (https://example.com/info).</p>
      <a href="https://example.com/register?a=1&amp;b=2">https://example.com/register?a=1&amp;b=2</a>
      <table><tr><td>Complete agenda</td></tr></table><pre>npm install example</pre>
      <p>www.example.com</p><a href="mailto:team@example.com">Contact us</a>
      <a href="#details">Internal reference</a><footer data-email-footer>Final footer text</footer>
      </body></html>`);
    await replaceLinksWithQr(page);
    const result = await page.evaluate(() => ({
      text: document.body.innerText,
      strong: document.querySelector("strong")?.textContent,
      table: document.querySelector("td")?.textContent,
      beforeFooter: document.querySelector("[data-email-footer]")?.previousElementSibling?.hasAttribute("data-qr-section"),
      clickable: document.querySelector('a[href="https://example.com/register?a=1&b=2"]')?.textContent,
      inlineCodes: document.querySelectorAll("body > :not([data-qr-section]) [data-qr-url]").length,
      codes: Array.from(document.querySelectorAll<HTMLElement>("[data-qr-url]"), node => ({
        url: node.dataset.qrUrl, src: node.querySelector("img")?.src,
      })),
    }));
    assert.match(result.text, /Opening paragraph/);
    assert.match(result.text, /Final footer text/);
    assert.match(result.text, /npm install example/);
    assert.match(result.text, /Internal reference/);
    assert.doesNotMatch(result.text, /https?:\/\/|www\./);
    assert.equal(result.strong, "Register here");
    assert.equal(result.table, "Complete agenda");
    assert.equal(result.beforeFooter, true);
    assert.match(result.clickable ?? "", /Register here/);
    assert.equal(result.inlineCodes, 0);
    assert.equal(result.codes.length, 5);
    assert.ok(result.codes.every(code => code.src?.startsWith("data:image/png;base64,")));
    assert.ok(result.codes.some(code => code.url === "https://example.com/info"));
    assert.ok(result.codes.some(code => code.url === "mailto:team@example.com"));
    const repeated = result.codes.filter(code => code.url === "https://example.com/register?a=1&b=2");
    assert.equal(repeated.length, 1);
  } finally {
    await browser.close();
  }
});
