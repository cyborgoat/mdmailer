import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import sharp from "sharp";
import type { Brand } from "./config-schema.js";

const RASTER_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

function isRemote(ref: string): boolean {
  return ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:");
}

/**
 * Most email clients (Outlook, many webmail clients) don't render <img src="*.svg">
 * reliably, so local SVGs are rasterized to PNG. Local raster files and hosted
 * URLs pass through unchanged (hosted URLs stay as-is; local rasters are inlined
 * as data URIs so no hosting is required).
 */
async function resolveLogoSrc(ref: string): Promise<string> {
  if (isRemote(ref)) {
    return ref;
  }

  const absolutePath = resolve(ref);
  const ext = extname(absolutePath).toLowerCase();

  if (ext === ".svg") {
    const png = await sharp(absolutePath, { density: 300 }).resize({ height: 500 }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  }

  const mime = RASTER_MIME[ext];
  if (!mime) {
    throw new Error(`Unsupported logo file type "${ext}" for "${ref}". Use .svg, .png, .jpg, .gif, or .webp.`);
  }

  const buffer = await readFile(absolutePath);
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function resolveBrandLogo(brand: Brand): Promise<Brand> {
  return { ...brand, logoUrl: await resolveLogoSrc(brand.logoUrl) };
}
