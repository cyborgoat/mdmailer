import { randomUUID } from "node:crypto";
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

export interface LogoAttachment {
  cid: string;
  mime: string;
  buffer: Buffer;
}

export interface ResolvedBrand {
  brand: Brand;
  // Set only for local logo files, which get embedded as a data URI in the HTML
  // preview but need to be a proper CID attachment in the .eml — Outlook doesn't
  // render `data:` URIs in <img src>, only remote URLs and CID-referenced parts.
  logoAttachment?: LogoAttachment;
}

function isRemote(ref: string): boolean {
  return ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:");
}

/**
 * Most email clients (Outlook, many webmail clients) don't render <img src="*.svg">
 * reliably, so local SVGs are rasterized to PNG. Local raster files and hosted
 * URLs pass through unchanged (hosted URLs stay as-is; local rasters are inlined
 * as data URIs so no hosting is required).
 */
async function resolveLogoSrc(ref: string): Promise<{ src: string; attachment?: LogoAttachment }> {
  if (isRemote(ref)) {
    return { src: ref };
  }

  const absolutePath = resolve(ref);
  const ext = extname(absolutePath).toLowerCase();
  const cid = `logo-${randomUUID()}`;

  if (ext === ".svg") {
    const buffer = await sharp(absolutePath, { density: 300 }).resize({ height: 500 }).png().toBuffer();
    const mime = "image/png";
    return { src: `data:${mime};base64,${buffer.toString("base64")}`, attachment: { cid, mime, buffer } };
  }

  const mime = RASTER_MIME[ext];
  if (!mime) {
    throw new Error(`Unsupported logo file type "${ext}" for "${ref}". Use .svg, .png, .jpg, .gif, or .webp.`);
  }

  const buffer = await readFile(absolutePath);
  return { src: `data:${mime};base64,${buffer.toString("base64")}`, attachment: { cid, mime, buffer } };
}

export async function resolveBrandLogo(brand: Brand): Promise<ResolvedBrand> {
  const { src, attachment } = await resolveLogoSrc(brand.logoUrl);
  return { brand: { ...brand, logoUrl: src }, logoAttachment: attachment };
}
