import assert from "node:assert/strict";
import test from "node:test";
import { resolveLocale } from "./index.js";

test("locale resolution accepts the two supported languages and aliases", () => {
  assert.equal(resolveLocale("en"), "en");
  assert.equal(resolveLocale("English"), "en");
  assert.equal(resolveLocale("zh"), "zh");
  assert.equal(resolveLocale("zh-Hans"), "zh");
  assert.equal(resolveLocale("Chinese"), "zh");
});

test("locale resolution rejects missing and unsupported values", () => {
  assert.equal(resolveLocale(undefined), null);
  assert.equal(resolveLocale(""), null);
  assert.equal(resolveLocale("fr"), null);
});
