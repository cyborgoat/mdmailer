import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import sharp from "sharp";
import type { ImageIO } from "@goatcheese/mdmailer-core";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

/** Filesystem + sharp image I/O for the Node CLI. */
export const nodeImageIO: ImageIO = {
  async read(ref) {
    const absolutePath = resolve(ref);
    const ext = extname(absolutePath).toLowerCase();
    const mime = MIME_BY_EXTENSION[ext];
    if (!mime) {
      throw new Error(`Unsupported image file type "${ext}" for "${ref}". Use .svg, .png, .jpg, .gif, or .webp.`);
    }
    return { bytes: await readFile(absolutePath), mime };
  },

  // SVGs are rasterized at density 300, then optionally scaled to a height.
  async rasterize({ bytes }, { height }) {
    let pipeline = sharp(bytes, { density: 300 });
    if (height) pipeline = pipeline.resize({ height });
    const { data, info } = await pipeline.png().toBuffer({ resolveWithObject: true });
    return { bytes: data, mime: "image/png", width: info.width, height: info.height };
  },

  async measure({ bytes }) {
    const { width = 0, height = 0 } = await sharp(bytes).metadata();
    return { width, height };
  },
};
