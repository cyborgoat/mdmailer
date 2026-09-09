import { embedLocalImage, isRemoteRef, type EmbeddedImage } from "./embed-image.js";
import type { Brand } from "./config-schema.js";

export type LogoAttachment = Pick<EmbeddedImage, "cid" | "mime" | "buffer">;

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

export async function resolveBrandLogo(brand: Brand): Promise<ResolvedBrand> {
  if (isRemoteRef(brand.logoUrl)) {
    return { brand };
  }

  const embedded = await embedLocalImage(brand.logoUrl, { resizeHeight: 500 });
  const logoAspectRatio = embedded.height > 0 ? embedded.width / embedded.height : undefined;
  return {
    brand: { ...brand, logoUrl: embedded.dataUri, logoAspectRatio },
    logoAttachment: embedded,
  };
}
