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
});
