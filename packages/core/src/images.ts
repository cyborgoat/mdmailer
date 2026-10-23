import type { Brand } from "./config-schema.js";
import { randomUUID, toBase64 } from "./bytes.js";
import { fmString } from "./frontmatter.js";

/** Raw image bytes plus their MIME type. */
export interface ImageData {
  bytes: Uint8Array;
  mime: string;
}

/**
 * Injected image I/O. Core never touches the filesystem, `sharp`, or canvas;
 * the host environment supplies whatever it has (Node: fs + sharp, browser:
 * fetch + canvas).
 */
export interface ImageIO {
  /** Load bytes for a non-remote image ref (path, key, file id… the consumer decides). */
  read(ref: string): Promise<ImageData>;
  /**
   * Rasterize an SVG to PNG, optionally scaled to a target height, and report
   * the resulting size. Required whenever a ref resolves to `image/svg+xml`.
   */
  rasterize?(img: ImageData, opts: { height?: number }): Promise<ImageData & { width: number; height: number }>;
  /** Measure a raster image. Without it, embedded raster images report 0×0. */
  measure?(img: ImageData): Promise<{ width: number; height: number }>;
}

export interface EmbeddedImage {
  cid: string;
  mime: string;
  bytes: Uint8Array;
  dataUri: string;
  /** Pixel dimensions of the embedded raster — post-rasterize/resize for SVGs. */
  width: number;
  height: number;
}

const RASTER_MIMES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

export function isRemoteRef(ref: string): boolean {
  return ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:");
}

/**
 * Loads a local image through `io` and returns it as both a data URI (for the
 * .html preview, which browsers render fine) and raw bytes (for the .eml,
 * where it needs to travel as a proper Content-ID attachment — Outlook doesn't
 * render `data:` URIs in <img src>). SVGs are rasterized to PNG first, since
 * most email clients don't render inline SVG.
 */
export async function embedImage(ref: string, io: ImageIO, opts: { resizeHeight?: number } = {}): Promise<EmbeddedImage> {
  const cid = `img-${randomUUID()}`;
  const source = await io.read(ref);

  if (source.mime === "image/svg+xml") {
    if (!io.rasterize) {
      throw new Error(`Cannot embed SVG image "${ref}": the ImageIO provided no rasterize() to convert it to PNG.`);
    }
    const { bytes, mime, width, height } = await io.rasterize(source, { height: opts.resizeHeight });
    return { cid, mime, bytes, dataUri: `data:${mime};base64,${toBase64(bytes)}`, width, height };
  }

  if (!RASTER_MIMES.has(source.mime)) {
    throw new Error(`Unsupported image type "${source.mime}" for "${ref}". Use SVG, PNG, JPEG, GIF, or WebP.`);
  }
  const { width, height } = (await io.measure?.(source)) ?? { width: 0, height: 0 };
  return { cid, mime: source.mime, bytes: source.bytes, dataUri: `data:${source.mime};base64,${toBase64(source.bytes)}`, width, height };
}

// ─── Markdown body images ────────────────────────────────────────────────────

const MARKDOWN_IMAGE = /!\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g;

export interface ResolvedContentImages {
  markdown: string;
  attachments: EmbeddedImage[];
}

/**
 * Local images referenced in the body Markdown (`![alt](assets/images/foo.jpg)`)
 * get embedded the same way the org logo does: a data URI for the .html preview,
 * plus bytes the EML builder can attach as a CID part. Remote `http(s)://`
 * image URLs pass through unchanged.
 */
export async function resolveContentImages(markdown: string, io: ImageIO): Promise<ResolvedContentImages> {
  const attachments: EmbeddedImage[] = [];
  let result = markdown;

  for (const [full, alt, src, title = ""] of markdown.matchAll(MARKDOWN_IMAGE)) {
    if (isRemoteRef(src)) continue;

    const embedded = await embedImage(src, io);
    attachments.push(embedded);
    result = result.replace(full, `![${alt}](${embedded.dataUri}${title})`);
  }

  return { markdown: result, attachments };
}

// ─── Hosts / speakers ────────────────────────────────────────────────────────

export interface HostProfile {
  name: string;
  /** Resolved photo URL: remote https://… or embedded data: URI. */
  photoUrl?: string;
  bio?: string;
  role?: string;
}

export interface ResolvedHosts {
  /** Rich profiles when frontmatter supplies objects (photo/bio). */
  profiles: HostProfile[];
  attachments: EmbeddedImage[];
}

/**
 * Parses `hosts` / `speakers` frontmatter as either plain strings or
 * `{ name, photo, bio, role }` maps. Local photo paths are embedded like
 * content images (data URI + CID bytes).
 */
export async function resolveHosts(raw: unknown, io: ImageIO): Promise<ResolvedHosts> {
  if (raw == null) {
    return { profiles: [], attachments: [] };
  }

  const items = Array.isArray(raw) ? raw : [raw];
  const profiles: HostProfile[] = [];
  const attachments: EmbeddedImage[] = [];

  for (const item of items) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      const name = fmString(record.name ?? record.host ?? record.speaker);
      if (!name) continue;

      let photoUrl = fmString(record.photo ?? record.image ?? record.avatar);
      const bio = fmString(record.bio ?? record.intro ?? record.about);
      const role = fmString(record.role ?? record.title);

      if (photoUrl && !isRemoteRef(photoUrl)) {
        const embedded = await embedImage(photoUrl, io, { resizeHeight: 160 });
        attachments.push(embedded);
        photoUrl = embedded.dataUri;
      }

      profiles.push({ name, photoUrl, bio, role });
      continue;
    }

    const name = fmString(item);
    if (name) {
      profiles.push({ name });
    }
  }

  return { profiles, attachments };
}

// ─── Brand logo ──────────────────────────────────────────────────────────────

export type LogoAttachment = Pick<EmbeddedImage, "cid" | "mime" | "bytes">;

/**
 * Brand config with the logo's intrinsic aspect ratio filled in. For local
 * logos this is measured off the rasterized PNG so the email header can size
 * the <img> box to the real art; for remote logos the bytes are never fetched,
 * so it stays undefined and the header falls back to a default ratio.
 */
export type ResolvedOrganization = Brand & {
  logoAspectRatio?: number;
};

export interface ResolvedBrand {
  brand: ResolvedOrganization;
  // Set only for local logo files, which get embedded as a data URI in the HTML
  // preview but need to be a proper CID attachment in the .eml — Outlook doesn't
  // render `data:` URIs in <img src>, only remote URLs and CID-referenced parts.
  logoAttachment?: LogoAttachment;
}

export async function resolveBrandLogo(brand: Brand, io: ImageIO): Promise<ResolvedBrand> {
  if (isRemoteRef(brand.logoUrl)) {
    return { brand };
  }

  const embedded = await embedImage(brand.logoUrl, io, { resizeHeight: 500 });
  const logoAspectRatio = embedded.height > 0 ? embedded.width / embedded.height : undefined;
  return {
    brand: { ...brand, logoUrl: embedded.dataUri, logoAspectRatio },
    logoAttachment: embedded,
  };
}
