import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const exec = promisify(execFile);
const cli = fileURLToPath(new URL("./cli.ts", import.meta.url));
// Temporary workspaces need the repository's automatic JSX transform.
const env = { ...process.env, TSX_TSCONFIG_PATH: fileURLToPath(new URL("../tsconfig.json", import.meta.url)) };

test("CLI defaults to cwd and supports relative and absolute output folders", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "mdmailer-output-"));
  const run = (...args: string[]) => exec(process.execPath, ["--import", import.meta.resolve("tsx"), cli, ...args], { cwd, env });
  try {
    await run("init");
    await run("templates/news.md");
    await access(join(cwd, "news.html"));
    await access(join(cwd, "news.eml"));
    await assert.rejects(access(join(cwd, "templates/news.html")));
    await assert.rejects(access(join(cwd, "output")));

    await run("templates/", "--output", "nested/email exports");
    assert.equal((await readdir(join(cwd, "nested/email exports"))).length, 10);

    const absolute = join(cwd, "absolute exports");
    await run("generate", "--input", "templates/news.md", "--output", absolute);
    await access(join(absolute, "news.html"));
    await access(join(absolute, "news.eml"));

    await assert.rejects(run("templates/news.md", "--output"), /Missing value for --output/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("folder generation stops at invalid frontmatter and preserves earlier outputs", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "mdmailer-errors-"));
  const run = (...args: string[]) => exec(process.execPath, ["--import", import.meta.resolve("tsx"), cli, ...args], { cwd, env });
  try {
    await run("init");
    await mkdir(join(cwd, "batch"));
    const valid = "---\ntype: news\nlang: en\n---\nExample body\n";
    await writeFile(join(cwd, "batch/a.md"), valid);
    await writeFile(join(cwd, "batch/b.md"), "---\ntype: news\n---\nMissing language\n");
    await writeFile(join(cwd, "batch/c.md"), valid);
    await assert.rejects(run("batch/", "--output", "results"), /Missing required frontmatter field "lang"/);
    assert.deepEqual((await readdir(join(cwd, "results"))).sort(), ["a.eml", "a.html"]);
    await assert.rejects(run("templates/news.md", "--type", "event"), /Email type cannot be set from the CLI/);
    await assert.rejects(run("templates/news.md", "--theme", "unknown"), /Valid themes: classic, navy-gold, forest-cream/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
