import { readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const OPTIONS = new Set(["input", "output", "format", "config", "theme", "template", "type", "lang", "locale", "language"]);
export type OutputFormat = "html" | "eml" | "png";

export function parseOutputFormats(value = "html,eml,png"): Set<OutputFormat> {
  const formats = value.split(",").map(format => format.trim().toLowerCase().replace(/^\./, ""));
  if (formats.some(format => !["html", "eml", "png"].includes(format))) {
    throw new Error("Invalid --format. Choose html, eml, png, or a comma-separated combination (for example: html,png).");
  }
  return new Set(formats as OutputFormat[]);
}

export function parseGenerateArgs(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  let positionalOnly = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!positionalOnly && arg === "--") {
      positionalOnly = true;
      continue;
    }
    if (!positionalOnly && arg.startsWith("-")) {
      const key = arg.slice(2);
      if (!arg.startsWith("--") || !OPTIONS.has(key)) {
        throw new Error(`Unknown option "${arg}". Run mdmailer --help for usage.`);
      }
      const value = argv[++i];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}.`);
      }
      if (args.has(key)) throw new Error(`Specify ${arg} only once.`);
      args.set(key, value);
    } else {
      if (args.has("input")) throw new Error("Specify one Markdown file or folder only.");
      args.set("input", arg);
    }
  }
  return args;
}

export async function resolveGenerateInputs(input: string): Promise<string[]> {
  let info;
  try {
    info = await stat(input);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Input "${input}" does not exist. Provide a Markdown file or folder.`);
    }
    throw error;
  }
  if (info.isDirectory()) {
    const entries = await readdir(input, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".md")
      .map((entry) => join(input, entry.name))
      .sort();
    if (!files.length) throw new Error(`No Markdown (.md) files found in "${input}".`);
    return files;
  }
  if (!info.isFile() || extname(input).toLowerCase() !== ".md") {
    throw new Error(`Input "${input}" must be a Markdown (.md) file or folder.`);
  }
  return [input];
}
