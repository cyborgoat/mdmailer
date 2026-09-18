import { readFile, stat } from "node:fs/promises";
import os from "node:os";
import { dirname, join, resolve } from "node:path";
import { configSchema, type Config } from "./config-schema.js";
import { isRemoteRef } from "./embed-image.js";

export function globalConfigPath(): string {
  return join(os.homedir(), ".mdmailer", "mdmailer.config.json");
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export async function loadConfig(explicitPath?: string): Promise<Config> {
  let path: string;
  if (explicitPath !== undefined) {
    path = resolve(explicitPath);
  } else {
    const local = resolve("mdmailer.config.json");
    const global = globalConfigPath();
    if (await exists(local)) path = local;
    else if (await exists(global)) path = global;
    else throw new Error("No configuration found. Run mdmailer init for this workspace or mdmailer init --global for user-wide branding.");
  }

  try {
    const config = configSchema.parse(JSON.parse(await readFile(path, "utf8")));
    const logoPath = (value: string) => isRemoteRef(value) ? value : resolve(dirname(path), value);
    return {
      ...config,
      organization: {
        ...config.organization,
        logoUrl: logoPath(config.organization.logoUrl),
        ...(config.organization.logoUrlOnDark ? { logoUrlOnDark: logoPath(config.organization.logoUrlOnDark) } : {}),
      },
    };
  } catch (error) {
    throw new Error(`Cannot load configuration "${path}": ${error instanceof Error ? error.message : String(error)}`);
  }
}
