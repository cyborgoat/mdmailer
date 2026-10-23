// DOM post-processing applied to the rendered email: link → QR replacement
// (with a "Scan to learn more" section) and baked <img> dimensions.
//
// Each exported DOM function is SELF-CONTAINED — it may only use its arguments
// and DOM globals, never module-level bindings — so a Node host can ship it
// into a puppeteer page with `fn.toString()` (see `inPageCall`) while browsers
// and jsdom-style hosts call it directly with a `Document`.

import { qrDataUrl } from "./qr.js";

/**
 * Phase 1: replace every link and bare URL with a numbered marker, append the
 * QR section, and return the distinct destinations in numbering order. The
 * markers (`[data-qr-url]`) get their QR images from `insertQrImages`.
 */
export function replaceLinksWithQrMarkers(doc: Document): string[] {
  const destinations = new Map<string, { number: number; label: string }>();
  const pattern = /(?:https?:\/\/|www\.)[^\s<>]+/gi;
  const qr = { code(url: string, label = "", opts: { force?: boolean } = {}): HTMLElement {
    if (!destinations.has(url)) destinations.set(url, { number: destinations.size + 1, label });
    else if (label && (opts.force || !destinations.get(url)!.label)) destinations.get(url)!.label = label;
    const span = doc.createElement("sup");
    span.textContent = ` [${destinations.get(url)!.number}]`;
    span.style.cssText = "font-size:10px;line-height:1;white-space:nowrap";
    return span;
  } };
  // Preserve rich labels and linked images, but remove URL-only labels.
  for (const link of doc.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    const url = link.getAttribute("href") ?? "";
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(url)) continue;
    // A link can mark its own QR caption (e.g. "Scan to join the meeting"),
    // distinct from its clickable text, which always wins for that URL.
    const captionOverride = link.dataset.qrCaption;
    const label = doc.createElement("a");
    label.href = url;
    label.style.cssText = link.style.cssText;
    label.append(...Array.from(link.childNodes));
    const text = label.textContent?.trim() ?? "";
    if (text === url || /^(?:https?:\/\/|www\.|mailto:|tel:)[^\s]+$/i.test(text)) label.textContent = "";
    link.replaceWith(label);
    label.append(qr.code(url, captionOverride || (label.textContent?.trim() ?? ""), { force: Boolean(captionOverride) }));
  }
  // Plain URLs need the same treatment, including those inside code blocks.
  const SHOW_TEXT = 4;
  const walker = doc.createTreeWalker(doc.body, SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    if (node.parentElement?.closest("script,style,[data-qr-url]")) continue;
    const text = node.textContent ?? "";
    const fragment = doc.createDocumentFragment();
    let end = 0;
    for (const match of text.matchAll(pattern)) {
      let url = match[0].replace(/[.,;:!?，。；：！？]+$/, "");
      while (url.endsWith(")") && (url.match(/\)/g)?.length ?? 0) > (url.match(/\(/g)?.length ?? 0)) url = url.slice(0, -1);
      const destination = url.startsWith("www.") ? `https://${url}` : url;
      const link = doc.createElement("a");
      link.href = destination;
      link.style.color = "inherit";
      link.append(qr.code(destination));
      fragment.append(text.slice(end, match.index), link);
      end = match.index + url.length;
    }
    if (end) {
      fragment.append(text.slice(end));
      node.replaceWith(fragment);
    }
  }
  if (destinations.size) {
    const section = doc.createElement("div");
    section.dataset.qrSection = "";
    section.style.cssText = "box-sizing:border-box;max-width:100%;margin:24px auto 0;padding:24px 0 0;text-align:center";
    const typography = doc.defaultView!.getComputedStyle(doc.querySelector("h1,h2") ?? doc.body);
    section.style.color = typography.color;
    section.style.fontFamily = typography.fontFamily;
    const heading = doc.createElement("p");
    const chinese = doc.documentElement.lang.startsWith("zh");
    heading.textContent = chinese ? "扫码了解更多" : "Scan to learn more";
    heading.style.cssText = "font-size:16px;font-weight:600;margin:0 0 20px";
    const grid = doc.createElement("table");
    grid.setAttribute("role", "presentation");
    grid.setAttribute("align", "center");
    grid.cellPadding = "0";
    grid.cellSpacing = "0";
    grid.style.cssText = "margin:0 auto;border-collapse:collapse";
    let row: HTMLTableRowElement;
    for (const [url, { number, label }] of destinations) {
      if ((number - 1) % 3 === 0) row = grid.insertRow();
      const item = row!.insertCell();
      item.dataset.qrUrl = url;
      item.setAttribute("align", "center");
      item.setAttribute("valign", "top");
      item.style.cssText = "width:144px;padding:0 8px 16px;text-align:center";
      const caption = doc.createElement("a");
      caption.href = url;
      caption.textContent = `[${number}] ${label || (chinese ? "链接" : "Link")}`;
      caption.style.cssText = `display:block;margin-top:10px;font-family:${typography.fontFamily};color:${typography.color};font-size:13px;line-height:1.4;overflow-wrap:anywhere;text-decoration:none`;
      item.append(caption);
    }
    section.append(heading, grid);
    const footer = doc.querySelector("[data-email-footer]");
    if (footer) footer.before(section);
    else doc.body.append(section);
  }
  return [...destinations.keys()];
}

