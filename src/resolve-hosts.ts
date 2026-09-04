import { embedLocalImage, isRemoteRef, type EmbeddedImage } from "./embed-image.js";
import { fmString } from "./frontmatter.js";

export interface HostProfile {
  name: string;
  /** Resolved photo URL: remote https://… or embedded data: URI. */
  photoUrl?: string;
  bio?: string;
  role?: string;
}

export interface ResolvedHosts {
  /** Plain name list — used by event/workshop detail cards. */
  names: string[];
  /** Rich profiles when frontmatter supplies objects (photo/bio). */
  profiles: HostProfile[];
  attachments: EmbeddedImage[];
}

/**
 * Parses `hosts` / `speakers` frontmatter as either plain strings or
 * `{ name, photo, bio, role }` maps. Local photo paths are embedded like
 * content images (data URI + CID buffer).
 */
export async function resolveHosts(raw: unknown): Promise<ResolvedHosts> {
  if (raw == null) {
    return { names: [], profiles: [], attachments: [] };
  }

  const items = Array.isArray(raw) ? raw : [raw];
  const names: string[] = [];
  const profiles: HostProfile[] = [];
  const attachments: EmbeddedImage[] = [];

  for (const item of items) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      const name = fmString(record.name ?? record.host ?? record.speaker);
      if (!name) continue;

      names.push(name);
      let photoUrl = fmString(record.photo ?? record.image ?? record.avatar);
      const bio = fmString(record.bio ?? record.intro ?? record.about);
      const role = fmString(record.role ?? record.title);

      if (photoUrl && !isRemoteRef(photoUrl)) {
        const embedded = await embedLocalImage(photoUrl, { resizeHeight: 160 });
        attachments.push(embedded);
        photoUrl = embedded.dataUri;
      }

      profiles.push({ name, photoUrl, bio, role });
      continue;
    }

    const name = fmString(item);
    if (name) {
      names.push(name);
      profiles.push({ name });
    }
  }

  return { names, profiles, attachments };
}
