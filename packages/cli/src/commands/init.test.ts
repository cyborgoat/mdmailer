import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";
import { runInit, slugify } from "./init.js";

test("slugify normalizes free-form names into safe folder names", () => {
  assert.equal(slugify("My Email Project"), "my-email-project");
  assert.equal(slugify("  Spaces   Everywhere  "), "spaces-everywhere");
  assert.equal(slugify("Weird!!Chars??"), "weird-chars");
  assert.equal(slugify("--already--slug--"), "already-slug");
  assert.equal(slugify(""), "mdmailer-project");
  assert.equal(slugify("!!!"), "mdmailer-project");
});

function fakeTerminal() {
  const input = Object.assign(new PassThrough(), { isTTY: true as const });
  const output = Object.assign(new PassThrough(), { isTTY: true as const });
  let buffer = "";
  output.on("data", (chunk) => {
    buffer += chunk.toString();
  });
  return { input, output, text: () => buffer };
}

async function waitFor(getText: () => string, pattern: RegExp, timeoutMs = 5000) {
  const start = Date.now();
  while (!pattern.test(getText())) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for ${pattern} in:\n${getText()}`);
    }
    await new Promise((resolve) => setImmediate(resolve));
  }
}

test("interactive init prompts for a project name and default theme, then scaffolds a subfolder", async () => {
  const originalCwd = process.cwd();
  const root = await mkdtemp(join(tmpdir(), "mdmailer-init-"));
  process.chdir(root);
  try {
    const term = fakeTerminal();
    const done = runInit([], term);
    await waitFor(term.text, /Project name/);
    term.input.write("My Email Project\n");
    await waitFor(term.text, /Choose a default theme/);
    term.input.write("2\n"); // navy-gold
    await done;

    assert.deepEqual(await readdir(root), ["my-email-project"]);
    const projectDir = join(root, "my-email-project");
    const config = JSON.parse(await readFile(join(projectDir, "mdmailer.config.json"), "utf8"));
    assert.equal(config.theme.preset, "navy-gold");
    assert.equal(config.organization.name, "Your Organization");
    await readFile(join(projectDir, "SKILL.md"), "utf8");
    await readFile(join(projectDir, "assets/logo.svg"), "utf8");
    assert.ok((await readdir(join(projectDir, "templates"))).length === 12);
    assert.ok((await readdir(join(projectDir, "assets/images/hosts"))).length === 5);
  } finally {
    process.chdir(originalCwd);
    await rm(root, { recursive: true, force: true });
  }
});

test("interactive init defaults blank answers to the cwd name and classic theme", async () => {
  const originalCwd = process.cwd();
  const root = await mkdtemp(join(tmpdir(), "mdmailer-init-"));
  process.chdir(root);
  try {
    const term = fakeTerminal();
    const done = runInit([], term);
    await waitFor(term.text, /Project name/);
    term.input.write("\n");
    await waitFor(term.text, /Choose a default theme/);
    term.input.write("\n");
    await done;

    const slug = slugify(basename(root));
    const config = JSON.parse(await readFile(join(root, slug, "mdmailer.config.json"), "utf8"));
    assert.equal(config.theme.preset, "classic");
  } finally {
    process.chdir(originalCwd);
    await rm(root, { recursive: true, force: true });
  }
});

test("interactive init reprompts on an invalid theme choice", async () => {
  const originalCwd = process.cwd();
  const root = await mkdtemp(join(tmpdir(), "mdmailer-init-"));
  process.chdir(root);
  try {
    const term = fakeTerminal();
    const done = runInit([], term);
    await waitFor(term.text, /Project name/);
    term.input.write("Project\n");
    await waitFor(term.text, /Choose a default theme/);
    term.input.write("nonsense\n");
    await waitFor(term.text, /Please enter a number/);
    term.input.write("forest-cream\n");
    await done;

    const config = JSON.parse(await readFile(join(root, "project", "mdmailer.config.json"), "utf8"));
    assert.equal(config.theme.preset, "forest-cream");
  } finally {
    process.chdir(originalCwd);
    await rm(root, { recursive: true, force: true });
  }
});

test("re-running interactive init against the same project name preserves user edits", async () => {
  const originalCwd = process.cwd();
  const root = await mkdtemp(join(tmpdir(), "mdmailer-init-"));
  process.chdir(root);
  try {
    const first = fakeTerminal();
    const firstDone = runInit([], first);
    await waitFor(first.text, /Project name/);
    first.input.write("project\n");
    await waitFor(first.text, /Choose a default theme/);
    first.input.write("1\n");
    await firstDone;

    const skillPath = join(root, "project", "SKILL.md");
    await writeFile(skillPath, "User workspace instructions");

    const second = fakeTerminal();
    const secondDone = runInit([], second);
    await waitFor(second.text, /Project name/);
    second.input.write("project\n");
    await waitFor(second.text, /Choose a default theme/);
    second.input.write("2\n"); // different theme, but config.json already exists and is skipped
    await secondDone;

    assert.equal(await readFile(skillPath, "utf8"), "User workspace instructions");
    const config = JSON.parse(await readFile(join(root, "project", "mdmailer.config.json"), "utf8"));
    assert.equal(config.theme.preset, "classic", "existing config.json is preserved, not overwritten");
  } finally {
    process.chdir(originalCwd);
    await rm(root, { recursive: true, force: true });
  }
});
