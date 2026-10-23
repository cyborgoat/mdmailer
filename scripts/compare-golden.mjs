#!/usr/bin/env node
// Regression guard for the core extraction: regenerates every starter template
// (default + one non-default theme) and diffs the normalized .html/.eml against
// stored golden files. Usage:
//   node scripts/compare-golden.mjs --update   # (re)write golden files
//   node scripts/compare-golden.mjs            # compare
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliRoot = join(root, "packages", "cli");
const goldenDir = join(root, "test", "golden");
const cli = process.env.MDMAILER_CLI ?? join(cliRoot, "dist", "cli.js");
const update = process.argv.includes("--update");
const variants = [{ name: "default", args: [] }, { name: "navy-gold", args: ["--theme", "navy-gold"] }];

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
// Random UUIDs become stable placeholders numbered by first appearance per file.
function normalize(text) {
  const seen = new Map();
  return text.replace(UUID, (id) => {
    if (!seen.has(id)) seen.set(id, `UUID${seen.size + 1}`);
    return seen.get(id);
  });
}

const work = mkdtempSync(join(tmpdir(), "mdmailer-golden-"));
const failures = [];
try {
  for (const variant of variants) {
    const out = join(work, variant.name);
    execFileSync("node", [cli, join(cliRoot, "templates"), "--output", out, "--format", "html,eml,png", ...variant.args],
      { cwd: cliRoot, stdio: ["ignore", "ignore", "inherit"] });
    for (const file of readdirSync(out)) {
      const path = join(out, file);
      if (file.endsWith(".png")) {
        if (statSync(path).size < 5000) failures.push(`${variant.name}/${file}: PNG missing or trivially small`);
        continue;
      }
      const actual = normalize(readFileSync(path, "utf8"));
      const goldenPath = join(goldenDir, variant.name, file);
      if (update) {
        mkdirSync(dirname(goldenPath), { recursive: true });
        writeFileSync(goldenPath, actual);
      } else if (!existsSync(goldenPath)) {
        failures.push(`${variant.name}/${file}: no golden file`);
      } else if (readFileSync(goldenPath, "utf8") !== actual) {
        failures.push(`${variant.name}/${file}: differs from golden`);
        writeFileSync(join(work, `${variant.name}-${file}.actual`), actual);
      }
    }
  }
  if (update) console.log(`Golden files written to ${goldenDir}`);
  else if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
  else console.log("Golden outputs match.");
} finally {
  if (!failures.length) rmSync(work, { recursive: true, force: true });
  else console.error(`Actual outputs kept in ${work}`);
}
