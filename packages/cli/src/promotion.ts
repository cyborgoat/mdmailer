import type { Page } from "puppeteer";
import { inPageCall, insertQrImages, qrDataUrl, replaceLinksWithQrMarkers } from "@goatcheese/mdmailer-core";

/** Adapt the existing email DOM for print; keep every section and link label. */
export async function replaceLinksWithQr(page: Page): Promise<string[]> {
  const urls = await page.evaluate(inPageCall(replaceLinksWithQrMarkers)) as string[];
  // Generate each destination once, even when the email repeats a link.
  const images = Object.fromEntries(await Promise.all(urls.map(async url => [url, await qrDataUrl(url)])));
  await page.evaluate(inPageCall(insertQrImages, images));
  return Object.values(images);
}
