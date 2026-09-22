import QRCode from "qrcode";
import type { Page } from "puppeteer";

/** Adapt the existing email DOM for print; keep every section and link label. */
export async function replaceLinksWithQr(page: Page): Promise<string[]> {
  const urls = await page.evaluate(() => {
    const destinations = new Map<string, { number: number; label: string }>();
    const pattern = /(?:https?:\/\/|www\.)[^\s<>]+/gi;
    const qr = { code(url: string, label = ""): HTMLElement {
      if (!destinations.has(url)) destinations.set(url, { number: destinations.size + 1, label });
      else if (label && !destinations.get(url)!.label) destinations.get(url)!.label = label;
      const span = document.createElement("sup");
      span.textContent = ` [${destinations.get(url)!.number}]`;
      span.style.cssText = "font-size:10px;line-height:1;white-space:nowrap";
      return span;
    } };
    // Preserve rich labels and linked images, but remove URL-only labels.
    for (const link of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const url = link.getAttribute("href") ?? "";
      if (!/^(https?:\/\/|mailto:|tel:)/i.test(url)) continue;
      const label = document.createElement("a");
      label.href = url;
      label.style.cssText = link.style.cssText;
      label.append(...Array.from(link.childNodes));
      const text = label.textContent?.trim() ?? "";
      if (text === url || /^(?:https?:\/\/|www\.|mailto:|tel:)[^\s]+$/i.test(text)) label.textContent = "";
      link.replaceWith(label);
      label.append(qr.code(url, label.textContent?.trim() ?? ""));
    }
    // Plain URLs need the same treatment, including those inside code blocks.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    for (const node of nodes) {
      if (node.parentElement?.closest("script,style,[data-qr-url]")) continue;
      const text = node.textContent ?? "";
      const fragment = document.createDocumentFragment();
      let end = 0;
      for (const match of text.matchAll(pattern)) {
        let url = match[0].replace(/[.,;:!?，。；：！？]+$/, "");
        while (url.endsWith(")") && (url.match(/\)/g)?.length ?? 0) > (url.match(/\(/g)?.length ?? 0)) url = url.slice(0, -1);
        const destination = url.startsWith("www.") ? `https://${url}` : url;
        const link = document.createElement("a");
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
      const section = document.createElement("div");
      section.dataset.qrSection = "";
      section.style.cssText = "box-sizing:border-box;max-width:100%;margin:24px auto 0;padding:24px 0 0;text-align:center";
      const typography = getComputedStyle(document.querySelector("h1,h2") ?? document.body);
      section.style.color = typography.color;
      section.style.fontFamily = typography.fontFamily;
      const heading = document.createElement("p");
      const chinese = document.documentElement.lang.startsWith("zh");
      heading.textContent = chinese ? "扫码了解更多" : "Scan to learn more";
      heading.style.cssText = "font-size:16px;font-weight:600;margin:0 0 20px";
      const grid = document.createElement("table");
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
        const caption = document.createElement("a");
        caption.href = url;
        caption.textContent = `[${number}] ${label || (chinese ? "链接" : "Link")}`;
        caption.style.cssText = `display:block;margin-top:10px;font-family:${typography.fontFamily};color:${typography.color};font-size:13px;line-height:1.4;overflow-wrap:anywhere;text-decoration:none`;
        item.append(caption);
      }
      section.append(heading, grid);
      const footer = document.querySelector("[data-email-footer]");
      if (footer) footer.before(section);
      else document.body.append(section);
    }
    return [...destinations.keys()];
  });
  // Generate each destination once, even when the email repeats a link.
  const images = Object.fromEntries(await Promise.all(urls.map(async url => [url, await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M", margin: 4, scale: 6,
    color: { dark: "#000000", light: "#ffffff" },
  })])));
  await page.evaluate(images => {
    for (const span of document.querySelectorAll<HTMLElement>("[data-qr-url]")) {
      const image = document.createElement("img");
      image.src = images[span.dataset.qrUrl!];
      image.alt = "QR code";
      image.width = 128;
      image.height = 128;
      image.style.cssText = "display:block;width:128px;height:128px;max-width:none;background:white;border-radius:0;margin:0 auto";
      span.prepend(image);
    }
  }, images);
  return Object.values(images);
}
