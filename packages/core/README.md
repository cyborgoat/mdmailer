# @goatcheese/mdmailer-core

The environment-neutral core of [mdmailer](https://github.com/cyborgoat/mdmailer): turn Markdown plus configuration into branded email HTML and EML. It has no `node:fs`, `sharp`, `puppeteer` or `node:http` imports, and runs in Node and in browsers/webviews.

The command-line tool is [`@goatcheese/mdmailer`](../cli).

```sh
npm install @goatcheese/mdmailer-core
```

## What core does and doesn't do

- **Does:** parse frontmatter, render the template to HTML (`renderEmail`), post-process the DOM (QR codes for links, baked `<img>` sizes), and assemble the `.eml` (`buildEml`).
- **Doesn't:** read files, rasterize SVGs, or export PNG. You pass in an `ImageIO` for image access; PNG export lives in the CLI (puppeteer).

## Rendering

```ts
import { parseConfig, renderEmail, type ImageIO } from "@goatcheese/mdmailer-core";

const images: ImageIO = {
  // Resolve a local image ref however your environment does it.
  async read(ref) {
    const response = await fetch(ref);
    return { bytes: new Uint8Array(await response.arrayBuffer()), mime: response.headers.get("content-type") ?? "image/png" };
  },
};

const config = parseConfig({
  organization: { name: "Example", logoUrl: "https://example.com/logo.png" },
  theme: { primaryColor: "#1A73E8", footerText: "© Example" },
});

const rendered = await renderEmail(markdown, { config, images, plainText: true });
// rendered.html is the raw React render — post-process it next.
```

`rendered.html` is the render **before** DOM post-processing. To get the final HTML:

### In a browser

```ts
import { postProcessDocument, serializeDocument, buildEml, collectEmlAttachments } from "@goatcheese/mdmailer-core";

const frame = document.createElement("iframe");
frame.style.cssText = `position:fixed;left:-9999px;width:${rendered.contentWidth}px`;
document.body.append(frame);
frame.srcdoc = rendered.html;
await new Promise((resolve) => (frame.onload = resolve));

const { qrImages } = await postProcessDocument(frame.contentDocument!);
const html = serializeDocument(frame.contentDocument!);
const eml = buildEml({
  subject: rendered.title,
  html,
  text: rendered.text,
  attachments: collectEmlAttachments(rendered, qrImages),
});
frame.remove();
```

The iframe must be attached and laid out: image dimensions are measured with `getBoundingClientRect`. A host without layout (jsdom) can pass `imageSizes` to `postProcessDocument` instead.

### In Node (puppeteer)

Load `rendered.html` into a page, then run the self-contained phases with `inPageCall` — see `packages/cli/src/screenshot.ts` and `promotion.ts`.

## `ImageIO`

| Method | Required | Purpose |
|---|---|---|
| `read(ref)` | yes | Bytes + MIME type for a non-remote image ref (logo, Markdown image, host photo). `http(s):` and `data:` refs are never passed to it. |
| `rasterize(img, { height })` | when an SVG is referenced | SVG → PNG (optionally scaled to `height`), returning the new size. Node: sharp. Browser: canvas. |
| `measure(img)` | optional | Pixel size of raster images; without it they report 0×0 (the logo then falls back to a default aspect ratio). |

## API

`renderEmail`, `parseConfig`, `postProcessDocument`, `serializeDocument`, `buildEml`, `collectEmlAttachments`, `qrDataUrl`, plus the config schema, theme presets, template names and the lower-level post-processing phases (`replaceLinksWithQrMarkers`, `insertQrImages`, `bakeImageSizes`, `inPageCall`). The API is `0.x` and may change.

`crypto.randomUUID` is used when available (secure contexts), with a `getRandomValues` fallback.
