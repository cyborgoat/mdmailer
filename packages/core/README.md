English | [简体中文](README.zh-CN.md)

# @goatcheese/mdmailer-core

Render branded HTML emails and build EML files from Markdown in a Node.js, browser, or webview application. For a terminal workflow with live preview and PNG export, use the [mdmailer CLI](https://github.com/cyborgoat/mdmailer).

## Installation

Run this in your application’s project directory:

```sh
npm install @goatcheese/mdmailer-core
```

## Usage

### Render a Markdown draft

Pass the Markdown source, parsed branding config, and an image adapter to `renderEmail`. This example uses an embedded logo. Replace it and supply an adapter for any local images used by your drafts.

```js
import { parseConfig, renderEmail } from "@goatcheese/mdmailer-core";

const markdown = `---
title: Team update
type: news
lang: en
---

The new handbook is ready. [Read it](https://example.com/handbook).`;

const config = parseConfig({
  organization: {
    name: "Example",
    logoUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  },
  theme: { primaryColor: "#1A73E8", footerText: "© Example" },
});

const rendered = await renderEmail(markdown, {
  config,
  images: {
    async read(ref) {
      throw new Error(`No local image adapter for ${ref}`);
    },
  },
  plainText: true,
});

console.log(rendered.title); // Team update
```

The result includes the subject, initial HTML, plain-text body, content width, and image attachment metadata. Finalize the HTML in a DOM to add QR codes and set image dimensions.

### Finalize HTML and build EML in a browser

In the same browser module, load the initial HTML into an attached iframe at the email’s content width. The iframe gives the DOM a layout to measure.

```js
import {
  buildEml,
  collectEmlAttachments,
  postProcessDocument,
  serializeDocument,
} from "@goatcheese/mdmailer-core";

const frame = document.createElement("iframe");
frame.setAttribute("sandbox", "allow-same-origin");
frame.style.cssText = `position:fixed;left:-9999px;width:${rendered.contentWidth}px`;
const loaded = new Promise((resolve) => {
  frame.addEventListener("load", resolve, { once: true });
});
frame.srcdoc = rendered.html;
document.body.append(frame);

let html;
let eml;
try {
  await loaded;
  const doc = frame.contentDocument;
  const { qrImages } = await postProcessDocument(doc);
  html = serializeDocument(doc);
  eml = buildEml({
    subject: rendered.title,
    html,
    text: rendered.text,
    attachments: collectEmlAttachments(rendered, qrImages),
  });
} finally {
  frame.remove();
}
```

In Node.js, use a browser page for DOM processing or provide measured dimensions through the `imageSizes` option when using a DOM without layout. The CLI demonstrates running the separate DOM phases through `inPageCall`. [CLI rendering source](https://github.com/cyborgoat/mdmailer/blob/main/packages/cli/src/screenshot.ts)

## Image adapter

| Method | When to supply it | What it returns |
| --- | --- | --- |
| `read(ref)` | Required adapter method. Called for local logo paths, Markdown images, and host photos. HTTP(S) and data URLs bypass it. | Image bytes and MIME type. |
| `rasterize(img, { height })` | Supply it if your local inputs include SVGs. | PNG bytes and dimensions, with optional scaling to the requested height. |
| `measure(img)` | Supply it to report raster image dimensions. The logo uses a default aspect ratio when dimensions are unavailable. | Pixel width and height. |

The host application provides file access and image conversion. Use the CLI if you need PNG output.

## API reference

The main entry points are `parseConfig`, `renderEmail`, `postProcessDocument`, `serializeDocument`, `collectEmlAttachments`, and `buildEml`. The package also exports the config schemas, theme presets, template names, `qrDataUrl`, and the individual DOM processing phases. The API is in the 0.x series. [Public exports](https://github.com/cyborgoat/mdmailer/blob/main/packages/core/src/index.ts)

## License

[MIT](LICENSE)
