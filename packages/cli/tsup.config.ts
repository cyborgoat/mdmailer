import { copyFile, mkdir } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node24",
  clean: true,
  // Core is bundled in (resolved from source via tsconfig paths); its third-party
  // dependencies stay external and are declared in this package.
  noExternal: ["@goatcheese/mdmailer-core"],
  banner: { js: "#!/usr/bin/env node" },
  async onSuccess() {
    const skillDir = new URL("./dist/skills/mdmailer/", import.meta.url);
    await mkdir(skillDir, { recursive: true });
    await copyFile(new URL("../../SKILL.md", import.meta.url), new URL("SKILL.md", skillDir));
  },
});
