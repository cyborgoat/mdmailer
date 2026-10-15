import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { loadConfig } from "../config.js";
import { THEME_PRESET_NAMES, type ThemePresetName, type Config } from "../config-schema.js";
import { resolveGenerateInputs } from "../generate-input.js";
import { renderEmail } from "./generate.js";

export function parsePreviewArgs(argv: string[]) {
  const args = new Map<string, string>();
  let positionalOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!positionalOnly && arg === "--") { positionalOnly = true; continue; }
    if (!positionalOnly && arg.startsWith("-")) {
      const key = arg.slice(2);
      if (!arg.startsWith("--") || !["input", "config", "theme", "port"].includes(key)) {
        throw new Error(`Unknown preview option "${arg}". Run mdmailer --help for usage.`);
      }
      const value = argv[++i];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}.`);
      if (args.has(key)) throw new Error(`Specify ${arg} only once.`);
      args.set(key, value);
    } else {
      if (args.has("input")) throw new Error("Preview accepts one Markdown file only.");
      args.set("input", arg);
    }
  }
  const input = args.get("input");
  if (!input) throw new Error("Provide a Markdown file: mdmailer preview <file.md>.");
  const portText = args.get("port") ?? "3000";
  const port = Number(portText);
  if (!/^\d+$/.test(portText) || !Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("--port must be an integer from 0 to 65535 (0 chooses a free port).");
  }
  const theme = args.get("theme")?.trim().toLowerCase();
  if (theme !== undefined && !THEME_PRESET_NAMES.includes(theme as ThemePresetName)) {
    throw new Error(`Unknown theme "${theme}". Valid themes: ${THEME_PRESET_NAMES.join(", ")}`);
  }
  return { inputPath: resolve(input), configPath: args.get("config"), theme, port };
}

const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>mdmailer · Live preview</title><style>
*{box-sizing:border-box}body{margin:0;background:#eef0f3;color:#182033;font:14px system-ui,sans-serif}
header{padding:16px 24px;background:white;border-bottom:1px solid #d9dfe7;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
h1{font-size:17px;margin:0}#file{color:#536079;overflow-wrap:anywhere}nav{margin-left:auto;display:flex;gap:8px}
button{padding:7px 12px;border:1px solid #ccd3df;border-radius:6px;background:white;color:inherit;cursor:pointer}button[aria-pressed=true]{background:#182033;color:white}
#status{padding:12px 24px;color:#536079}#error{margin:0 24px 16px;padding:16px;background:#fff0ed;border:1px solid #e5b9b0;border-radius:6px;white-space:pre-wrap;overflow-wrap:anywhere}
iframe{display:block;border:0;margin:0 auto;background:white;width:100%;height:calc(100vh - 115px)}main{padding:0 16px 16px}
</style></head><body><header><h1>mdmailer</h1><span id="file"></span><nav aria-label="Preview width"><button aria-pressed="true" data-width="100%">Desktop</button><button aria-pressed="false" data-width="375px">Mobile</button></nav></header>
<div id="status" role="status">Connecting…</div><pre id="error" role="alert" hidden></pre><main><iframe title="Email preview" sandbox="" referrerpolicy="no-referrer"></iframe></main>
<script>
const frame=document.querySelector('iframe'),status=document.querySelector('#status'),error=document.querySelector('#error');
let version=-1;
document.querySelectorAll('[data-width]').forEach(button=>button.onclick=()=>{frame.style.width=button.dataset.width;frame.style.maxWidth='100%';document.querySelectorAll('[data-width]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
async function poll(){try{const response=await fetch('/state?version='+version,{cache:'no-store'});if(!response.ok)throw new Error('Connection failed');const state=await response.json();document.querySelector('#file').textContent=state.file;status.textContent=state.updating?'Rendering…':state.error?'Fix the error and save to retry. Last successful preview is shown.':'Live · Save your Markdown or config to update';error.hidden=!state.error;error.textContent=state.error||'';if(state.html!==undefined){frame.srcdoc=state.html;version=state.version;}}catch{status.textContent='Disconnected · Reconnecting…';}setTimeout(poll,500);}poll();
</script></body></html>`;

interface PreviewOptions {
  inputPath: string;
  configPath?: string;
  theme?: string;
  port: number;
  intervalMs?: number;
  render?: (markdown: string, config: Config, theme?: string) => Promise<{ html: string }>;
}

/** Keep rendering serial so slow image/browser work cannot overwrite newer edits. */
export async function startPreview(options: PreviewOptions) {
  const files = await resolveGenerateInputs(options.inputPath);
  if (files.length !== 1 || files[0] !== options.inputPath) throw new Error("Preview accepts one Markdown file, not a folder.");
  const state = { file: options.inputPath, version: 0, html: "", error: "", updating: true };
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let previous = "";
  const render = options.render ?? renderEmail;
  let pending: Promise<void>;
  const update = async () => {
    try {
      const markdown = await readFile(options.inputPath, "utf8");
      const config = await loadConfig(options.configPath);
      const fingerprint = JSON.stringify([markdown, config]);
      if (fingerprint !== previous) {
        state.updating = true;
        const result = await render(markdown, config, options.theme);
        state.html = result.html;
        state.version++;
        state.error = "";
        previous = fingerprint;
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error);
      // Retry even if a broken/missing file is restored to its previous contents.
      previous = "";
    } finally {
      state.updating = false;
      if (!stopped) timer = setTimeout(() => { pending = update(); }, options.intervalMs ?? 400);
    }
  };
  const server = createServer((request, response) => {
    const address = server.address();
    if (!address || typeof address === "string" || request.headers.host !== `127.0.0.1:${address.port}`) {
      response.writeHead(403).end(); return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    if (request.method !== "GET") { response.writeHead(405).end(); return; }
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    if (url.pathname === "/") {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(PAGE);
    } else if (url.pathname === "/state") {
      const { html, ...metadata } = state;
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify({
        ...metadata, ...(url.searchParams.get("version") !== String(state.version) ? { html } : {}),
      }));
    } else { response.writeHead(404).end(); }
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, "127.0.0.1", () => { server.off("error", reject); resolve(); });
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not start preview server.");
  pending = update();
  return {
    url: `http://127.0.0.1:${address.port}`,
    async close() {
      stopped = true;
      clearTimeout(timer);
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      await pending;
    },
  };
}

export async function runPreview(argv: string[]) {
  const preview = await startPreview(parsePreviewArgs(argv));
  console.log(`Live email preview: ${preview.url}\nOpen this URL in your browser, then edit and save your Markdown.\nPress Ctrl+C to stop.`);
  const stop = () => {
    process.off("SIGINT", stop);
    process.off("SIGTERM", stop);
    void preview.close().catch(error => { console.error(error); process.exitCode = 1; });
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}
