import { embedLocalImage, isRemoteRef, type EmbeddedImage } from "./embed-image.js";

const MARKDOWN_IMAGE = /!\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g;

export interface ResolvedContentImages {
  markdown: string;
  attachments: EmbeddedImage[];
}

/**
 * Local images referenced in the body Markdown (`![alt](assets/images/foo.jpg)`)
 * get embedded the same way the org logo does: a data URI for the .html preview,
 * plus a buffer generate.ts can attach as a CID part for the .eml. Remote
 * `http(s)://` image URLs pass through unchanged.
 */
export async function resolveContentImages(markdown: string): Promise<ResolvedContentImages> {
  const attachments: EmbeddedImage[] = [];
  let result = markdown;

  for (const [full, alt, src, title = ""] of markdown.matchAll(MARKDOWN_IMAGE)) {
    if (isRemoteRef(src)) continue;

    const embedded = await embedLocalImage(src);
    attachments.push(embedded);
    result = result.replace(full, `![${alt}](${embedded.dataUri}${title})`);
  }

  return { markdown: result, attachments };
}
