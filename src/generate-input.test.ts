import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { parseGenerateArgs, resolveGenerateInputs } from "./generate-input.js";

test("positional input and legacy --input produce the same options", () => {
  assert.deepEqual(
    parseGenerateArgs(["content/example.md", "--theme", "navy-gold"]),
    parseGenerateArgs(["--input", "content/example.md", "--theme", "navy-gold"]),
  );
  assert.equal(parseGenerateArgs(["--config", "custom.json", "content/"]).get("input"), "content/");
  assert.equal(parseGenerateArgs(["--", "--example.md"]).get("input"), "--example.md");
});

test("invalid options and ambiguous inputs fail clearly", () => {
  for (const argv of [["a.md", "b.md"], ["a.md", "--input", "b.md"], ["--input", "a.md", "b.md"]]) {
    assert.throws(() => parseGenerateArgs(argv), /only/);
  }
  assert.throws(() => parseGenerateArgs(["a.md", "--theme"]), /Missing value/);
  assert.throws(() => parseGenerateArgs(["--input", "--theme", "classic"]), /Missing value/);
  assert.throws(() => parseGenerateArgs(["a.md", "--typo", "classic"]), /Unknown option/);
});

test("folder inputs include only immediate Markdown files in sorted order", async () => {
  const dir = await mkdtemp(join(tmpdir(), "mdmailer-input-"));
  try {
    await mkdir(join(dir, "nested"));
    await writeFile(join(dir, "nested", "hidden.md"), "nested");
    await writeFile(join(dir, "b.md"), "b");
    await writeFile(join(dir, "a.MD"), "a");
    await writeFile(join(dir, "notes.txt"), "notes");
    assert.deepEqual(await resolveGenerateInputs(dir), [join(dir, "a.MD"), join(dir, "b.md")]);
    assert.deepEqual(await resolveGenerateInputs(join(dir, "b.md")), [join(dir, "b.md")]);
    await assert.rejects(resolveGenerateInputs(join(dir, "notes.txt")), /must be a Markdown/);
    await assert.rejects(resolveGenerateInputs(join(dir, "missing.md")), /does not exist/);
    await mkdir(join(dir, "empty"));
    await assert.rejects(resolveGenerateInputs(join(dir, "empty")), /No Markdown/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
