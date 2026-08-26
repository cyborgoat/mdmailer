import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import sharp from "sharp";

const RASTER_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export interface EmbeddedImage {
  cid: string;
  mime: string;
  buffer: Buffer;
  dataUri: string;
}

export function isRemoteRef(ref: string): boolean {
  return ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:");
}

/**
 * Reads a local image file and returns it as both a data URI (for the .html
 * preview, which browsers render fine) and a raw buffer (for the .eml, where
 * it needs to travel as a proper Content-ID attachment — Outlook doesn't
 * render `data:` URIs in <img src>). SVGs are rasterized to PNG first, since
 * most email clients don't render inline SVG.
 */
export async function embedLocalImage(ref: string, opts: { resizeHeight?: number } = {}): Promise<EmbeddedImage> {
  const absolutePath = resolve(ref);
  const ext = extname(absolutePath).toLowerCase();
  const cid = `img-${randomUUID()}`;

  if (ext === ".svg") {
    let pipeline = sharp(absolutePath, { density: 300 });
    if (opts.resizeHeight) {
      pipeline = pipeline.resize({ height: opts.resizeHeight });
    }
    const buffer = await pipeline.png().toBuffer();
    const mime = "image/png";
    return { cid, mime, buffer, dataUri: `data:${mime};base64,${buffer.toString("base64")}` };
  }

  const mime = RASTER_MIME[ext];
  if (!mime) {
    throw new Error(`Unsupported image file type "${ext}" for "${ref}". Use .svg, .png, .jpg, .gif, or .webp.`);
  }

  const buffer = await readFile(absolutePath);
  return { cid, mime, buffer, dataUri: `data:${mime};base64,${buffer.toString("base64")}` };
}
