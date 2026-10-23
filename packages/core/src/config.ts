import { configSchema, type Config } from "./config-schema.js";

/** Validate untrusted JSON (already `JSON.parse`d) against the config schema. No I/O. */
export function parseConfig(json: unknown): Config {
  return configSchema.parse(json);
}
