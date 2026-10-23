import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { postProcessDocument, serializeDocument } from "./post-process.js";

// The Chrome-driven equivalent lives in the CLI's promotion.test.ts; this proves
// the same functions work on any DOM implementation.
test("postProcessDocument converts links to QR markers and bakes supplied image sizes (jsdom)", async () => {
  const { window } = new JSDOM(`<!DOCTYPE html><html lang="zh"><body>
    <h1>Title</h1><p>See https://example.com/a. And www.example.org.</p>
    <a href="https://example.com/a"><strong>Register</strong></a><a href="#local">Local</a>
    <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">
    <footer data-email-footer>Footer</footer></body></html>`);
  const doc = window.document;
  const { qrImages } = await postProcessDocument(doc, {
    qr: async (url) => `data:image/png;base64,${Buffer.from(url).toString("base64")}`,
    imageSizes: [{ width: 120.4, height: 60.2 }],
  });
  assert.equal(qrImages.length, 2);
  assert.equal(doc.querySelectorAll("[data-qr-url]").length, 2);
  assert.equal(doc.querySelector("[data-qr-section] p")?.textContent, "扫码了解更多");
  assert.equal(doc.querySelector("[data-email-footer]")?.previousElementSibling?.hasAttribute("data-qr-section"), true);
  assert.ok(doc.body.textContent?.includes("Local"));
  assert.doesNotMatch(doc.body.textContent ?? "", /https?:\/\/|www\./);
  const first = doc.querySelector("img:not([alt='QR code'])")!;
  assert.equal(first.getAttribute("width"), "120");
  assert.equal(first.getAttribute("height"), "60");
  assert.match(serializeDocument(doc), /^<!DOCTYPE html>/);
});
