import { embedLocalImage, isRemoteRef, type EmbeddedImage } from "./embed-image.js";
import type { Brand } from "./config-schema.js";

export type LogoAttachment = Pick<EmbeddedImage, "cid" | "mime" | "buffer">;

export interface ResolvedBrand {
  brand: Brand;
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
  return { brand: { ...brand, logoUrl: embedded.dataUri }, logoAttachment: embedded };
}
