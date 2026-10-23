import { fromBase64, randomUUID, toBase64 } from "./bytes.js";
import type { RenderedEmail } from "./render.js";

export interface EmlAttachment {
  cid: string;
  mime: string;
  bytes: Uint8Array;
  // The string to find-and-replace in the rendered HTML with `cid:<cid>` —
  // either the org logo's resolved src, or a content image's data URI.
  renderedSrc: string;
}

export interface EmlInput {
  subject: string;
  /** Final HTML (post-processed), still carrying data: URIs for local images. */
  html: string;
  text: string;
  attachments: EmlAttachment[];
}

function extensionForMime(mime: string): string {
  const subtype = mime.split("/")[1] ?? "png";
  return subtype === "jpeg" ? "jpg" : subtype;
}

// RFC 2045 caps base64 body lines at 76 characters.
function wrapBase64(base64: string): string {
  return base64.match(/.{1,76}/g)?.join("\r\n") ?? base64;
}

/**
 * Every local image that must travel as a CID part: the logo, Markdown body
 * images, host photos, and the QR codes produced by post-processing. The .html
 * preview keeps them as data: URIs; `buildEml` swaps each for a `cid:` reference.
 */
export function collectEmlAttachments(rendered: RenderedEmail, qrImages: string[] = []): EmlAttachment[] {
  const { organization, logoAttachment, contentImages, hostImages } = rendered;
  return [
    ...(logoAttachment ? [{ ...logoAttachment, renderedSrc: organization.logoUrl }] : []),
    ...contentImages.map((image): EmlAttachment => ({ ...image, renderedSrc: image.dataUri })),
    ...hostImages.map((image): EmlAttachment => ({ ...image, renderedSrc: image.dataUri })),
    ...qrImages.map((dataUri): EmlAttachment => ({
      cid: `qr-${randomUUID()}`, mime: "image/png",
      bytes: fromBase64(dataUri.split(",")[1]), renderedSrc: dataUri,
    })),
  ];
}

export function buildEml({ subject, html, text, attachments }: EmlInput): string {
  const emlHtml = attachments.reduce((acc, att) => acc.split(att.renderedSrc).join(`cid:${att.cid}`), html);
  const altBoundary = `mdmailer-alt-${randomUUID()}`;
  const alternativePart = [
    `--${altBoundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    text,
    ``,
    `--${altBoundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    emlHtml,
    ``,
    `--${altBoundary}--`,
  ].join("\r\n");

  if (attachments.length === 0) {
    return [
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
      ``,
      alternativePart,
      ``,
    ].join("\r\n");
  }

  // Outlook doesn't render `data:` URI images in <img src>, so local images travel
  // as proper inline attachments referenced by Content-ID (`cid:...`) instead,
  // wrapped in multipart/related around the text/html + text/plain alternative.
  const relatedBoundary = `mdmailer-rel-${randomUUID()}`;
  const attachmentParts = attachments
    .map((attachment) =>
      [
        `--${relatedBoundary}`,
        `Content-Type: ${attachment.mime}`,
        `Content-Transfer-Encoding: base64`,
        `Content-ID: <${attachment.cid}>`,
        `Content-Disposition: inline; filename="${attachment.cid}.${extensionForMime(attachment.mime)}"`,
        ``,
        wrapBase64(toBase64(attachment.bytes)),
        ``,
      ].join("\r\n"),
    )
    .join("");

  return [
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/related; boundary="${relatedBoundary}"`,
    ``,
    `--${relatedBoundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    ``,
    alternativePart,
    ``,
    attachmentParts,
    `--${relatedBoundary}--`,
    ``,
  ].join("\r\n");
}
