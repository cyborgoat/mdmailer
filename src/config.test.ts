import assert from "node:assert/strict";
import { access, copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { globalConfigPath, loadConfig } from "./config.js";
import { runInit } from "./commands/init.js";
import { runGenerate } from "./commands/generate.js";

// This test process uses a temporary cwd and mocked home, never the real user config.
test("global setup, config precedence, relative logos, and synchronized starters", async (t) => {
  const originalCwd = process.cwd();
  const root = await mkdtemp(join(os.tmpdir(), "mdmailer-config-"));
  const home = join(root, "user");
  const workspace = join(root, "workspace");
  await mkdir(workspace);
  const homeMock = t.mock.method(os, "homedir", () => home);
  process.chdir(workspace);
  try {
    await assert.rejects(loadConfig(), /mdmailer init --global/);
    await runInit(["--global"]);
    assert.deepEqual(await readdir(workspace), []);
    const globalPath = globalConfigPath();
    const bundledSkill = await readFile(fileURLToPath(new URL("../SKILL.md", import.meta.url)), "utf8");
    assert.equal(await readFile(join(dirname(globalPath), "SKILL.md"), "utf8"), bundledSkill);
    await writeFile(join(dirname(globalPath), "SKILL.md"), "User global instructions");
    assert.equal(globalPath, join(home, ".mdmailer/mdmailer.config.json"));
    const global = JSON.parse(await readFile(globalPath, "utf8"));
    global.organization.name = "Global brand";
    global.organization.logoUrlOnDark = "assets/dark.svg";
    await copyFile(join(dirname(globalPath), "assets/logo.svg"), join(dirname(globalPath), "assets/dark.svg"));
    await writeFile(globalPath, JSON.stringify(global));
    await runInit(["--global"]);
    assert.equal(JSON.parse(await readFile(globalPath, "utf8")).organization.name, "Global brand");
    assert.equal(await readFile(join(dirname(globalPath), "SKILL.md"), "utf8"), "User global instructions");
    const resolved = await loadConfig();
    assert.equal(resolved.organization.logoUrl, join(dirname(globalPath), "assets/logo.svg"));
    assert.equal(resolved.organization.logoUrlOnDark, join(dirname(globalPath), "assets/dark.svg"));

    await writeFile("email.md", "---\ntype: news\nlang: en\ntheme: navy-gold\n---\nHello\n");
    await runGenerate(["email.md"]);
    assert.match(await readFile("email.html", "utf8"), /Global brand/);
    await access("email.eml");
    await runInit();
    assert.equal((await loadConfig()).organization.name, "Your Organization");
    assert.equal(await readFile("SKILL.md", "utf8"), bundledSkill);
    await writeFile("SKILL.md", "User workspace instructions");
    await runInit();
    assert.equal(await readFile("SKILL.md", "utf8"), "User workspace instructions");
    const templates = fileURLToPath(new URL("../templates/", import.meta.url));
    assert.deepEqual((await readdir("templates")).sort(), (await readdir(templates)).sort());
    for (const name of await readdir(templates)) {
      assert.equal(await readFile(join("templates", name), "utf8"), await readFile(join(templates, name), "utf8"));
    }
    await runGenerate(["templates/", "--output", "local-output"]);
    await rm("mdmailer.config.json");
    await runGenerate(["templates/", "--output", "global-output"]);
    assert.equal((await readdir("global-output")).length, 12);

    const explicit = join(root, "explicit.json");
    global.organization.logoUrl = "https://example.com/logo.png";
    global.organization.logoUrlOnDark = join(root, "absolute.svg");
    await writeFile(explicit, JSON.stringify(global));
    await writeFile("mdmailer.config.json", "invalid JSON");
    assert.equal((await loadConfig(explicit)).organization.logoUrl, "https://example.com/logo.png");
    assert.equal((await loadConfig(explicit)).organization.logoUrlOnDark, join(root, "absolute.svg"));
    await assert.rejects(loadConfig(), /Cannot load configuration/);
    await assert.rejects(loadConfig("missing.json"), /missing.json/);
    await rm("mdmailer.config.json");
    await mkdir("mdmailer.config.json");
    await assert.rejects(loadConfig(), /Cannot load configuration/);
    await rm("mdmailer.config.json", { recursive: true });
    await writeFile(globalPath, "{}");
    await assert.rejects(loadConfig(), /Cannot load configuration/);
    await assert.rejects(runInit(["--bad"]), /Usage/);
  } finally {
    process.chdir(originalCwd);
    homeMock.mock.restore();
    await rm(root, { recursive: true, force: true });
  }
});
