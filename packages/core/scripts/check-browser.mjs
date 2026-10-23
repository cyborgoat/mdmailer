// Fails if core can't be bundled for a browser: any node:* import, or sharp/puppeteer.
import { build } from "esbuild";

const result = await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "browser",
  format: "esm",
  write: false,
  metafile: true,
  logLevel: "silent",
  define: { "process.env.NODE_ENV": '"production"' },
  jsx: "automatic",
});
const inputs = Object.keys(result.metafile.inputs);
const bad = inputs.filter((p) => /node:|[\\/]node_modules[\\/](sharp|puppeteer)/.test(p));
if (bad.length) { console.error("Node-only modules in browser bundle:\n" + bad.join("\n")); process.exit(1); }
console.log(`Browser bundle OK: ${(result.outputFiles[0].contents.length / 1024).toFixed(0)} KB, ${inputs.length} modules.`);
