import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import sharp from "sharp";

const exec = promisify(execFile);
const cli = fileURLToPath(new URL("./cli.ts", import.meta.url));
// Temporary workspaces need the repository's automatic JSX transform.
const env = { ...process.env, TSX_TSCONFIG_PATH: fileURLToPath(new URL("../tsconfig.json", import.meta.url)) };

test("CLI requires output and supports explicit current, relative and absolute folders", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "mdmailer-output-"));
  const run = (...args: string[]) => exec(process.execPath, ["--import", import.meta.resolve("tsx"), cli, ...args], { cwd, env });
  try {
    await run("init");
    await assert.rejects(run("templates/news.md"), /Required option --output/);
    await assert.rejects(access(join(cwd, "news.html")));
    await run("templates/news.md", "--output", ".");
    await access(join(cwd, "news.html"));
    await access(join(cwd, "news.eml"));
    const html = await readFile(join(cwd, "news.html"), "utf8");
    const eml = await readFile(join(cwd, "news.eml"), "utf8");
    assert.ok(html.indexOf("data-qr-section") < html.indexOf("data-email-footer"));
    assert.match(html, /alt="QR code"/);
    assert.match(eml, /src="cid:qr-/);
    assert.match(eml, /Content-ID: <qr-/);
    const screenshot = await sharp(join(cwd, "news.png")).metadata();
    assert.equal(screenshot.format, "png");
    assert.ok(screenshot.width! >= 1200);
    assert.ok(screenshot.height! > 1350, "includes the complete email instead of a fixed-height card");
    await assert.rejects(access(join(cwd, "templates/news.html")));
    await assert.rejects(access(join(cwd, "output")));

    await run("templates/", "--output", "nested/email exports");
    assert.equal((await readdir(join(cwd, "nested/email exports"))).length, 36);

    const absolute = join(cwd, "absolute exports");
    await run("generate", "--input", "templates/news.md", "--output", absolute);
    await access(join(absolute, "news.html"));
    await access(join(absolute, "news.eml"));
    await access(join(absolute, "news.png"));

    await assert.rejects(run("templates/news.md", "--output"), /Missing value for --output/);
    await assert.rejects(run("templates/news.md", "--output", "invalid", "--format", "pdf"), /Invalid --format/);
    await assert.rejects(access(join(cwd, "invalid")));

    for (const format of ["html", "eml", "png", "html,eml", "html,png", "eml,png"]) {
      const folder = `only-${format}`;
      const { stdout } = await run("templates/news.md", "--output", folder, "--format", format);
      assert.deepEqual((await readdir(join(cwd, folder))).sort(), format.split(",").map(ext => `news.${ext}`).sort());
      for (const ext of ["html", "eml", "png"]) {
        assert.equal(stdout.includes(`news.${ext}`), format.split(",").includes(ext));
      }
    }
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("config theme.preset is the fallback for frontmatter that omits theme, but explicit frontmatter and --theme still win", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "mdmailer-theme-preset-"));
  const run = (...args: string[]) => exec(process.execPath, ["--import", import.meta.resolve("tsx"), cli, ...args], { cwd, env });
  try {
    await run("init");
    const configPath = join(cwd, "mdmailer.config.json");
    const config = JSON.parse(await readFile(configPath, "utf8"));
    config.theme.preset = "navy-gold";
    await writeFile(configPath, JSON.stringify(config));

    await writeFile(join(cwd, "omitted.md"), "---\ntype: news\nlang: en\n---\nBody\n");
    await writeFile(join(cwd, "explicit.md"), "---\ntype: news\nlang: en\ntheme: classic\n---\nBody\n");

    await run("omitted.md", "--output", "out", "--format", "html");
    await run("explicit.md", "--output", "out", "--format", "html");
    await run("omitted.md", "--output", "out-flag", "--format", "html", "--theme", "forest-cream");

    assert.match(await readFile(join(cwd, "out/omitted.html"), "utf8"), /background-color:#14213D/);
    assert.match(await readFile(join(cwd, "out/explicit.html"), "utf8"), /background-color:#ffffff/);
    assert.match(await readFile(join(cwd, "out-flag/omitted.html"), "utf8"), /background-color:#173F35/);
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
    assert.deepEqual((await readdir(join(cwd, "results"))).sort(), ["a.eml", "a.html", "a.png"]);
    await assert.rejects(run("templates/news.md", "--type", "event"), /Email type cannot be set from the CLI/);
    await assert.rejects(run("templates/news.md", "--output", "results", "--theme", "unknown"), /Valid themes: classic, navy-gold, forest-cream/);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