/** Phase 2: put each destination's QR image (a data URI keyed by URL) into its marker. */
export function insertQrImages(doc: Document, images: Record<string, string>): void {
  for (const span of doc.querySelectorAll<HTMLElement>("[data-qr-url]")) {
    const image = doc.createElement("img");
    image.src = images[span.dataset.qrUrl!];
    image.alt = "QR code";
    image.width = 128;
    image.height = 128;
    image.style.cssText = "display:block;width:128px;height:128px;max-width:none;background:white;border-radius:0;margin:0 auto";
    span.prepend(image);
  }
}

/**
 * Phase 3: bake the CSS-constrained (max-width: 100%; height: auto) box size
 * into width/height attributes. Browsers honor the CSS either way, but many
 * mail clients — Outlook's Word engine especially — ignore max-width on <img>
 * and fall back to the source file's native pixel size, which is what made
 * oversized or mismatched Markdown images render messy in the .eml. Explicit
 * attributes make the .eml match the .html/.png layout.
 *
 * Measuring needs real layout. A host without layout (jsdom) can pass `sizes`,
 * one entry per `document.images` in order, instead.
 */
export async function bakeImageSizes(doc: Document, sizes?: Array<{ width: number; height: number }>): Promise<void> {
  if (!sizes) {
    await doc.fonts?.ready;
    await Promise.all(Array.from(doc.images, async (image) => {
      await image.decode();
    }));
  }
  Array.from(doc.images).forEach((image, index) => {
    const { width, height } = sizes?.[index] ?? image.getBoundingClientRect();
    if (width > 0) image.setAttribute("width", String(Math.round(width)));
    if (height > 0) image.setAttribute("height", String(Math.round(height)));
  });
}

export interface PostProcessOptions {
  /** QR image generator: a PNG data URI for a URL. Defaults to core's `qrDataUrl`. */
  qr?: (url: string) => Promise<string>;
  /** Pre-measured image sizes for hosts without layout; see `bakeImageSizes`. */
  imageSizes?: Array<{ width: number; height: number }>;
}

/**
 * The whole post-processing pipeline on any live `Document` (a browser iframe,
 * jsdom, …). Returns the QR images (PNG data URIs) so the EML can attach them.
 * Node hosts driving puppeteer run the three phases through `inPageCall`
 * instead, since the QR images are generated outside the page.
 */
export async function postProcessDocument(doc: Document, opts: PostProcessOptions = {}): Promise<{ qrImages: string[] }> {
  const qr = opts.qr ?? qrDataUrl;
  const urls = replaceLinksWithQrMarkers(doc);
  // Generate each destination once, even when the email repeats a link.
  const images = Object.fromEntries(await Promise.all(urls.map(async url => [url, await qr(url)])));
  insertQrImages(doc, images);
  await bakeImageSizes(doc, opts.imageSizes);
  return { qrImages: Object.values(images) };
}

/** Serialize a processed document like puppeteer's `page.content()`: doctype + `<html>`. */
export function serializeDocument(doc: Document): string {
  let content = "";
  for (const node of Array.from(doc.childNodes)) {
    content += node === doc.documentElement ? doc.documentElement.outerHTML : new (doc.defaultView!.XMLSerializer)().serializeToString(node);
  }
  return content;
}

/**
 * A JS expression that runs one of the self-contained phase functions above
 * against the page's `document`, for `page.evaluate(string)`. Defines the
 * `__name` helper some bundlers (esbuild's keepNames) inject into function bodies.
 */
export function inPageCall(fn: (doc: Document, ...args: never[]) => unknown, ...args: unknown[]): string {
  return `(() => { globalThis.__name ??= (target) => target; return (${fn.toString()})(document, ${args.map((arg) => JSON.stringify(arg)).join(", ")}); })()`;
}
